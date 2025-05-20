import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { uploadEquipmentData } from '../../services/equipmentService';

const EquipmentUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setFile(selectedFile);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          toast.error('The Excel file does not contain enough data');
          return;
        }
        
        // Extract headers from first row
        const headers = jsonData[0];
        
        // Create preview data - just show first 5 rows
        const previewData = jsonData.slice(1, 6).map(row => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });
        
        setPreview(previewData);
        setShowPreview(true);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadEquipmentData(formData);
      
      toast.success(`${response.data.processed} equipment records processed successfully`);
      if (response.data.created > 0) {
        toast.info(`${response.data.created} new equipment records created`);
      }
      if (response.data.updated > 0) {
        toast.info(`${response.data.updated} existing equipment records updated`);
      }
      if (response.data.errors && response.data.errors.length > 0) {
        response.data.errors.forEach(error => toast.warning(error));
      }
      
      // Reset form
      setFile(null);
      setPreview([]);
      setShowPreview(false);
      
      // Notify parent component if needed
      // onUploadComplete();
      
    } catch (error) {
      console.error('Error uploading equipment data:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload equipment data';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a simple template
    const template = [
      ['equipmentId', 'name', 'category', 'manufacturer', 'model', 'serialNumber', 'purchaseDate', 'warrantyExpiration', 'status', 'condition', 'location.ward', 'location.room', 'location.floor', 'location.building', 'patient', 'department', 'description'],
      ['EQ001', 'Example Equipment', 'Critical', 'Example Manufacturer', 'Model X', 'SN12345', '2025-01-01', '2028-01-01', 'Available', 'Good', 'ICU', '101', '1', 'Main', '', '', 'Example description']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment Template');
    
    XLSX.writeFile(wb, 'equipment_upload_template.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Upload Equipment Data</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excel File (.xlsx or .xls)
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="border border-gray-300 p-2 w-full rounded"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload an Excel file with equipment data. The file should include columns for equipmentId, status, and other required fields.
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="text-blue-600 hover:text-blue-800"
        >
          Download Template
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Template Format:</h3>
        <p className="mb-2">Your Excel file should have the following columns:</p>
        <ul className="list-disc pl-8 space-y-1">
          <li><strong>equipmentId</strong> (required) - The unique identifier for the equipment</li>
          <li><strong>name</strong> - Name of the equipment</li>
          <li><strong>category</strong> - Critical, Imaging, Monitoring, Surgical, or Laboratory</li>
          <li><strong>manufacturer</strong> - Manufacturer name</li>
          <li><strong>model</strong> - Model number or name</li>
          <li><strong>serialNumber</strong> - Serial number of the equipment</li>
          <li><strong>purchaseDate</strong> - Date when the equipment was purchased</li>
          <li><strong>warrantyExpiration</strong> - Date when the warranty expires</li>
          <li><strong>status</strong> - Available, In Use, Maintenance, or Out of Order</li>
          <li><strong>condition</strong> - Excellent, Good, Fair, or Poor</li>
          <li><strong>location.ward</strong> - Ward location (ICU, ER, Surgery, etc.)</li>
          <li><strong>location.room</strong> - Room number</li>
          <li><strong>location.floor</strong> - Floor number</li>
          <li><strong>location.building</strong> - Building name</li>
          <li><strong>patient</strong> - Patient ID or name (if equipment is in use)</li>
          <li><strong>department</strong> - Department using the equipment (if in use)</li>
          <li><strong>description</strong> - Additional description or notes</li>
        </ul>
      </div>
      
      {showPreview && preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Preview (First 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map((header, index) => (
                    <th 
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td 
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell !== undefined ? cell.toString() : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing the first 5 rows from your Excel file
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`px-4 py-2 rounded-md ${
            uploading || !file
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload and Update Equipment'}
        </button>
      </div>
    </div>
  );
};

export default EquipmentUpload;