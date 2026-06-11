const Employee = require('../models/Employee');

// Recognize face
exports.recognizeFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    console.log('Received face descriptor for recognition');
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: 'Valid face descriptor array is required'
      });
    }
    
    // Get all employees with face descriptors
    const employees = await Employee.find({ 
      isActive: true,
      faceDescriptor: { $ne: [] } // Only get employees with face data
    });
    
    console.log(`Comparing with ${employees.length} employees`);
    
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered faces found in database'
      });
    }
    
    let bestMatch = null;
    let bestDistance = Infinity;
    
    for (const employee of employees) {
      // Ensure faceDescriptor is an array
      let employeeDescriptor = employee.faceDescriptor;
      
      // If it's a string, parse it
      if (typeof employeeDescriptor === 'string') {
        try {
          employeeDescriptor = JSON.parse(employeeDescriptor);
        } catch (e) {
          console.error(`Error parsing face descriptor for ${employee.name}:`, e);
          continue;
        }
      }
      
      // Calculate Euclidean distance
      if (Array.isArray(employeeDescriptor) && employeeDescriptor.length === faceDescriptor.length) {
        const distance = calculateDistance(faceDescriptor, employeeDescriptor);
        
        if (distance < bestDistance && distance < 0.6) {
          bestDistance = distance;
          bestMatch = employee;
        }
      }
    }
    
    if (bestMatch) {
      const confidence = Math.max(0, Math.min(100, (1 - bestDistance) * 100));
      
      res.status(200).json({
        success: true,
        employee: {
          id: bestMatch._id,
          employeeId: bestMatch.employeeId,
          name: bestMatch.name,
          department: bestMatch.department,
          profileImage: bestMatch.profileImage
        },
        confidence: Math.round(confidence),
        distance: bestDistance
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No matching face found. Please register your face first.'
      });
    }
  } catch (error) {
    console.error('Face recognition error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Face recognition failed: ' + error.message 
    });
  }
};

// Calculate Euclidean distance between two vectors
function calculateDistance(descriptor1, descriptor2) {
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Get all face descriptors for training
exports.getAllFaceDescriptors = async (req, res) => {
  try {
    const employees = await Employee.find({ 
      isActive: true,
      faceDescriptor: { $ne: [] }
    }).select('employeeId name faceDescriptor profileImage');
    
    // Ensure all descriptors are parsed
    const processedEmployees = employees.map(emp => {
      let descriptor = emp.faceDescriptor;
      if (typeof descriptor === 'string') {
        try {
          descriptor = JSON.parse(descriptor);
        } catch (e) {
          descriptor = [];
        }
      }
      return {
        ...emp.toObject(),
        faceDescriptor: descriptor
      };
    });
    
    res.status(200).json({
      success: true,
      count: processedEmployees.length,
      data: processedEmployees
    });
  } catch (error) {
    console.error('Error fetching face descriptors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};