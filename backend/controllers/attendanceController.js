const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, faceRecognized, recognitionConfidence } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (!attendance) {
      // Check-in
      attendance = await Attendance.create({
        employeeId,
        checkInTime: new Date(),
        faceRecognized,
        recognitionConfidence,
        status: recognitionConfidence > 80 ? 'Present' : 'Late'
      });
    } else if (!attendance.checkOutTime) {
      // Check-out
      attendance.checkOutTime = new Date();
      await attendance.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attendance,
      message: attendance.checkOutTime ? 'Checked out successfully' : 'Checked in successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.find({
      date: { $gte: queryDate, $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) }
    }).populate('employeeId', 'name employeeId profileImage department');
    
    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee attendance report
exports.getEmployeeAttendanceReport = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    const query = { employeeId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      late: attendance.filter(a => a.status === 'Late').length,
      halfDay: attendance.filter(a => a.status === 'Half Day').length
    };
    
    res.status(200).json({
      success: true,
      summary,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};