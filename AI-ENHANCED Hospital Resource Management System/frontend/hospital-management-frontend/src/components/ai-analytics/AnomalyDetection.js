import React, { useState, useEffect } from 'react';
import { getAnomalyDetection } from '../../services/aiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const AnomalyDetection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('resource');
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    const fetchAnomalyData = async () => {
      try {
        setLoading(true);
        const response = await getAnomalyDetection();
        setAnomalyData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Could not load anomaly detection data');
        setLoading(false);
        console.error('Error fetching anomaly data:', err);
      }
    };

    fetchAnomalyData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Mock data for development without backend
  const mockData = {
    categories: {
      resource: {
        title: "Resource Usage Anomalies",
        description: "Detection of unusual patterns in hospital resource utilization",
        anomalies: [
          {
            id: "a1",
            title: "Abnormal Ventilator Usage",
            description: "Ventilator usage increased by 42% in the past 48 hours",
            severity: "critical",
            timestamp: "2023-04-08T15:23:11Z",
            relatedMetric: "Equipment Usage"
          },
          {
            id: "a2",
            title: "ICU Bed Occupancy Spike",
            description: "ICU bed occupancy reached 97%, 22% above normal seasonal pattern",
            severity: "warning",
            timestamp: "2023-04-08T09:14:32Z",
            relatedMetric: "Bed Allocation"
          },
          {
            id: "a3",
            title: "Staff Overtime Pattern",
            description: "Nursing staff in Emergency department showing 35% increase in overtime hours",
            severity: "medium",
            timestamp: "2023-04-06T22:47:09Z",
            relatedMetric: "Staff Scheduling"
          }
        ],
        chartData: [
          { date: '04/02', normal: 72, actual: 74, anomaly: false },
          { date: '04/03', normal: 75, actual: 73, anomaly: false },
          { date: '04/04', normal: 76, actual: 78, anomaly: false },
          { date: '04/05', normal: 74, actual: 80, anomaly: false },
          { date: '04/06', normal: 75, actual: 86, anomaly: true },
          { date: '04/07', normal: 77, actual: 92, anomaly: true },
          { date: '04/08', normal: 78, actual: 95, anomaly: true }
        ]
      },
      patient: {
        title: "Patient Care Anomalies",
        description: "Detection of unusual patterns in patient care metrics",
        anomalies: [
          {
            id: "b1",
            title: "Readmission Rate Increase",
            description: "30-day readmission rate for cardiac patients increased to 18% (7% above baseline)",
            severity: "warning",
            timestamp: "2023-04-07T11:33:56Z",
            relatedMetric: "Patient Outcomes"
          },
          {
            id: "b2",
            title: "Unusual Medication Pattern",
            description: "25% increase in antibiotic prescriptions in pediatric ward",
            severity: "medium",
            timestamp: "2023-04-05T16:21:43Z",
            relatedMetric: "Medication"
          }
        ],
        chartData: [
          { date: '04/02', normal: 8.5, actual: 9.1, anomaly: false },
          { date: '04/03', normal: 8.7, actual: 9.0, anomaly: false },
          { date: '04/04', normal: 8.6, actual: 8.9, anomaly: false },
          { date: '04/05', normal: 8.5, actual: 10.2, anomaly: true },
          { date: '04/06', normal: 8.4, actual: 11.3, anomaly: true },
          { date: '04/07', normal: 8.5, actual: 12.8, anomaly: true },
          { date: '04/08', normal: 8.6, actual: 11.7, anomaly: true }
        ]
      },
      financial: {
        title: "Financial Anomalies",
        description: "Detection of unusual patterns in financial and billing metrics",
        anomalies: [
          {
            id: "c1",
            title: "Billing Code Irregularity",
            description: "Unusual pattern detected in billing codes for radiology services",
            severity: "medium",
            timestamp: "2023-04-07T14:42:21Z",
            relatedMetric: "Billing"
          },
          {
            id: "c2",
            title: "Supply Cost Variation",
            description: "Cardiology supplies showing 31% cost increase outside of seasonal norms",
            severity: "warning",
            timestamp: "2023-04-04T10:09:45Z",
            relatedMetric: "Supply Chain"
          }
        ],
        chartData: [
          { date: '04/02', normal: 24500, actual: 25100, anomaly: false },
          { date: '04/03', normal: 23800, actual: 24000, anomaly: false },
          { date: '04/04', normal: 24200, actual: 31700, anomaly: true },
          { date: '04/05', normal: 24600, actual: 32500, anomaly: true },
          { date: '04/06', normal: 25100, actual: 30800, anomaly: true },
          { date: '04/07', normal: 24900, actual: 28600, anomaly: true },
          { date: '04/08', normal: 24700, actual: 26300, anomaly: false }
        ]
      }
    }
  };

  // Use mock data if backend data is not available
  const data = anomalyData || mockData;
  const categoryData = data.categories[selectedCategory];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'medium': return 'blue';
      default: return 'gray';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2">Anomaly Detection</h2>
        <p className="text-gray-600">
          AI-driven analysis to identify unusual patterns and outliers across hospital operations,
          helping to detect issues before they become critical problems.
        </p>
      </div>
      
      {/* Time range selector */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-700 mr-2">Time Range:</span>
            <select 
              className="border rounded px-3 py-1"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded ${selectedCategory === 'resource' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSelectedCategory('resource')}
            >
              Resources
            </button>
            <button 
              className={`px-3 py-1 rounded ${selectedCategory === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSelectedCategory('patient')}
            >
              Patient Care
            </button>
            <button 
              className={`px-3 py-1 rounded ${selectedCategory === 'financial' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSelectedCategory('financial')}
            >
              Financial
            </button>
          </div>
        </div>
      </div>
      
      {/* Anomaly chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-2">{categoryData.title}</h3>
        <p className="text-gray-600 mb-4">{categoryData.description}</p>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={categoryData.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="normal" 
                name="Expected Range" 
                stroke="#64748b" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Values" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.anomaly) {
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#ef4444" 
                        stroke="white" 
                        strokeWidth={2} 
                      />
                    );
                  }
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="#3b82f6" 
                    />
                  );
                }}
              />
              {/* Add reference line for visualization */}
              <ReferenceLine y={categoryData.chartData[0].normal * 1.2} stroke="red" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-3 flex items-center justify-end text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Normal data point</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Anomaly detected</span>
          </div>
        </div>
      </div>
      
      {/* Detected anomalies */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
        
        <div className="space-y-4">
          {categoryData.anomalies.map((anomaly) => (
            <div 
              key={anomaly.id}
              className={`border-l-4 border-${getSeverityColor(anomaly.severity)}-500 bg-${getSeverityColor(anomaly.severity)}-50 p-4 rounded-r`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{anomaly.title}</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${getSeverityColor(anomaly.severity)}-100 text-${getSeverityColor(anomaly.severity)}-800`}>
                  {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{anomaly.description}</p>
              <div className="mt-2 text-sm text-gray-500 flex justify-between">
                <span>Related to: {anomaly.relatedMetric}</span>
                <span>Detected: {formatTimestamp(anomaly.timestamp)}</span>
              </div>
              <div className="mt-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">
                  Investigate
                </button>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Mark as Reviewed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex space-x-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Configure Alerts
        </button>
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
          Export Report
        </button>
      </div>
    </div>
  );
};

export default AnomalyDetection;