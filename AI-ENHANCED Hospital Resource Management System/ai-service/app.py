from flask import Flask, request, jsonify, send_from_directory 
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import numpy as np
import traceback

# Import AI modules
from models.resource_optimization import ResourceOptimizer
from models.disease_prediction import DiseasePrediction
from models.anomaly_detection import AnomalyDetector
from utils.data_processor import DataProcessor

# Load environment variables
load_dotenv()

# Custom JSON encoder for numpy types
class NumpyJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyJSONEncoder, self).default(obj)

# Create necessary directories for models
os.makedirs('./models/saved/resource', exist_ok=True)
os.makedirs('./models/saved/disease', exist_ok=True)
os.makedirs('./models/saved/anomaly', exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

# Configure Flask JSON encoder
app.json.encoder = NumpyJSONEncoder

# Initialize AI models
resource_optimizer = ResourceOptimizer()
disease_prediction = DiseasePrediction()
anomaly_detector = AnomalyDetector()
data_processor = DataProcessor()

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the Hospital AI Service API"})

@app.route('/health', methods=['GET'])
def health_check():
    print("Health check endpoint accessed")
    return jsonify({"status": "healthy", "service": "hospital-ai-service"})

@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        "success": True,
        "message": "AI Service API is working!",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/resource-optimization', methods=['POST'])
def optimize_resources():
    data = request.json
    print(f"Received resource optimization request with data keys: {data.keys() if data else 'None'}")
    
    try:
        # If specific data wasn't provided in the request, fetch from database
        data_processor = DataProcessor()
        
        # Get beds data
        if data and 'bedsData' in data and data['bedsData']:
            beds_data = data.get('bedsData', [])
        else:
            print("Fetching beds data from database")
            beds_data = data_processor.fetch_bed_data().get('stats', [])
            print(f"Fetched bed data: {len(beds_data)} wards")
            
        # Get staff data
        if data and 'staffData' in data and data['staffData']:
            staff_data = data.get('staffData', [])
        else:
            print("Fetching staff data from database")
            staff_data = data_processor.fetch_staff_data().get('stats', [])
            print(f"Fetched staff data: {len(staff_data)} staff types")
            
        # Get equipment data
        if data and 'equipmentData' in data and data['equipmentData']:
            equipment_data = data.get('equipmentData', [])
        else:
            print("Fetching equipment data from database")
            equipment_data = data_processor.fetch_equipment_data().get('stats', [])
            print(f"Fetched equipment data: {len(equipment_data)} equipment categories")
        
        resource_type = data.get('resourceType', 'all') if data else 'all'
        
        print(f"Processing optimization with: {len(beds_data)} beds, {len(staff_data)} staff types, {len(equipment_data)} equipment categories")
        
        result = resource_optimizer.get_optimization(
            beds_data=beds_data,
            staff_data=staff_data,
            equipment_data=equipment_data,
            resource_type=resource_type
        )
        
        print(f"Returning resource optimization result with keys: {result.keys() if result else 'None'}")
        
        # Convert result to serializable form
        serializable_result = json.loads(json.dumps(result, cls=NumpyJSONEncoder))
        return jsonify(serializable_result)
    
    except Exception as e:
        print(f"Error in optimize_resources: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e), "message": "Failed to optimize resources"}), 500

@app.route('/api/disease-prediction', methods=['POST'])
def predict_disease_outbreak():
    data = request.json
    print(f"Received disease prediction request with data keys: {data.keys() if data else 'None'}")

    try:
        result = disease_prediction.predict_outbreaks(
            historical_data=data.get('historicalData', []),
            current_data=data.get('currentData', []),
            prediction_days=data.get('predictionDays', 30)
        )

        print(f"Returning disease prediction result with keys: {result.keys() if result else 'None'}")
        serializable_result = json.loads(json.dumps(result, cls=NumpyJSONEncoder))
        return jsonify(serializable_result)

    except Exception as e:
        print(f"Error in predict_disease_outbreak: {str(e)}")
        return jsonify({"error": str(e), "message": "Failed to predict disease outbreak"}), 500

@app.route('/api/anomaly-detection', methods=['POST'])
def detect_anomalies():
    data = request.json
    print(f"Received anomaly detection request with data keys: {data.keys() if data else 'None'}")

    try:
        result = anomaly_detector.detect(
            resource_data=data.get('resourceData', []),
            patient_data=data.get('patientData', []),
            financial_data=data.get('financialData', []),
            detection_type=data.get('detectionType', 'all')
        )

        print(f"Returning anomaly detection result with keys: {result.keys() if result else 'None'}")
        serializable_result = json.loads(json.dumps(result, cls=NumpyJSONEncoder))
        return jsonify(serializable_result)

    except Exception as e:
        print(f"Error in detect_anomalies: {str(e)}")
        return jsonify({"error": str(e), "message": "Failed to detect anomalies"}), 500

@app.route('/api/train', methods=['POST'])
def train_models():
    data = request.json
    model_type = data.get('modelType', 'all')
    training_data = data.get('trainingData', [])

    try:
        result = {"status": "training_started", "message": f"Training {model_type} model"}

        if model_type in ['resource', 'all']:
            resource_optimizer.train(training_data)
        if model_type in ['disease', 'all']:
            disease_prediction.train(training_data)
        if model_type in ['anomaly', 'all']:
            anomaly_detector.train(training_data)

        return jsonify(result)

    except Exception as e:
        print(f"Error in train_models: {str(e)}")
        return jsonify({"error": str(e), "message": "Failed to train models"}), 500

@app.route('/test_data/<filename>', methods=['GET'])
def serve_test_data(filename):
    return send_from_directory('test_data', filename)

@app.route('/api/test-data', methods=['GET'])
def get_all_test_data():
    try:
        test_data = {}
        for filename in os.listdir('test_data'):
            if filename.endswith('.json'):
                with open(os.path.join('test_data', filename), 'r') as f:
                    test_data[filename] = json.load(f)
        return jsonify({"success": True, "data": test_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/convert-data', methods=['POST'])
def convert_data():
    try:
        data = request.json
        serializable_data = json.loads(json.dumps(data, cls=NumpyJSONEncoder))
        return jsonify({"success": True, "data": serializable_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/debug/mongodb', methods=['GET']) 
def debug_mongodb():
    """Debug endpoint to check MongoDB connection"""
    try:
        data_processor = DataProcessor()

        # Check if connected
        if data_processor.db is None:
            return jsonify({
                "status": "error",
                "message": "Not connected to MongoDB",
                "mongo_uri": data_processor.mongo_uri.replace(
                    data_processor.mongo_uri.split('@')[0], 
                    "***:***"
                ) if '@' in data_processor.mongo_uri else data_processor.mongo_uri
            })

        # Test collection counts
        collections = {
            "beds": data_processor.db.beds.count_documents({}),
            "staff": data_processor.db.staff.count_documents({}),
            "equipment": data_processor.db.equipment.count_documents({}),
            "patients": data_processor.db.patients.count_documents({}) if "patients" in data_processor.db.list_collection_names() else 0
        }

        return jsonify({
            "status": "success",
            "message": f"Connected to MongoDB: {data_processor.db.name}",
            "collections": collections,
            "collection_names": data_processor.db.list_collection_names()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error checking MongoDB: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug_mode = os.environ.get('DEBUG', 'False').lower() == 'true'

    print(f"Starting Flask app on http://localhost:{port}")
    print("Available endpoints:")
    print("  - /health")
    print("  - /test")
    print("  - /api/resource-optimization")
    print("  - /api/disease-prediction")
    print("  - /api/anomaly-detection")
    print("  - /api/train")
    print("  - /test_data/<filename>")
    print("  - /api/test-data")
    print("  - /api/convert-data")
    print("  - /debug/mongodb")
    print("\nJSON Serialization: Using custom NumpyJSONEncoder to handle numpy data types")

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
