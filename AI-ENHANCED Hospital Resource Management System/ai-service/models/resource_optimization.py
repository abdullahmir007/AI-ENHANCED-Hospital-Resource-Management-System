# File: models/resource_optimization.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from datetime import datetime, timedelta
import json

class ResourceOptimizer:
    def __init__(self, model_path="./models/saved/resource"):
        self.model_path = model_path
        
        # Create model directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
        
        # Load models if they exist, otherwise create new ones
        self.bed_model = self._load_model('bed_model.pkl') or RandomForestRegressor()
        self.staff_model = self._load_model('staff_model.pkl') or RandomForestRegressor()
        self.equipment_model = self._load_model('equipment_model.pkl') or RandomForestRegressor()
    
    def _load_model(self, filename):
        try:
            return joblib.load(os.path.join(self.model_path, filename))
        except (FileNotFoundError, EOFError):
            return None
    
    def _save_model(self, model, filename):
        joblib.dump(model, os.path.join(self.model_path, filename))
    
    def train(self, training_data):
        """Train resource optimization models with historical data"""
        if not training_data:
            # Use mock data for demonstration
            training_data = self._generate_mock_training_data()
        
        # Train bed optimization model
        if 'beds' in training_data:
            bed_df = pd.DataFrame(training_data['beds'])
            X_bed = bed_df.drop(['optimal_count', 'utilization'], axis=1)
            y_bed = bed_df['optimal_count']
            self.bed_model.fit(X_bed, y_bed)
            self._save_model(self.bed_model, 'bed_model.pkl')
        
        # Train staff optimization model
        if 'staff' in training_data:
            staff_df = pd.DataFrame(training_data['staff'])
            X_staff = staff_df.drop(['optimal_count', 'utilization'], axis=1)
            y_staff = staff_df['optimal_count']
            self.staff_model.fit(X_staff, y_staff)
            self._save_model(self.staff_model, 'staff_model.pkl')
        
        # Train equipment optimization model
        if 'equipment' in training_data:
            equip_df = pd.DataFrame(training_data['equipment'])
            X_equip = equip_df.drop(['optimal_count', 'utilization'], axis=1)
            y_equip = equip_df['optimal_count']
            self.equipment_model.fit(X_equip, y_equip)
            self._save_model(self.equipment_model, 'equipment_model.pkl')
        
        return {"status": "success", "message": "Models trained successfully"}
    
    def get_optimization(self, beds_data=None, staff_data=None, equipment_data=None, resource_type='all'):
        """Get optimization recommendations for hospital resources"""
        result = {
            "resources": {},
            "recommendations": []
        }
        
        if beds_data is None and staff_data is None and equipment_data is None:
            # Use mock data for demonstration
            beds_data, staff_data, equipment_data = self._generate_mock_resource_data()
        
        # Process bed optimization
        if resource_type in ['all', 'beds'] and beds_data:
            bed_recommendations = self._optimize_beds(beds_data)
            result["resources"]["beds"] = bed_recommendations['summary']
            result["recommendations"].extend(bed_recommendations['recommendations'])
        else:
            # Provide empty but valid structure for beds
            result["resources"]["beds"] = {
                "current": 0,
                "optimal": 0,
                "utilization": 0,
                "recommendations": [],
                "utilization_improvement": "0%",
                "chartData": []
            }
        
        # Process staff optimization
        if resource_type in ['all', 'staff'] and staff_data:
            staff_recommendations = self._optimize_staff(staff_data)
            result["resources"]["staff"] = staff_recommendations['summary']
            result["recommendations"].extend(staff_recommendations['recommendations'])
        else:
            # Provide empty but valid structure for staff
            result["resources"]["staff"] = {
                "current": 0,
                "optimal": 0,
                "utilization": 0,
                "recommendations": [],
                "utilization_improvement": "0%",
                "chartData": []
            }
        
        # Process equipment optimization
        if resource_type in ['all', 'equipment'] and equipment_data:
            equipment_recommendations = self._optimize_equipment(equipment_data)
            result["resources"]["equipment"] = equipment_recommendations['summary']
            result["recommendations"].extend(equipment_recommendations['recommendations'])
        else:
            # Provide empty but valid structure for equipment
            result["resources"]["equipment"] = {
                "current": 0,
                "optimal": 0,
                "utilization": 0,
                "recommendations": [],
                "utilization_improvement": "0%",
                "chartData": []
            }
        
        return result
    
    def _optimize_beds(self, beds_data):
        """Generate bed optimization recommendations"""
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(beds_data)
        
        # Calculate current utilization
        total_beds = df['total'].sum()
        total_occupied = df['occupied'].sum()
        utilization = round((total_occupied / total_beds * 100), 1) if total_beds > 0 else 0
        
        # Identify over/under-utilized wards
        df['utilization'] = df.apply(lambda x: round((x['occupied'] / x['total'] * 100), 1) if x['total'] > 0 else 0, axis=1)
        high_util_wards = df[df['utilization'] > 85]
        low_util_wards = df[df['utilization'] < 40]
        
        # Generate chart data
        chart_data = []
        recommendations = []
        
        # Estimate optimal bed count for each ward
        for _, ward in df.iterrows():
            # Simple heuristic: if utilization > 85%, increase by 10%; if < 40%, decrease by 10%
            if ward['utilization'] > 85:
                optimal = int(ward['total'] * 1.1)
                recommendations.append({
                    "id": f"bed-{ward['ward'].lower()}",
                    "resource": "Beds",
                    "area": ward['ward'],
                    "recommendation": f"Increase bed capacity in {ward['ward']} ward",
                    "impact": "High",
                    "description": f"{ward['ward']} is at {ward['utilization']}% capacity. Consider adding {optimal - ward['total']} beds or redistributing patients.",
                    "actionRequired": f"Add {optimal - ward['total']} beds to improve patient flow"
                })
            elif ward['utilization'] < 40:
                optimal = max(int(ward['total'] * 0.9), 1)  # Ensure at least 1 bed
                recommendations.append({
                    "id": f"bed-realloc-{ward['ward'].lower()}",
                    "resource": "Beds",
                    "area": ward['ward'],
                    "recommendation": f"Reallocate beds from {ward['ward']} ward",
                    "impact": "Medium",
                    "description": f"{ward['ward']} is at only {ward['utilization']}% capacity. Consider reallocating {ward['total'] - optimal} beds to high-demand areas.",
                    "actionRequired": f"Reallocate {ward['total'] - optimal} beds to optimize resource use"
                })
            else:
                optimal = ward['total']
            
            chart_data.append({
                "ward": ward['ward'],
                "current": ward['total'],
                "optimal": optimal
            })
        
        # Calculate overall optimal bed count
        optimal_total = sum(item['optimal'] for item in chart_data)
        
        # Calculate optimal utilization
        optimal_utilization = round((total_occupied / optimal_total * 100), 1) if optimal_total > 0 else 0
        
        # Generate summary
        summary = {
            "current": total_beds,
            "optimal": optimal_total,
            "utilization": utilization,
            "recommendations": [r["recommendation"] for r in recommendations],
            "utilization_improvement": f"{abs(optimal_utilization - utilization):.1f}%",
            "chartData": chart_data
        }
        
        return {
            "summary": summary,
            "recommendations": recommendations
        }
    
    def _optimize_staff(self, staff_data):
        """Generate staff optimization recommendations"""
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(staff_data)
        
        # Calculate current utilization
        total_staff = df['total'].sum()
        on_duty = df['onDuty'].sum()
        utilization = round((on_duty / total_staff * 100), 1) if total_staff > 0 else 0
        
        # Identify over/under-utilized staff types
        df['utilization'] = df.apply(lambda x: round((x['onDuty'] / x['total'] * 100), 1) if x['total'] > 0 else 0, axis=1)
        overworked_staff = df[df['utilization'] > 90]
        underutilized_staff = df[df['utilization'] < 50]
        
        # Generate chart data
        chart_data = []
        recommendations = []
        
        # Estimate optimal staff count for each type
        for _, staff_type in df.iterrows():
            # If utilization > 90%, increase by 15%; if < 50%, decrease by 10%
            if staff_type['utilization'] > 90:
                optimal = int(staff_type['total'] * 1.15)
                recommendations.append({
                    "id": f"staff-{staff_type['type'].lower()}",
                    "resource": "Staff",
                    "area": staff_type['type'],
                    "recommendation": f"Increase {staff_type['type']} staffing",
                    "impact": "High",
                    "description": f"{staff_type['type']}s are currently overutilized at {staff_type['utilization']}%. Increase staffing to reduce burnout and improve care quality.",
                    "actionRequired": f"Hire {optimal - staff_type['total']} additional {staff_type['type']}s"
                })
            elif staff_type['utilization'] < 50:
                optimal = max(int(staff_type['total'] * 0.9), 1)  # Ensure at least 1 staff
                recommendations.append({
                    "id": f"staff-realloc-{staff_type['type'].lower()}",
                    "resource": "Staff",
                    "area": staff_type['type'],
                    "recommendation": f"Optimize {staff_type['type']} scheduling",
                    "impact": "Medium",
                    "description": f"{staff_type['type']}s are currently underutilized at {staff_type['utilization']}%. Consider schedule optimization or cross-training.",
                    "actionRequired": f"Redistribute {staff_type['type']} schedules or reassign to high-demand areas"
                })
            else:
                optimal = staff_type['total']
            
            chart_data.append({
                "role": staff_type['type'],
                "current": staff_type['total'],
                "optimal": optimal
            })
        
        # Calculate overall optimal staff count
        optimal_total = sum(item['optimal'] for item in chart_data)
        
        # Calculate optimal utilization
        optimal_utilization = round((on_duty / optimal_total * 100), 1) if optimal_total > 0 else 0
        
        # Generate summary
        summary = {
            "current": total_staff,
            "optimal": optimal_total,
            "utilization": utilization,
            "recommendations": [r["recommendation"] for r in recommendations],
            "utilization_improvement": f"{abs(optimal_utilization - utilization):.1f}%",
            "chartData": chart_data
        }
        
        return {
            "summary": summary,
            "recommendations": recommendations
        }
    
    def _optimize_equipment(self, equipment_data):
        """Generate equipment optimization recommendations"""
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(equipment_data)
        
        # Calculate current utilization
        total_equipment = df['total'].sum()
        in_use = df['inUse'].sum() if 'inUse' in df.columns else 0
        utilization = round((in_use / total_equipment * 100), 1) if total_equipment > 0 else 0
        
        # Calculate utilization for each equipment category
        df['utilization'] = df.apply(
            lambda x: round((x.get('inUse', 0) / x['total'] * 100), 1) if x['total'] > 0 else 0, 
            axis=1
        )
        high_util_equip = df[df['utilization'] > 80]
        low_util_equip = df[df['utilization'] < 45]
        
        # Generate chart data
        chart_data = []
        recommendations = []
        
        # Estimate optimal equipment count for each category
        for _, equip in df.iterrows():
            # If utilization > 80%, increase by 10%; if < 45%, decrease by 15%
            if equip['utilization'] > 80:
                optimal = int(equip['total'] * 1.1)
                recommendations.append({
                    "id": f"equip-{equip['category'].lower()}",
                    "resource": "Equipment",
                    "area": equip['category'],
                    "recommendation": f"Increase {equip['category']} availability",
                    "impact": "High",
                    "description": f"{equip['category']} equipment is highly utilized at {equip['utilization']}%. Consider acquiring additional units to reduce bottlenecks.",
                    "actionRequired": f"Acquire {optimal - equip['total']} additional {equip['category']} units"
                })
            elif equip['utilization'] < 45:
                optimal = max(int(equip['total'] * 0.85), 1)  # Ensure at least 1 equipment
                recommendations.append({
                    "id": f"equip-realloc-{equip['category'].lower()}",
                    "resource": "Equipment",
                    "area": equip['category'],
                    "recommendation": f"Reduce {equip['category']} equipment count",
                    "impact": "Medium",
                    "description": f"{equip['category']} equipment is underutilized at {equip['utilization']}%. Consider reallocating or replacing with multi-purpose units.",
                    "actionRequired": f"Reallocate {equip['total'] - optimal} {equip['category']} units to high-demand areas"
                })
            else:
                optimal = equip['total']
            
            chart_data.append({
                "type": equip['category'],
                "current": equip['total'],
                "optimal": optimal
            })
        
        # Additional specialized recommendations
        if len(df) > 0:
            recommendations.append({
                "id": "equip-scheduling",
                "resource": "Equipment",
                "area": "Scheduling",
                "recommendation": "Implement equipment scheduling system",
                "impact": "High",
                "description": "A centralized equipment scheduling system could increase utilization by 15-20% across all categories.",
                "actionRequired": "Deploy scheduling system to improve resource tracking and utilization"
            })
        
        # Calculate overall optimal equipment count
        optimal_total = sum(item['optimal'] for item in chart_data)
        
        # Calculate optimal utilization
        optimal_utilization = round((in_use / optimal_total * 100), 1) if optimal_total > 0 else 0
        
        # Generate summary
        summary = {
            "current": total_equipment,
            "optimal": optimal_total,
            "utilization": utilization,
            "recommendations": [r["recommendation"] for r in recommendations],
            "utilization_improvement": f"{abs(optimal_utilization - utilization):.1f}%",
            "chartData": chart_data
        }
        
        return {
            "summary": summary,
            "recommendations": recommendations
        }
    
    def _generate_mock_resource_data(self):
        """Generate mock data for demonstration purposes"""
        # Mock bed data
        beds_data = [
            {"ward": "ICU", "total": 25, "occupied": 22, "available": 3},
            {"ward": "ER", "total": 15, "occupied": 12, "available": 3},
            {"ward": "General", "total": 60, "occupied": 45, "available": 15},
            {"ward": "Pediatric", "total": 20, "occupied": 8, "available": 12},
            {"ward": "Maternity", "total": 10, "occupied": 8, "available": 2}
        ]
        
        # Mock staff data
        staff_data = [
            {"type": "Physician", "total": 22, "onDuty": 18, "offDuty": 4},
            {"type": "Nurse", "total": 35, "onDuty": 32, "offDuty": 3},
            {"type": "Technician", "total": 18, "onDuty": 15, "offDuty": 3},
            {"type": "Admin", "total": 12, "onDuty": 5, "offDuty": 7}
        ]
        
        # Mock equipment data
        equipment_data = [
            {"category": "Ventilators", "total": 15, "inUse": 12, "available": 3, "maintenance": 0},
            {"category": "MRI", "total": 3, "inUse": 2, "available": 0, "maintenance": 1},
            {"category": "X-ray", "total": 18, "inUse": 8, "available": 8, "maintenance": 2},
            {"category": "CT Scan", "total": 4, "inUse": 3, "available": 1, "maintenance": 0},
            {"category": "Ultrasound", "total": 10, "inUse": 7, "available": 3, "maintenance": 0},
            {"category": "Monitoring", "total": 15, "inUse": 13, "available": 2, "maintenance": 0}
        ]
        
        return beds_data, staff_data, equipment_data
    
    def _generate_mock_training_data(self):
        """Generate mock training data for resource optimization models"""
        # This method remains unchanged
        # Your existing code for generating training data
        return {
            "beds": [],
            "staff": [],
            "equipment": []
        }


# Create folder structure if it doesn't exist
os.makedirs("models/saved/resource", exist_ok=True)