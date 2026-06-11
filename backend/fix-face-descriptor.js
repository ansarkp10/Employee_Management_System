const mongoose = require('mongoose');
const Employee = require('./models/Employee');

async function fixFaceDescriptors() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('Connected to MongoDB');
    
    // Find all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);
    
    for (const employee of employees) {
      let needsUpdate = false;
      let updatedDescriptor = employee.faceDescriptor;
      
      // Check if faceDescriptor is a string
      if (typeof employee.faceDescriptor === 'string') {
        try {
          updatedDescriptor = JSON.parse(employee.faceDescriptor);
          needsUpdate = true;
          console.log(`Fixing face descriptor for ${employee.name}`);
        } catch (e) {
          console.error(`Error parsing for ${employee.name}:`, e);
          updatedDescriptor = [];
          needsUpdate = true;
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await Employee.updateOne(
          { _id: employee._id },
          { $set: { faceDescriptor: updatedDescriptor } }
        );
        console.log(`✓ Updated ${employee.name}`);
      }
    }
    
    console.log('All face descriptors fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixFaceDescriptors();