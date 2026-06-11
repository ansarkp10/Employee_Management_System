const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['HR', 'IT', 'Finance', 'Marketing', 'Sales', 'Operations']
  },
  position: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  faceDescriptor: {
    type: [Number],  // Array of numbers, not string
    default: []
  },
  profileImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);