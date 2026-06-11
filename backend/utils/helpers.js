const fs = require('fs');
const path = require('path');

// Generate unique employee ID
const generateEmployeeId = (department) => {
  const prefix = {
    'HR': 'HR',
    'IT': 'IT',
    'Finance': 'FIN',
    'Marketing': 'MKT',
    'Sales': 'SAL',
    'Operations': 'OPS'
  };
  
  const deptPrefix = prefix[department] || 'EMP';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${deptPrefix}${timestamp}${random}`;
};

// Format date for display
const formatDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  switch(format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY HH:MM':
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

// Calculate working hours
const calculateWorkingHours = (checkInTime, checkOutTime) => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const diffMs = checkOut - checkIn;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  const hours = Math.floor(diffHours);
  const minutes = Math.floor((diffHours % 1) * 60);
  
  return {
    hours,
    minutes,
    total: diffHours.toFixed(2)
  };
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Delete file from disk
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    } else {
      resolve(false);
    }
  });
};

// Create directory if not exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Generate random password
const generateRandomPassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Calculate attendance percentage
const calculateAttendancePercentage = (presentDays, totalDays) => {
  if (totalDays === 0) return 0;
  return ((presentDays / totalDays) * 100).toFixed(2);
};

// Group attendance by month
const groupAttendanceByMonth = (attendanceRecords) => {
  const grouped = {};
  
  attendanceRecords.forEach(record => {
    const month = new Date(record.date).getMonth();
    const year = new Date(record.date).getFullYear();
    const key = `${year}-${month + 1}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        year,
        month: month + 1,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        total: 0
      };
    }
    
    grouped[key][record.status.toLowerCase()]++;
    grouped[key].total++;
  });
  
  return grouped;
};

module.exports = {
  generateEmployeeId,
  formatDate,
  calculateWorkingHours,
  isValidEmail,
  isValidPhone,
  deleteFile,
  ensureDirectoryExists,
  getFileExtension,
  generateRandomPassword,
  calculateAttendancePercentage,
  groupAttendanceByMonth
};