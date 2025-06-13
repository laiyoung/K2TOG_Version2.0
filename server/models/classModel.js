const pool = require('../config/db');

// Get all classes
const getAllClassesFromDB = async (filters = {}) => {
  const { status, instructor_id, start_date, end_date } = filters;
  let query = `
    SELECT 
      c.id, c.title, c.description, c.price, c.location_type, c.location_details, 
      c.recurrence_pattern, c.prerequisites, c.materials_needed, c.image_url,
      c.created_at, c.updated_at
    FROM classes c
  `;
  const queryParams = [];
  let paramCount = 1;

  // If filtering by instructor_id, join class_sessions
  if (instructor_id) {
    query += ' JOIN class_sessions cs ON cs.class_id = c.id';
  }
  query += ' WHERE 1=1';

  if (status) {
    query += ` AND c.status = $${paramCount}`;
    queryParams.push(status);
    paramCount++;
  }
  if (instructor_id) {
    query += ` AND cs.instructor_id = $${paramCount}`;
    queryParams.push(instructor_id);
    paramCount++;
  }
  if (start_date) {
    query += ` AND c.created_at >= $${paramCount}`;
    queryParams.push(start_date);
    paramCount++;
  }
  if (end_date) {
    query += ` AND c.created_at <= $${paramCount}`;
    queryParams.push(end_date);
    paramCount++;
  }

  query += ' ORDER BY c.created_at DESC';

  const result = await pool.query(query, queryParams);
  return result.rows;
};

// Get a single class by ID
const getClassById = async (id) => {
  const result = await pool.query(
    'SELECT id, title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url, created_at, updated_at FROM classes WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Create a new class (general info only)
const createClass = async ({
  title,
  description,
  price,
  location_type,
  location_details,
  recurrence_pattern = null,
  prerequisites = null,
  materials_needed = null,
  image_url = null
}) => {
  const result = await pool.query(
    `INSERT INTO classes (
      title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url]
  );
  return result.rows[0];
};

// Get class sessions
const getClassSessions = async (classId) => {
  const result = await pool.query(
    `SELECT 
      cs.*,
      CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
      (cs.capacity - cs.enrolled_count) as available_spots
     FROM class_sessions cs
     LEFT JOIN users u ON u.id = cs.instructor_id
     WHERE cs.class_id = $1 
     ORDER BY cs.session_date, cs.start_time`,
    [classId]
  );
  return result.rows;
};

// Add user to waitlist
const addToWaitlist = async (classId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get class details including waitlist settings
    const classResult = await client.query(
      `SELECT c.*, 
              COUNT(DISTINCT e.id) as current_enrollments,
              COUNT(DISTINCT w.id) as waitlist_count,
              AVG(DATE_PART('day', e.enrolled_at - w.created_at)) as avg_wait_time
       FROM classes c
       LEFT JOIN enrollments e ON e.class_id = c.id AND e.enrollment_status = 'approved'
       LEFT JOIN class_waitlist w ON w.class_id = c.id AND w.status = 'waiting'
       WHERE c.id = $1
       GROUP BY c.id`,
      [classId]
    );

    if (!classResult.rows[0].waitlist_enabled) {
      throw new Error('Waitlist is not enabled for this class');
    }

    if (classResult.rows[0].waitlist_count >= classResult.rows[0].waitlist_capacity) {
      throw new Error('Waitlist is full');
    }

    // Calculate position and estimated wait time
    const position = parseInt(classResult.rows[0].waitlist_count) + 1;
    const avgWaitTime = classResult.rows[0].avg_wait_time || 7; // Default to 7 days if no historical data
    const estimatedWaitTime = Math.ceil(avgWaitTime * (position / classResult.rows[0].capacity));

    // Add to waitlist
    const result = await client.query(
      `INSERT INTO class_waitlist (
        class_id, 
        user_id, 
        position, 
        status,
        estimated_wait_time,
        created_at
      )
      VALUES ($1, $2, $3, 'waiting', $4, CURRENT_TIMESTAMP)
      RETURNING *`,
      [classId, userId, position, estimatedWaitTime]
    );

    // Update positions for all waitlist entries
    await client.query(
      `UPDATE class_waitlist 
       SET position = subquery.new_position
       FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_position
         FROM class_waitlist
         WHERE class_id = $1 AND status = 'waiting'
       ) as subquery
       WHERE class_waitlist.id = subquery.id`,
      [classId]
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

// Get user's waitlist entries
const getUserWaitlistEntries = async (userId) => {
  const result = await pool.query(
    `SELECT w.*, 
            c.title as class_title, 
            c.capacity, 
            c.enrolled_count, 
            c.start_date, 
            c.end_date, 
            c.location_details, 
            cs.instructor_id, 
            u.name as instructor_name, 
            COUNT(DISTINCT w2.id) FILTER (WHERE w2.created_at < w.created_at AND w2.status = 'waiting') as position
     FROM class_waitlist w
     JOIN classes c ON c.id = w.class_id
     LEFT JOIN class_sessions cs ON cs.class_id = c.id
     LEFT JOIN users u ON u.id = cs.instructor_id
     LEFT JOIN class_waitlist w2 ON w2.class_id = w.class_id
     WHERE w.user_id = $1
     GROUP BY w.id, c.id, cs.instructor_id, u.name
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Update waitlist status
const updateWaitlistStatus = async (waitlistId, status, adminId = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the waitlist entry and class details
    const waitlistResult = await client.query(
      `SELECT w.*, c.title as class_title, u.email as user_email
       FROM class_waitlist w
       JOIN classes c ON c.id = w.class_id
       JOIN users u ON u.id = w.user_id
       WHERE w.id = $1`,
      [waitlistId]
    );

    if (!waitlistResult.rows[0]) {
      throw new Error('Waitlist entry not found');
    }

    const waitlistEntry = waitlistResult.rows[0];

    // Update the status
    const result = await client.query(
      `UPDATE class_waitlist 
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $2
       WHERE id = $3
       RETURNING *`,
      [status, adminId, waitlistId]
    );

    // If status is 'offered', update the position of other entries
    if (status === 'offered') {
      await client.query(
        `UPDATE class_waitlist 
         SET position = subquery.new_position
         FROM (
           SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_position
           FROM class_waitlist
           WHERE class_id = $1 AND status = 'waiting'
         ) as subquery
         WHERE class_waitlist.id = subquery.id`,
        [waitlistEntry.class_id]
      );
    }

    await client.query('COMMIT');
    return { ...result.rows[0], class_title: waitlistEntry.class_title, user_email: waitlistEntry.user_email };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Get class waitlist with enhanced details
const getClassWaitlist = async (classId) => {
  const result = await pool.query(
    `SELECT w.*,
            u.name as user_name,
            u.email as user_email,
            u.phone_number as user_phone,
            cs.capacity as session_capacity,
            DATE_PART('day', CURRENT_TIMESTAMP - w.created_at) as days_on_waitlist,
            CASE 
              WHEN w.status = 'waiting' THEN
                ROUND(AVG(DATE_PART('day', e.enrolled_at - w2.created_at)) * 
                      (COUNT(DISTINCT w2.id) FILTER (WHERE w2.created_at < w.created_at AND w2.status = 'waiting')::float / 
                       NULLIF(cs.capacity, 0)))
              ELSE NULL
            END as estimated_wait_time
     FROM class_waitlist w
     JOIN users u ON u.id = w.user_id
     JOIN classes c ON c.id = w.class_id
     LEFT JOIN class_sessions cs ON cs.class_id = w.class_id
     LEFT JOIN enrollments e ON e.class_id = w.class_id AND e.enrollment_status = 'approved'
     LEFT JOIN class_waitlist w2 ON w2.class_id = w.class_id
     WHERE w.class_id = $1
     GROUP BY w.id, u.name, u.email, u.phone_number, cs.capacity
     ORDER BY 
       CASE WHEN w.status = 'waiting' THEN 0 ELSE 1 END,
       w.position`,
    [classId]
  );
  return result.rows;
};

// Update class status
const updateClassStatus = async (classId, status) => {
  // First check if the class exists
  const classExists = await pool.query(
    'SELECT id FROM classes WHERE id = $1',
    [classId]
  );

  if (!classExists.rows[0]) {
    return null;
  }

  const result = await pool.query(
    `UPDATE classes 
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [status, classId]
  );
  return result.rows[0];
};

// Get class with enhanced details
const getClassWithDetails = async (classId) => {
  // First get the class details
  const classResult = await pool.query(
    `SELECT c.id, c.title, c.description, c.price, c.location_type, c.location_details,
            c.recurrence_pattern, c.prerequisites, c.materials_needed, c.image_url,
            c.created_at, c.updated_at
     FROM classes c
     WHERE c.id = $1`,
    [classId]
  );

  if (!classResult.rows[0]) {
    return null;
  }

  // Then get the sessions
  const sessionsResult = await pool.query(
    `SELECT * FROM class_sessions 
     WHERE class_id = $1 
     ORDER BY session_date, start_time`,
    [classId]
  );

  // Combine the results
  const classDetails = classResult.rows[0];
  classDetails.sessions = sessionsResult.rows;

  // Optionally, group sessions into date ranges or add more logic here

  return classDetails;
};

// Update a class (general info only)
const updateClass = async (id, updates) => {
  const {
    title,
    description,
    price,
    location_type,
    location_details,
    recurrence_pattern,
    prerequisites,
    materials_needed,
    image_url
  } = updates;

  const result = await pool.query(
    `UPDATE classes 
     SET title = $1, 
         description = $2, 
         price = $3, 
         location_type = $4, 
         location_details = $5, 
         recurrence_pattern = $6, 
         prerequisites = $7, 
         materials_needed = $8, 
         image_url = $9, 
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
     RETURNING *`,
    [title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url, id]
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

// Get class participants with enrollment details
const getClassParticipants = async (classId) => {
  const result = await pool.query(
    `SELECT 
      e.id as enrollment_id,
      e.enrollment_status,
      e.payment_status,
      e.enrolled_at,
      e.admin_notes,
      e.reviewed_at,
      u.id as user_id,
      u.name,
      u.email,
      u.phone_number,
      cs.session_date,
      cs.start_time,
      cs.end_time,
      cs.status as session_status
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    LEFT JOIN class_sessions cs ON cs.id = e.session_id
    WHERE e.class_id = $1
    ORDER BY e.enrolled_at DESC`,
    [classId]
  );
  return result.rows;
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
  getUserWaitlistEntries,
  updateWaitlistStatus,
  getClassWaitlist,
  updateClassStatus,
  getClassWithDetails,
  getClassParticipants,
  addToWaitlist
};
