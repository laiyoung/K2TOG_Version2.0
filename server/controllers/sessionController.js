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

module.exports = {
  getClassSessionsWithStudents,
  updateSessionStatus
};