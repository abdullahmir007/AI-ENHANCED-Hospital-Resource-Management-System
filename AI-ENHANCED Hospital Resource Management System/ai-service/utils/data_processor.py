# File: utils/data_processor.py
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv

class DataProcessor:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Initialize MongoDB connection (if available)
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hospital-resource-management')
        self.mongo_client = None
        self.db = None
        
        # Try to connect to MongoDB
        try:
            self.mongo_client = MongoClient(self.mongo_uri)
            self.db = self.mongo_client.get_database()
            print(f"Connected to MongoDB: {self.db.name}")
        except Exception as e:
            print(f"Could not connect to MongoDB: {e}")
            self.mongo_client = None
            self.db = None
    
    def fetch_bed_data(self, days=30):
        """Fetch bed data from database or generate mock data"""
        if self.db is not None:
            try:
                # Get aggregated stats by ward
                pipeline = [
                    {
                        '$group': {
                            '_id': '$ward',
                            'total': {'$sum': 1},
                            'occupied': {'$sum': {'$cond': [{'$eq': ['$status', 'Occupied']}, 1, 0]}},
                            'available': {'$sum': {'$cond': [{'$eq': ['$status', 'Available']}, 1, 0]}}
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'ward': '$_id',
                            'total': 1,
                            'occupied': 1,
                            'available': 1
                        }
                    }
                ]
                
                stats = list(self.db.beds.aggregate(pipeline))
                print(f"Successfully fetched bed data from MongoDB: {len(stats)} wards")
                
                return {
                    'stats': stats
                }
            except Exception as e:
                print(f"Error fetching bed data from MongoDB: {e}")
                # Fall back to mock data
                return self._generate_mock_bed_data()
        else:
            # No DB connection, use mock data
            print("No MongoDB connection, using mock bed data")
            return self._generate_mock_bed_data()
    
    def fetch_staff_data(self, days=30):
        """Fetch staff data from database or generate mock data"""
        if self.db is not None:
            try:
                print("Attempting to fetch staff data from 'staffs' collection")
                
                # Get aggregated stats by staff type
                pipeline = [
                    {
                        '$group': {
                            '_id': {'$ifNull': ['$staffType', '$type']},  # Try both field names
                            'total': {'$sum': 1},
                            'onDuty': {
                                '$sum': {
                                    '$cond': [
                                        {'$or': [
                                            {'$eq': ['$onDuty', True]},
                                            {'$eq': ['$onDuty', 1]},
                                            {'$eq': ['$status', 'On Duty']}
                                        ]},
                                        1, 0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        '$match': {
                            '_id': {'$ne': None}  # Filter out null types
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'type': '$_id',
                            'total': 1,
                            'onDuty': 1
                        }
                    }
                ]
                
                stats = list(self.db.staffs.aggregate(pipeline))
                print(f"Successfully fetched staff data from MongoDB: {len(stats)} staff types")
                
                # If no data found, try with the singular 'staff' collection name
                if len(stats) == 0:
                    print("No staff data found in 'staffs' collection, trying 'staff' collection")
                    stats = list(self.db.staff.aggregate(pipeline)) if 'staff' in self.db.list_collection_names() else []
                    print(f"After trying 'staff' collection: {len(stats)} staff types found")
                
                return {
                    'stats': stats
                }
            except Exception as e:
                print(f"Error fetching staff data from MongoDB: {e}")
                return self._generate_mock_staff_data()
        else:
            print("No MongoDB connection, using mock staff data")
            return self._generate_mock_staff_data()
    
    def fetch_equipment_data(self, days=30):
        """Fetch equipment data from database or generate mock data"""
        if self.db is not None:
            try:
                print("Attempting to fetch equipment data from 'equipment' collection")
                
                # Get aggregated stats by category
                pipeline = [
                    {
                        '$group': {
                            '_id': {'$ifNull': ['$category', '$type']},  # Try both field names
                            'total': {'$sum': 1},
                            'inUse': {'$sum': {'$cond': [{'$eq': ['$status', 'In Use']}, 1, 0]}},
                            'available': {'$sum': {'$cond': [{'$eq': ['$status', 'Available']}, 1, 0]}},
                            'maintenance': {'$sum': {'$cond': [{'$eq': ['$status', 'Maintenance']}, 1, 0]}}
                        }
                    },
                    {
                        '$match': {
                            '_id': {'$ne': None}  # Filter out null categories
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'category': '$_id',
                            'total': 1,
                            'inUse': 1,
                            'available': 1,
                            'maintenance': 1
                        }
                    }
                ]
                
                stats = list(self.db.equipment.aggregate(pipeline))
                print(f"Successfully fetched equipment data from MongoDB: {len(stats)} categories")
                
                return {
                    'stats': stats
                }
            except Exception as e:
                print(f"Error fetching equipment data from MongoDB: {e}")
                return self._generate_mock_equipment_data()
        else:
            print("No MongoDB connection, using mock equipment data")
            return self._generate_mock_equipment_data()
    
    def fetch_patient_data(self, days=30):
        """Fetch patient data from database or generate mock data"""
        if self.db is not None:
            try:
                # Try to fetch from database
                collection = self.db.patients
                
                # Get patients admitted in the last 'days' days
                date_cutoff = datetime.now() - timedelta(days=days)
                patients = list(collection.find({
                    'admissionDate': {'$gte': date_cutoff}
                }, {
                    'patientId': 1, 
                    'name': 1, 
                    'age': 1, 
                    'gender': 1,
                    'diagnosis': 1,
                    'status': 1,
                    'admissionDate': 1,
                    'dischargeDate': 1
                }))
                
                # Convert to desired format
                patient_data = []
                for patient in patients:
                    patient_data.append({
                        'id': str(patient.get('_id')),
                        'patientId': patient.get('patientId'),
                        'name': patient.get('name'),
                        'age': patient.get('age'),
                        'gender': patient.get('gender'),
                        'diagnosis': patient.get('diagnosis'),
                        'status': patient.get('status'),
                        'admissionDate': patient.get('admissionDate'),
                        'dischargeDate': patient.get('dischargeDate')
                    })
                
                # Get diagnoses distribution
                pipeline = [
                    {
                        '$group': {
                            '_id': '$diagnosis',
                            'count': {'$sum': 1}
                        }
                    },
                    {
                        '$sort': {'count': -1}
                    },
                    {
                        '$limit': 10
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'diagnosis': '$_id',
                            'count': 1
                        }
                    }
                ]
                
                diagnoses = list(collection.aggregate(pipeline))
                
                return {
                    'patients': patient_data,
                    'diagnoses': diagnoses
                }
            except Exception as e:
                print(f"Error fetching patient data: {e}")
                # Fall back to mock data
                return self._generate_mock_patient_data(days)
        else:
            # No DB connection, use mock data
            return self._generate_mock_patient_data(days)
    
    def fetch_historical_metrics(self, metric_type, days=30):
        """Fetch historical metrics data for AI analysis"""
        if self.db is not None:
            try:
                # In a real application, this would fetch actual metrics
                # For this demo, we'll use the mock data generator
                return self._generate_mock_historical_metrics(metric_type, days)
            except Exception as e:
                print(f"Error fetching historical metrics: {e}")
                return self._generate_mock_historical_metrics(metric_type, days)
        else:
            return self._generate_mock_historical_metrics(metric_type, days)
    
    def _generate_mock_bed_data(self):
        """Generate mock bed data"""
        wards = ['ICU', 'ER', 'General', 'Pediatric', 'Maternity', 'Surgical']
        stats = []
        for ward in wards:
            if ward == 'ICU':
                total = random.randint(18, 25)
                occupancy_rate = random.uniform(0.8, 0.95)
            elif ward == 'ER':
                total = random.randint(15, 20)
                occupancy_rate = random.uniform(0.75, 0.9)
            elif ward == 'General':
                total = random.randint(50, 70)
                occupancy_rate = random.uniform(0.65, 0.85)
            elif ward == 'Pediatric':
                total = random.randint(15, 25)
                occupancy_rate = random.uniform(0.5, 0.8)
            elif ward == 'Maternity':
                total = random.randint(10, 15)
                occupancy_rate = random.uniform(0.6, 0.9)
            else:  # Surgical
                total = random.randint(20, 30)
                occupancy_rate = random.uniform(0.7, 0.9)
            
            occupied = int(total * occupancy_rate)
            available = total - occupied
            
            stats.append({
                'ward': ward,
                'total': total,
                'occupied': occupied,
                'available': available
            })
        
        return {
            'stats': stats
        }
    
    def _generate_mock_staff_data(self):
        """Generate mock staff data"""
        staff_types = ['Physician', 'Nurse', 'Technician', 'Admin']
        stats = []
        for staff_type in staff_types:
            if staff_type == 'Physician':
                total = random.randint(15, 25)
                duty_rate = random.uniform(0.6, 0.75)
            elif staff_type == 'Nurse':
                total = random.randint(60, 80)
                duty_rate = random.uniform(0.7, 0.85)
            elif staff_type == 'Technician':
                total = random.randint(15, 25)
                duty_rate = random.uniform(0.6, 0.8)
            else:  # Administrator
                total = random.randint(8, 15)
                duty_rate = random.uniform(0.8, 1.0)
            
            on_duty = int(total * duty_rate)
            
            stats.append({
                'type': staff_type,
                'total': total,
                'onDuty': on_duty
            })
        
        return {
            'stats': stats
        }
    
    def _generate_mock_equipment_data(self):
        """Generate mock equipment data"""
        categories = ['Critical', 'Imaging', 'Monitoring', 'Surgical', 'Laboratory']
        stats = []
        for category in categories:
            if category == 'Critical':
                total = random.randint(15, 25)
                in_use_rate = random.uniform(0.7, 0.9)
                maint_rate = random.uniform(0.05, 0.1)
            elif category == 'Imaging':
                total = random.randint(8, 15)
                in_use_rate = random.uniform(0.6, 0.8)
                maint_rate = random.uniform(0.1, 0.15)
            elif category == 'Monitoring':
                total = random.randint(30, 50)
                in_use_rate = random.uniform(0.7, 0.85)
                maint_rate = random.uniform(0.05, 0.1)
            elif category == 'Surgical':
                total = random.randint(20, 30)
                in_use_rate = random.uniform(0.6, 0.75)
                maint_rate = random.uniform(0.1, 0.2)
            else:  # Laboratory
                total = random.randint(25, 40)
                in_use_rate = random.uniform(0.65, 0.8)
                maint_rate = random.uniform(0.05, 0.15)
            
            in_use = int(total * in_use_rate)
            maintenance = int(total * maint_rate)
            available = total - in_use - maintenance
            
            stats.append({
                'category': category,
                'total': total,
                'inUse': in_use,
                'available': available,
                'maintenance': maintenance
            })
        
        return {
            'stats': stats
        }
    
    def _generate_mock_patient_data(self, days=30):
        """Generate mock patient data for the specified number of days"""
        diagnoses = [
            'Pneumonia', 'Hypertension', 'Diabetes', 'Fracture', 'Appendicitis',
            'Influenza', 'COVID-19', 'Asthma', 'COPD', 'Heart Disease', 'Stroke'
        ]
        
        # Generate diagnoses distribution
        diagnoses_dist = []
        remaining_percentage = 100
        
        # Top diagnoses with realistic percentages
        for i, diagnosis in enumerate(diagnoses[:5]):
            if i < 4:
                percentage = random.randint(10, 30)
                remaining_percentage -= percentage
            else:
                percentage = remaining_percentage
            
            diagnoses_dist.append({
                'diagnosis': diagnosis,
                'count': percentage  # Using percentage as count for simplicity
            })
        
        # Generate individual patient data
        patients = []
        patient_id_counter = 1
        
        # Generate between 3-5 patients per day for the specified number of days
        for day in range(days):
            date = datetime.now() - timedelta(days=days-day)
            daily_patients = random.randint(3, 5)
            
            for _ in range(daily_patients):
                # Randomly determine if patient has been discharged
                is_discharged = random.random() < 0.7 and day < days - 2  # 70% chance of discharge for older admissions
                
                # If discharged, calculate a reasonable length of stay
                discharge_date = None
                if is_discharged:
                    stay_length = random.randint(1, 7)  # 1-7 days stay
                    discharge_date = date + timedelta(days=min(stay_length, days-day-1))
                
                patients.append({
                    'id': str(patient_id_counter),
                    'patientId': f'P{patient_id_counter:03d}',
                    'name': f'Patient {patient_id_counter}',
                    'age': random.randint(18, 85),
                    'gender': random.choice(['Male', 'Female']),
                    'diagnosis': random.choice(diagnoses),
                    'status': 'Discharged' if is_discharged else 'Admitted',
                    'admissionDate': date.isoformat(),
                    'dischargeDate': discharge_date.isoformat() if discharge_date else None
                })
                patient_id_counter += 1
        
        return {
            'patients': patients,
            'diagnoses': diagnoses_dist
        }
    
    def _generate_mock_historical_metrics(self, metric_type, days=30):
        """Generate mock historical metrics for AI analysis"""
        metrics = []
        
        if metric_type == 'bed_occupancy':
            # Generate bed occupancy metrics for the past n days
            base_occupancy = 75  # Base percentage
            for day in range(days):
                date = datetime.now() - timedelta(days=days-day)
                
                # Create weekly pattern
                day_of_week = date.weekday()
                weekday_factor = 1.0 + (0.15 if day_of_week < 5 else -0.1)  # Higher on weekdays
                
                # Create gradual trend over time (slight increase)
                trend_factor = 1.0 + (day / days) * 0.1
                
                # Add some randomness
                random_factor = random.uniform(0.92, 1.08)
                
                # Calculate occupancy with factors
                occupancy = base_occupancy * weekday_factor * trend_factor * random_factor
                
                metrics.append({
                    'date': date.isoformat(),
                    'value': min(100, round(occupancy, 1))  # Cap at 100%
                })
        
        elif metric_type == 'staff_utilization':
            # Generate staff utilization metrics
            base_utilization = 80  # Base percentage
            for day in range(days):
                date = datetime.now() - timedelta(days=days-day)
                
                # Create weekly pattern
                day_of_week = date.weekday()
                weekday_factor = 1.0 + (0.1 if day_of_week < 5 else -0.15)  # Higher on weekdays
                
                # Add some randomness
                random_factor = random.uniform(0.95, 1.05)
                
                # Calculate utilization with factors
                utilization = base_utilization * weekday_factor * random_factor
                
                metrics.append({
                    'date': date.isoformat(),
                    'value': min(100, round(utilization, 1))
                })
        
        elif metric_type == 'disease_trends':
            # Generate disease trend metrics
            diseases = ['Influenza', 'COVID-19', 'Pneumonia', 'Gastroenteritis']
            disease_data = {}
            
            for disease in diseases:
                # Different baseline and seasonality for each disease
                if disease == 'Influenza':
                    base_cases = 20
                    seasonal_factor = lambda day: 1.0 + 0.5 * np.sin((day / days) * 2 * np.pi)  # Cyclical pattern
                elif disease == 'COVID-19':
                    base_cases = 15
                    seasonal_factor = lambda day: 1.0 + 0.3 * np.sin((day / days) * 4 * np.pi)  # Faster cycles
                elif disease == 'Pneumonia':
                    base_cases = 10
                    seasonal_factor = lambda day: 1.0 + 0.4 * np.sin((day / days) * 2 * np.pi + np.pi/2)  # Offset cycle
                else:  # Gastroenteritis
                    base_cases = 12
                    seasonal_factor = lambda day: 1.0 + 0.2 * np.sin((day / days) * 3 * np.pi)
                
                disease_data[disease] = []
                
                for day in range(days):
                    date = datetime.now() - timedelta(days=days-day)
                    
                    # Apply seasonal factor
                    season = seasonal_factor(day)
                    
                    # Add randomness
                    random_factor = random.uniform(0.8, 1.2)
                    
                    # Calculate cases
                    cases = int(base_cases * season * random_factor)
                    
                    disease_data[disease].append({
                        'date': date.isoformat(),
                        'cases': cases
                    })
            
            return disease_data
        
        elif metric_type == 'financial_metrics':
            # Generate financial metrics
            base_expense = 24500  # Base daily expense
            for day in range(days):
                date = datetime.now() - timedelta(days=days-day)
                
                # Create weekly pattern
                day_of_week = date.weekday()
                weekday_factor = 1.0 + (0.15 if day_of_week < 5 else -0.25)  # Higher on weekdays
                
                # Add some randomness
                random_factor = random.uniform(0.9, 1.1)
                
                # Calculate daily expense
                expense = base_expense * weekday_factor * random_factor
                
                # Calculate related metrics
                revenue = expense * random.uniform(1.15, 1.35)  # Revenue is 15-35% higher than expense
                profit = revenue - expense
                
                metrics.append({
                    'date': date.isoformat(),
                    'expense': round(expense),
                    'revenue': round(revenue),
                    'profit': round(profit)
                })
        
        return metrics


# Create folder structure if it doesn't exist
os.makedirs("utils", exist_ok=True)