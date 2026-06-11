const Employee = require('../models/Employee');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-faceDescriptor');
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-faceDescriptor');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  console.log('📥 Received POST request to /api/employees');
  console.log('📦 Request body:', req.body);
  
  try {
    // Generate employee ID if not provided
    const employeeData = {
      ...req.body,
      employeeId: req.body.employeeId || `EMP${Date.now()}`
    };
    
    console.log('📝 Attempting to create employee with data:', employeeData);
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'department', 'position', 'joinDate', 'salary'];
    const missingFields = requiredFields.filter(field => !employeeData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const employee = await Employee.create(employeeData);
    
    console.log('✅ Employee created successfully:', employee._id);
    
    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or ID already exists'
      });
    }
    
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to create employee',
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : null
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-faceDescriptor');
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};