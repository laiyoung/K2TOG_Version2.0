const {
    getAllClassesFromDB,
    getClassById,
    createClass,
    getClassSessions,
    addToWaitlist,
    updateWaitlistStatus,
    getClassWaitlist,
    updateClassStatus,
    getClassWithDetails,
    updateClass,
    deleteClass,
    incrementEnrolledCount,
    decrementEnrolledCount
} = require('../models/classModel');

const { validateDate, validateTime, validatePrice, validateCapacity } = require('../utils/validators');

const { upload } = require('../config/cloudinary');

// @desc    Get all classes with optional filtering
// @route   GET /api/classes
// @access  Public
const getAllClasses = async (req, res) => {
    try {
        const { status, instructor_id, start_date, end_date } = req.query;
        const classes = await getAllClassesFromDB({ status, instructor_id, start_date, end_date });
        res.json(classes);
    } catch (err) {
        console.error('Get all classes error:', err);
        res.status(500).json({ error: 'Failed to load classes' });
    }
};

// @desc    Get class by ID with full details
// @route   GET /api/classes/:id
// @access  Public
const getSingleClass = async (req, res) => {
    try {
        const classDetails = await getClassWithDetails(req.params.id);
        if (!classDetails) return res.status(404).json({ error: 'Class not found' });
        res.json(classDetails);
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
    const requiredFields = ['title', 'description', 'date', 'start_time', 'end_time', 'location_type', 'location_details', 'price', 'capacity'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            error: 'Missing required fields', 
            fields: missingFields 
        });
    }

    // Validate field types and formats
    if (!validateDate(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (!validateTime(start_time) || !validateTime(end_time)) {
        return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
    }

    if (!validatePrice(price)) {
        return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if (!validateCapacity(capacity)) {
        return res.status(400).json({ error: 'Capacity must be a positive number' });
    }

    if (is_recurring && (!recurrence_pattern || !recurrence_pattern.endDate)) {
        return res.status(400).json({ error: 'Recurring classes require a valid recurrence pattern with end date' });
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

// @desc    Update class details
// @route   PUT /api/classes/:id
// @access  Admin
const updateClassDetails = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Validate class exists
        const existingClass = await getClassById(id);
        if (!existingClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Validate updates if provided
        if (updates.date && !validateDate(updates.date)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if ((updates.start_time && !validateTime(updates.start_time)) || 
            (updates.end_time && !validateTime(updates.end_time))) {
            return res.status(400).json({ error: 'Invalid time format' });
        }

        if (updates.price && !validatePrice(updates.price)) {
            return res.status(400).json({ error: 'Invalid price' });
        }

        if (updates.capacity && !validateCapacity(updates.capacity)) {
            return res.status(400).json({ error: 'Invalid capacity' });
        }

        const updatedClass = await updateClass(id, updates);
        res.json(updatedClass);
    } catch (err) {
        console.error('Update class error:', err);
        res.status(500).json({ error: 'Failed to update class' });
    }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Admin
const deleteClassById = async (req, res) => {
    const { id } = req.params;

    try {
        const existingClass = await getClassById(id);
        if (!existingClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        await deleteClass(id);
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        console.error('Delete class error:', err);
        res.status(500).json({ error: 'Failed to delete class' });
    }
};

// @desc    Get class sessions
// @route   GET /api/classes/:id/sessions
// @access  Public
const getClassSessionsList = async (req, res) => {
    try {
        const sessions = await getClassSessions(req.params.id);
        res.json(sessions);
    } catch (err) {
        console.error('Get class sessions error:', err);
        res.status(500).json({ error: 'Failed to load class sessions' });
    }
};

// @desc    Add user to class waitlist
// @route   POST /api/classes/:id/waitlist
// @access  Private
const addUserToWaitlist = async (req, res) => {
    const { id: classId } = req.params;
    const userId = req.user.id;

    try {
        const waitlistEntry = await addToWaitlist(classId, userId);
        res.status(201).json(waitlistEntry);
    } catch (err) {
        console.error('Add to waitlist error:', err);
        if (err.message === 'Waitlist is not enabled for this class') {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === 'Waitlist is full') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to add to waitlist' });
    }
};

// @desc    Update waitlist status
// @route   PUT /api/classes/:classId/waitlist/:waitlistId
// @access  Admin
const updateWaitlistEntryStatus = async (req, res) => {
    const { waitlistId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updatedEntry = await updateWaitlistStatus(waitlistId, status);
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Waitlist entry not found' });
        }
        res.json(updatedEntry);
    } catch (err) {
        console.error('Update waitlist status error:', err);
        res.status(500).json({ error: 'Failed to update waitlist status' });
    }
};

// @desc    Get class waitlist
// @route   GET /api/classes/:id/waitlist
// @access  Admin
const getClassWaitlistEntries = async (req, res) => {
    try {
        const waitlist = await getClassWaitlist(req.params.id);
        res.json(waitlist);
    } catch (err) {
        console.error('Get class waitlist error:', err);
        res.status(500).json({ error: 'Failed to load waitlist' });
    }
};

// @desc    Update class status
// @route   PUT /api/classes/:id/status
// @access  Admin
const updateClassStatusById = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updatedClass = await updateClassStatus(id, status);
        if (!updatedClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(updatedClass);
    } catch (err) {
        console.error('Update class status error:', err);
        res.status(500).json({ error: 'Failed to update class status' });
    }
};

// @desc    Upload class image
// @route   POST /api/classes/:id/image
// @access  Admin
const uploadClassImage = async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageUrl = req.file.path;
        const updatedClass = await updateClass(id, { image_url: imageUrl });
        
        if (!updatedClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(updatedClass);
    } catch (err) {
        console.error('Upload class image error:', err);
        res.status(500).json({ error: 'Failed to upload class image' });
    }
};

module.exports = {
    getAllClasses,
    getSingleClass,
    createNewClass,
    updateClassDetails,
    deleteClassById,
    getClassSessionsList,
    addUserToWaitlist,
    updateWaitlistEntryStatus,
    getClassWaitlistEntries,
    updateClassStatusById,
    uploadClassImage
};
  