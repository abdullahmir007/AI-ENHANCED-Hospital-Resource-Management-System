import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById, addVitalSigns, addMedication, addNote } from '../../services/patientService';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [vitalForm, setVitalForm] = useState({
    temperature: '',
    heartRate: '',
    bloodPressure: '',
    respiratoryRate: '',
    oxygenSaturation: ''
  });
  
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  
  const [noteForm, setNoteForm] = useState({
    text: ''
  });

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const response = await getPatientById(id);
        setPatient(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Failed to load patient details. Please try again.');
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const handleBackToList = () => {
    navigate('/patients');
  };

  const handleEditPatient = () => {
    navigate(`/patients/${id}/edit`);
  };

  const handleVitalSubmit = async (e) => {
    e.preventDefault();
    try {
      await addVitalSigns(id, vitalForm);
      // Refresh patient data
      const response = await getPatientById(id);
      setPatient(response.data.data);
      // Reset form
      setVitalForm({
        temperature: '',
        heartRate: '',
        bloodPressure: '',
        respiratoryRate: '',
        oxygenSaturation: ''
      });
    } catch (err) {
      console.error('Error adding vital signs:', err);
      alert('Failed to add vital signs. Please try again.');
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedication(id, medicationForm);
      // Refresh patient data
      const response = await getPatientById(id);
      setPatient(response.data.data);
      // Reset form
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    } catch (err) {
      console.error('Error adding medication:', err);
      alert('Failed to add medication. Please try again.');
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await addNote(id, noteForm);
      // Refresh patient data
      const response = await getPatientById(id);
      setPatient(response.data.data);
      // Reset form
      setNoteForm({ text: '' });
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Patient not found'}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleBackToList}
        >
          Back to Patient List
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
            <div className="text-sm text-gray-500 mt-1">
              Patient ID: {patient.patientId} | Age: {patient.age} | Gender: {patient.gender}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={handleBackToList}
            >
              Back
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleEditPatient}
            >
              Edit Patient
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'vitals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('vitals')}
          >
            Vital Signs
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'medications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('medications')}
          >
            Medications
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p>{patient.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p>{patient.bloodType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${patient.status === 'Admitted' ? 'bg-green-100 text-green-800' : 
                          patient.status === 'Discharged' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {patient.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Date</p>
                    <p>{new Date(patient.admissionDate).toLocaleDateString()}</p>
                  </div>
                  {patient.dischargeDate && (
                    <div>
                      <p className="text-sm text-gray-500">Discharge Date</p>
                      <p>{new Date(patient.dischargeDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                  {patient.contactInfo && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{patient.contactInfo.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{patient.contactInfo.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p>{patient.contactInfo.address || 'Not provided'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Emergency Contact</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {patient.emergencyContact ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p>{patient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p>{patient.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p>No emergency contact information provided</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Assigned Resources</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Assigned Bed</p>
                    <p>{patient.assignedBed ? `${patient.assignedBed.bedId} (${patient.assignedBed.ward})` : 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned Doctor</p>
                    <p>{patient.assignedDoctor ? patient.assignedDoctor.name : 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned Nurse</p>
                    <p>{patient.assignedNurse ? patient.assignedNurse.name : 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vital Signs Tab */}
        {activeTab === 'vitals' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Vital Signs</h3>
            </div>
            
            {/* Add Vital Signs Form */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Add New Vital Signs</h4>
              <form onSubmit={handleVitalSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border rounded"
                      value={vitalForm.temperature}
                      onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={vitalForm.heartRate}
                      onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="e.g. 120/80"
                      value={vitalForm.bloodPressure}
                      onChange={(e) => setVitalForm({ ...vitalForm, bloodPressure: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Rate</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={vitalForm.respiratoryRate}
                      onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Saturation (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border rounded"
                      value={vitalForm.oxygenSaturation}
                      onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Vital Signs
                  </button>
                </div>
              </form>
            </div>
            
            {/* Vital Signs History */}
            <div>
              <h4 className="font-medium mb-3">Vital Signs History</h4>
              {patient.vitalSigns && patient.vitalSigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respiratory Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O2 Saturation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patient.vitalSigns.map((vital, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(vital.date).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vital.temperature} °C</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vital.heartRate} bpm</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vital.bloodPressure}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vital.respiratoryRate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vital.oxygenSaturation}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No vital signs recorded</div>
              )}
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Medications</h3>
            </div>
            
            {/* Add Medication Form */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Add New Medication</h4>
              <form onSubmit={handleMedicationSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={medicationForm.name}
                      onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="e.g. 500mg"
                      value={medicationForm.dosage}
                      onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="e.g. twice daily"
                      value={medicationForm.frequency}
                      onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={medicationForm.startDate}
                      onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={medicationForm.endDate}
                      onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Medication
                  </button>
                </div>
              </form>
            </div>
            
            {/* Medications List */}
            <div>
              <h4 className="font-medium mb-3">Current Medications</h4>
              {patient.medications && patient.medications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patient.medications.map((medication, index) => {
                        const startDate = new Date(medication.startDate);
                        const endDate = medication.endDate ? new Date(medication.endDate) : null;
                        const today = new Date();
                        const isActive = !endDate || endDate >= today;
                        
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{medication.dosage}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{medication.frequency}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{startDate.toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {endDate ? endDate.toLocaleDateString() : 'Ongoing'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isActive ? 'Active' : 'Completed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No medications prescribed</div>
              )}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Notes</h3>
            </div>
            
            {/* Add Note Form */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Add New Note</h4>
              <form onSubmit={handleNoteSubmit}>
                <div>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={noteForm.text}
                    onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                    placeholder="Enter your notes here..."
                    required
                  ></textarea>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
              </form>
            </div>
            
            {/* Notes List */}
            <div>
              <h4 className="font-medium mb-3">Patient Notes</h4>
              {patient.notes && patient.notes.length > 0 ? (
                <div className="space-y-4">
                  {patient.notes.map((note, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(note.date).toLocaleString()} by {note.author ? note.author.name : 'Unknown'}
                      </div>
                      <p className="text-gray-800">{note.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No notes recorded</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;