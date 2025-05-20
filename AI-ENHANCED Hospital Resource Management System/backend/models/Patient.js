
// File: models/Patient.js
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Please add a patient ID'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please add an age']
  },
  gender: {
    type: String,
    required: [true, 'Please add a gender'],
    enum: ['Male', 'Female', 'Other']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  admissionDate: {
    type: Date,
    required: [true, 'Please add an admission date']
  },
  dischargeDate: Date,
  diagnosis: {
    type: String,
    required: [true, 'Please add a diagnosis']
  },
  treatmentPlan: String,
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  vitalSigns: [{
    date: {
      type: Date,
      default: Date.now
    },
    temperature: Number,
    heartRate: Number,
    bloodPressure: String,
    respiratoryRate: Number,
    oxygenSaturation: Number
  }],
  assignedBed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  notes: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      text: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expirationDate: Date
  },
  status: {
    type: String,
    enum: ['Admitted', 'Discharged', 'Transferred', 'Deceased'],
    default: 'Admitted'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update the updatedAt field before saving
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for length of stay (in days)
PatientSchema.virtual('lengthOfStay').get(function() {
  const endDate = this.dischargeDate || new Date();
  const start = new Date(this.admissionDate);
  const diffTime = Math.abs(endDate - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Patient', PatientSchema);