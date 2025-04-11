const {
  enrollUserInClass,
  cancelEnrollment,
  getUserEnrollments,
  isUserAlreadyEnrolled,
  getAllEnrollments,
} = require("../models/enrollmentModel");

const {
  incrementEnrolledCount,
  decrementEnrolledCount,
  getClassById,
} = require("../models/classModel");

const sendEmail = require("../utils/sendEmail");

// @desc    Enroll user in a class
// @route   POST /api/enrollments/:classId
// @access  Private
const enrollInClass = async (req, res) => {
  const userId = req.user.id;
  const classId = req.params.classId;

  try {
    const alreadyEnrolled = await isUserAlreadyEnrolled(userId, classId);
    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ error: "User already enrolled in this class" });
    }

    const now = new Date();
    const classDetails = await getClassById(classId);

    if (new Date(classDetails.date) <= now) {
      return res
        .status(400)
        .json({ error: "Class has already started or ended" });
    }

    const enrollment = await enrollUserInClass(userId, classId, "paid");
    await incrementEnrolledCount(classId);

    res.status(201).json(enrollment);

    // After enrolling user
    await sendEmail({
      to: req.user.email,
      subject: "Class Enrollment Confirmation",
      html: `<p>You are successfully enrolled in "${classInfo.title}".</p>`,
    });
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
    const canceled = await cancelEnrollment(userId, classId);
    if (!canceled)
      return res.status(404).json({ error: "Enrollment not found" });

    await decrementEnrolledCount(classId);
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
    const enrollments = await getAllEnrollments();
    res.json(enrollments);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Failed to fetch all enrollments" });
  }
};

module.exports = {
  enrollInClass,
  cancelClassEnrollment,
  getMyEnrollments,
  getAllEnrollmentsAdmin,
};
