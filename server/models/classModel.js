const pool = require('../config/db');

// Get all classes (ordered by date)
const getAllClassesFromDB = async () => {
  const result = await pool.query('SELECT * FROM classes ORDER BY date');
  return result.rows;
};

// Get a single class by ID
const getClassById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM classes WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Create a new class (admin use)
const createClass = async ({
  title,
  description,
  date,
  location_type,
  location_details,
  price,
  capacity
}) => {
  const result = await pool.query(
    `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, description, date, location_type, location_details, price, capacity]
  );
  return result.rows[0];
};

// Update enrolled count after user enrollment
const incrementEnrolledCount = async (classId) => {
  await pool.query(
    `UPDATE classes SET enrolled_count = enrolled_count + 1 WHERE id = $1`,
    [classId]
  );
};

// Decrease enrolled count on cancellation
const decrementEnrolledCount = async (classId) => {
  await pool.query(
    `UPDATE classes SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE id = $1`,
    [classId]
  );
};

module.exports = {
  getAllClassesFromDB,
  getClassById,
  createClass,
  incrementEnrolledCount,
  decrementEnrolledCount,
};
