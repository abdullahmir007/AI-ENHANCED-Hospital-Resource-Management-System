// components/common/APITester.jsx
import React, { useState } from 'react';

const APITester = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const testHealth = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:5001/health');
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">API Connection Tester</h3>
      <button
        onClick={testHealth}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="font-medium text-green-800">Success!</p>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="font-medium text-red-800">Connection Error</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default APITester;