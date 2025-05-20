import React, { useState } from 'react';
import { uploadBedExcel } from '../../services/bedService';
import { toast } from 'react-toastify';
import { generateBedExcelTemplate } from './ExcelTemplateGenerator';

const BedUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && 
        (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
         selectedFile.type === 'application/vnd.ms-excel')) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('bedFile', file);
      
      const response = await uploadBedExcel(formData);
      
      setResults(response.data);
      toast.success('Bed data updated successfully');
    } catch (err) {
      console.error('Error uploading bed data:', err);
      toast.error(err.response?.data?.message || 'Failed to update bed data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Upload Bed Data</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excel File (.xlsx or .xls)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".xlsx,.xls"
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload an Excel file with bed data. The file should include columns for bedId, status, and other required fields.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`px-4 py-2 rounded-md text-white ${
            loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload and Update Beds'}
        </button>
      </form>

      {results && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Upload Results:</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Total Records Processed:</p>
                <p className="text-lg">{results.totalProcessed}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Successfully Updated:</p>
                <p className="text-lg text-green-600">{results.updated}</p>
              </div>
              {results.errors > 0 && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-red-600">Errors:</p>
                  <p className="text-lg text-red-600">{results.errors}</p>
                  {results.errorDetails && (
                    <ul className="mt-2 text-sm text-red-600 list-disc pl-5">
                      {results.errorDetails.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-md font-semibold mb-2">Template Format:</h3>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600">Your Excel file should have the following columns:</p>
          <button
            type="button"
            onClick={generateBedExcelTemplate}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Download Template
          </button>
        </div>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          <li><strong>bedId</strong> (required) - The unique identifier for the bed</li>
          <li><strong>status</strong> - Available, Occupied, Reserved, or Maintenance</li>
          <li><strong>ward</strong> - ICU, ER, General, Pediatric, Maternity, or Surgical</li>
          <li><strong>type</strong> - Standard, Electric, Bariatric, Low, Pediatric, or Delivery</li>
          <li><strong>location.building</strong> - Building name</li>
          <li><strong>location.floor</strong> - Floor number</li>
          <li><strong>location.roomNumber</strong> - Room number</li>
          <li><strong>currentPatient.patientId</strong> - Patient ID (if occupied)</li>
          <li><strong>lastSanitized</strong> - Date the bed was last sanitized</li>
          <li><strong>notes</strong> - Additional notes</li>
          <li><strong>maintenanceReason</strong> - Reason for maintenance (if applicable)</li>
          <li><strong>maintenanceEndTime</strong> - Expected end of maintenance</li>
          <li><strong>reservedFor</strong> - Name for reservation (if applicable)</li>
          <li><strong>reservationTime</strong> - Time of planned admission</li>
        </ul>
      </div>
    </div>
  );
};

export default BedUpload;