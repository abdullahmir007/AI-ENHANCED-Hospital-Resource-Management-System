import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPatient, getPatientById, updatePatient } from '../../services/patientService';
import { getAllBeds } from '../../services/bedService';
import { getAllStaff } from '../../services/StaffService';

const PatientForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [beds, setBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    bloodType: '',
    contactInfo: {
      phone: '',
      email: '',
      address: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    admissionDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatmentPlan: '',
    allergies: '',
    status: 'Admitted',
    assignedBed: '',
    assignedDoctor: '',
    assignedNurse: ''
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        // Fetch available beds and staff
        const [bedsRes, staffRes] = await Promise.all([
          getAllBeds({ status: 'Available' }),
          getAllStaff()
        ]);

        const availableBeds = bedsRes.data.data;
        setBeds(availableBeds);

        const staffList = staffRes.data.data;
        setDoctors(staffList.filter(s => s.staffType === 'Physician' || s.staffType === 'Surgeon'));
        setNurses(staffList.filter(s => s.staffType === 'Nurse'));

        // If editing, fetch patient data
        if (isEditing && id) {
          const patientRes = await getPatientById(id);
          const patient = patientRes.data.data;
          
          // Format data for form
          setFormData({
            patientId: patient.patientId || '',
            name: patient.name || '',
            age: patient.age || '',
            gender: patient.gender || 'Male',
            bloodType: patient.bloodType || '',
            contactInfo: {
              phone: patient.contactInfo?.phone || '',
              email: patient.contactInfo?.email || '',
              address: patient.contactInfo?.address || ''
            },
            emergencyContact: {
              name: patient.emergencyContact?.name || '',
              relationship: patient.emergencyContact?.relationship || '',
              phone: patient.emergencyContact?.phone || ''
            },
            admissionDate: patient.admissionDate ? new Date(patient.admissionDate).toISOString().split('T')[0] : '',
            diagnosis: patient.diagnosis || '',
            treatmentPlan: patient.treatmentPlan || '',
            allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : '',
            status: patient.status || 'Admitted',
            assignedBed: patient.assignedBed?._id || '',
            assignedDoctor: patient.assignedDoctor?._id || '',
            assignedNurse: patient.assignedNurse?._id || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format data for submission
      const submissionData = {
        ...formData,
        age: parseInt(formData.age),
        allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : []
      };
      
      if (isEditing) {
        await updatePatient(id, submissionData);
      } else {
        await createPatient(submissionData);
      }
      
      navigate('/patients');
    } catch (err) {
      console.error('Error saving patient:', err);
      setError('Failed to save patient. Please check your data and try again.');
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID*
                </label>
                <input
                  type="text"
                  name="patientId"
                  className="w-full p-2 border rounded"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age*
                  </label>
                  <input
                    type="number"
                    name="age"
                    className="w-full p-2 border rounded"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender*
                  </label>
                  <select
                    name="gender"
                    className="w-full p-2 border rounded"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type
                </label>
                <select
                  name="bloodType"
                  className="w-full p-2 border rounded"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  className="w-full p-2 border rounded"
                  value={formData.contactInfo.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  className="w-full p-2 border rounded"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="contactInfo.address"
                  rows="2"
                  className="w-full p-2 border rounded"
                  value={formData.contactInfo.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  className="w-full p-2 border rounded"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  className="w-full p-2 border rounded"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  className="w-full p-2 border rounded"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Date*
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  className="w-full p-2 border rounded"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis*
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  className="w-full p-2 border rounded"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Plan
                </label>
                <textarea
                  name="treatmentPlan"
                  rows="2"
                  className="w-full p-2 border rounded"
                  value={formData.treatmentPlan}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  name="allergies"
                  className="w-full p-2 border rounded"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="e.g. Penicillin, Peanuts, Latex"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status*
                </label>
                <select
                  name="status"
                  className="w-full p-2 border rounded"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Admitted">Admitted</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Assignments */}
          <div>
            <h3 className="text-lg font-medium mb-4">Resource Assignments</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Bed
                </label>
                <select
                  name="assignedBed"
                  className="w-full p-2 border rounded"
                  value={formData.assignedBed}
                  onChange={handleInputChange}
                >
                  <option value="">No Bed Assigned</option>
                  {beds.map(bed => (
                    <option key={bed._id} value={bed._id}>
                      {bed.bedId} - {bed.ward} ({bed.location.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Doctor
                </label>
                <select
                  name="assignedDoctor"
                  className="w-full p-2 border rounded"
                  value={formData.assignedDoctor}
                  onChange={handleInputChange}
                >
                  <option value="">No Doctor Assigned</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.staffType}, {doctor.department})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Nurse
                </label>
                <select
                  name="assignedNurse"
                  className="w-full p-2 border rounded"
                  value={formData.assignedNurse}
                  onChange={handleInputChange}
                >
                  <option value="">No Nurse Assigned</option>
                  {nurses.map(nurse => (
                    <option key={nurse._id} value={nurse._id}>
                      {nurse.name} ({nurse.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? 'Update Patient' : 'Create Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;