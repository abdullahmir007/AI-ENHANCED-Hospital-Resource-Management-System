
// File: models/Alert.js
const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  type: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['bed', 'staff', 'equipment', 'patient', 'system'],
    required: [true, 'Please add a category']
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'Resolved', 'Closed'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  source: {
    type: String,
    required: [true, 'Please add a source']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    enum: ['Bed', 'Staff', 'Equipment', 'Patient']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  resolution: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Set expiration date if not set
AlertSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set default expiration to 14 days from creation
    this.expiresAt = new Date(this.createdAt);
    this.expiresAt.setDate(this.expiresAt.getDate() + 14);
  }
  next();
});

module.exports = mongoose.model('Alert', AlertSchema);