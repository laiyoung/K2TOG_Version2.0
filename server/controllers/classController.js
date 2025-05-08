const {
    getAllClassesFromDB,
    getClassById,
    createClass
  } = require('../models/classModel');
  
  // @desc    Get all classes
  // @route   GET /api/classes
  // @access  Public
  const getAllClasses = async (req, res) => {
    try {
      const classes = await getAllClassesFromDB();
      res.json(classes);
    } catch (err) {
      console.error('Get all classes error:', err);
      res.status(500).json({ error: 'Failed to load classes' });
    }
  };
  
  // @desc    Get class by ID
  // @route   GET /api/classes/:id
  // @access  Public
  const getSingleClass = async (req, res) => {
    try {
      const classItem = await getClassById(req.params.id);
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
      res.json(classItem);
    } catch (err) {
      console.error('Get class by ID error:', err);
      res.status(500).json({ error: 'Failed to load class' });
    }
  };
  
  // @desc    Create a new class (admin only)
  // @route   POST /api/classes
  // @access  Admin
  const createNewClass = async (req, res) => {
    const {
      title,
      description,
      date,
      location_type,
      location_details,
      price,
      capacity
    } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'location_type', 'location_details', 'price', 'capacity'];
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

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
  
    try {
      const newClass = await createClass({
        title,
        description,
        date,
        location_type,
        location_details,
        price,
        capacity
      });
  
      res.status(201).json(newClass);
    } catch (err) {
      console.error('Create class error:', err);
      res.status(500).json({ error: 'Failed to create class' });
    }
  };
  
  module.exports = {
    getAllClasses,
    getSingleClass,
    createNewClass
  };
  