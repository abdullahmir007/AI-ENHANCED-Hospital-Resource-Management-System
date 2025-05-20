import json
import random
import os
import math
from datetime import datetime, timedelta

# Create test data directory if it doesn't exist
os.makedirs('test_data', exist_ok=True)

# Generate bed data
def generate_bed_data():
    wards = ['ICU', 'ER', 'General', 'Pediatric', 'Maternity', 'Surgical']
    bed_data = []

    for ward in wards:
        if ward == 'ICU':
            total = random.randint(15, 25)
            occupancy_rate = random.uniform(0.75, 0.95)
        elif ward == 'ER':
            total = random.randint(10, 20)
            occupancy_rate = random.uniform(0.7, 0.9)
        elif ward == 'General':
            total = random.randint(40, 70)
            occupancy_rate = random.uniform(0.6, 0.85)
        elif ward == 'Pediatric':
            total = random.randint(15, 25)
            occupancy_rate = random.uniform(0.5, 0.8)
        elif ward == 'Maternity':
            total = random.randint(10, 15)
            occupancy_rate = random.uniform(0.6, 0.9)
        else:  # Surgical
            total = random.randint(15, 30)
            occupancy_rate = random.uniform(0.65, 0.85)

        occupied = int(total * occupancy_rate)
        available = total - occupied

        bed_data.append({
            'ward': ward,
            'total': total,
            'occupied': occupied,
            'available': available
        })

    return bed_data

# Generate staff data
def generate_staff_data():
    staff_types = ['Physician', 'Nurse', 'Technician', 'Admin']
    staff_data = []

    for staff_type in staff_types:
        if staff_type == 'Physician':
            total = random.randint(20, 35)
            duty_rate = random.uniform(0.6, 0.75)
        elif staff_type == 'Nurse':
            total = random.randint(50, 80)
            duty_rate = random.uniform(0.7, 0.85)
        elif staff_type == 'Technician':
            total = random.randint(15, 30)
            duty_rate = random.uniform(0.6, 0.8)
        else:  # Admin
            total = random.randint(10, 20)
            duty_rate = random.uniform(0.8, 0.95)

        on_duty = int(total * duty_rate)

        staff_data.append({
            'type': staff_type,
            'total': total,
            'onDuty': on_duty
        })

    return staff_data

# Generate equipment data
def generate_equipment_data():
    categories = ['Ventilators', 'MRI', 'X-ray', 'CT Scan', 'Ultrasound', 'Monitoring']
    equipment_data = []

    for category in categories:
        if category == 'Ventilators':
            total = random.randint(15, 25)
            usage_rate = random.uniform(0.7, 0.9)
        elif category == 'MRI':
            total = random.randint(2, 5)
            usage_rate = random.uniform(0.6, 0.85)
        elif category == 'X-ray':
            total = random.randint(10, 20)
            usage_rate = random.uniform(0.65, 0.8)
        elif category == 'CT Scan':
            total = random.randint(3, 6)
            usage_rate = random.uniform(0.7, 0.9)
        elif category == 'Ultrasound':
            total = random.randint(8, 15)
            usage_rate = random.uniform(0.6, 0.8)
        else:  # Monitoring
            total = random.randint(30, 50)
            usage_rate = random.uniform(0.7, 0.85)

        in_use = int(total * usage_rate)
        maintenance = int(total * random.uniform(0.05, 0.15))
        available = total - in_use - maintenance

        equipment_data.append({
            'category': category,
            'total': total,
            'inUse': in_use,
            'available': available,
            'maintenance': maintenance
        })

    return equipment_data

# Generate disease data
def generate_disease_data():
    diseases = ['Influenza', 'COVID-19', 'Pneumonia', 'Gastroenteritis', 'Common Cold', 'Bronchitis']
    current_data = {}
    historical_data = {}

    # Current data
    current_data['Influenza'] = random.randint(30, 60)
    current_data['COVID-19'] = random.randint(20, 40)
    current_data['Pneumonia'] = random.randint(40, 70)
    current_data['Gastroenteritis'] = random.randint(25, 45)
    current_data['Common Cold'] = random.randint(60, 100)
    current_data['Bronchitis'] = random.randint(15, 35)

    # Historical data
    for disease in diseases:
        historical_data[disease] = []

        if disease == 'Influenza':
            base_value = random.randint(20, 30)
            seasonal_factor = 2.0
            random_factor = 0.3
        elif disease == 'COVID-19':
            base_value = random.randint(15, 25)
            seasonal_factor = 1.5
            random_factor = 0.4
        elif disease == 'Pneumonia':
            base_value = random.randint(30, 50)
            seasonal_factor = 1.8
            random_factor = 0.25
        elif disease == 'Gastroenteritis':
            base_value = random.randint(20, 35)
            seasonal_factor = 1.3
            random_factor = 0.35
        elif disease == 'Common Cold':
            base_value = random.randint(40, 70)
            seasonal_factor = 2.2
            random_factor = 0.2
        else:  # Bronchitis
            base_value = random.randint(10, 25)
            seasonal_factor = 1.7
            random_factor = 0.3

        for day in range(365, 0, -1):
            date = (datetime.now() - timedelta(days=day)).strftime('%Y-%m-%d')
            day_of_year = 365 - day
            seasonal_value = 1 + (seasonal_factor - 1) * abs(math.sin(((day_of_year / 365) * 2 * math.pi) - math.pi/2))
            random_value = 1 + random.uniform(-random_factor, random_factor)
            cases = max(1, int(base_value * seasonal_value * random_value))

            if day % 5 == 0:
                historical_data[disease].append({
                    "date": date,
                    "cases": cases
                })

    return current_data, historical_data

# Generate resource metrics
def generate_resource_metrics():
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(29, -1, -1)]
    resource_data = []

    base_bed_occupancy = 75.0
    base_staff_utilization = 80.0
    base_equipment_usage = 65.0

    for i, date in enumerate(dates):
        anomaly_factor = 1.0
        if i >= 23:
            anomaly_factor = 1.0 + (i - 22) * 0.05

        day_of_week = (datetime.now() - timedelta(days=29-i)).weekday()
        weekday_factor = 1.05 if day_of_week < 5 else 0.9
        random_factor = random.uniform(0.95, 1.05)

        resource_data.append({
            'date': date,
            'bed_occupancy': round(base_bed_occupancy * anomaly_factor * weekday_factor * random_factor, 1),
            'staff_utilization': round(base_staff_utilization * anomaly_factor * weekday_factor * random_factor, 1),
            'equipment_usage': round(base_equipment_usage * anomaly_factor * weekday_factor * random_factor, 1)
        })

    return resource_data

# Generate patient metrics
def generate_patient_metrics():
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(29, -1, -1)]
    patient_data = []

    base_readmission_rate = 8.5
    base_length_of_stay = 4.2
    base_medication_errors = 2.1

    for i, date in enumerate(dates):
        anomaly_factor = 1.0
        if 15 <= i <= 20:
            anomaly_factor = 1.0 + (i - 14) * 0.1
        random_factor = random.uniform(0.92, 1.08)

        patient_data.append({
            'date': date,
            'readmission_rate': round(base_readmission_rate * anomaly_factor * random_factor, 1),
            'length_of_stay': round(base_length_of_stay * anomaly_factor * random_factor, 1),
            'medication_errors': round(base_medication_errors * anomaly_factor * random_factor, 1)
        })

    return patient_data

# Generate financial metrics
def generate_financial_metrics():
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(29, -1, -1)]
    financial_data = []

    base_daily_expenses = 24500
    base_revenue_per_bed = 3200
    base_supply_costs = 8500

    for i, date in enumerate(dates):
        anomaly_factor = 1.0
        if 8 <= i <= 12:
            anomaly_factor = 1.2 + (i - 8) * 0.05

        day_of_week = (datetime.now() - timedelta(days=29-i)).weekday()
        weekday_factor = 1.1 if day_of_week < 5 else 0.85
        random_factor = random.uniform(0.95, 1.05)

        financial_data.append({
            'date': date,
            'daily_expenses': round(base_daily_expenses * anomaly_factor * weekday_factor * random_factor),
            'revenue_per_bed': round(base_revenue_per_bed * random_factor),
            'supply_costs': round(base_supply_costs * anomaly_factor * random_factor)
        })

    return financial_data

# Generate all test data and save to JSON
def generate_all_test_data():
    bed_data = generate_bed_data()
    staff_data = generate_staff_data()
    equipment_data = generate_equipment_data()
    current_disease_data, historical_disease_data = generate_disease_data()
    resource_metrics = generate_resource_metrics()
    patient_metrics = generate_patient_metrics()
    financial_metrics = generate_financial_metrics()

    with open('test_data/beds.json', 'w') as f:
        json.dump(bed_data, f, indent=2)

    with open('test_data/staff.json', 'w') as f:
        json.dump(staff_data, f, indent=2)

    with open('test_data/equipment.json', 'w') as f:
        json.dump(equipment_data, f, indent=2)

    with open('test_data/current_diseases.json', 'w') as f:
        json.dump(current_disease_data, f, indent=2)

    with open('test_data/historical_diseases.json', 'w') as f:
        json.dump(historical_disease_data, f, indent=2)

    with open('test_data/resource_metrics.json', 'w') as f:
        json.dump(resource_metrics, f, indent=2)

    with open('test_data/patient_metrics.json', 'w') as f:
        json.dump(patient_metrics, f, indent=2)

    with open('test_data/financial_metrics.json', 'w') as f:
        json.dump(financial_metrics, f, indent=2)

    print("Test data generated successfully!")
    print(f"Files saved to the test_data directory: {os.path.abspath('test_data')}")
    print("\nGenerated the following files:")
    for filename in os.listdir('test_data'):
        file_path = os.path.join('test_data', filename)
        size = os.path.getsize(file_path) / 1024
        print(f"  - {filename} ({size:.2f} KB)")

if __name__ == "__main__":
    generate_all_test_data()
