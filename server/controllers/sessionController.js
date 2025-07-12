const pool = require('../config/db');

// Get all sessions with their students for a specific class
async function getClassSessionsWithStudents(req, res) {
  const { classId } = req.params;
  
  try {
    const query = `
      WITH session_students AS (
        SELECT 
          cs.id as session_id,
          cs.session_date,
          cs.start_time,
          cs.end_time,
          cs.status,
          json_agg(
            CASE WHEN u.id IS NOT NULL THEN
              json_build_object(
                'id', u.id,
                'name', CONCAT(u.first_name, ' ', u.last_name),
                'email', u.email,
                'enrollment_status', e.enrollment_status,
                'payment_status', e.payment_status
              )
            END
          ) FILTER (WHERE u.id IS NOT NULL) as students
        FROM class_sessions cs
        LEFT JOIN enrollments e ON e.session_id = cs.id
        LEFT JOIN users u ON u.id = e.user_id
        WHERE cs.class_id = $1
        GROUP BY cs.id, cs.session_date, cs.start_time, cs.end_time, cs.status
        ORDER BY cs.session_date ASC, cs.start_time ASC
      )
      SELECT 
        session_id,
        session_date,
        start_time,
        end_time,
        status,
        COALESCE(students, '[]'::json) as students
      FROM session_students;
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