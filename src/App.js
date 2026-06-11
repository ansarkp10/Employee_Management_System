import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import Attendance from './components/Attendance';
import FaceRecognition from './components/FaceRecognition';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">EMS - Face Recognition</h1>
            <ul className="nav-menu">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/employees">Employees</Link></li>
              <li><Link to="/attendance">Attendance</Link></li>
              <li><Link to="/face-recognition">Face Recognition</Link></li>
              <li><Link to="/add-employee">Add Employee</Link></li>
            </ul>
          </div>
        </nav>
        
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/add-employee" element={<EmployeeForm />} />
            <Route path="/edit-employee/:id" element={<EmployeeForm />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/face-recognition" element={<FaceRecognition />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;