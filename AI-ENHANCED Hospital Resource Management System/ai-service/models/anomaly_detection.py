# File: models/anomaly_detection.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os
import joblib
import json
import random

class AnomalyDetector:
    def __init__(self, model_path="./models/saved/anomaly"):
        self.model_path = model_path
        
        # Create model directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
        
        # Initialize models
        self.resource_model = self._load_model('resource_model.pkl') or IsolationForest(contamination=0.05)
        self.patient_model = self._load_model('patient_model.pkl') or IsolationForest(contamination=0.05)
        self.financial_model = self._load_model('financial_model.pkl') or IsolationForest(contamination=0.05)
        
        # Initialize normal ranges for different metrics
        self.normal_ranges = self._load_normal_ranges() or self._generate_normal_ranges()
    
    def _load_model(self, filename):
        try:
            return joblib.load(os.path.join(self.model_path, filename))
        except (FileNotFoundError, EOFError):
            return None
    
    def _save_model(self, model, filename):
        joblib.dump(model, os.path.join(self.model_path, filename))
    
    def _load_normal_ranges(self):
        try:
            with open(os.path.join(self.model_path, 'normal_ranges.json'), 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    def _save_normal_ranges(self):
        with open(os.path.join(self.model_path, 'normal_ranges.json'), 'w') as f:
            json.dump(self.normal_ranges, f)
    
    def _generate_normal_ranges(self):
        """Generate normal ranges for different hospital metrics"""
        return {
            "resource": {
                "bed_occupancy": {"mean": 75, "std": 10},
                "staff_utilization": {"mean": 80, "std": 8},
                "equipment_usage": {"mean": 65, "std": 12}
            },
            "patient": {
                "readmission_rate": {"mean": 8.5, "std": 1.5},
                "length_of_stay": {"mean": 4.2, "std": 0.8},
                "medication_errors": {"mean": 2.1, "std": 1.0}
            },
            "financial": {
                "daily_expenses": {"mean": 24500, "std": 3500},
                "revenue_per_bed": {"mean": 3200, "std": 450},
                "supply_costs": {"mean": 8500, "std": 1200}
            }
        }
    
    def train(self, training_data=None):
        """Train anomaly detection models with historical data"""
        if not training_data:
            # Use mock data for demonstration
            training_data = self._generate_mock_training_data()
        
        # Train resource model
        if 'resource' in training_data:
            resource_df = pd.DataFrame(training_data['resource'])
            # Standardize the data
            scaler = StandardScaler()
            resource_data_scaled = scaler.fit_transform(resource_df.drop(['date', 'is_anomaly'], axis=1))
            # Train isolation forest
            self.resource_model.fit(resource_data_scaled)
            self._save_model(self.resource_model, 'resource_model.pkl')
        
        # Train patient model
        if 'patient' in training_data:
            patient_df = pd.DataFrame(training_data['patient'])
            # Standardize the data
            scaler = StandardScaler()
            patient_data_scaled = scaler.fit_transform(patient_df.drop(['date', 'is_anomaly'], axis=1))
            # Train isolation forest
            self.patient_model.fit(patient_data_scaled)
            self._save_model(self.patient_model, 'patient_model.pkl')
        
        # Train financial model
        if 'financial' in training_data:
            financial_df = pd.DataFrame(training_data['financial'])
            # Standardize the data
            scaler = StandardScaler()
            financial_data_scaled = scaler.fit_transform(financial_df.drop(['date', 'is_anomaly'], axis=1))
            # Train isolation forest
            self.financial_model.fit(financial_data_scaled)
            self._save_model(self.financial_model, 'financial_model.pkl')
        
        return {"status": "success", "message": "Anomaly detection models trained successfully"}
    
    def detect(self, resource_data=None, patient_data=None, financial_data=None, detection_type='all'):
        """Detect anomalies in hospital operations data"""
        if resource_data is None and patient_data is None and financial_data is None:
            # Use mock data for demonstration
            resource_data, patient_data, financial_data = self._generate_mock_data()
        
        result = {
            "categories": {},
            "detectionDate": datetime.now().isoformat(),
            "totalAnomalies": 0
        }
        
        # Process resource anomalies
        if detection_type in ['all', 'resource'] and resource_data:
            resource_anomalies = self._detect_resource_anomalies(resource_data)
            result["categories"]["resource"] = resource_anomalies
            result["totalAnomalies"] += len(resource_anomalies["anomalies"])
        
        # Process patient anomalies
        if detection_type in ['all', 'patient'] and patient_data:
            patient_anomalies = self._detect_patient_anomalies(patient_data)
            result["categories"]["patient"] = patient_anomalies
            result["totalAnomalies"] += len(patient_anomalies["anomalies"])
        
        # Process financial anomalies
        if detection_type in ['all', 'financial'] and financial_data:
            financial_anomalies = self._detect_financial_anomalies(financial_data)
            result["categories"]["financial"] = financial_anomalies
            result["totalAnomalies"] += len(financial_anomalies["anomalies"])
        
        return result
    
    def _detect_resource_anomalies(self, resource_data):
        """Detect anomalies in resource usage"""
        # For demo purposes, use statistical approach
        # In a real application, would use the trained model
        
        # Initialize result structure
        result = {
            "title": "Resource Usage Anomalies",
            "description": "Detection of unusual patterns in hospital resource utilization",
            "anomalies": [],
            "chartData": []
        }
        
        # Get normal ranges
        bed_occupancy_range = self.normal_ranges["resource"]["bed_occupancy"]
        staff_utilization_range = self.normal_ranges["resource"]["staff_utilization"]
        equipment_usage_range = self.normal_ranges["resource"]["equipment_usage"]
        
        # Process data to detect anomalies
        dates = []
        bed_values = []
        staff_values = []
        equipment_values = []
        
        for entry in resource_data:
            dates.append(entry["date"])
            
            # Extract values
            bed_occupancy = entry.get("bed_occupancy", 0)
            staff_utilization = entry.get("staff_utilization", 0)
            equipment_usage = entry.get("equipment_usage", 0)
            
            bed_values.append(bed_occupancy)
            staff_values.append(staff_utilization)
            equipment_values.append(equipment_usage)
            
            # Check for anomalies (values outside 2 standard deviations)
            bed_anomaly = abs(bed_occupancy - bed_occupancy_range["mean"]) > 2 * bed_occupancy_range["std"]
            staff_anomaly = abs(staff_utilization - staff_utilization_range["mean"]) > 2 * staff_utilization_range["std"]
            equipment_anomaly = abs(equipment_usage - equipment_usage_range["mean"]) > 2 * equipment_usage_range["std"]
            
            # Add detected anomalies
            if bed_anomaly and bed_occupancy > bed_occupancy_range["mean"]:
                result["anomalies"].append({
                    "id": f"bed-{len(result['anomalies'])}",
                    "title": "Abnormal Bed Occupancy",
                    "description": f"Bed occupancy reached {bed_occupancy}%, {round(bed_occupancy - bed_occupancy_range['mean'], 1)}% above normal pattern",
                    "severity": "critical" if bed_occupancy > 95 else "warning",
                    "timestamp": entry["date"],
                    "relatedMetric": "Bed Allocation"
                })
            
            if staff_anomaly and staff_utilization > staff_utilization_range["mean"]:
                result["anomalies"].append({
                    "id": f"staff-{len(result['anomalies'])}",
                    "title": "Staff Utilization Spike",
                    "description": f"Staff utilization reached {staff_utilization}%, {round(staff_utilization - staff_utilization_range['mean'], 1)}% above normal pattern",
                    "severity": "critical" if staff_utilization > 95 else "warning",
                    "timestamp": entry["date"],
                    "relatedMetric": "Staff Scheduling"
                })
            
            if equipment_anomaly and equipment_usage > equipment_usage_range["mean"]:
                result["anomalies"].append({
                    "id": f"equip-{len(result['anomalies'])}",
                    "title": "Abnormal Equipment Usage",
                    "description": f"Equipment usage increased to {equipment_usage}%, {round(equipment_usage - equipment_usage_range['mean'], 1)}% above normal pattern",
                    "severity": "critical" if equipment_usage > 90 else "medium",
                    "timestamp": entry["date"],
                    "relatedMetric": "Equipment Usage"
                })
        
        # Create chart data for visualization
        for i, date in enumerate(dates):
            # Determine if this date has an anomaly
            has_anomaly = any(a["timestamp"] == date for a in result["anomalies"])
            
            # Take average of the three metrics for simplicity
            actual_value = (bed_values[i] + staff_values[i] + equipment_values[i]) / 3
            normal_value = (bed_occupancy_range["mean"] + staff_utilization_range["mean"] + equipment_usage_range["mean"]) / 3
            
            # Add to chart data
            result["chartData"].append({
                "date": date.split("T")[0] if "T" in date else date,
                "normal": normal_value,
                "actual": actual_value,
                "anomaly": has_anomaly
            })
        
        return result
    
    def _detect_patient_anomalies(self, patient_data):
        """Detect anomalies in patient care metrics"""
        # Initialize result structure
        result = {
            "title": "Patient Care Anomalies",
            "description": "Detection of unusual patterns in patient care metrics",
            "anomalies": [],
            "chartData": []
        }
        
        # Get normal ranges
        readmission_range = self.normal_ranges["patient"]["readmission_rate"]
        los_range = self.normal_ranges["patient"]["length_of_stay"]
        med_errors_range = self.normal_ranges["patient"]["medication_errors"]
        
        # Process data to detect anomalies
        dates = []
        readmission_values = []
        los_values = []
        med_error_values = []
        
        for entry in patient_data:
            dates.append(entry["date"])
            
            # Extract values
            readmission_rate = entry.get("readmission_rate", 0)
            length_of_stay = entry.get("length_of_stay", 0)
            medication_errors = entry.get("medication_errors", 0)
            
            readmission_values.append(readmission_rate)
            los_values.append(length_of_stay)
            med_error_values.append(medication_errors)
            
            # Check for anomalies
            readmission_anomaly = abs(readmission_rate - readmission_range["mean"]) > 2 * readmission_range["std"]
            los_anomaly = abs(length_of_stay - los_range["mean"]) > 2 * los_range["std"]
            med_errors_anomaly = abs(medication_errors - med_errors_range["mean"]) > 2 * med_errors_range["std"]
            
            # Add detected anomalies
            if readmission_anomaly and readmission_rate > readmission_range["mean"]:
                result["anomalies"].append({
                    "id": f"readm-{len(result['anomalies'])}",
                    "title": "Readmission Rate Increase",
                    "description": f"30-day readmission rate increased to {readmission_rate}% ({round(readmission_rate - readmission_range['mean'], 1)}% above baseline)",
                    "severity": "warning",
                    "timestamp": entry["date"],
                    "relatedMetric": "Patient Outcomes"
                })
            
            if los_anomaly and length_of_stay > los_range["mean"]:
                result["anomalies"].append({
                    "id": f"los-{len(result['anomalies'])}",
                    "title": "Length of Stay Increase",
                    "description": f"Average length of stay increased to {length_of_stay} days ({round(length_of_stay - los_range['mean'], 1)} days above normal)",
                    "severity": "medium",
                    "timestamp": entry["date"],
                    "relatedMetric": "Patient Flow"
                })
            
            if med_errors_anomaly and medication_errors > med_errors_range["mean"]:
                result["anomalies"].append({
                    "id": f"med-{len(result['anomalies'])}",
                    "title": "Medication Error Rate Spike",
                    "description": f"Medication errors increased to {medication_errors} per 100 patients ({round(medication_errors - med_errors_range['mean'], 1)} above baseline)",
                    "severity": "critical" if medication_errors > 5 else "warning",
                    "timestamp": entry["date"],
                    "relatedMetric": "Medication"
                })
        
        # Create chart data for visualization
        for i, date in enumerate(dates):
            # Determine if this date has an anomaly
            has_anomaly = any(a["timestamp"] == date for a in result["anomalies"])
            
            # Use readmission rate for chart data as main metric
            actual_value = readmission_values[i]
            normal_value = readmission_range["mean"]
            
            # Add to chart data
            result["chartData"].append({
                "date": date.split("T")[0] if "T" in date else date,
                "normal": normal_value,
                "actual": actual_value,
                "anomaly": has_anomaly
            })
        
        return result
    
    def _detect_financial_anomalies(self, financial_data):
        """Detect anomalies in financial metrics"""
        # Initialize result structure
        result = {
            "title": "Financial Anomalies",
            "description": "Detection of unusual patterns in financial and billing metrics",
            "anomalies": [],
            "chartData": []
        }
        
        # Get normal ranges
        expenses_range = self.normal_ranges["financial"]["daily_expenses"]
        revenue_range = self.normal_ranges["financial"]["revenue_per_bed"]
        supply_range = self.normal_ranges["financial"]["supply_costs"]
        
        # Process data to detect anomalies
        dates = []
        expense_values = []
        revenue_values = []
        supply_values = []
        
        for entry in financial_data:
            dates.append(entry["date"])
            
            # Extract values
            daily_expenses = entry.get("daily_expenses", 0)
            revenue_per_bed = entry.get("revenue_per_bed", 0)
            supply_costs = entry.get("supply_costs", 0)
            
            expense_values.append(daily_expenses)
            revenue_values.append(revenue_per_bed)
            supply_values.append(supply_costs)
            
            # Check for anomalies
            expense_anomaly = abs(daily_expenses - expenses_range["mean"]) > 2.5 * expenses_range["std"]
            revenue_anomaly = abs(revenue_per_bed - revenue_range["mean"]) > 2.5 * revenue_range["std"]
            supply_anomaly = abs(supply_costs - supply_range["mean"]) > 2.5 * supply_range["std"]
            
            # Add detected anomalies
            if expense_anomaly and daily_expenses > expenses_range["mean"]:
                result["anomalies"].append({
                    "id": f"exp-{len(result['anomalies'])}",
                    "title": "Daily Expense Spike",
                    "description": f"Daily expenses reached ${daily_expenses}, ${round(daily_expenses - expenses_range['mean'])} above average",
                    "severity": "warning",
                    "timestamp": entry["date"],
                    "relatedMetric": "Expenses"
                })
            
            if revenue_anomaly and revenue_per_bed < revenue_range["mean"]:
                result["anomalies"].append({
                    "id": f"rev-{len(result['anomalies'])}",
                    "title": "Revenue Per Bed Decrease",
                    "description": f"Revenue per bed fell to ${revenue_per_bed}, ${round(revenue_range['mean'] - revenue_per_bed)} below average",
                    "severity": "medium",
                    "timestamp": entry["date"],
                    "relatedMetric": "Revenue"
                })
            
            if supply_anomaly and supply_costs > supply_range["mean"]:
                result["anomalies"].append({
                    "id": f"sup-{len(result['anomalies'])}",
                    "title": "Supply Cost Variation",
                    "description": f"Supply costs increased to ${supply_costs}, ${round(supply_costs - supply_range['mean'])} above normal",
                    "severity": "warning",
                    "timestamp": entry["date"],
                    "relatedMetric": "Supply Chain"
                })
        
        # Create chart data for visualization
        for i, date in enumerate(dates):
            # Determine if this date has an anomaly
            has_anomaly = any(a["timestamp"] == date for a in result["anomalies"])
            
            # Use daily expenses for chart data
            actual_value = expense_values[i]
            normal_value = expenses_range["mean"]
            
            # Add to chart data
            result["chartData"].append({
                "date": date.split("T")[0] if "T" in date else date,
                "normal": normal_value,
                "actual": actual_value,
                "anomaly": has_anomaly
            })
        
        return result
    
    def _generate_mock_data(self):
        """Generate mock data for demonstration purposes"""
        # Generate dates for the past 7 days
        dates = []
        for days_ago in range(6, -1, -1):
            date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            dates.append(date)
        
        # Generate resource data
        resource_data = []
        bed_occupancy_mean = self.normal_ranges["resource"]["bed_occupancy"]["mean"]
        staff_util_mean = self.normal_ranges["resource"]["staff_utilization"]["mean"]
        equip_usage_mean = self.normal_ranges["resource"]["equipment_usage"]["mean"]
        
        for i, date in enumerate(dates):
            # Normal pattern with slight randomness
            randomness = random.uniform(0.9, 1.1)
            
            # Add anomalies on last few days
            if i >= 4:  # Last 3 days have anomalies
                randomness = random.uniform(1.15, 1.25)  # Significantly higher
            
            resource_data.append({
                "date": date,
                "bed_occupancy": round(bed_occupancy_mean * randomness, 1),
                "staff_utilization": round(staff_util_mean * randomness, 1),
                "equipment_usage": round(equip_usage_mean * randomness, 1)
            })
        
        # Generate patient data
        patient_data = []
        readmission_mean = self.normal_ranges["patient"]["readmission_rate"]["mean"]
        los_mean = self.normal_ranges["patient"]["length_of_stay"]["mean"]
        med_errors_mean = self.normal_ranges["patient"]["medication_errors"]["mean"]
        
        for i, date in enumerate(dates):
            # Normal pattern with slight randomness
            randomness = random.uniform(0.9, 1.1)
            
            # Add anomalies on days 3-5
            if 2 <= i <= 5:
                randomness = random.uniform(1.2, 1.4)  # Higher values
            
            patient_data.append({
                "date": date,
                "readmission_rate": round(readmission_mean * randomness, 1),
                "length_of_stay": round(los_mean * randomness, 1),
                "medication_errors": round(med_errors_mean * randomness, 1)
            })
        
        # Generate financial data
        financial_data = []
        expenses_mean = self.normal_ranges["financial"]["daily_expenses"]["mean"]
        revenue_mean = self.normal_ranges["financial"]["revenue_per_bed"]["mean"]
        supply_mean = self.normal_ranges["financial"]["supply_costs"]["mean"]
        
        for i, date in enumerate(dates):
            # Normal pattern with slight randomness
            randomness = random.uniform(0.9, 1.1)
            
            # Add anomalies on days 2-4
            if 2 <= i <= 4:
                randomness = random.uniform(1.25, 1.35)  # Higher values
            
            financial_data.append({
                "date": date,
                "daily_expenses": round(expenses_mean * randomness),
                "revenue_per_bed": round(revenue_mean * (2 - randomness)),  # Inverse relation
                "supply_costs": round(supply_mean * randomness)
            })
        
        return resource_data, patient_data, financial_data
    
    def _generate_mock_training_data(self):
        """Generate mock training data for anomaly detection models"""
        # Generate 60 days of data with some anomalies
        dates = []
        for days_ago in range(59, -1, -1):
            date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            dates.append(date)
        
        # Generate resource training data (5% anomalies)
        resource_data = []
        bed_range = self.normal_ranges["resource"]["bed_occupancy"]
        staff_range = self.normal_ranges["resource"]["staff_utilization"]
        equip_range = self.normal_ranges["resource"]["equipment_usage"]
        
        for date in dates:
            # Determine if this entry should be an anomaly (5% chance)
            is_anomaly = random.random() < 0.05
            
            if is_anomaly:
                # Generate anomalous values (outside normal range)
                bed_occupancy = bed_range["mean"] + random.uniform(2.5, 4) * bed_range["std"] * random.choice([-1, 1])
                staff_utilization = staff_range["mean"] + random.uniform(2.5, 4) * staff_range["std"] * random.choice([-1, 1])
                equipment_usage = equip_range["mean"] + random.uniform(2.5, 4) * equip_range["std"] * random.choice([-1, 1])
            else:
                # Generate normal values
                bed_occupancy = bed_range["mean"] + random.uniform(-1, 1) * bed_range["std"]
                staff_utilization = staff_range["mean"] + random.uniform(-1, 1) * staff_range["std"]
                equipment_usage = equip_range["mean"] + random.uniform(-1, 1) * equip_range["std"]
            
            resource_data.append({
                "date": date,
                "bed_occupancy": max(0, round(bed_occupancy, 1)),
                "staff_utilization": max(0, round(staff_utilization, 1)),
                "equipment_usage": max(0, round(equipment_usage, 1)),
                "is_anomaly": is_anomaly
            })
        
        # Generate patient training data
        patient_data = []
        readmission_range = self.normal_ranges["patient"]["readmission_rate"]
        los_range = self.normal_ranges["patient"]["length_of_stay"]
        med_errors_range = self.normal_ranges["patient"]["medication_errors"]
        
        for date in dates:
            # Determine if this entry should be an anomaly (5% chance)
            is_anomaly = random.random() < 0.05
            
            if is_anomaly:
                # Generate anomalous values
                readmission_rate = readmission_range["mean"] + random.uniform(2.5, 4) * readmission_range["std"] * random.choice([-1, 1])
                length_of_stay = los_range["mean"] + random.uniform(2.5, 4) * los_range["std"] * random.choice([-1, 1])
                medication_errors = med_errors_range["mean"] + random.uniform(2.5, 4) * med_errors_range["std"] * random.choice([-1, 1])
            else:
                # Generate normal values
                readmission_rate = readmission_range["mean"] + random.uniform(-1, 1) * readmission_range["std"]
                length_of_stay = los_range["mean"] + random.uniform(-1, 1) * los_range["std"]
                medication_errors = med_errors_range["mean"] + random.uniform(-1, 1) * med_errors_range["std"]
            
            patient_data.append({
                "date": date,
                "readmission_rate": max(0, round(readmission_rate, 1)),
                "length_of_stay": max(0, round(length_of_stay, 1)),
                "medication_errors": max(0, round(medication_errors, 1)),
                "is_anomaly": is_anomaly
            })
        
        # Generate financial training data
        financial_data = []
        expenses_range = self.normal_ranges["financial"]["daily_expenses"]
        revenue_range = self.normal_ranges["financial"]["revenue_per_bed"]
        supply_range = self.normal_ranges["financial"]["supply_costs"]
        
        for date in dates:
            # Determine if this entry should be an anomaly (5% chance)
            is_anomaly = random.random() < 0.05
            
            if is_anomaly:
                # Generate anomalous values
                daily_expenses = expenses_range["mean"] + random.uniform(2.5, 4) * expenses_range["std"] * random.choice([-1, 1])
                revenue_per_bed = revenue_range["mean"] + random.uniform(2.5, 4) * revenue_range["std"] * random.choice([-1, 1])
                supply_costs = supply_range["mean"] + random.uniform(2.5, 4) * supply_range["std"] * random.choice([-1, 1])
            else:
                # Generate normal values
                daily_expenses = expenses_range["mean"] + random.uniform(-1, 1) * expenses_range["std"]
                revenue_per_bed = revenue_range["mean"] + random.uniform(-1, 1) * revenue_range["std"]
                supply_costs = supply_range["mean"] + random.uniform(-1, 1) * supply_range["std"]
            
            financial_data.append({
                "date": date,
                "daily_expenses": max(0, round(daily_expenses)),
                "revenue_per_bed": max(0, round(revenue_per_bed)),
                "supply_costs": max(0, round(supply_costs)),
                "is_anomaly": is_anomaly
            })
        
        return {
            "resource": resource_data,
            "patient": patient_data,
            "financial": financial_data
        }


# Create folder structure if it doesn't exist
os.makedirs("models/saved/anomaly", exist_ok=True)