// File: models/Staff.js
const mongoose = require('mongoose');

const ContactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: String,
  address: String
});

const EmergencyContactSchema = new mongoose.Schema({
  name: String,
  relationship: String,
  phone: String
});

const CertificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  issuedDate: Date,
  expirationDate: Date
});

const EducationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String
});

const ShiftSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  assignment: {
    type: String,
    default: 'Unassigned'
  },
  shift: {
    type: String,
    enum: [
      'Morning (7AM-3PM)', 
      'Evening (3PM-11PM)', 
      'Night (11PM-7AM)', 
      'Custom',
      'Off',
      'Unassigned'
    ],
    default: 'Unassigned'
  },
  startTime: String,
  endTime: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Off', 'Unassigned'],
    default: 'Scheduled'
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  notes: String
});

const PerformanceMetricsSchema = new mongoose.Schema({
  patientSatisfaction: {
    type: Number,
    min: 0,
    max: 100
  },
  patientsTreated: {
    type: Number,
    default: 0
  },
  averagePatientLoad: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  avgHoursPerShift: {
    type: Number,
    default: 0
  }
});

const StaffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    required: [true, 'Please add a staff ID'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  staffType: {
    type: String,
    required: [true, 'Please add a staff type'],
    enum: ['Surgeon', 'Nurse', 'Physician', 'Technician', 'Administrator']
  },
  specialty: String,
  licensedSince: Date,
  onDuty: {
    type: Boolean,
    default: false
  },
  currentAssignment: String,
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  supervisor: String,
  patientsAssigned: {
    type: Number,
    default: 0
  },
  contactInfo: ContactInfoSchema,
  emergencyContact: EmergencyContactSchema,
  certifications: [CertificationSchema],
  education: [EducationSchema],
  shifts: [ShiftSchema],
  performanceMetrics: PerformanceMetricsSchema,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field before saving
StaffSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting upcoming shifts
StaffSchema.virtual('upcomingShifts').get(function() {
  const today = new Date();
  return this.shifts.filter(shift => {
    return new Date(shift.date) >= today && shift.status === 'Scheduled';
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
});

module.exports = mongoose.model('Staff', StaffSchema);
