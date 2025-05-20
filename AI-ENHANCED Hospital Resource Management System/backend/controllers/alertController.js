// File: controllers/alertController.js
const Alert = require('../models/Alert');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Handle specific search parameter
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    reqQuery.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }

  // Filter by status
  if (reqQuery.status) {
    reqQuery.status = reqQuery.status;
  }

  // Filter by priority
  if (reqQuery.priority) {
    reqQuery.priority = reqQuery.priority;
  }

  // Filter by category
  if (reqQuery.category) {
    reqQuery.category = reqQuery.category;
  }

  // Filter by type
  if (reqQuery.type) {
    reqQuery.type = reqQuery.type;
  }

  // Filter by read status
  if (reqQuery.read !== undefined) {
    reqQuery.read = reqQuery.read === 'true';
  }

  // Create query
  let query = Alert.find(reqQuery)
    .populate('assignedTo', 'name')
    .populate('acknowledgedBy', 'name')
    .populate('resolvedBy', 'name')
    .populate('createdBy', 'name');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Alert.countDocuments(reqQuery);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const alerts = await query;

  // Pagination result
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  res.status(200).json({
    success: true,
    pagination,
    data: alerts
  });
});

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id)
    .populate('assignedTo', 'name')
    .populate('acknowledgedBy', 'name')
    .populate('resolvedBy', 'name')
    .populate('createdBy', 'name');

  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: alert
  });
});

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
exports.createAlert = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const alert = await Alert.create(req.body);

  // Emit socket event for new alert
  if (req.app.get('io')) {
    req.app.get('io').emit('new-alert', { alert });
  }

  res.status(201).json({
    success: true,
    data: alert
  });
});

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private
exports.updateAlert = asyncHandler(async (req, res, next) => {
  let alert = await Alert.findById(req.params.id);

  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }

  // Handle status transitions
  if (req.body.status) {
    if (req.body.status === 'Acknowledged' && alert.status === 'Active') {
      req.body.acknowledgedBy = req.user.id;
      req.body.acknowledgedAt = Date.now();
    } else if (req.body.status === 'Resolved' && (alert.status === 'Active' || alert.status === 'Acknowledged')) {
      req.body.resolvedBy = req.user.id;
      req.body.resolvedAt = Date.now();
    }
  }

  alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Emit socket event for updated alert
  if (req.app.get('io')) {
    req.app.get('io').emit('alert-updated', { alert });
  }

  res.status(200).json({
    success: true,
    data: alert
  });
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
exports.deleteAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }

  await alert.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let alert = await Alert.findById(req.params.id);

  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }

  alert = await Alert.findByIdAndUpdate(req.params.id, { read: true }, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: alert
  });
});

// @desc    Mark all alerts as read
// @route   PUT /api/alerts/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Alert.updateMany({ read: false }, { read: true });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Private
exports.getAlertStats = asyncHandler(async (req, res, next) => {
  // Get counts by status
  const statusStats = await Alert.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object
  const byStatus = statusStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Get counts by type
  const typeStats = await Alert.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object
  const byType = typeStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Get counts by category
  const categoryStats = await Alert.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object
  const byCategory = categoryStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Get total alerts
  const total = await Alert.countDocuments();
  const unread = await Alert.countDocuments({ read: false });
  const active = await Alert.countDocuments({ status: 'Active' });
  const acknowledged = await Alert.countDocuments({ status: 'Acknowledged' });
  const resolved = await Alert.countDocuments({ status: 'Resolved' });
  const critical = await Alert.countDocuments({ priority: 'Critical', status: { $ne: 'Resolved' } });

  // Compile stats
  const stats = {
    total,
    unread,
    active,
    acknowledged,
    resolved,
    critical,
    byStatus,
    byType,
    byCategory
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});