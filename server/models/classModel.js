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

// Create a new class with enhanced features
const createClass = async ({
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
  is_recurring = false,
  recurrence_pattern = null,
  min_enrollment = 1,
  prerequisites = null,
  materials_needed = null,
  instructor_id = null,
  waitlist_enabled = false,
  waitlist_capacity = 0
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert the main class record
    const classResult = await client.query(
      `INSERT INTO classes (
        title, description, date, start_time, end_time, duration_minutes,
        location_type, location_details, price, capacity, is_recurring,
        recurrence_pattern, min_enrollment, prerequisites, materials_needed,
        instructor_id, waitlist_enabled, waitlist_capacity, enrolled_count, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 0, 'scheduled')
      RETURNING *`,
      [
        title, description, date, start_time, end_time, duration_minutes,
        location_type, location_details, price, capacity, is_recurring,
        recurrence_pattern, min_enrollment, prerequisites, materials_needed,
        instructor_id, waitlist_enabled, waitlist_capacity
      ]
    );

    const newClass = classResult.rows[0];

    // If it's a recurring class, create the sessions
    if (is_recurring && recurrence_pattern) {
      const sessions = generateRecurringSessions(date, recurrence_pattern, start_time, end_time);
      for (const session of sessions) {
        await client.query(
          `INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
           VALUES ($1, $2, $3, $4)`,
          [newClass.id, session.date, session.start_time, session.end_time]
        );
      }
    } else {
      // For non-recurring classes, create a single session
      await client.query(
        `INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [newClass.id, date, start_time, end_time]
      );
    }

    await client.query('COMMIT');
    return newClass;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Generate recurring sessions based on pattern
const generateRecurringSessions = (startDate, pattern, startTime, endTime) => {
  const sessions = [];
  const { frequency, interval, endDate, daysOfWeek } = pattern;
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);

  while (current <= end) {
    if (daysOfWeek.includes(current.getDay())) {
      sessions.push({
        date: current.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime
      });
    }
    current.setDate(current.getDate() + interval);
  }

  return sessions;
};

// Get class sessions
const getClassSessions = async (classId) => {
  const result = await pool.query(
    `SELECT * FROM class_sessions 
     WHERE class_id = $1 
     ORDER BY session_date, start_time`,
    [classId]
  );
  return result.rows;
};

// Add user to waitlist
const addToWaitlist = async (classId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current waitlist position
    const positionResult = await client.query(
      `SELECT COUNT(*) as position 
       FROM class_waitlist 
       WHERE class_id = $1`,
      [classId]
    );
    const position = parseInt(positionResult.rows[0].position) + 1;

    // Check if class has waitlist enabled and capacity
    const classResult = await client.query(
      `SELECT waitlist_enabled, waitlist_capacity 
       FROM classes 
       WHERE id = $1`,
      [classId]
    );

    if (!classResult.rows[0].waitlist_enabled) {
      throw new Error('Waitlist is not enabled for this class');
    }

    if (position > classResult.rows[0].waitlist_capacity) {
      throw new Error('Waitlist is full');
    }

    // Add to waitlist
    const result = await client.query(
      `INSERT INTO class_waitlist (class_id, user_id, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [classId, userId, position]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Update waitlist status
const updateWaitlistStatus = async (waitlistId, status) => {
  const result = await pool.query(
    `UPDATE class_waitlist 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [status, waitlistId]
  );
  return result.rows[0];
};

// Get class waitlist
const getClassWaitlist = async (classId) => {
  const result = await pool.query(
    `SELECT w.*, u.name as user_name, u.email as user_email
     FROM class_waitlist w
     JOIN users u ON u.id = w.user_id
     WHERE w.class_id = $1
     ORDER BY w.position`,
    [classId]
  );
  return result.rows;
};

// Update class status
const updateClassStatus = async (classId, status) => {
  const result = await pool.query(
    `UPDATE classes 
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, classId]
  );
  return result.rows[0];
};

// Get class with enhanced details
const getClassWithDetails = async (classId) => {
  const result = await pool.query(
    `SELECT c.*, 
            u.name as instructor_name,
            COUNT(DISTINCT s.id) as total_sessions,
            COUNT(DISTINCT e.id) as total_enrollments,
            COUNT(DISTINCT w.id) as waitlist_count
     FROM classes c
     LEFT JOIN users u ON u.id = c.instructor_id
     LEFT JOIN class_sessions s ON s.class_id = c.id
     LEFT JOIN enrollments e ON e.class_id = c.id AND e.enrollment_status = 'approved'
     LEFT JOIN class_waitlist w ON w.class_id = c.id AND w.status = 'waiting'
     WHERE c.id = $1
     GROUP BY c.id, u.name`,
    [classId]
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
  getClassSessions,
  addToWaitlist,
  updateWaitlistStatus,
  getClassWaitlist,
  updateClassStatus,
  getClassWithDetails
};
