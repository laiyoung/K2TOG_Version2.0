const {
    getAllUsers,
    getUserById
  } = require('../models/userModel');
  
  const {
    getAllClassesFromDB,
    getClassById,
    updateClass,
    deleteClass
  } = require('../models/classModel');
  
  const {
    getAllEnrollments,
    cancelEnrollment
  } = require('../models/enrollmentModel');
  
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
  
  module.exports = {
    adminGetUsers,
    adminDeleteUser,
    adminGetClasses,
    adminEditClass,
    adminDeleteClass,
    adminEnrollmentStats,
    adminRemoveUserFromClass,
  };
  