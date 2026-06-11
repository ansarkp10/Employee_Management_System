import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: 'IT',
    position: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    isActive: true
  });

  useEffect(() => {
  loadModels();

  if (id) {
    fetchEmployee();
  }
}, [id]);

  const loadModels = async () => {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
      setModelsLoaded(true);
      toast.success('Face recognition ready');
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load face recognition');
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`/api/employees/${id}`);
      const employee = response.data.data;
      setFormData({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        joinDate: employee.joinDate.split('T')[0],
        salary: employee.salary,
        address: employee.address,
        isActive: employee.isActive
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const captureFace = async () => {
    if (!modelsLoaded) {
      toast.error('Face recognition models not loaded yet');
      return;
    }
    
    setCapturing(true);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const image = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi.detectSingleFace(image)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        toast.error('No face detected. Please try again.');
        setCapturing(false);
        return;
      }
      
      setFaceDescriptor(Array.from(detection.descriptor));
      toast.success('Face captured successfully!');
    } catch (error) {
      console.error('Error capturing face:', error);
      toast.error('Failed to capture face');
    } finally {
      setCapturing(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Validate required fields on frontend
    const required = ['name', 'email', 'phone', 'position', 'salary'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.join(', ')}`);
      setLoading(false);
      return;
    }
    
    // Prepare data
    const employeeData = {
      employeeId: `EMP${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      position: formData.position.trim(),
      joinDate: formData.joinDate,
      salary: Number(formData.salary),
      address: {
        street: formData.address.street || '',
        city: formData.address.city || '',
        state: formData.address.state || '',
        zipCode: formData.address.zipCode || ''
      },
      isActive: formData.isActive
    };
    
    console.log('Sending data:', employeeData);
    
    const response = await axios.post('http://localhost:5000/api/employees', employeeData);
    
    if (response.data.success) {
      toast.success('Employee created successfully!');
      navigate('/employees');
    }
  } catch (error) {
    console.error('Full error:', error);
    
    if (error.response) {
      // Server responded with error
      console.error('Server error data:', error.response.data);
      toast.error(error.response.data.message || 'Failed to save employee');
    } else if (error.request) {
      // Request was made but no response
      toast.error('Cannot connect to server. Is backend running?');
    } else {
      // Other error
      toast.error('Error: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="form-container">
      <h1>{id ? 'Edit Employee' : 'Add New Employee'}</h1>
      
      {!id && (
        <div className="face-capture-section">
          <h3>Face Registration</h3>
          <div className="webcam-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={400}
              height={300}
              videoConstraints={{
                width: 400,
                height: 300,
                facingMode: "user"
              }}
            />
            <button 
              type="button" 
              onClick={captureFace}
              disabled={capturing || !modelsLoaded}
            >
              {capturing ? 'Capturing...' : 'Capture Face'}
            </button>
            {faceDescriptor && (
              <div className="success-message">
                ✓ Face captured successfully
              </div>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Department *</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Position *</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Join Date *</label>
          <input
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Salary *</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            required
          />
        </div>
        
        <h3>Address</h3>
        <div className="form-group">
          <label>Street</label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Zip Code</label>
          <input
            type="text"
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            />
            Active Employee
          </label>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/employees')}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (id ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;