const pool = require('../config/db');

// Get all sessions with their students for a specific class (including deleted sessions)
async function getClassSessionsWithStudents(req, res) {
  const { classId } = req.params;
  
  try {
    const query = `
      WITH        active_session_students AS (
         SELECT 
           cs.id as session_id,
           cs.session_date,
           cs.start_time,
           cs.end_time,
           cs.status,
           'active' as session_type,
           json_agg(
             json_build_object(
               'id', u.id,
               'name', CONCAT(u.first_name, ' ', u.last_name),
               'email', u.email,
               'enrollment_status', e.enrollment_status,
               'payment_status', e.payment_status,
               'enrollment_type', 'active'
             )
           ) FILTER (WHERE u.id IS NOT NULL) as students
         FROM class_sessions cs
         LEFT JOIN (
           SELECT DISTINCT ON (e.user_id, e.session_id) 
             e.session_id, e.user_id, e.enrollment_status, e.payment_status
           FROM enrollments e
         ) e ON e.session_id = cs.id
         LEFT JOIN users u ON u.id = e.user_id
         WHERE cs.class_id = $1 AND cs.deleted_at IS NULL
         GROUP BY cs.id, cs.session_date, cs.start_time, cs.end_time, cs.status
       ),
             historical_session_students AS (
         SELECT 
           hs.original_session_id as session_id,
           hs.session_date,
           hs.start_time,
           hs.end_time,
           hs.status,
           'historical' as session_type,
           json_agg(
             json_build_object(
               'id', u.id,
               'name', CONCAT(u.first_name, ' ', u.last_name),
               'email', u.email,
               'enrollment_status', he.enrollment_status,
               'payment_status', he.payment_status,
               'enrollment_type', 'historical',
               'archived_at', he.archived_at,
               'archived_reason', he.archived_reason
             )
           ) FILTER (WHERE u.id IS NOT NULL) as students
         FROM historical_sessions hs
         LEFT JOIN (
           SELECT DISTINCT ON (he.user_id, hs.original_session_id) 
             he.historical_session_id, he.user_id, he.enrollment_status, he.payment_status, he.archived_at, he.archived_reason
           FROM historical_enrollments he
           JOIN historical_sessions hs ON hs.id = he.historical_session_id
           ORDER BY he.user_id, hs.original_session_id, he.archived_at DESC
         ) he ON he.historical_session_id = hs.id
         LEFT JOIN users u ON u.id = he.user_id
         WHERE hs.class_id = $1
         GROUP BY hs.original_session_id, hs.session_date, hs.start_time, hs.end_time, hs.status
       ),
      all_sessions AS (
        SELECT * FROM active_session_students
        UNION ALL
        SELECT * FROM historical_session_students
      )
      SELECT 
        session_id,
        session_date,
        start_time,
        end_time,
        status,
        session_type,
        COALESCE(students, '[]'::json) as students
      FROM all_sessions
      ORDER BY session_date ASC, start_time ASC;
    `;

    const { rows } = await pool.query(query, [classId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sessions with students:', error);
    res.status(500).json({ error: 'Failed to fetch sessions and students' });
  }
}

// Update session status
async function updateSessionStatus(req, res) {
  const { sessionId } = req.params;
  const { status } = req.body;

  if (!['scheduled', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const query = `
      UPDATE class_sessions
      SET status = $1
      WHERE id = $2
      RETURNING id, session_date, start_time, end_time, status;
    `;

    const { rows } = await pool.query(query, [status, sessionId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ error: 'Failed to update session status' });
  }
}

// Get a single session
async function getSessionById(req, res) {
  const { sessionId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM class_sessions WHERE id = $1`,
      [sessionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

// Create a session
async function createSession(req, res) {
  const {
    class_id,
    session_date,
    end_date,
    start_time,
    end_time,
    capacity,
    min_enrollment,
    waitlist_enabled,
    waitlist_capacity,
    instructor_id,
    status
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO class_sessions (
        class_id, session_date, end_date, start_time, end_time, capacity, min_enrollment, waitlist_enabled, waitlist_capacity, instructor_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [class_id, session_date, end_date, start_time, end_time, capacity, min_enrollment, waitlist_enabled, waitlist_capacity, instructor_id, status || 'scheduled']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

// Update a session
async function updateSession(req, res) {
  const { sessionId } = req.params;
  const {
    session_date,
    end_date,
    start_time,
    end_time,
    capacity,
    min_enrollment,
    waitlist_enabled,
    waitlist_capacity,
    instructor_id,
    status
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE class_sessions SET
        session_date = COALESCE($1, session_date),
        end_date = COALESCE($2, end_date),
        start_time = COALESCE($3, start_time),
        end_time = COALESCE($4, end_time),
        capacity = COALESCE($5, capacity),
        min_enrollment = COALESCE($6, min_enrollment),
        waitlist_enabled = COALESCE($7, waitlist_enabled),
        waitlist_capacity = COALESCE($8, waitlist_capacity),
        instructor_id = COALESCE($9, instructor_id),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *`,
      [session_date, end_date, start_time, end_time, capacity, min_enrollment, waitlist_enabled, waitlist_capacity, instructor_id, status, sessionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
}

// Delete a session
async function deleteSession(req, res) {
  const { sessionId } = req.params;
  try {
    // Optionally, delete enrollments for this session first
    await pool.query('DELETE FROM enrollments WHERE session_id = $1', [sessionId]);
    const result = await pool.query(
      'DELETE FROM class_sessions WHERE id = $1 RETURNING *',
      [sessionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
}

module.exports = {
  getClassSessionsWithStudents,
  updateSessionStatus,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
};