// File: models/Equipment.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  building: String,
  floor: String,
  ward: {
    type: String,
    required: [true, 'Please add a ward']
  },
  room: {
    type: String,
    required: [true, 'Please add a room']
  }
});

const SpecificationsSchema = new mongoose.Schema({
  powerRequirements: String,
  dimensions: String,
  weight: String,
  batteryBackup: String
});

const MaintenanceHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['Preventive', 'Corrective'],
    required: true
  },
  technician: String,
  notes: String,
  cost: {
    type: Number,
    default: 0
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const UsageLogSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  patient: String,
  department: String,
  assignedBy: String
});

const EquipmentSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    required: [true, 'Please add an equipment ID'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Critical', 'Imaging', 'Monitoring', 'Surgical', 'Laboratory']
  },
  manufacturer: {
    type: String,
    required: [true, 'Please add a manufacturer']
  },
  model: {
    type: String,
    required: [true, 'Please add a model']
  },
  serialNumber: {
    type: String,
    required: [true, 'Please add a serial number'],
    unique: true,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Please add a purchase date']
  },
  warrantyExpiration: Date,
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance', 'Out of Order'],
    default: 'Available'
  },
  location: {
    type: LocationSchema,
    required: true
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  lastMaintenance: Date,
  nextMaintenance: Date,
  maintenanceHistory: [MaintenanceHistorySchema],
  usageLog: [UsageLogSchema],
  description: String,
  specifications: SpecificationsSchema,
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
EquipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for equipment age (in years)
EquipmentSchema.virtual('age').get(function() {
  const now = new Date();
  const purchase = new Date(this.purchaseDate);
  const diffTime = Math.abs(now - purchase);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
});

// Virtual for maintenance status
EquipmentSchema.virtual('maintenanceStatus').get(function() {
  if (!this.nextMaintenance) return 'Not Scheduled';
  
  const today = new Date();
  const nextMaintenance = new Date(this.nextMaintenance);
  
  // If next maintenance is overdue
  if (nextMaintenance < today) {
    return 'Overdue';
  }
  
  // If next maintenance is within the next 30 days
  const diffTime = Math.abs(nextMaintenance - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) {
    return 'Due Soon';
  }
  
  return 'Scheduled';
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
