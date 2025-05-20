import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDiseaseOutbreakPrediction } from '../../services/aiService';

const DiseaseOutbreakPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);

  useEffect(() => {
    const fetchPredictionData = async () => {
      try {
        setLoading(true);
        const response = await getDiseaseOutbreakPrediction();
        setPredictionData(response.data.data);
        // Set the highest risk disease as the default selected disease
        setSelectedDisease(response.data.data.highestRiskDisease.disease);
        setLoading(false);
      } catch (err) {
        setError('Could not load disease prediction data');
        setLoading(false);
        console.error('Error fetching disease prediction:', err);
      }
    };

    fetchPredictionData();
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

  // Disease trend chart component
  const renderTrendChart = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Disease Trend Analysis</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="lastYear" 
                name="Last Year" 
                stroke="#1a3a6e" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="currentYear" 
                name="Current Year" 
                stroke="#f39c12" 
                strokeWidth={2} 
                strokeDasharray={predictionData.monthlyTrend.some(d => d.isPrediction) ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span>
          <span className="mr-4">Historical Data</span>
          <span className="inline-block w-4 h-4 bg-yellow-500 mr-2"></span>
          <span className="mr-4">Current Year</span>
          <span className="inline-block w-4 h-4 bg-yellow-500 mr-2 border-dashed border-2 border-yellow-500"></span>
          <span>Prediction</span>
        </div>
      </div>
    );
  };

  // Disease prediction cards
  const renderPredictionCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {predictionData.predictions.map((disease, index) => (
          <div 
            key={index}
            className={`bg-white p-4 rounded-lg shadow-md cursor-pointer border-2 ${
              selectedDisease === disease.disease ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setSelectedDisease(disease.disease)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">{disease.disease}</h3>
              <span 
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  disease.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  disease.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}
              >
                {disease.riskLevel} Risk
              </span>
            </div>
            <div className="text-2xl font-bold mb-2">
              {disease.changePercentage > 0 ? '+' : ''}{disease.changePercentage}%
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div>Current: {disease.currentCases}</div>
              <div>Predicted: {disease.predictedCases}</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Confidence: {disease.confidence}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Recommendations section
  const renderRecommendations = () => {
    const recommendation = predictionData.recommendations.find(
      r => r.type === selectedDisease
    ) || predictionData.recommendations[0];

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recommended Actions</h2>
        
        <div className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded-r">
          <h3 className="text-lg font-semibold">{recommendation.title}</h3>
          <p className="text-gray-600 mt-1">{recommendation.description}</p>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Action Plan:</h4>
            <ul className="ml-5 list-disc space-y-1">
              {recommendation.actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-blue-700 font-medium mr-2">Impact:</span>
              <span className="font-medium">{recommendation.impact}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium mr-2">Confidence:</span>
              <span>{recommendation.confidence}%</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Implement Recommendation
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2">Disease Outbreak Prediction</h2>
        <p className="text-gray-600">
          AI analysis of historical patterns, current cases, and seasonal factors to predict
          potential disease outbreaks and help prepare appropriate responses.
        </p>
      </div>
      
      {renderPredictionCards()}
      {renderTrendChart()}
      {renderRecommendations()}
    </div>
  );
};

export default DiseaseOutbreakPrediction;