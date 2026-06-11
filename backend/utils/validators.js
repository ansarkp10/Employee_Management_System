// Employee data validator
const validateEmployeeData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) {
    errors.push('Valid 10-digit phone number is required');
  }
  
  const validDepartments = ['HR', 'IT', 'Finance', 'Marketing', 'Sales', 'Operations'];
  if (!data.department || !validDepartments.includes(data.department)) {
    errors.push(`Department must be one of: ${validDepartments.join(', ')}`);
  }
  
  if (!data.position || data.position.trim().length < 2) {
    errors.push('Position must be at least 2 characters long');
  }
  
  if (data.salary && (isNaN(data.salary) || data.salary < 0)) {
    errors.push('Salary must be a positive number');
  }
  
  if (data.joinDate && isNaN(new Date(data.joinDate))) {
    errors.push('Valid join date is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Attendance validator
const validateAttendance = (data) => {
  const errors = [];
  
  if (!data.employeeId) {
    errors.push('Employee ID is required');
  }
  
  if (data.recognitionConfidence !== undefined) {
    if (isNaN(data.recognitionConfidence) || 
        data.recognitionConfidence < 0 || 
        data.recognitionConfidence > 100) {
      errors.push('Recognition confidence must be between 0 and 100');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Face recognition validator
const validateFaceData = (data) => {
  const errors = [];
  
  if (!data.faceDescriptor || !Array.isArray(data.faceDescriptor)) {
    errors.push('Face descriptor must be an array');
  }
  
  if (data.faceDescriptor.length !== 128) {
    errors.push('Face descriptor must have 128 dimensions');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Pagination validator
const validatePagination = (page, limit) => {
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    skip: (validatedPage - 1) * validatedLimit
  };
};

// Date range validator
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid start date' };
  }
  
  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid end date' };
  }
  
  if (start > end) {
    return { isValid: false, error: 'Start date must be before end date' };
  }
  
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return { isValid: false, error: 'Date range cannot exceed 365 days' };
  }
  
  return { isValid: true };
};

module.exports = {
  validateEmployeeData,
  validateAttendance,
  validateFaceData,
  validatePagination,
  validateDateRange
};