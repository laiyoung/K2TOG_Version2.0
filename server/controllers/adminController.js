const pool = require('../config/db');

// @desc    Get all instructors
// @route   GET /api/admin/instructors
// @access  Admin
const getInstructors = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, phone_number 
             FROM users 
             WHERE role = 'instructor' AND status = 'active'
             ORDER BY name`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get instructors error:', err);
        res.status(500).json({ error: 'Failed to fetch instructors' });
    }
};

module.exports = {
    getInstructors
}; 