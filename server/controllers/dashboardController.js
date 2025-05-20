const {
    getAllUsers,
    getUserById
  } = require('../models/userModel');
  
  const {
    getAllClassesFromDB,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassSessions,
    getClassWaitlist,
    updateClassStatus,
    updateWaitlistStatus,
    getClassWithDetails
  } = require('../models/classModel');
  
  const {
    getAllEnrollments,
    getPendingEnrollments,
    getEnrollmentById,
    approveEnrollment,
    rejectEnrollment,
    cancelEnrollment
  } = require('../models/enrollmentModel');
  
  const {
    getAllPayments,
    getPaymentById,
    getFinancialSummary,
    getRevenueByClass,
    processRefund
  } = require('../models/paymentModel');
  
  const pool = require('../config/db'); // for direct deletes
  
  // @desc    Get all users
  const adminGetUsers = async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  
  // @desc    Delete user by ID
  const adminDeleteUser = async (req, res) => {
    const userId = req.params.userId;
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
  
  // @desc    Get all classes
  const adminGetClasses = async (req, res) => {
    try {
      const classes = await getAllClassesFromDB();
      res.json(classes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch classes' });
    }
  };
  
  // @desc    Edit class
  const adminEditClass = async (req, res) => {
    const classId = req.params.classId;
    const updates = req.body;
  
    try {
      const classItem = await getClassById(classId);
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
  
      const updatedClass = await updateClass(classId, updates);
      res.json(updatedClass);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update class' });
    }
  };
  
  // @desc    Delete class
  const adminDeleteClass = async (req, res) => {
    const classId = req.params.classId;
    try {
      await deleteClass(classId);
      res.json({ message: 'Class deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete class' });
    }
  };
  
  // @desc    Get total enrollment count
  const adminEnrollmentStats = async (req, res) => {
    try {
      const enrollments = await getAllEnrollments();
      res.json({ totalEnrollments: enrollments.length });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch enrollment stats' });
    }
  };
  
  // @desc    Remove a user from a class
  const adminRemoveUserFromClass = async (req, res) => {
    const { userId, classId } = req.params;
  
    try {
      const removed = await cancelEnrollment(userId, classId);
      if (!removed) return res.status(404).json({ error: 'Enrollment not found' });
  
      res.json({ message: 'User removed from class' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove user from class' });
    }
  };
  
  // @desc    Get pending enrollments
  const adminGetPendingEnrollments = async (req, res) => {
    try {
      const pendingEnrollments = await getPendingEnrollments();
      res.json(pendingEnrollments);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch pending enrollments' });
    }
  };
  
  // @desc    Get enrollment details
  const adminGetEnrollmentDetails = async (req, res) => {
    try {
      const enrollment = await getEnrollmentById(req.params.enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      res.json(enrollment);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch enrollment details' });
    }
  };
  
  // @desc    Approve an enrollment
  const adminApproveEnrollment = async (req, res) => {
    const { enrollmentId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id; // From auth middleware
  
    try {
      const enrollment = await getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
  
      if (enrollment.enrollment_status !== 'pending') {
        return res.status(400).json({ error: 'Enrollment is not pending approval' });
      }
  
      const approvedEnrollment = await approveEnrollment(enrollmentId, adminId, adminNotes);
      res.json(approvedEnrollment);
    } catch (err) {
      res.status(500).json({ error: 'Failed to approve enrollment' });
    }
  };
  
  // @desc    Reject an enrollment
  const adminRejectEnrollment = async (req, res) => {
    const { enrollmentId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id; // From auth middleware
  
    try {
      const enrollment = await getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
  
      if (enrollment.enrollment_status !== 'pending') {
        return res.status(400).json({ error: 'Enrollment is not pending approval' });
      }
  
      const rejectedEnrollment = await rejectEnrollment(enrollmentId, adminId, adminNotes);
      res.json(rejectedEnrollment);
    } catch (err) {
      res.status(500).json({ error: 'Failed to reject enrollment' });
    }
  };
  
  // @desc    Get financial summary
  const adminGetFinancialSummary = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
  
      const summary = await getFinancialSummary(startDate, endDate);
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch financial summary' });
    }
  };
  
  // @desc    Get revenue by class
  const adminGetRevenueByClass = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
  
      const revenue = await getRevenueByClass(startDate, endDate);
      res.json(revenue);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch revenue by class' });
    }
  };
  
  // @desc    Get all payments with filters
  const adminGetAllPayments = async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        status,
        refundStatus,
        userId,
        classId
      } = req.query;
  
      const payments = await getAllPayments({
        startDate,
        endDate,
        status,
        refundStatus,
        userId,
        classId
      });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  };
  
  // @desc    Get payment details
  const adminGetPaymentDetails = async (req, res) => {
    try {
      const payment = await getPaymentById(req.params.paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch payment details' });
    }
  };
  
  // @desc    Process a refund
  const adminProcessRefund = async (req, res) => {
    const { paymentId } = req.params;
    const { refundAmount, refundReason } = req.body;
    const adminId = req.user.id;
  
    try {
      const payment = await getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
  
      if (payment.refund_status) {
        return res.status(400).json({ error: 'Payment has already been refunded' });
      }
  
      if (refundAmount > payment.amount) {
        return res.status(400).json({ error: 'Refund amount cannot exceed payment amount' });
      }
  
      const refundedPayment = await processRefund(paymentId, {
        refundAmount,
        refundReason,
        adminId
      });
  
      res.json(refundedPayment);
    } catch (err) {
      res.status(500).json({ error: 'Failed to process refund' });
    }
  };
  
  // @desc    Create a new class
  // @route   POST /api/admin/classes
  // @access  Admin
  const adminCreateClass = async (req, res) => {
    const {
      title,
      description,
      date,
      start_time,
      end_time,
      duration_minutes,
      location_type,
      location_details,
      price,
      capacity,
      is_recurring,
      recurrence_pattern,
      min_enrollment,
      prerequisites,
      materials_needed,
      instructor_id,
      waitlist_enabled,
      waitlist_capacity
    } = req.body;
  
    // Validate required fields
    const requiredFields = [
      'title', 'description', 'date', 'start_time', 'end_time',
      'location_type', 'location_details', 'price', 'capacity'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
  
    // Validate field types
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
  
    if (typeof capacity !== 'number' || capacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
  
    if (duration_minutes && (typeof duration_minutes !== 'number' || duration_minutes <= 0)) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
  
    // Validate date and time format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
  
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({ error: 'Time must be in HH:MM format' });
    }
  
    // Validate recurring class pattern if provided
    if (is_recurring && recurrence_pattern) {
      const { frequency, interval, endDate, daysOfWeek } = recurrence_pattern;
      if (!frequency || !interval || !endDate || !Array.isArray(daysOfWeek)) {
        return res.status(400).json({ error: 'Invalid recurrence pattern' });
      }
    }
  
    try {
      const newClass = await createClass({
        title,
        description,
        date,
        start_time,
        end_time,
        duration_minutes,
        location_type,
        location_details,
        price,
        capacity,
        is_recurring,
        recurrence_pattern,
        min_enrollment,
        prerequisites,
        materials_needed,
        instructor_id,
        waitlist_enabled,
        waitlist_capacity
      });
  
      res.status(201).json(newClass);
    } catch (err) {
      console.error('Create class error:', err);
      res.status(500).json({ error: 'Failed to create class' });
    }
  };
  
  // @desc    Get class details with enhanced information
  // @route   GET /api/admin/classes/:classId
  // @access  Admin
  const adminGetClassDetails = async (req, res) => {
    try {
      const classDetails = await getClassWithDetails(req.params.classId);
      if (!classDetails) {
        return res.status(404).json({ error: 'Class not found' });
      }
      res.json(classDetails);
    } catch (err) {
      console.error('Get class details error:', err);
      res.status(500).json({ error: 'Failed to fetch class details' });
    }
  };
  
  // @desc    Get class sessions
  // @route   GET /api/admin/classes/:classId/sessions
  // @access  Admin
  const adminGetClassSessions = async (req, res) => {
    try {
      const sessions = await getClassSessions(req.params.classId);
      res.json(sessions);
    } catch (err) {
      console.error('Get class sessions error:', err);
      res.status(500).json({ error: 'Failed to fetch class sessions' });
    }
  };
  
  // @desc    Update class status
  // @route   PUT /api/admin/classes/:classId/status
  // @access  Admin
  const adminUpdateClassStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['active', 'cancelled', 'completed', 'scheduled'];
  
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
    }
  
    try {
      const updatedClass = await updateClassStatus(req.params.classId, status);
      if (!updatedClass) {
        return res.status(404).json({ error: 'Class not found' });
      }
      res.json(updatedClass);
    } catch (err) {
      console.error('Update class status error:', err);
      res.status(500).json({ error: 'Failed to update class status' });
    }
  };
  
  // @desc    Get class waitlist
  // @route   GET /api/admin/classes/:classId/waitlist
  // @access  Admin
  const adminGetClassWaitlist = async (req, res) => {
    try {
      const waitlist = await getClassWaitlist(req.params.classId);
      res.json(waitlist);
    } catch (err) {
      console.error('Get class waitlist error:', err);
      res.status(500).json({ error: 'Failed to fetch class waitlist' });
    }
  };
  
  // @desc    Update waitlist status
  // @route   PUT /api/admin/classes/:classId/waitlist/:waitlistId
  // @access  Admin
  const adminUpdateWaitlistStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['waiting', 'offered', 'accepted', 'declined'];
  
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
    }
  
    try {
      const updatedWaitlist = await updateWaitlistStatus(req.params.waitlistId, status);
      if (!updatedWaitlist) {
        return res.status(404).json({ error: 'Waitlist entry not found' });
      }
      res.json(updatedWaitlist);
    } catch (err) {
      console.error('Update waitlist status error:', err);
      res.status(500).json({ error: 'Failed to update waitlist status' });
    }
  };
  
  module.exports = {
    adminGetUsers,
    adminDeleteUser,
    adminGetClasses,
    adminEditClass,
    adminDeleteClass,
    adminEnrollmentStats,
    adminRemoveUserFromClass,
    adminGetPendingEnrollments,
    adminGetEnrollmentDetails,
    adminApproveEnrollment,
    adminRejectEnrollment,
    adminGetFinancialSummary,
    adminGetRevenueByClass,
    adminGetAllPayments,
    adminGetPaymentDetails,
    adminProcessRefund,
    adminCreateClass,
    adminGetClassDetails,
    adminGetClassSessions,
    adminUpdateClassStatus,
    adminGetClassWaitlist,
    adminUpdateWaitlistStatus
  };
  