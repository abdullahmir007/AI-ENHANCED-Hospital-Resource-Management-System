import requests
import json
import time
import sys
import os
from datetime import datetime, timedelta
import random

# Configuration
base_url = 'http://localhost:5001'
test_data_dir = 'test_data'

# Helper functions
def print_success(message):
    print(f"\033[92m✓ {message}\033[0m")  # Green text

def print_error(message):
    print(f"\033[91m✗ {message}\033[0m")  # Red text

def print_info(message):
    print(f"\033[94m> {message}\033[0m")  # Blue text

def print_warning(message):
    print(f"\033[93m! {message}\033[0m")  # Yellow text

def print_header(message):
    print(f"\n\033[1m{message}\033[0m")  # Bold text

def load_test_data(filename):
    try:
        file_path = os.path.join(test_data_dir, filename)
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print_error(f"Test data file {filename} not found.")
        print_info(f"Make sure to run generate_test_data.py first to create test data.")
        return None
    except json.JSONDecodeError:
        print_error(f"Error parsing {filename}. Invalid JSON format.")
        return None

# Test functions
def test_health_check():
    print_header("Testing Health Check Endpoint")
    print_info("Sending request to /health...")
    
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                print_success("Health check returned status: healthy")
                return True
            else:
                print_error(f"Health check returned unexpected status: {data.get('status')}")
                return False
        else:
            print_error(f"Health check failed with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error(f"Connection error. Make sure the AI service is running at {base_url}")
        return False
    except Exception as e:
        print_error(f"Unexpected error during health check: {str(e)}")
        return False

def test_resource_optimization():
    print_header("Testing Resource Optimization")
    print_info("Loading test data...")
    
    beds_data = load_test_data('beds.json')
    staff_data = load_test_data('staff.json')
    equipment_data = load_test_data('equipment.json')
    
    if not all([beds_data, staff_data, equipment_data]):
        return False
    
    print_info("Sending request to /api/resource-optimization...")
    
    try:
        payload = {
            'bedsData': beds_data,
            'staffData': staff_data,
            'equipmentData': equipment_data,
            'resourceType': 'all'
        }
        
        response = requests.post(f"{base_url}/api/resource-optimization", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for expected data structure
            if 'resources' in data and 'recommendations' in data:
                resource_types = list(data['resources'].keys())
                recommendations_count = len(data['recommendations'])
                
                print_success(f"Resource optimization returned data for {', '.join(resource_types)}")
                print_success(f"Generated {recommendations_count} recommendations")
                
                # Show sample recommendation
                if recommendations_count > 0:
                    sample = data['recommendations'][0]
                    print_info(f"Sample recommendation: {sample.get('recommendation')} (Impact: {sample.get('impact')})")
                
                return True
            else:
                print_error("Resource optimization returned unexpected data structure")
                print_info(f"Received: {json.dumps(data, indent=2)[:200]}...")
                return False
        else:
            print_error(f"Resource optimization failed with status code: {response.status_code}")
            try:
                print_info(f"Error message: {response.json()}")
            except:
                print_info(f"Response content: {response.text[:200]}...")
            return False
    except Exception as e:
        print_error(f"Unexpected error during resource optimization test: {str(e)}")
        return False

def test_disease_prediction():
    print_header("Testing Disease Outbreak Prediction")
    print_info("Loading test data...")
    
    current_data = load_test_data('current_diseases.json')
    historical_data = load_test_data('historical_diseases.json')
    
    if not all([current_data, historical_data]):
        return False
    
    print_info("Sending request to /api/disease-prediction...")
    
    try:
        payload = {
            'currentData': current_data,
            'historicalData': historical_data,
            'predictionDays': 30
        }
        
        response = requests.post(f"{base_url}/api/disease-prediction", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for expected data structure
            if ('predictions' in data and 'monthlyTrend' in data and 
                'recommendations' in data and 'highestRiskDisease' in data):
                
                disease_count = len(data['predictions'])
                highest_risk = data['highestRiskDisease'].get('disease')
                risk_level = data['highestRiskDisease'].get('riskLevel')
                
                print_success(f"Disease prediction analyzed {disease_count} diseases")
                print_success(f"Highest risk disease: {highest_risk} (Risk Level: {risk_level})")
                
                # Show sample recommendation
                if data['recommendations']:
                    sample = data['recommendations'][0]
                    print_info(f"Sample recommendation: {sample.get('title')}")
                    print_info(f"Actions: {', '.join(sample.get('actions', [])[:2])}...")
                
                return True
            else:
                print_error("Disease prediction returned unexpected data structure")
                print_info(f"Received: {json.dumps(data, indent=2)[:200]}...")
                return False
        else:
            print_error(f"Disease prediction failed with status code: {response.status_code}")
            try:
                print_info(f"Error message: {response.json()}")
            except:
                print_info(f"Response content: {response.text[:200]}...")
            return False
    except Exception as e:
        print_error(f"Unexpected error during disease prediction test: {str(e)}")
        return False

def test_anomaly_detection():
    print_header("Testing Anomaly Detection")
    print_info("Loading test data...")
    
    resource_data = load_test_data('resource_metrics.json')
    patient_data = load_test_data('patient_metrics.json')
    financial_data = load_test_data('financial_metrics.json')
    
    if not all([resource_data, patient_data, financial_data]):
        # If test data files don't exist, generate simple test data
        print_warning("Test data files not found, generating simple test data...")
        
        resource_data = []
        patient_data = []
        financial_data = []
        
        # Generate date range for past 7 days
        for i in range(6, -1, -1):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            
            # Add resource metrics with an anomaly on the last day
            anomaly_factor = 1.5 if i <= 1 else 1.0
            resource_data.append({
                'date': date,
                'bed_occupancy': round(75 * (0.9 + 0.2 * random.random()) * anomaly_factor, 1),
                'staff_utilization': round(80 * (0.9 + 0.2 * random.random()) * anomaly_factor, 1),
                'equipment_usage': round(65 * (0.9 + 0.2 * random.random()) * anomaly_factor, 1)
            })
            
            # Add patient metrics with anomalies in the middle
            anomaly_factor = 1.4 if 2 <= i <= 4 else 1.0
            patient_data.append({
                'date': date,
                'readmission_rate': round(8.5 * (0.9 + 0.2 * random.random()) * anomaly_factor, 1),
                'length_of_stay': round(4.2 * (0.9 + 0.2 * random.random()) * anomaly_factor, 1),
                'medication_errors': round(2.1 * (0.9 + 0.2 * random.random()) * anomaly_factor, 1)
            })
            
            # Add financial metrics with anomalies on days 3-5
            anomaly_factor = 1.3 if 2 <= i <= 4 else 1.0
            financial_data.append({
                'date': date,
                'daily_expenses': round(24500 * (0.9 + 0.2 * random.random()) * anomaly_factor),
                'revenue_per_bed': round(3200 * (0.9 + 0.2 * random.random())),
                'supply_costs': round(8500 * (0.9 + 0.2 * random.random()) * anomaly_factor)
            })
    
    print_info("Sending request to /api/anomaly-detection...")
    
    try:
        payload = {
            'resourceData': resource_data,
            'patientData': patient_data,
            'financialData': financial_data,
            'detectionType': 'all'
        }
        
        response = requests.post(f"{base_url}/api/anomaly-detection", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for expected data structure
            if 'categories' in data and 'totalAnomalies' in data:
                categories = list(data['categories'].keys())
                total_anomalies = data['totalAnomalies']
                
                print_success(f"Anomaly detection analyzed {len(categories)} categories")
                print_success(f"Detected {total_anomalies} anomalies")
                
                # Show sample anomaly
                if categories and 'anomalies' in data['categories'][categories[0]]:
                    sample_category = categories[0]
                    sample_anomalies = data['categories'][sample_category]['anomalies']
                    if sample_anomalies:
                        sample = sample_anomalies[0]
                        print_info(f"Sample anomaly: {sample.get('title')} (Severity: {sample.get('severity')})")
                        print_info(f"Description: {sample.get('description')}")
                
                return True
            else:
                print_error("Anomaly detection returned unexpected data structure")
                print_info(f"Received: {json.dumps(data, indent=2)[:200]}...")
                return False
        else:
            print_error(f"Anomaly detection failed with status code: {response.status_code}")
            try:
                print_info(f"Error message: {response.json()}")
            except:print_info(f"Response content: {response.text[:200]}...")
            return False
    except Exception as e:
        print_error(f"Unexpected error during anomaly detection test: {str(e)}")
        return False

def test_model_training():
    print_header("Testing Model Training")
    print_info("Sending request to /api/train...")
    
    try:
        payload = {
            'modelType': 'all',
            'trainingData': None  # Let the service use its default training data
        }
        
        response = requests.post(f"{base_url}/api/train", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'status' in data and data['status'] == 'training_started':
                print_success(f"Model training initiated successfully")
                print_info(f"Message: {data.get('message')}")
                return True
            else:
                print_error("Model training returned unexpected response")
                print_info(f"Received: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Model training failed with status code: {response.status_code}")
            try:
                print_info(f"Error message: {response.json()}")
            except:
                print_info(f"Response content: {response.text[:200]}...")
            return False
    except Exception as e:
        print_error(f"Unexpected error during model training test: {str(e)}")
        return False

def run_all_tests():
    print("\n" + "="*50)
    print("HOSPITAL AI SERVICE TEST SUITE")
    print("="*50 + "\n")
    
    # Start with health check
    if not test_health_check():
        print_error("\nCannot continue with tests - health check failed")
        print_info("Make sure the AI service is running at " + base_url)
        return False
    
    # Wait a moment between tests
    time.sleep(1)
    
    # Run all tests
    tests = [
        test_resource_optimization,
        test_disease_prediction,
        test_anomaly_detection,
        test_model_training
    ]
    
    results = []
    for test in tests:
        results.append(test())
        time.sleep(1)  # Pause between tests
    
    # Print summary
    print("\n" + "="*50)
    print("TEST RESULTS SUMMARY")
    print("="*50)
    
    test_names = [
        "Health Check",
        "Resource Optimization",
        "Disease Prediction",
        "Anomaly Detection",
        "Model Training"
    ]
    
    # Include the health check in results
    all_results = [True] + results  # We already checked health
    
    for i, (name, passed) in enumerate(zip(test_names, all_results)):
        if passed:
            print(f"\033[92m✓ {name}: PASSED\033[0m")
        else:
            print(f"\033[91m✗ {name}: FAILED\033[0m")
    
    # Overall assessment
    total_passed = sum(all_results)
    if total_passed == len(all_results):
        print("\n\033[92m✓ All tests passed successfully!\033[0m")
    else:
        print(f"\n\033[93m! {total_passed}/{len(all_results)} tests passed\033[0m")
    
    print("\nTest suite completed!")
    return all(all_results)

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error during test execution: {str(e)}")
        sys.exit(1)