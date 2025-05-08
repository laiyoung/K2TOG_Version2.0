const pool = require('../config/db');

// Get all classes
const getAllClassesFromDB = async () => {
  const result = await pool.query('SELECT * FROM classes ORDER BY date DESC');
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
    `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description, date, location_type, location_details, price, capacity, 0]
  );
  return result.rows[0];
};

// Update a class (admin use)
const updateClass = async (id, updates) => {
  const {
    title,
    description,
    date,
    location_type,
    location_details,
    price,
    capacity,
    enrolled_count
  } = updates;

  const result = await pool.query(
    `UPDATE classes 
     SET title = $1, 
         description = $2, 
         date = $3, 
         location_type = $4, 
         location_details = $5, 
         price = $6, 
         capacity = $7,
         enrolled_count = $8
     WHERE id = $9
     RETURNING *`,
    [title, description, date, location_type, location_details, price, capacity, enrolled_count, id]
  );
  return result.rows[0];
};

// Delete a class (admin use)
const deleteClass = async (id) => {
  // First delete any enrollments for this class
  await pool.query('DELETE FROM enrollments WHERE class_id = $1', [id]);
  
  // Then delete the class
  const result = await pool.query(
    'DELETE FROM classes WHERE id = $1 RETURNING *',
    [id]
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
  updateClass,
  deleteClass,
  incrementEnrolledCount,
  decrementEnrolledCount,
};
