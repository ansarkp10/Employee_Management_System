import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, departmentFilter, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data.data);
      setFilteredEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    
    setFilteredEmployees(filtered);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`/api/employees/${id}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employee-list">
      <div className="list-header">
        <h1>Employee Management</h1>
        <Link to="/add-employee" className="btn-primary">Add New Employee</Link>
      </div>
      
      <div className="filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>
                  <img 
                    src={`http://localhost:5000/${employee.profileImage}`}
                    alt={employee.name}
                    className="employee-thumb"
                  />
                </td>
                <td>{employee.name}</td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td>{employee.email}</td>
                <td>{employee.phone}</td>
                <td>
                  <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <Link to={`/edit-employee/${employee._id}`} className="action-btn edit">
                    <FaEdit />
                  </Link>
                  <button onClick={() => handleDelete(employee._id, employee.name)} className="action-btn delete">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="no-results">
          <p>No employees found</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;