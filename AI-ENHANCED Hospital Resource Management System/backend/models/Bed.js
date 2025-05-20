// File: models/Bed.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  }
});

const BedHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
    required: true
  },
  patientName: String,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const BedSchema = new mongoose.Schema({
  bedId: {
    type: String,
    required: [true, 'Please add a bed ID'],
    unique: true,
    trim: true
  },
  ward: {
    type: String,
    required: [true, 'Please add a ward'],
    enum: ['ICU', 'ER', 'General', 'Pediatric', 'Maternity', 'Surgical']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
    default: 'Available'
  },
  type: {
    type: String,
    enum: ['Standard', 'Electric', 'Bariatric', 'Low', 'Pediatric', 'Delivery'],
    default: 'Standard'
  },
  location: {
    type: LocationSchema,
    required: true
  },
  lastSanitized: {
    type: Date,
    default: Date.now
  },
  lastMaintenance: {
    type: Date
  },
  maintenanceReason: String,
  maintenanceEndTime: Date,
  currentPatient: {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    name: String,
    age: Number,
    gender: String,
    diagnosis: String,
    admissionDate: Date,
    expectedDischarge: Date
  },
  reservedFor: {
    name: String,
    admissionTime: Date
  },
  reservationTime: Date,
  history: [BedHistorySchema],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create bed history on status change
BedSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isModified('currentPatient')) {
    const historyEntry = {
      date: new Date(),
      status: this.status,
      patientName: this.currentPatient ? this.currentPatient.name : null,
      patientId: this.currentPatient ? this.currentPatient.patientId : null,
      updatedBy: this.updatedBy
    };
    
    this.history.push(historyEntry);
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Bed', BedSchema);