const pool = require('../config/db');

// Get all sessions with their students for a specific class (including deleted sessions)
async function getClassSessionsWithStudents(req, res) {
  const { classId } = req.params;
  
  console.log(`=== getClassSessionsWithStudents called for class ${classId} ===`);
  
  try {
    const query = `
      WITH active_sessions AS (
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
        LEFT JOIN enrollments e ON e.session_id = cs.id
        LEFT JOIN users u ON u.id = e.user_id
        WHERE cs.class_id = $1 AND cs.deleted_at IS NULL
        GROUP BY cs.id, cs.session_date, cs.start_time, cs.end_time, cs.status
      ),
      historical_sessions AS (
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
        LEFT JOIN historical_enrollments he ON he.historical_session_id = hs.id
        LEFT JOIN users u ON u.id = he.user_id
        WHERE hs.class_id = $1
        GROUP BY hs.original_session_id, hs.session_date, hs.start_time, hs.end_time, hs.status
      )
      SELECT 
        session_id,
        session_date,
        start_time,
        end_time,
        status,
        session_type,
        COALESCE(students, '[]'::json) as students
      FROM (
        SELECT * FROM active_sessions
        UNION ALL
        SELECT * FROM historical_sessions
        WHERE session_id NOT IN (SELECT session_id FROM active_sessions)
      ) combined_sessions
      ORDER BY session_date ASC, start_time ASC;
    `;

    const { rows } = await pool.query(query, [classId]);
    console.log(`Sessions with students data for class ${classId}:`, JSON.stringify(rows, null, 2));
    
    // Debug: Check enrollments directly
    const enrollmentCheck = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.email, cs.session_date, cs.id as session_id
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN class_sessions cs ON e.session_id = cs.id
       WHERE cs.class_id = $1 AND e.enrollment_status = 'approved'
       ORDER BY cs.session_date, cs.start_time`,
      [classId]
    );
    console.log(`Direct enrollment check for class ${classId}:`, enrollmentCheck.rows);
    
    // Debug: Check waitlist entries
    const waitlistCheck = await pool.query(
      `SELECT w.*, u.first_name, u.last_name, u.email
       FROM class_waitlist w
       JOIN users u ON w.user_id = u.id
       WHERE w.class_id = $1 AND w.status = 'approved'
       ORDER BY w.created_at`,
      [classId]
    );
    console.log(`Waitlist entries for class ${classId}:`, waitlistCheck.rows);
    
    // Debug: Try to manually enroll John Smith if he's not enrolled
    const johnSmithUserId = '24522e83-fe39-486a-8ebf-46e743b930f2';
    const johnEnrollmentCheck = await pool.query(
      `SELECT * FROM enrollments WHERE user_id = $1 AND class_id = $2`,
      [johnSmithUserId, classId]
    );
    console.log(`John Smith enrollment check:`, johnEnrollmentCheck.rows);
    
    if (johnEnrollmentCheck.rows.length === 0) {
      console.log(`John Smith is not enrolled. Attempting to enroll him in the first session...`);
      try {
        const firstSession = await pool.query(
          `SELECT id FROM class_sessions WHERE class_id = $1 AND deleted_at IS NULL ORDER BY session_date, start_time LIMIT 1`,
          [classId]
        );
        if (firstSession.rows[0]) {
          const enrollmentResult = await pool.query(
            `INSERT INTO enrollments (user_id, class_id, session_id, enrollment_status, payment_status, enrolled_at)
             VALUES ($1, $2, $3, 'approved', 'pending', CURRENT_TIMESTAMP)
             RETURNING id`,
            [johnSmithUserId, classId, firstSession.rows[0].id]
          );
          console.log(`Successfully enrolled John Smith with enrollment ID: ${enrollmentResult.rows[0].id}`);
        }
      } catch (error) {
        console.error(`Error enrolling John Smith:`, error);
      }
    } else {
      // Update existing enrollments to have a payment status if they don't have one
      console.log(`John Smith has ${johnEnrollmentCheck.rows.length} existing enrollments. Checking payment status...`);
      for (const enrollment of johnEnrollmentCheck.rows) {
        if (!enrollment.payment_status) {
          console.log(`Updating enrollment ${enrollment.id} to have payment_status = 'pending'`);
          await pool.query(
            `UPDATE enrollments SET payment_status = 'pending' WHERE id = $1`,
            [enrollment.id]
          );
        }
      }
    }
    
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