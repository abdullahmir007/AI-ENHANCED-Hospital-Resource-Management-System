// File: utils/helpers.js
  /**
   * Collection of helper functions
   */
  exports.generateRandomId = (prefix = '') => {
    // Generate a random alphanumeric ID with a prefix
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomString}`;
  };
  
  exports.calculateDateDifference = (startDate, endDate) => {
    // Calculate the difference between two dates in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  exports.formatDate = (date) => {
    // Format a date to YYYY-MM-DD
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  exports.calculateAge = (birthDate) => {
    // Calculate age based on birth date
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  };
  
  exports.paginate = (query, pageSize = 10, pageNumber = 1) => {
    // Helper to paginate MongoDB queries
    const skip = (pageNumber - 1) * pageSize;
    return query.limit(pageSize).skip(skip);
  };
  
  // Random data generation for development
  exports.generateRandomTime = () => {
    // Generate a random time in the format HH:MM AM/PM
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  exports.generateRandomDate = (start, end) => {
    // Generate a random date between start and end
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  /**
 * Safely process and modify query parameters
 * @param {Object} originalQuery - The original req.query object
 * @param {Array} removeFields - Fields to exclude from query
 * @param {Object} additionalFilters - Additional filters to add
 * @returns {Object} - Processed query object
 */
exports.processQueryParams = (originalQuery, removeFields = [], additionalFilters = {}) => {
    // Create a copy of the query
    const reqQuery = { ...originalQuery };
    
    // Fields to exclude
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Add additional filters
    Object.keys(additionalFilters).forEach(key => {
      reqQuery[key] = additionalFilters[key];
    });
    
    return reqQuery;
  };
  /**
 * Safely process and modify query parameters
 * @param {Object} originalQuery - The original req.query object
 * @param {Array} removeFields - Fields to exclude from query
 * @param {Object} additionalFilters - Additional filters to add
 * @returns {Object} - Processed query object
 */
exports.processQueryParams = (originalQuery, removeFields = [], additionalFilters = {}) => {
    // Create a copy of the query
    const reqQuery = { ...originalQuery };
    
    // Fields to exclude
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Add additional filters
    Object.keys(additionalFilters).forEach(key => {
      reqQuery[key] = additionalFilters[key];
    });
    
    return reqQuery;
  };