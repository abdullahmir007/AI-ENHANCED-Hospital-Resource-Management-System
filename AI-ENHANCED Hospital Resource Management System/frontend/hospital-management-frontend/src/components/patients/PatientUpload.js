import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { uploadPatientBatch } from '../../services/patientService';

const PatientUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [uploadStats, setUploadStats] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check if it's an Excel file
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
      toast.error('Please upload a valid Excel or CSV file');
      fileInputRef.current.value = null;
      return;
    }
    
    setFile(selectedFile);
    setPreview([]);
    setUploadStats(null);
    
    // Preview the first few rows
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const binaryData = evt.target.result;
        const workbook = XLSX.read(binaryData, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Get column headers
        const headers = jsonData[0];
        
        // Check if the required columns exist
        const requiredColumns = ['patientId', 'name', 'age', 'gender', 'diagnosis', 'status'];
        const missingColumns = requiredColumns.filter(col => 
          !headers.some(header => header && header.toLowerCase() === col.toLowerCase())
        );
        
        if (missingColumns.length > 0) {
          toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
          fileInputRef.current.value = null;
          setFile(null);
          return;
        }
        
        // Preview only the first 5 rows
        const previewData = [];
        for (let i = 1; i < Math.min(6, jsonData.length); i++) {
          const row = jsonData[i];
          if (row && row.length > 0) {
            const rowData = {};
            headers.forEach((header, idx) => {
              if (header && idx < row.length) {
                rowData[header] = row[idx];
              }
            });
            previewData.push(rowData);
          }
        }
        
        setPreview(previewData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Error reading Excel file. Please check the format.');
        fileInputRef.current.value = null;
        setFile(null);
      }
    };
    
    reader.onerror = () => {
      console.error('FileReader error');
      toast.error('Error reading file. Please try again.');
      fileInputRef.current.value = null;
      setFile(null);
    };
    
    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          // Parse Excel file
          const binaryData = evt.target.result;
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON with proper options
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false, // Return formatted text instead of raw values
            defval: "", // Default empty cells to empty string
            blankrows: false // Skip blank rows
          });
          
          // Clean and validate data
          const processedData = jsonData.map(patient => {
            // Convert keys to standard format
            const standardizedPatient = {};
            Object.keys(patient).forEach(key => {
              // Trim whitespace from string values
              if (typeof patient[key] === 'string') {
                standardizedPatient[key] = patient[key].trim();
              } else {
                standardizedPatient[key] = patient[key];
              }
            });
            
            // Ensure age is a number
            if (standardizedPatient.age && typeof standardizedPatient.age === 'string') {
              standardizedPatient.age = parseInt(standardizedPatient.age, 10);
            }
            
            // Handle allergies format
            if (standardizedPatient.allergies && typeof standardizedPatient.allergies === 'string') {
              standardizedPatient.allergies = standardizedPatient.allergies
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0);
            }
            
            // Handle nested objects if in flat format
            if (standardizedPatient['contactInfo.phone'] || 
                standardizedPatient['contactInfo.email'] || 
                standardizedPatient['contactInfo.address']) {
              standardizedPatient.contactInfo = {
                phone: standardizedPatient['contactInfo.phone'] || '',
                email: standardizedPatient['contactInfo.email'] || '',
                address: standardizedPatient['contactInfo.address'] || ''
              };
              delete standardizedPatient['contactInfo.phone'];
              delete standardizedPatient['contactInfo.email'];
              delete standardizedPatient['contactInfo.address'];
            }
            
            if (standardizedPatient['emergencyContact.name'] || 
                standardizedPatient['emergencyContact.relationship'] || 
                standardizedPatient['emergencyContact.phone']) {
              standardizedPatient.emergencyContact = {
                name: standardizedPatient['emergencyContact.name'] || '',
                relationship: standardizedPatient['emergencyContact.relationship'] || '',
                phone: standardizedPatient['emergencyContact.phone'] || ''
              };
              delete standardizedPatient['emergencyContact.name'];
              delete standardizedPatient['emergencyContact.relationship'];
              delete standardizedPatient['emergencyContact.phone'];
            }
            
            // *** IMPORTANT FIX: Remove empty string fields that need to be ObjectIds ***
            // These will be treated as null on the server
            if (standardizedPatient.assignedBed === '') {
              delete standardizedPatient.assignedBed;
            }
            
            if (standardizedPatient.assignedDoctor === '') {
              delete standardizedPatient.assignedDoctor;
            }
            
            if (standardizedPatient.assignedNurse === '') {
              delete standardizedPatient.assignedNurse;
            }
            
            return standardizedPatient;
          });
          
          // Filter out rows with missing required data
          const validData = processedData.filter(patient => 
            patient.patientId && patient.name && 
            (patient.age !== undefined && patient.age !== null) && 
            patient.gender && patient.diagnosis && patient.status
          );
          
          if (validData.length === 0) {
            throw new Error('No valid patient data found in the file');
          }
          
          if (validData.length < processedData.length) {
            toast.warning(`${processedData.length - validData.length} records were skipped due to missing required fields`);
          }
          
          // Log data for debugging
          console.log('Submitting data:', validData);
          
          // Make sure we're sending an array
          if (!Array.isArray(validData)) {
            console.error('Data is not an array:', validData);
            throw new Error('Invalid data format. Expected an array.');
          }
          
          // Upload the valid data
          const response = await uploadPatientBatch(validData);
          
          setUploadStats(response.data.data);
          toast.success('Patient data uploaded successfully!');
        } catch (error) {
          console.error('Error processing Excel data:', error);
          
          if (error.response) {
            console.error('Response error data:', error.response.data);
            if (error.response.data && error.response.data.error) {
              toast.error(`Error: ${error.response.data.error}`);
            } else if (error.response.data && error.response.data.message) {
              toast.error(`Error: ${error.response.data.message}`);
            } else {
              toast.error(`Server error (${error.response.status}): Please check server logs`);
            }
          } else if (error.message) {
            toast.error(`Error: ${error.message}`);
          } else {
            toast.error('Error processing Excel data. Please check the format.');
          }
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader error');
        toast.error('Error reading file. Please try again.');
        setUploading(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file. Please try again.');
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    fileInputRef.current.value = null;
    setFile(null);
    setPreview([]);
    setUploadStats(null);
  };

  const downloadTemplate = () => {
    // Create a template workbook
    const wb = XLSX.utils.book_new();
    const templateData = [
      [
        'patientId', 'name', 'age', 'gender', 'bloodType', 'contactInfo.phone', 
        'contactInfo.email', 'contactInfo.address', 'emergencyContact.name', 
        'emergencyContact.relationship', 'emergencyContact.phone', 'admissionDate', 
        'diagnosis', 'treatmentPlan', 'allergies', 'status', 'dischargeDate'
      ],
      [
        'P041', 'John Doe', '45', 'Male', 'O+', '555-1234', 
        'john@example.com', '123 Main St', 'Jane Doe', 
        'Spouse', '555-5678', '2025-04-20', 
        'Hypertension', 'Medication and follow up', 'Penicillin', 'Admitted', ''
      ],
      [
        'P042', 'Jane Smith', '35', 'Female', 'A-', '555-5678', 
        'jane@example.com', '456 Oak St', 'John Smith', 
        'Spouse', '555-1234', '2025-04-15', 
        'Fracture', 'Cast and physical therapy', '', 'Discharged', '2025-04-21'
      ]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'PatientTemplate');
    
    // Add some instructional comments
    const instructions = `
Instructions:
1. patientId, name, age, gender, diagnosis, and status are required fields.
2. Use 'Admitted', 'Discharged', 'Transferred', or 'Deceased' for status.
3. For new patients, provide a unique patientId.
4. For existing patients, use their current patientId and the system will update their info.
5. For discharging patients, set status to 'Discharged' and provide a dischargeDate.
6. For allergies, provide as comma-separated values (e.g., "Penicillin, Latex").
7. Dates should be in YYYY-MM-DD format.
8. Leave assignedBed, assignedDoctor, and assignedNurse fields empty unless you have valid IDs.
`;
    
    const commentWs = XLSX.utils.aoa_to_sheet([[instructions]]);
    XLSX.utils.book_append_sheet(wb, commentWs, 'Instructions');
    
    // Download the template
    XLSX.writeFile(wb, 'patient_upload_template.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Upload Patient Data</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Excel File (.xlsx or .xls)</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            ref={fileInputRef}
          />
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Download Template
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Upload an Excel file with patient data. The file should include columns for patientId, name, age, gender, diagnosis, status, and other fields.
        </p>
      </div>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`px-4 py-2 rounded-md ${
            !file || uploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Upload and Update Patients'
          )}
        </button>
        
        {file && (
          <button
            onClick={handleClearFile}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
      
      {preview.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-bold mb-3">Preview (First {preview.length} rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.keys(row).map((key, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`}
                        className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                      >
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {preview.length} of {file ? 'many' : '0'} rows. Upload to process all data.
          </p>
        </div>
      )}
      
      {uploadStats && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-md font-semibold text-green-800 mb-2">Upload Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded shadow">
              <p className="text-sm text-gray-500">Added</p>
              <p className="text-xl font-bold text-green-600">{uploadStats.added}</p>
            </div>
            <div className="text-center p-3 bg-white rounded shadow">
              <p className="text-sm text-gray-500">Updated</p>
              <p className="text-xl font-bold text-blue-600">{uploadStats.updated}</p>
            </div>
            <div className="text-center p-3 bg-white rounded shadow">
              <p className="text-sm text-gray-500">Discharged</p>
              <p className="text-xl font-bold text-orange-600">{uploadStats.discharged}</p>
            </div>
            <div className="text-center p-3 bg-white rounded shadow">
              <p className="text-sm text-gray-500">Errors</p>
              <p className="text-xl font-bold text-red-600">{uploadStats.errors}</p>
            </div>
          </div>
          {uploadStats.errorDetails && uploadStats.errorDetails.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-red-600 mb-1">Error Details:</p>
              <ul className="text-xs text-red-600 list-disc pl-5 max-h-40 overflow-y-auto">
                {uploadStats.errorDetails.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientUpload;