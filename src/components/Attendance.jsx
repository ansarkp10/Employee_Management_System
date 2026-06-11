import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendar, FaDownload, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    total: 0
  });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/attendance/date/${selectedDate}`);
      const data = response.data.data;
      setAttendance(data);
      setFilteredAttendance(data);
      calculateSummary(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const present = data.filter(a => a.status === 'Present').length;
    const absent = data.filter(a => a.status === 'Absent').length;
    const late = data.filter(a => a.status === 'Late').length;
    const halfDay = data.filter(a => a.status === 'Half Day').length;
    
    setSummary({
      present,
      absent,
      late,
      halfDay,
      total: data.length
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const exportToCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Status', 'Confidence'];
    const csvData = filteredAttendance.map(record => [
      record.employeeId?.employeeId || 'N/A',
      record.employeeId?.name || 'N/A',
      record.employeeId?.department || 'N/A',
      new Date(record.checkInTime).toLocaleTimeString(),
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'Not checked out',
      record.status,
      `${record.recognitionConfidence || 0}%`
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return <div className="loading">Loading attendance...</div>;
  }

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <div className="header-controls">
          <div className="date-picker">
            <FaCalendar />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <button onClick={exportToCSV} className="btn-secondary">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card present">
          <h3>Present</h3>
          <div className="count">{summary.present}</div>
          <div className="percentage">{((summary.present / summary.total) * 100 || 0).toFixed(1)}%</div>
        </div>
        
        <div className="summary-card absent">
          <h3>Absent</h3>
          <div className="count">{summary.absent}</div>
          <div className="percentage">{((summary.absent / summary.total) * 100 || 0).toFixed(1)}%</div>
        </div>
        
        <div className="summary-card late">
          <h3>Late</h3>
          <div className="count">{summary.late}</div>
          <div className="percentage">{((summary.late / summary.total) * 100 || 0).toFixed(1)}%</div>
        </div>
        
        <div className="summary-card half-day">
          <h3>Half Day</h3>
          <div className="count">{summary.halfDay}</div>
          <div className="percentage">{((summary.halfDay / summary.total) * 100 || 0).toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Check In Time</th>
              <th>Check Out Time</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map(record => (
              <tr key={record._id}>
                <td>{record.employeeId?.employeeId || 'N/A'}</td>
                <td>{record.employeeId?.name || 'N/A'}</td>
                <td>{record.employeeId?.department || 'N/A'}</td>
                <td>{new Date(record.checkInTime).toLocaleTimeString()}</td>
                <td>
                  {record.checkOutTime 
                    ? new Date(record.checkOutTime).toLocaleTimeString()
                    : '—'
                  }
                </td>
                <td>
                  <span className={`status-badge ${record.status.toLowerCase()}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.recognitionConfidence || 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredAttendance.length === 0 && (
        <div className="no-data">
          <p>No attendance records found for this date</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;