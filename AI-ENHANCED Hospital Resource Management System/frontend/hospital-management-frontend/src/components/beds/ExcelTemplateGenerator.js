// You can add this as a utility function in your project
// Add it to the utils folder or create a new file in components/beds

import * as XLSX from 'xlsx';

/**
 * Generate and download a template Excel file for bed updates
 */
export const generateBedExcelTemplate = () => {
  // Define the template data with one example row
  const templateData = [
    {
      'bedId': 'BED001',
      'status': 'Available',
      'ward': 'General',
      'type': 'Standard',
      'location.building': 'Main',
      'location.floor': '1',
      'location.roomNumber': '101',
      'currentPatient.patientId': '',
      'lastSanitized': new Date().toISOString().split('T')[0],
      'notes': 'Example notes',
      'maintenanceReason': '',
      'maintenanceEndTime': '',
      'reservedFor': '',
      'reservationTime': ''
    }
  ];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // bedId
    { wch: 12 }, // status
    { wch: 10 }, // ward
    { wch: 12 }, // type
    { wch: 15 }, // location.building
    { wch: 10 }, // location.floor
    { wch: 15 }, // location.roomNumber
    { wch: 25 }, // currentPatient.patientId
    { wch: 15 }, // lastSanitized
    { wch: 25 }, // notes
    { wch: 25 }, // maintenanceReason
    { wch: 20 }, // maintenanceEndTime
    { wch: 15 }, // reservedFor
    { wch: 20 }  // reservationTime
  ];

  worksheet['!cols'] = columnWidths;

  // Create comments/notes for each column to help users
  const comments = {
    A1: { t: 's', v: 'Required. The unique bed identifier' },
    B1: { t: 's', v: 'Available, Occupied, Reserved, or Maintenance' },
    C1: { t: 's', v: 'ICU, ER, General, Pediatric, Maternity, or Surgical' },
    D1: { t: 's', v: 'Standard, Electric, Bariatric, Low, Pediatric, or Delivery' },
    E1: { t: 's', v: 'Building name' },
    F1: { t: 's', v: 'Floor number' },
    G1: { t: 's', v: 'Room number' },
    H1: { t: 's', v: 'Required only if status is Occupied. Must be a valid patient ID' },
    I1: { t: 's', v: 'Date in YYYY-MM-DD format' },
    J1: { t: 's', v: 'Any additional notes' },
    K1: { t: 's', v: 'Reason for maintenance if status is Maintenance' },
    L1: { t: 's', v: 'Expected maintenance end date (YYYY-MM-DD)' },
    M1: { t: 's', v: 'Name of person for reservation if status is Reserved' },
    N1: { t: 's', v: 'Reservation time (YYYY-MM-DD)' }
  };

  // Add a notes sheet with instructions
  const notesData = [
    ['Bed Data Upload Instructions'],
    [''],
    ['1. Required Fields:'],
    ['   - bedId: This is the unique identifier for the bed and must be provided for each row'],
    [''],
    ['2. Status Values:'],
    ['   - Available: Bed is ready for use'],
    ['   - Occupied: Bed is currently assigned to a patient (requires a valid patient ID)'],
    ['   - Reserved: Bed is reserved for upcoming admission'],
    ['   - Maintenance: Bed is unavailable due to maintenance'],
    [''],
    ['3. Patient Assignment:'],
    ['   - When setting a bed to "Occupied", you must provide a valid patient ID in the currentPatient.patientId column'],
    ['   - When changing from "Occupied" to another status, the patient will be automatically unassigned'],
    [''],
    ['4. Data Format:'],
    ['   - Dates should be in YYYY-MM-DD format'],
    ['   - Patient IDs must match existing patients in the system'],
    [''],
    ['5. Validation:'],
    ['   - All beds must already exist in the system (this template cannot create new beds)'],
    ['   - Patients can only be assigned to one bed at a time'],
    ['   - Invalid data will be reported in the upload results']
  ];

  const notesSheet = XLSX.utils.aoa_to_sheet(notesData);
  notesSheet['!cols'] = [{ wch: 60 }];

  // Create a workbook with both sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bed Data Template');
  XLSX.utils.book_append_sheet(workbook, notesSheet, 'Instructions');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'bed_data_template.xlsx');
};

export default generateBedExcelTemplate;