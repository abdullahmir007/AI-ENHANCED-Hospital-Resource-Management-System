import requests
import json

# Base URL of your Flask API
BASE_URL = "http://localhost:5001"

# Test health endpoint
print("Testing health endpoint...")
health_response = requests.get(f"{BASE_URL}/health")
print(f"Status code: {health_response.status_code}")
print(f"Response: {health_response.json()}")
print("-" * 50)

# Load test data
print("Loading test data...")
with open("test_data/beds.json") as f:
    beds_data = json.load(f)
with open("test_data/staff.json") as f:
    staff_data = json.load(f)
with open("test_data/equipment.json") as f:
    equipment_data = json.load(f)

# Test resource optimization endpoint
print("Testing resource optimization endpoint...")
optimization_data = {
    "bedsData": beds_data,
    "staffData": staff_data,
    "equipmentData": equipment_data,
    "resourceType": "all"
}

optimization_response = requests.post(
    f"{BASE_URL}/api/resource-optimization", 
    json=optimization_data
)
print(f"Status code: {optimization_response.status_code}")
print(f"Response keys: {list(optimization_response.json().keys())}")
print("-" * 50)

# Print the actual response structure
print("First 500 characters of the response:")
print(json.dumps(optimization_response.json(), indent=2)[:500])