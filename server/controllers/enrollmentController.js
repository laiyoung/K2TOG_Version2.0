const {
  enrollUserInClass,
  cancelEnrollment,
  getUserEnrollments,
  isUserAlreadyEnrolled,
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  setEnrollmentPending,
  getPendingEnrollments,
  getEnrollmentById
} = require("../models/enrollmentModel");

const {
  incrementEnrolledCount,
  decrementEnrolledCount,
  getClassById,
  getClassWithDetails
} = require("../models/classModel");

const { sendEmail } = require("../utils/emailService");
const { validateEmail } = require("../utils/validators");
const pool = require("../config/db");

// @desc    Enroll user in a class
// @route   POST /api/enrollments/:classId
// @access  Private
const enrollInClass = async (req, res) => {
  const userId = req.user.id;
  const classId = req.params.classId;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // Check if already enrolled
    const alreadyEnrolled = await isUserAlreadyEnrolled(userId, classId);
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "User already enrolled in this class" });
    }

    // Validate class exists and is available
    const classDetails = await getClassWithDetails(classId);
    if (!classDetails) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Validate session exists and belongs to this class
    const session = await pool.query(
      'SELECT * FROM class_sessions WHERE id = $1 AND class_id = $2',
      [sessionId, classId]
    );
    if (!session.rows[0]) {
      return res.status(400).json({ error: "Invalid session for this class" });
    }

    const now = new Date();
    if (new Date(session.rows[0].session_date) <= now) {
      return res.status(400).json({ error: "Session has already started or ended" });
    }

    if (classDetails.enrolled_count >= classDetails.capacity) {
      return res.status(400).json({ error: "Class is full" });
    }

    // Create enrollment
    const enrollment = await enrollUserInClass(userId, classId, sessionId, "paid");
    await incrementEnrolledCount(classId);

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Class Enrollment Confirmation",
        html: `
          <h2>Enrollment Confirmation</h2>
          <p>You have successfully enrolled in "${classDetails.title}".</p>
          <p>Class Details:</p>
          <ul>
            <li>Date: ${new Date(session.rows[0].session_date).toLocaleDateString()}</li>
            <li>Time: ${session.rows[0].start_time} - ${session.rows[0].end_time}</li>
            <li>Location: ${classDetails.location_details}</li>
          </ul>
          <p>We look forward to seeing you there!</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue with enrollment even if email fails
    }

    res.status(201).json(enrollment);
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ error: "Failed to enroll in class" });
  }
};

// @desc    Cancel enrollment
// @route   DELETE /api/enrollments/:classId
// @access  Private
const cancelClassEnrollment = async (req, res) => {
  const userId = req.user.id;
  const classId = req.params.classId;

  try {
    const classDetails = await getClassById(classId);
    if (!classDetails) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Check if class has already started
    const now = new Date();
    if (new Date(classDetails.date) <= now) {
      return res.status(400).json({ error: "Cannot cancel enrollment for a class that has already started" });
    }

    const canceled = await cancelEnrollment(userId, classId);
    if (!canceled) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    await decrementEnrolledCount(classId);

    // Send cancellation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Class Enrollment Cancellation",
        html: `
          <h2>Enrollment Cancellation</h2>
          <p>Your enrollment in "${classDetails.title}" has been cancelled.</p>
          <p>If you did not request this cancellation, please contact us immediately.</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.json({ message: "Enrollment cancelled successfully" });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ error: "Failed to cancel enrollment" });
  }
};

// @desc    Get current user's enrolled classes
// @route   GET /api/enrollments/my
// @access  Private
const getMyEnrollments = async (req, res) => {
  const userId = req.user.id;

  try {
    const enrollments = await getUserEnrollments(userId);
    res.json(enrollments);
  } catch (err) {
    console.error("Get enrollments error:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

// @desc    Get all enrollments (admin)
// @route   GET /api/enrollments
// @access  Admin
const getAllEnrollmentsAdmin = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      class_id: req.query.classId,
      user_id: req.query.userId,
      start_date: req.query.startDate,
      end_date: req.query.endDate
    };

    const enrollments = await getAllEnrollments(filters);
    res.json(enrollments);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Failed to fetch all enrollments" });
  }
};

// @desc    Get pending enrollments (admin)
// @route   GET /api/enrollments/pending
// @access  Admin
const getPendingEnrollmentsList = async (req, res) => {
  try {
    const enrollments = await getPendingEnrollments();
    res.json(enrollments);
  } catch (err) {
    console.error("Get pending enrollments error:", err);
    res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Admin
const getEnrollmentDetails = async (req, res) => {
  try {
    const enrollment = await getEnrollmentById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    res.json(enrollment);
  } catch (err) {
    console.error("Get enrollment details error:", err);
    res.status(500).json({ error: "Failed to fetch enrollment details" });
  }
};

// @desc    Approve enrollment (admin)
// @route   PUT /api/enrollments/:id/approve
// @access  Admin
const approveEnrollmentRequest = async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const adminId = req.user.id;

  try {
    const enrollment = await getEnrollmentById(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    if (enrollment.enrollment_status !== 'pending') {
      return res.status(400).json({ error: "Can only approve pending enrollments" });
    }

    const approvedEnrollment = await approveEnrollment(id, adminId, adminNotes);

    // Send approval email
    try {
      await sendEmail({
        to: enrollment.user_email,
        subject: "Enrollment Approved",
        html: `
          <h2>Enrollment Approved</h2>
          <p>Your enrollment in "${enrollment.class_title}" has been approved.</p>
          <p>Class Details:</p>
          <ul>
            <li>Date: ${new Date(enrollment.class_date).toLocaleDateString()}</li>
            <li>Location: ${enrollment.location_details}</li>
          </ul>
          <p>We look forward to seeing you there!</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.json(approvedEnrollment);
  } catch (err) {
    console.error("Approve enrollment error:", err);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
};

// @desc    Reject enrollment (admin)
// @route   PUT /api/enrollments/:id/reject
// @access  Admin
const rejectEnrollmentRequest = async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const adminId = req.user.id;

  try {
    const enrollment = await getEnrollmentById(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    if (enrollment.enrollment_status !== 'pending') {
      return res.status(400).json({ error: "Can only reject pending enrollments" });
    }

    const rejectedEnrollment = await rejectEnrollment(id, adminId, adminNotes);

    // Send rejection email
    try {
      await sendEmail({
        to: enrollment.user_email,
        subject: "Enrollment Status Update",
        html: `
          <h2>Enrollment Status Update</h2>
          <p>Your enrollment in "${enrollment.class_title}" has been rejected.</p>
          ${adminNotes ? `<p>Reason: ${adminNotes}</p>` : ''}
          <p>If you have any questions, please contact us.</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.json(rejectedEnrollment);
  } catch (err) {
    console.error("Reject enrollment error:", err);
    res.status(500).json({ error: "Failed to reject enrollment" });
  }
};

// @desc    Set enrollment to pending (admin)
// @route   POST /api/enrollments/:id/pending
// @access  Admin
const setEnrollmentToPending = async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const adminId = req.user.id;

  try {
    const enrollment = await getEnrollmentById(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    if (enrollment.enrollment_status === 'pending') {
      return res.status(400).json({ error: "Enrollment is already pending" });
    }

    const pendingEnrollment = await setEnrollmentPending(id, adminId, adminNotes);

    // Send notification email
    try {
      await sendEmail({
        to: enrollment.user_email,
        subject: "Enrollment Status Update",
        html: `
          <h2>Enrollment Status Update</h2>
          <p>Your enrollment in "${enrollment.class_title}" has been set to pending.</p>
          ${adminNotes ? `<p>Notes: ${adminNotes}</p>` : ''}
          <p>We will review your enrollment and update you soon.</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.json(pendingEnrollment);
  } catch (err) {
    console.error("Set enrollment pending error:", err);
    res.status(500).json({ error: "Failed to set enrollment to pending" });
  }
};

// @desc    Get waitlist status for a class and user
// @route   GET /api/enrollments/waitlist/:classId
// @access  Private
const getWaitlistStatus = async (req, res) => {
  const userId = req.user.id;
  const classId = req.params.classId;
  try {
    const result = await pool.query(
      `SELECT * FROM class_waitlist WHERE class_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [classId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not on waitlist' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get waitlist status error:', err);
    res.status(500).json({ error: 'Failed to fetch waitlist status' });
  }
};

module.exports = {
  enrollInClass,
  cancelClassEnrollment,
  getMyEnrollments,
  getAllEnrollmentsAdmin,
  getPendingEnrollmentsList,
  getEnrollmentDetails,
  approveEnrollmentRequest,
  rejectEnrollmentRequest,
  setEnrollmentToPending,
  getWaitlistStatus,
};
