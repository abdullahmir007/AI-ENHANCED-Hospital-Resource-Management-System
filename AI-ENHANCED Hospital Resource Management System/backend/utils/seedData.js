// File: utils/seedData.js
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Bed = require('../models/Bed');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const Equipment = require('../models/Equipment');
const Alert = require('../models/Alert');
const logger = require('./logger');
const { generateRandomId } = require('./helpers');
const config = require('../config/config');

// Add explicit DB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    });
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Seed users
 * @returns {Promise<Array>} - Array of created users
 */
const seedUsers = async () => {
  logger.info('Seeding users...');
  
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: adminPassword,
      role: 'admin'
    });
    
    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@hospital.com',
      password: managerPassword,
      role: 'manager'
    });
    
    // Create doctor user
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = await User.create({
      name: 'Doctor User',
      email: 'doctor@hospital.com',
      password: doctorPassword,
      role: 'doctor',
      department: 'Surgery'
    });
    
    // Create nurse user
    const nursePassword = await bcrypt.hash('nurse123', 10);
    const nurse = await User.create({
      name: 'Nurse User',
      email: 'nurse@hospital.com',
      password: nursePassword,
      role: 'nurse',
      department: 'ICU'
    });
    
    logger.info('Users seeded successfully');
    return [admin, manager, doctor, nurse];
  } catch (error) {
    logger.error(`Error seeding users: ${error.message}`);
    throw error;
  }
};

/**
 * Seed beds
 * @param {string} userId - ID of user creating the beds
 * @returns {Promise<Array>} - Array of created beds
 */
const seedBeds = async (userId) => {
  logger.info('Seeding beds...');
  
  try {
    // Clear existing beds
    await Bed.deleteMany({});
    
    const beds = [];
    const wards = ['ICU', 'ER', 'General', 'Pediatric', 'Maternity', 'Surgical'];
    const statuses = ['Available', 'Occupied', 'Reserved', 'Maintenance'];
    const bedTypes = ['Standard', 'Electric', 'Bariatric', 'Low', 'Pediatric', 'Delivery'];
    
    // Generate 50 beds
    for (let i = 1; i <= 50; i++) {
      const ward = wards[Math.floor(Math.random() * wards.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const bedType = ward === 'Pediatric' ? 'Pediatric' : bedTypes[Math.floor(Math.random() * bedTypes.length)];
      
      const bed = {
        bedId: `BED${i.toString().padStart(3, '0')}`,
        ward,
        status,
        type: bedType,
        location: {
          building: 'Main',
          floor: Math.floor(Math.random() * 4) + 1,
          roomNumber: `${Math.floor(Math.random() * 40) + 100}`
        },
        lastSanitized: new Date(),
        createdBy: userId,
        createdAt: new Date()
      };
      
      // Add patient info for occupied beds
      if (status === 'Occupied') {
        bed.currentPatient = {
            patientId: new mongoose.Types.ObjectId(), // Add 'new' keyword
            name: `Patient ${Math.floor(Math.random() * 100) + 1}`,
          age: Math.floor(Math.random() * 70) + 18,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          diagnosis: 'General observation',
          admissionDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
        };
      }
      
      const createdBed = await Bed.create(bed);
      beds.push(createdBed);
    }
    
    logger.info('Beds seeded successfully');
    return beds;
  } catch (error) {
    logger.error(`Error seeding beds: ${error.message}`);
    throw error;
  }
};

/**
 * Seed staff
 * @param {string} userId - ID of user creating the staff
 * @returns {Promise<Array>} - Array of created staff
 */
const seedStaff = async (userId) => {
  logger.info('Seeding staff...');
  
  try {
    // Clear existing staff
    await Staff.deleteMany({});
    
    const staff = [];
    const staffTypes = ['Surgeon', 'Nurse', 'Physician', 'Technician', 'Administrator'];
    const departments = ['Surgery', 'ICU', 'ER', 'General Ward', 'Pediatrics', 'Radiology'];
    
    // Generate 30 staff members
    for (let i = 1; i <= 30; i++) {
      const staffType = staffTypes[Math.floor(Math.random() * staffTypes.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      
      const specialty = staffType === 'Surgeon' ? 
        ['Cardiac', 'Neuro', 'Ortho', 'General', 'Plastic'][Math.floor(Math.random() * 5)] : '';
      
      const onDuty = Math.random() > 0.3;
      
      const staffMember = {
        staffId: `S${i.toString().padStart(3, '0')}`,
        name: `Staff Member ${i}`,
        staffType,
        specialty,
        licensedSince: new Date(Date.now() - Math.floor(Math.random() * 10 * 365) * 24 * 60 * 60 * 1000),
        onDuty,
        currentAssignment: onDuty ? department : '',
        department,
        supervisor: 'Dr. Supervisor',
        patientsAssigned: onDuty ? Math.floor(Math.random() * 8) + 1 : 0,
        contactInfo: {
          email: `staff${i}@hospital.com`,
          phone: `555-${Math.floor(1000 + Math.random() * 9000)}`
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Relative',
          phone: `555-${Math.floor(1000 + Math.random() * 9000)}`
        },
        certifications: [
          {
            name: 'Basic Life Support',
            issuedDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
            expirationDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date()
      };
      
      const createdStaff = await Staff.create(staffMember);
      staff.push(createdStaff);
    }
    
    logger.info('Staff seeded successfully');
    return staff;
  } catch (error) {
    logger.error(`Error seeding staff: ${error.message}`);
    throw error;
  }
};

/**
 * Seed patients
 * @param {string} userId - ID of user creating the patients
 * @returns {Promise<Array>} - Array of created patients
 */
const seedPatients = async (userId) => {
  logger.info('Seeding patients...');
  
  try {
    // Clear existing patients
    await Patient.deleteMany({});
    
    const patients = [];
    const diagnoses = [
      'Pneumonia', 'Hypertension', 'Diabetes', 'Fracture', 'Appendicitis',
      'Influenza', 'Asthma', 'COPD', 'Heart Disease', 'Stroke'
    ];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const statuses = ['Admitted', 'Discharged'];
    
    // Generate 40 patients
    for (let i = 1; i <= 40; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const admissionDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      
      let dischargeDate = null;
      if (status === 'Discharged') {
        dischargeDate = new Date(admissionDate);
        dischargeDate.setDate(admissionDate.getDate() + Math.floor(Math.random() * 10) + 1);
      }
      
      const patient = {
        patientId: `P${i.toString().padStart(3, '0')}`,
        name: `Patient ${i}`,
        age: Math.floor(Math.random() * 80) + 10,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        contactInfo: {
          phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
          address: `${Math.floor(Math.random() * 1000) + 100} Main St`
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Relative',
          phone: `555-${Math.floor(1000 + Math.random() * 9000)}`
        },
        admissionDate,
        dischargeDate,
        diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
        treatmentPlan: 'Standard care protocol',
        allergies: Math.random() > 0.7 ? ['Penicillin'] : [],
        status,
        createdBy: userId,
        createdAt: new Date()
      };
      
      const createdPatient = await Patient.create(patient);
      patients.push(createdPatient);
    }
    
    logger.info('Patients seeded successfully');
    return patients;
  } catch (error) {
    logger.error(`Error seeding patients: ${error.message}`);
    throw error;
  }
};

/**
 * Seed equipment
 * @param {string} userId - ID of user creating the equipment
 * @returns {Promise<Array>} - Array of created equipment
 */
const seedEquipment = async (userId) => {
  logger.info('Seeding equipment...');
  
  try {
    // Clear existing equipment
    await Equipment.deleteMany({});
    
    const equipment = [];
    const categories = ['Critical', 'Imaging', 'Monitoring', 'Surgical', 'Laboratory'];
    const statuses = ['Available', 'In Use', 'Maintenance', 'Out of Order'];
    const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
    const wards = ['ICU', 'ER', 'Radiology', 'Surgery', 'Laboratory'];
    
    // Generate 25 equipment items
    for (let i = 1; i <= 25; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const ward = wards[Math.floor(Math.random() * wards.length)];
      
      const purchaseDate = new Date(Date.now() - Math.floor(Math.random() * 1000) * 24 * 60 * 60 * 1000);
      const warrantyExpiration = new Date(purchaseDate);
      warrantyExpiration.setFullYear(purchaseDate.getFullYear() + 3);
      
      const lastMaintenance = new Date(Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000);
      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setMonth(lastMaintenance.getMonth() + 3);
      
      const equipmentItem = {
        equipmentId: `EQ${i.toString().padStart(3, '0')}`,
        name: `Equipment ${i}`,
        category,
        manufacturer: 'Medical Systems Inc.',
        model: `Model ${Math.floor(Math.random() * 1000)}`,
        serialNumber: `SN${generateRandomId()}`,
        purchaseDate,
        warrantyExpiration,
        status,
        location: {
          building: 'Main',
          floor: Math.floor(Math.random() * 4) + 1,
          ward,
          room: `${Math.floor(Math.random() * 40) + 100}`
        },
        condition,
        lastMaintenance,
        nextMaintenance,
        maintenanceHistory: [
          {
            date: lastMaintenance,
            type: 'Preventive',
            technician: 'Maintenance Tech',
            notes: 'Regular maintenance',
            cost: Math.floor(Math.random() * 500) + 100
          }
        ],
        description: `Standard ${category} equipment`,
        specifications: {
          powerRequirements: '110V AC',
          dimensions: '80cm x 60cm x 150cm',
          weight: '45kg'
        },
        createdBy: userId,
        createdAt: new Date()
      };
      
      // Add usage log for equipment in use
      if (status === 'In Use') {
        equipmentItem.usageLog = [
          {
            startDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
            patient: `Patient ${Math.floor(Math.random() * 40) + 1}`,
            department: ward,
            assignedBy: 'Staff Member'
          }
        ];
      }
      
      const createdEquipment = await Equipment.create(equipmentItem);
      equipment.push(createdEquipment);
    }
    
    logger.info('Equipment seeded successfully');
    return equipment;
  } catch (error) {
    logger.error(`Error seeding equipment: ${error.message}`);
    throw error;
  }
};

/**
 * Seed alerts
 * @param {string} userId - ID of user creating the alerts
 * @returns {Promise<Array>} - Array of created alerts
 */
const seedAlerts = async (userId) => {
  logger.info('Seeding alerts...');
  
  try {
    // Clear existing alerts
    await Alert.deleteMany({});
    
    const alerts = [];
    const types = ['critical', 'warning', 'info'];
    const categories = ['bed', 'staff', 'equipment', 'patient', 'system'];
    const statuses = ['Active', 'Acknowledged', 'Resolved', 'Closed'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    
    // Generate 15 alerts
    for (let i = 1; i <= 15; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const alert = {
        title: `Alert ${i}`,
        description: `This is a ${type} alert for ${category}`,
        type,
        category,
        status,
        priority,
        source: 'System',
        read: Math.random() > 0.5,
        createdBy: userId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
      };
      
      const createdAlert = await Alert.create(alert);
      alerts.push(createdAlert);
    }
    
    logger.info('Alerts seeded successfully');
    return alerts;
  } catch (error) {
    logger.error(`Error seeding alerts: ${error.message}`);
    throw error;
  }
};

/**
 * Seed all data
 * @returns {Promise<void>}
 */
const seedAll = async () => {
  try {
    // First establish connection to MongoDB
    await connectDB();
    
    logger.info('Starting data seeding...');
    
    // Seed users first
    const users = await seedUsers();
    const adminId = users[0]._id;
    
    // Seed other entities with admin user ID - do these sequentially to avoid overwhelming the connection
    await seedBeds(adminId);
    await seedStaff(adminId);
    await seedPatients(adminId);
    await seedEquipment(adminId);
    await seedAlerts(adminId);
    
    logger.info('All data seeded successfully');
    
    // Close the connection when done
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error seeding data: ${error.message}`);
    // Make sure to close the connection on error too
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed after error');
    }
    process.exit(1);
  }
};

module.exports = {
  seedUsers,
  seedBeds,
  seedStaff,
  seedPatients,
  seedEquipment,
  seedAlerts,
  seedAll
};