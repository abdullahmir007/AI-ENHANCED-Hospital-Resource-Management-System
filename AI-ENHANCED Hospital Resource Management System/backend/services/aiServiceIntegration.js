// File: services/aiServiceIntegration.js
const axios = require('axios');
const config = require('../config/config');

/**
 * AI Service Integration
 * This module integrates the Node.js backend with the Python AI service
 */
class AIServiceIntegration {
  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.logger = require('../utils/logger');
  }

  /**
   * Get resource optimization recommendations
   * @param {Object} options - Optional parameters for customization
   * @returns {Promise} - Response with optimization data
   */
  async getResourceOptimization(options = {}) {
    try {
      // Fetch required data from database to send to AI service
      const beds = await this._fetchBedsData();
      const staff = await this._fetchStaffData();
      const equipment = await this._fetchEquipmentData();

      // Make request to AI service
      const response = await axios.post(`${this.aiServiceUrl}/api/resource-optimization`, {
        bedsData: beds,
        staffData: staff,
        equipmentData: equipment,
        resourceType: options.resourceType || 'all'
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting resource optimization: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get disease outbreak prediction
   * @param {Object} options - Optional parameters for customization
   * @returns {Promise} - Response with disease prediction data
   */
  async getDiseaseOutbreakPrediction(options = {}) {
    try {
      // Fetch historical patient diagnosis data from database
      const historicalData = await this._fetchPatientHistoricalData();
      const currentData = await this._fetchCurrentDiseaseData();

      // Make request to AI service
      const response = await axios.post(`${this.aiServiceUrl}/api/disease-prediction`, {
        historicalData,
        currentData,
        predictionDays: options.days || 30
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting disease prediction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get anomaly detection
   * @param {Object} options - Optional parameters for customization
   * @returns {Promise} - Response with anomalies data
   */
  async getAnomalyDetection(options = {}) {
    try {
      // Fetch resource, patient and financial data from database
      const resourceData = await this._fetchResourceMetrics();
      const patientData = await this._fetchPatientMetrics();
      const financialData = await this._fetchFinancialMetrics();

      // Make request to AI service
      const response = await axios.post(`${this.aiServiceUrl}/api/anomaly-detection`, {
        resourceData,
        patientData,
        financialData,
        detectionType: options.detectionType || 'all'
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting anomaly detection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Train AI models with new data
   * @param {String} modelType - Type of model to train ('resource', 'disease', 'anomaly', or 'all')
   * @param {Object} trainingData - Data to use for training
   * @returns {Promise} - Response with training status
   */
  async trainModels(modelType = 'all', trainingData = null) {
    try {
      // If no training data provided, fetch it
      const data = trainingData || await this._fetchTrainingData(modelType);

      // Make request to AI service
      const response = await axios.post(`${this.aiServiceUrl}/api/train`, {
        modelType,
        trainingData: data
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error training models: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check AI service health
   * @returns {Promise<boolean>} - True if service is healthy
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      this.logger.error(`AI service health check failed: ${error.message}`);
      return false;
    }
  }

  /* Private helper methods for data fetching */

  /**
   * Fetch beds data aggregated by ward
   * @private
   */
  async _fetchBedsData() {
    try {
      const Bed = require('../models/Bed');
      
      // Use MongoDB aggregation to get stats by ward
      const bedStats = await Bed.aggregate([
        {
          $group: {
            _id: '$ward',
            total: { $sum: 1 },
            occupied: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] 
              } 
            },
            available: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] 
              } 
            }
          }
        },
        {
          $project: {
            _id: 0,
            ward: '$_id',
            total: 1,
            occupied: 1,
            available: 1
          }
        }
      ]);
      
      return bedStats;
    } catch (error) {
      this.logger.error(`Error fetching beds data: ${error.message}`);
      // Return mock data if there's an error
      return [
        { ward: "ICU", total: 25, occupied: 22, available: 3 },
        { ward: "ER", total: 15, occupied: 12, available: 3 },
        { ward: "General", total: 60, occupied: 45, available: 15 },
        { ward: "Pediatric", total: 20, occupied: 8, available: 12 },
        { ward: "Maternity", total: 10, occupied: 8, available: 2 }
      ];
    }
  }

  /**
   * Fetch staff data aggregated by type
   * @private
   */
  async _fetchStaffData() {
    try {
      const Staff = require('../models/Staff');
      
      // Use MongoDB aggregation to get stats by staff type
      const staffStats = await Staff.aggregate([
        {
          $group: {
            _id: '$staffType',
            total: { $sum: 1 },
            onDuty: { 
              $sum: { 
                $cond: ['$onDuty', 1, 0] 
              } 
            }
          }
        },
        {
          $project: {
            _id: 0,
            type: '$_id',
            total: 1,
            onDuty: 1
          }
        }
      ]);
      
      return staffStats;
    } catch (error) {
      this.logger.error(`Error fetching staff data: ${error.message}`);
      // Return mock data if there's an error
      return [
        { type: "Physician", total: 22, onDuty: 18 },
        { type: "Nurse", total: 35, onDuty: 32 },
        { type: "Technician", total: 18, onDuty: 15 },
        { type: "Admin", total: 12, onDuty: 5 }
      ];
    }
  }

  /**
   * Fetch equipment data aggregated by category
   * @private
   */
  async _fetchEquipmentData() {
    try {
      const Equipment = require('../models/Equipment');
      
      // Use MongoDB aggregation to get stats by category
      const equipmentStats = await Equipment.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            inUse: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'In Use'] }, 1, 0] 
              } 
            },
            available: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] 
              } 
            },
            maintenance: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] 
              } 
            }
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            total: 1,
            inUse: 1,
            available: 1,
            maintenance: 1
          }
        }
      ]);
      
      return equipmentStats;
    } catch (error) {
      this.logger.error(`Error fetching equipment data: ${error.message}`);
      // Return mock data if there's an error
      return [
        { category: "Ventilators", total: 15, inUse: 12, available: 3, maintenance: 0 },
        { category: "MRI", total: 3, inUse: 2, available: 0, maintenance: 1 },
        { category: "X-ray", total: 18, inUse: 8, available: 8, maintenance: 2 },
        { category: "CT Scan", total: 4, inUse: 3, available: 1, maintenance: 0 },
        { category: "Ultrasound", total: 10, inUse: 7, available: 3, maintenance: 0 },
        { category: "Monitoring", total: 15, inUse: 13, available: 2, maintenance: 0 }
      ];
    }
  }

  /**
   * Fetch patient historical data (past 30 days)
   * @private
   */
  async _fetchPatientHistoricalData() {
    try {
      const Patient = require('../models/Patient');
      
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get patients admitted in the last 30 days
      const patients = await Patient.find({
        admissionDate: { $gte: thirtyDaysAgo }
      }).select('patientId diagnosis admissionDate dischargeDate');
      
      // Transform data into format needed by the AI service
      const diseaseCounts = {};
      patients.forEach(patient => {
        const diagnosis = patient.diagnosis;
        if (!diseaseCounts[diagnosis]) {
          diseaseCounts[diagnosis] = [];
        }
        
        // Add entry with date
        const date = patient.admissionDate.toISOString().split('T')[0];
        const existingEntry = diseaseCounts[diagnosis].find(entry => entry.date === date);
        
        if (existingEntry) {
          existingEntry.cases += 1;
        } else {
          diseaseCounts[diagnosis].push({
            date,
            cases: 1
          });
        }
      });
      
      return diseaseCounts;
    } catch (error) {
      this.logger.error(`Error fetching patient historical data: ${error.message}`);
      // Return mock data for a few diseases
      return {
        "Influenza": [
          { "date": "2023-03-22", "cases": 12 },
          { "date": "2023-03-23", "cases": 15 },
          { "date": "2023-03-24", "cases": 18 },
          { "date": "2023-03-25", "cases": 22 }
        ],
        "COVID-19": [
          { "date": "2023-03-22", "cases": 8 },
          { "date": "2023-03-23", "cases": 10 },
          { "date": "2023-03-24", "cases": 12 },
          { "date": "2023-03-25", "cases": 15 }
        ],
        "Pneumonia": [
          { "date": "2023-03-22", "cases": 5 },
          { "date": "2023-03-23", "cases": 7 },
          { "date": "2023-03-24", "cases": 6 },
          { "date": "2023-03-25", "cases": 8 }
        ]
      };
    }
  }

  /**
   * Fetch current disease data (counts of active cases)
   * @private
   */
  async _fetchCurrentDiseaseData() {
    try {
      const Patient = require('../models/Patient');
      
      // Get counts of current patients by diagnosis
      const diagnosisCounts = await Patient.aggregate([
        {
          $match: {
            status: 'Admitted'  // Only count currently admitted patients
          }
        },
        {
          $group: {
            _id: '$diagnosis',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            diagnosis: '$_id',
            count: 1
          }
        }
      ]);
      
      // Convert to the format expected by AI service
      const currentData = {};
      diagnosisCounts.forEach(item => {
        currentData[item.diagnosis] = item.count;
      });
      
      return currentData;
    } catch (error) {
      this.logger.error(`Error fetching current disease data: ${error.message}`);
      // Return mock data
      return {
        "Influenza": 48,
        "COVID-19": 32,
        "Pneumonia": 57,
        "Gastroenteritis": 38
      };
    }
  }

  /**
   * Fetch resource metrics for anomaly detection
   * @private
   */
  async _fetchResourceMetrics() {
    try {
      const Bed = require('../models/Bed');
      const Staff = require('../models/Staff');
      const Equipment = require('../models/Equipment');
      
      // Calculate metrics for the past 7 days
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // This would normally fetch historical data from a metrics collection
      // For this example, we'll generate synthetic data based on current state
      
      // Get current metrics
      const bedOccupancy = await Bed.countDocuments({ status: 'Occupied' }) / await Bed.countDocuments() * 100;
      const staffUtilization = await Staff.countDocuments({ onDuty: true }) / await Staff.countDocuments() * 100;
      const equipmentUsage = await Equipment.countDocuments({ status: 'In Use' }) / await Equipment.countDocuments() * 100;
      
      // Generate time series with some variation
      const resourceData = dates.map((date, index) => {
        // Add increasing trend for later days to create anomaly
        const multiplier = index < 4 ? 1.0 : 1.0 + (index - 3) * 0.05;
        
        // Add random variation
        const randomFactor = 0.95 + Math.random() * 0.1;
        
        return {
          date,
          bed_occupancy: Math.min(100, Math.round(bedOccupancy * multiplier * randomFactor * 10) / 10),
          staff_utilization: Math.min(100, Math.round(staffUtilization * multiplier * randomFactor * 10) / 10),
          equipment_usage: Math.min(100, Math.round(equipmentUsage * multiplier * randomFactor * 10) / 10)
        };
      });
      
      return resourceData;
    } catch (error) {
      this.logger.error(`Error fetching resource metrics: ${error.message}`);
      // Return mock data
      return [
        { "date": "2023-03-20", "bed_occupancy": 72.5, "staff_utilization": 78.3, "equipment_usage": 67.8 },
        { "date": "2023-03-21", "bed_occupancy": 73.2, "staff_utilization": 79.1, "equipment_usage": 68.2 },
        { "date": "2023-03-22", "bed_occupancy": 74.8, "staff_utilization": 80.5, "equipment_usage": 68.7 },
        { "date": "2023-03-23", "bed_occupancy": 75.5, "staff_utilization": 81.2, "equipment_usage": 69.3 },
        { "date": "2023-03-24", "bed_occupancy": 80.2, "staff_utilization": 85.7, "equipment_usage": 72.5 },
        { "date": "2023-03-25", "bed_occupancy": 86.8, "staff_utilization": 90.2, "equipment_usage": 76.9 },
        { "date": "2023-03-26", "bed_occupancy": 92.5, "staff_utilization": 94.8, "equipment_usage": 81.2 }
      ];
    }
  }

  /**
   * Fetch patient metrics for anomaly detection
   * @private
   */
  async _fetchPatientMetrics() {
    try {
      const Patient = require('../models/Patient');
      
      // Calculate metrics for the past 7 days
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // This would normally fetch historical data from a metrics collection
      // For this example, we'll return synthetic data
      
      // Generate synthetic metrics with anomalies on specific days
      return dates.map((date, index) => {
        // Base values
        let readmission_rate = 8.5;
        let length_of_stay = 4.2;
        let medication_errors = 2.1;
        
        // Add anomalies on days 3-5
        if (index >= 3 && index <= 5) {
          const anomaly_factor = 1.0 + (index - 2) * 0.1;
          readmission_rate *= anomaly_factor;
          length_of_stay *= anomaly_factor;
          medication_errors *= anomaly_factor;
        }
        
        // Add random variation
        const random_factor = 0.95 + Math.random() * 0.1;
        
        return {
          date,
          readmission_rate: Math.round(readmission_rate * random_factor * 10) / 10,
          length_of_stay: Math.round(length_of_stay * random_factor * 10) / 10,
          medication_errors: Math.round(medication_errors * random_factor * 10) / 10
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching patient metrics: ${error.message}`);
      // Return mock data
      return [
        { "date": "2023-03-20", "readmission_rate": 8.2, "length_of_stay": 4.1, "medication_errors": 2.0 },
        { "date": "2023-03-21", "readmission_rate": 8.5, "length_of_stay": 4.3, "medication_errors": 1.9 },
        { "date": "2023-03-22", "readmission_rate": 8.1, "length_of_stay": 4.2, "medication_errors": 2.1 },
        { "date": "2023-03-23", "readmission_rate": 10.2, "length_of_stay": 4.7, "medication_errors": 2.5 },
        { "date": "2023-03-24", "readmission_rate": 11.5, "length_of_stay": 5.0, "medication_errors": 2.9 },
        { "date": "2023-03-25", "readmission_rate": 12.8, "length_of_stay": 5.3, "medication_errors": 3.2 },
        { "date": "2023-03-26", "readmission_rate": 10.5, "length_of_stay": 4.9, "medication_errors": 2.8 }
      ];
    }
  }

  /**
   * Fetch financial metrics for anomaly detection
   * @private
   */
  async _fetchFinancialMetrics() {
    // This would normally fetch from a financial records collection
    // For this example, we'll return synthetic data
    
    // Generate dates for the past 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Generate synthetic metrics with anomalies on days 2-4
    return dates.map((date, index) => {
      // Base values
      let daily_expenses = 24500;
      let revenue_per_bed = 3200;
      let supply_costs = 8500;
      
      // Add anomalies on days 2-4
      if (index >= 2 && index <= 4) {
        const anomaly_factor = 1.0 + (index - 1) * 0.1;
        daily_expenses *= anomaly_factor;
        revenue_per_bed /= anomaly_factor;  // Inverse relationship
        supply_costs *= anomaly_factor;
      }
      
      // Add random variation
      const random_factor = 0.95 + Math.random() * 0.1;
      
      return {
        date,
        daily_expenses: Math.round(daily_expenses * random_factor),
        revenue_per_bed: Math.round(revenue_per_bed * random_factor),
        supply_costs: Math.round(supply_costs * random_factor)
      };
    });
  }

  /**
   * Fetch training data for AI models
   * @private
   */
  async _fetchTrainingData(modelType) {
    // This would normally extract extensive historical data for AI training
    // For this example, we'll return null to let the AI service use its default mock data
    return null;
  }
}

module.exports = new AIServiceIntegration();