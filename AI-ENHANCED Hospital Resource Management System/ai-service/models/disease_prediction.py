# File: models/disease_prediction.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from prophet import Prophet
from sklearn.ensemble import RandomForestRegressor
import os
import joblib
import json
import random

class DiseasePrediction:
    def __init__(self, model_path="./models/saved/disease"):
        self.model_path = model_path
        
        # Create model directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
        
        # Initialize models
        self.prediction_models = {}
        
        # First load or generate seasonal patterns, then save them
        self.seasonal_patterns = self._load_seasonal_patterns()
        if not self.seasonal_patterns:
            self.seasonal_patterns = self._generate_seasonal_patterns()
            self._save_seasonal_patterns()
            
        self._load_models()
    
    def _load_seasonal_patterns(self):
        try:
            with open(os.path.join(self.model_path, 'seasonal_patterns.json'), 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    def _save_seasonal_patterns(self):
        with open(os.path.join(self.model_path, 'seasonal_patterns.json'), 'w') as f:
            json.dump(self.seasonal_patterns, f)
    
    def _generate_seasonal_patterns(self):
        """Generate seasonal patterns for common diseases"""
        diseases = [
            "Influenza", "COVID-19", "Pneumonia", "Gastroenteritis", 
            "Common Cold", "Bronchitis", "Asthma", "Allergies"
        ]
        
        patterns = {}
        
        for disease in diseases:
            if disease == "Influenza":
                # Flu peaks in winter
                patterns[disease] = {
                    "peak_months": [1, 2, 12],  # Jan, Feb, Dec
                    "moderate_months": [3, 11],  # Mar, Nov
                    "low_months": [4, 5, 6, 7, 8, 9, 10],  # Apr-Oct
                    "baseline_value": random.randint(15, 30),
                    "peak_multiplier": random.uniform(2.5, 4.0),
                    "year_trend": random.uniform(1.0, 1.15)  # Slight increase year over year
                }
            elif disease == "COVID-19":
                # COVID varies but has had winter peaks
                patterns[disease] = {
                    "peak_months": [1, 12],  # Jan, Dec
                    "moderate_months": [2, 7, 8, 11],  # Feb, Jul, Aug, Nov
                    "low_months": [3, 4, 5, 6, 9, 10],  # Mar-Jun, Sep-Oct
                    "baseline_value": random.randint(20, 40),
                    "peak_multiplier": random.uniform(2.0, 3.5),
                    "year_trend": random.uniform(0.8, 1.2)  # Variable trend
                }
            elif disease == "Pneumonia":
                # Pneumonia higher in winter
                patterns[disease] = {
                    "peak_months": [12, 1, 2],  # Dec-Feb
                    "moderate_months": [3, 11],  # Mar, Nov
                    "low_months": [4, 5, 6, 7, 8, 9, 10],  # Apr-Oct
                    "baseline_value": random.randint(10, 25),
                    "peak_multiplier": random.uniform(1.8, 2.5),
                    "year_trend": random.uniform(0.95, 1.1)
                }
            elif disease == "Gastroenteritis":
                # Gastroenteritis can peak in winter and summer
                patterns[disease] = {
                    "peak_months": [1, 7],  # Jan, Jul
                    "moderate_months": [2, 6, 8, 12],  # Feb, Jun, Aug, Dec
                    "low_months": [3, 4, 5, 9, 10, 11],  # Mar-May, Sep-Nov
                    "baseline_value": random.randint(15, 35),
                    "peak_multiplier": random.uniform(1.5, 2.0),
                    "year_trend": random.uniform(0.9, 1.05)
                }
            elif disease == "Common Cold":
                # Colds peak in fall and winter
                patterns[disease] = {
                    "peak_months": [10, 11, 12, 1, 2],  # Oct-Feb
                    "moderate_months": [3, 9],  # Mar, Sep
                    "low_months": [4, 5, 6, 7, 8],  # Apr-Aug
                    "baseline_value": random.randint(30, 60),
                    "peak_multiplier": random.uniform(1.7, 2.2),
                    "year_trend": random.uniform(0.97, 1.03)
                }
            elif disease == "Bronchitis":
                # Bronchitis peaks in winter
                patterns[disease] = {
                    "peak_months": [12, 1, 2],  # Dec-Feb
                    "moderate_months": [3, 11],  # Mar, Nov
                    "low_months": [4, 5, 6, 7, 8, 9, 10],  # Apr-Oct
                    "baseline_value": random.randint(10, 20),
                    "peak_multiplier": random.uniform(1.6, 2.3),
                    "year_trend": random.uniform(0.95, 1.05)
                }
            elif disease == "Asthma":
                # Asthma can have spring and fall peaks (allergies)
                patterns[disease] = {
                    "peak_months": [5, 9],  # May, Sep
                    "moderate_months": [4, 6, 8, 10],  # Apr, Jun, Aug, Oct
                    "low_months": [1, 2, 3, 7, 11, 12],  # Jan-Mar, Jul, Nov-Dec
                    "baseline_value": random.randint(15, 25),
                    "peak_multiplier": random.uniform(1.4, 1.8),
                    "year_trend": random.uniform(1.0, 1.1)  # Slight increase
                }
            elif disease == "Allergies":
                # Allergies peak in spring and fall
                patterns[disease] = {
                    "peak_months": [4, 5, 9],  # Apr, May, Sep
                    "moderate_months": [3, 6, 8, 10],  # Mar, Jun, Aug, Oct
                    "low_months": [1, 2, 7, 11, 12],  # Jan-Feb, Jul, Nov-Dec
                    "baseline_value": random.randint(20, 40),
                    "peak_multiplier": random.uniform(1.8, 2.5),
                    "year_trend": random.uniform(1.02, 1.12)  # Increasing trend
                }
        
        return patterns
    
    def _load_models(self):
        """Load prediction models for each disease if they exist"""
        diseases = list(self.seasonal_patterns.keys())
        
        for disease in diseases:
            model_file = os.path.join(self.model_path, f"{disease.lower().replace(' ', '_')}_model.pkl")
            try:
                self.prediction_models[disease] = joblib.load(model_file)
            except (FileNotFoundError, EOFError):
                # Create a new Prophet model if not found
                self.prediction_models[disease] = Prophet(
                    yearly_seasonality=True,
                    weekly_seasonality=True,
                    daily_seasonality=False
                )
    
    def _save_model(self, disease, model):
        """Save a trained model"""
        model_file = os.path.join(self.model_path, f"{disease.lower().replace(' ', '_')}_model.pkl")
        joblib.dump(model, model_file)
    
    def train(self, training_data=None):
        """Train disease prediction models with historical data"""
        if not training_data:
            # Use mock data for demonstration
            training_data = self._generate_mock_historical_data()
        
        diseases = list(self.seasonal_patterns.keys())
        
        for disease in diseases:
            if disease in training_data:
                disease_data = training_data[disease]
                
                # Prepare data for Prophet
                df = pd.DataFrame(disease_data)
                
                # Basic format for Prophet: ds (date) and y (value)
                prophet_df = pd.DataFrame({
                    'ds': pd.to_datetime(df['date']),
                    'y': df['cases']
                })
                
                # Train the model
                model = Prophet(
                    yearly_seasonality=True,
                    weekly_seasonality=True,
                    daily_seasonality=False
                )
                model.fit(prophet_df)
                
                # Save the trained model
                self.prediction_models[disease] = model
                self._save_model(disease, model)
        
        return {"status": "success", "message": "Disease prediction models trained successfully"}
    
    def predict_outbreaks(self, historical_data=None, current_data=None, prediction_days=30):
        """Predict disease outbreaks based on historical and current data"""
        if not historical_data and not current_data:
            # Use mock data for demonstration
            historical_data, current_data = self._generate_mock_data()
        
        result = {
            "predictions": [],
            "monthlyTrend": [],
            "recommendations": [],
            "analysisDate": datetime.now().isoformat()
        }
        
        # Identify diseases with highest risk
        highest_risk = None
        highest_risk_value = 0
        
        diseases = list(self.seasonal_patterns.keys())
        
        for disease in diseases:
            # Generate prediction for this disease
            current_cases = current_data.get(disease, random.randint(15, 60))
            
            # Use model if it exists, otherwise use seasonal patterns
            if disease in self.prediction_models and isinstance(self.prediction_models[disease], Prophet):
                prediction = self._predict_with_model(disease, current_cases, prediction_days)
            else:
                prediction = self._predict_with_patterns(disease, current_cases, prediction_days)
            
            # Calculate risk metrics
            change_percentage = int(((prediction["predictedCases"] - current_cases) / current_cases) * 100)
            
            # Determine risk level
            if change_percentage > 50 and prediction["predictedCases"] > 30:
                risk_level = "High"
                confidence = random.randint(75, 90)
            elif change_percentage > 25 or prediction["predictedCases"] > 50:
                risk_level = "Medium"
                confidence = random.randint(65, 80)
            else:
                risk_level = "Low"
                confidence = random.randint(55, 70)
            
            # Create prediction object
            disease_prediction = {
                "disease": disease,
                "riskLevel": risk_level,
                "currentCases": current_cases,
                "predictedCases": prediction["predictedCases"],
                "changePercentage": change_percentage,
                "confidence": confidence
            }
            
            # Add to predictions list
            result["predictions"].append(disease_prediction)
            
            # Check if this is the highest risk
            risk_score = change_percentage * confidence / 100
            if risk_level == "High" and risk_score > highest_risk_value:
                highest_risk = disease_prediction
                highest_risk_value = risk_score
        
        # Sort predictions by risk level and change percentage
        result["predictions"] = sorted(
            result["predictions"], 
            key=lambda x: (1 if x["riskLevel"] == "High" else (2 if x["riskLevel"] == "Medium" else 3), -x["changePercentage"])
        )
        
        # Set highest risk disease
        if highest_risk:
            result["highestRiskDisease"] = highest_risk
        else:
            result["highestRiskDisease"] = result["predictions"][0]
        
        # Generate monthly trend data
        result["monthlyTrend"] = self._generate_monthly_trend(result["highestRiskDisease"]["disease"])
        
        # Generate recommendations
        result["recommendations"] = self._generate_recommendations(result["highestRiskDisease"])
        
        return result
    
    def _predict_with_model(self, disease, current_cases, prediction_days):
        """Use trained Prophet model to make predictions"""
        model = self.prediction_models[disease]
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=prediction_days)
        
        # Make prediction
        forecast = model.predict(future)
        
        # Get the prediction for the end of the period
        last_prediction = forecast.iloc[-1]["yhat"]
        
        return {
            "predictedCases": int(max(last_prediction, current_cases * 0.8))  # Ensure prediction is reasonable
        }
    
    def _predict_with_patterns(self, disease, current_cases, prediction_days):
        """Use seasonal patterns to make predictions when no model is available"""
        pattern = self.seasonal_patterns[disease]
        
        # Determine current month and future month
        current_date = datetime.now()
        future_date = current_date + timedelta(days=prediction_days)
        
        current_month = current_date.month
        future_month = future_date.month
        
        # Get the multipliers based on seasonal patterns
        if future_month in pattern["peak_months"]:
            multiplier = pattern["peak_multiplier"]
        elif future_month in pattern["moderate_months"]:
            multiplier = (pattern["peak_multiplier"] + 1) / 2
        else:
            multiplier = 1.0
        
        # Add a random factor for variability
        random_factor = random.uniform(0.8, 1.2)
        
        # Calculate predicted cases
        predicted_cases = int(current_cases * multiplier * random_factor)
        
        # Ensure we don't predict too large a swing
        min_cases = int(current_cases * 0.5)
        max_cases = int(current_cases * 3.0)
        predicted_cases = max(min_cases, min(predicted_cases, max_cases))
        
        return {
            "predictedCases": predicted_cases
        }
    
    def _generate_monthly_trend(self, disease):
        """Generate monthly trend data for the past 12 months and next 6 months"""
        pattern = self.seasonal_patterns[disease]
        
        # Current date and month
        current_date = datetime.now()
        current_month = current_date.month
        
        # Generate the months
        months = []
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Past 12 months
        for i in range(12):
            month_index = (current_month - 12 + i) % 12
            if month_index == 0:
                month_index = 12
            months.append({
                'month': month_names[month_index - 1],
                'index': month_index
            })
        
        # Next 6 months (for prediction)
        for i in range(6):
            month_index = (current_month + i) % 12
            if month_index == 0:
                month_index = 12
            months.append({
                'month': month_names[month_index - 1],
                'index': month_index,
                'isPrediction': True
            })
        
        # Generate case data
        trend_data = []
        
        for i, month in enumerate(months):
            is_prediction = month.get('isPrediction', False)
            month_index = month['index']
            
            # Determine base multiplier based on seasonal pattern
            if month_index in pattern["peak_months"]:
                multiplier = pattern["peak_multiplier"]
            elif month_index in pattern["moderate_months"]:
                multiplier = (pattern["peak_multiplier"] + 1) / 2
            else:
                multiplier = 1.0
            
            # Add some random variation
            random_factor = random.uniform(0.9, 1.1)
            
            # Last year's data (slightly lower based on year trend)
            last_year = int(pattern["baseline_value"] * multiplier * random_factor / pattern["year_trend"])
            
            # Generate current year data
            if is_prediction:
                # For prediction months, increase based on the highest risk disease prediction
                if disease == self.seasonal_patterns.get("highestRiskDisease", {}).get("disease"):
                    current_year = int(pattern["baseline_value"] * multiplier * pattern["year_trend"] * random_factor * 1.5)
                else:
                    current_year = int(pattern["baseline_value"] * multiplier * pattern["year_trend"] * random_factor)
            else:
                # For past months, use the actual seasonal pattern
                current_year = int(pattern["baseline_value"] * multiplier * pattern["year_trend"] * random_factor)
            
            trend_data.append({
                'month': month['month'],
                'lastYear': last_year,
                'currentYear': current_year if not is_prediction else 0,
                'isPrediction': is_prediction
            })
        
        # Set current year values for prediction months
        for i in range(12, len(trend_data)):
            trend_data[i]['currentYear'] = trend_data[i]['lastYear'] * pattern["year_trend"] * random.uniform(1.1, 1.5)
        
        return trend_data
    
    def _generate_recommendations(self, highest_risk_disease):
        """Generate recommendations based on the highest risk disease"""
        disease = highest_risk_disease["disease"]
        risk_level = highest_risk_disease["riskLevel"]
        change_percentage = highest_risk_disease["changePercentage"]
        
        recommendations = []
        
        # Disease-specific recommendation
        disease_rec = {
            "type": disease,
            "title": f"Prepare for {disease} Peak Season",
            "description": f"Data indicates a {change_percentage}% increase in {disease} cases is likely in the next 4-6 weeks.",
            "actions": [
                f"Increase {disease} testing capacity by 30%",
                "Prepare additional beds in isolation areas",
                "Schedule additional nursing staff for peak periods",
                "Implement enhanced cleaning protocols in high-traffic areas"
            ],
            "impact": "Potentially affects all hospital departments",
            "confidence": highest_risk_disease["confidence"]
        }
        
        recommendations.append(disease_rec)
        
        # Generic preparedness recommendation
        prep_rec = {
            "type": "General Preparedness",
            "title": "General Outbreak Preparedness",
            "description": "Multiple respiratory illnesses show increasing trends for the coming season.",
            "actions": [
                "Review and update outbreak response protocols",
                "Cross-train additional staff for respiratory care",
                "Ensure medication and treatment supplies are stocked above normal levels",
                "Prepare patient education materials for preventive measures"
            ],
            "impact": "Hospital-wide preparedness enhancement",
            "confidence": 80
        }
        
        recommendations.append(prep_rec)
        
        # Add disease-specific recommendations
        if disease == "Influenza":
            recommendations.append({
                "type": "Influenza",
                "title": "Influenza Vaccination Campaign",
                "description": "Implement staff and patient vaccination campaign to reduce impact of predicted influenza surge.",
                "actions": [
                    "Schedule vaccination clinics for all staff",
                    "Offer free flu vaccines to high-risk patients",
                    "Develop communication campaign about vaccine importance",
                    "Monitor vaccine supplies and adjust ordering as needed"
                ],
                "impact": "Reduced severity and spread of influenza",
                "confidence": 85
            })
        elif disease == "COVID-19":
            recommendations.append({
                "type": "COVID-19",
                "title": "COVID-19 Variant Monitoring",
                "description": "Increase monitoring of COVID-19 variants and implement targeted interventions.",
                "actions": [
                    "Enhance genomic surveillance of positive cases",
                    "Update testing protocols for new variants",
                    "Review PPE supplies and usage protocols",
                    "Prepare for potential changes in treatment protocols"
                ],
                "impact": "Improved response to evolving COVID-19 threat",
                "confidence": 75
            })
        
        return recommendations
    
    def _generate_mock_data(self):
        """Generate mock data for demonstration purposes"""
        # Generate current cases data for each disease
        current_data = {}
        historical_data = {}
        
        diseases = list(self.seasonal_patterns.keys())
        
        for disease in diseases:
            pattern = self.seasonal_patterns[disease]
            
            # Generate current number of cases
            current_month = datetime.now().month
            
            # Determine multiplier based on seasonal pattern
            if current_month in pattern["peak_months"]:
                multiplier = pattern["peak_multiplier"]
            elif current_month in pattern["moderate_months"]:
                multiplier = (pattern["peak_multiplier"] + 1) / 2
            else:
                multiplier = 1.0
            
            # Add some random variation
            random_factor = random.uniform(0.8, 1.2)
            
            # Generate current cases
            current_cases = int(pattern["baseline_value"] * multiplier * random_factor)
            
            # Add to current data
            current_data[disease] = current_cases
            
            # Generate some historical data points (simplified)
            history = []
            for days_ago in range(30, 0, -5):  # Every 5 days for the past 30 days
                date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
                
                # Add some variability
                case_variation = random.uniform(0.8, 1.2)
                historical_cases = int(current_cases * case_variation)
                
                history.append({
                    "date": date,
                    "cases": historical_cases
                })
            
            historical_data[disease] = history
        
        return historical_data, current_data
    
    def _generate_mock_historical_data(self):
        """Generate mock historical data for training"""
        historical_data = {}
        diseases = list(self.seasonal_patterns.keys())
        
        # Generate 3 years of monthly data
        for disease in diseases:
            pattern = self.seasonal_patterns[disease]
            disease_data = []
            
            # Start date 3 years ago
            start_date = datetime.now() - timedelta(days=365*3)
            
            # Generate 36 months of data
            for month_offset in range(36):
                date = start_date + timedelta(days=30*month_offset)
                month = date.month
                
                # Determine multiplier based on seasonal pattern
                if month in pattern["peak_months"]:
                    multiplier = pattern["peak_multiplier"]
                elif month in pattern["moderate_months"]:
                    multiplier = (pattern["peak_multiplier"] + 1) / 2
                else:
                    multiplier = 1.0
                
                # Add year trend effect (increases each year)
                year_factor = pattern["year_trend"] ** (month_offset // 12)
                
                # Add some random variation
                random_factor = random.uniform(0.8, 1.2)
                
                # Calculate cases
                cases = int(pattern["baseline_value"] * multiplier * year_factor * random_factor)
                
                disease_data.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "cases": cases
                })
            
            historical_data[disease] = disease_data
        
        return historical_data


# Create folder structure if it doesn't exist
os.makedirs("models/saved/disease", exist_ok=True)