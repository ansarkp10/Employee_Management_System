import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaUserCheck, FaClock, FaDollarSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    averageAttendance: 0
  });
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [departmentDistribution, setDepartmentDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeesRes = await axios.get('/api/employees');
      const employees = employeesRes.data.data;
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await axios.get(`/api/attendance/date/${today}`);
      const attendance = attendanceRes.data.data;
      
      // Calculate stats
      const presentToday = attendance.filter(a => a.status === 'Present').length;
      const lateToday = attendance.filter(a => a.status === 'Late').length;
      
      // Calculate department distribution
      const deptMap = {};
      employees.forEach(emp => {
        deptMap[emp.department] = (deptMap[emp.department] || 0) + 1;
      });
      
      const distribution = Object.entries(deptMap).map(([name, value]) => ({
        name,
        value
      }));
      
      // Generate attendance trend (last 7 days)
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayAttendance = await axios.get(`/api/attendance/date/${dateStr}`);
        trend.push({
          date: dateStr.split('-').slice(1).join('/'),
          present: dayAttendance.data.data.filter(a => a.status === 'Present').length,
          total: employees.length
        });
      }
      
      setStats({
        totalEmployees: employees.length,
        presentToday,
        lateToday,
        averageAttendance: calculateAverageAttendance(attendanceTrend)
      });
      
      setDepartmentDistribution(distribution);
      setAttendanceTrend(trend);
      setRecentActivity(generateRecentActivity(attendance));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageAttendance = (trend) => {
    if (trend.length === 0) return 0;
    const total = trend.reduce((sum, day) => sum + (day.present / day.total), 0);
    return ((total / trend.length) * 100).toFixed(1);
  };

  const generateRecentActivity = (attendance) => {
    return attendance.slice(0, 5).map(record => ({
      id: record._id,
      employee: record.employeeId?.name || 'Unknown',
      time: new Date(record.checkInTime).toLocaleTimeString(),
      status: record.status
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <FaUsers size={40} color="#667eea" />
          <h3>Total Employees</h3>
          <div className="stat-number">{stats.totalEmployees}</div>
        </div>
        
        <div className="stat-card">
          <FaUserCheck size={40} color="#4caf50" />
          <h3>Present Today</h3>
          <div className="stat-number">{stats.presentToday}</div>
        </div>
        
        <div className="stat-card">
          <FaClock size={40} color="#ff9800" />
          <h3>Late Today</h3>
          <div className="stat-number">{stats.lateToday}</div>
        </div>
        
        <div className="stat-card">
          <FaDollarSign size={40} color="#f44336" />
          <h3>Avg Attendance</h3>
          <div className="stat-number">{stats.averageAttendance}%</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Attendance Trend (Last 7 Days)</h3>
          <LineChart width={600} height={300} data={attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#8884d8" />
          </LineChart>
        </div>
        
        <div className="chart-card">
          <h3>Department Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={departmentDistribution}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {departmentDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Check-ins</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.employee}</td>
                  <td>{activity.time}</td>
                  <td>
                    <span className={`status-badge ${activity.status.toLowerCase()}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;