-- Add soft delete columns to existing tables
ALTER TABLE classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create historical sessions table to preserve data
CREATE TABLE IF NOT EXISTS historical_sessions (
  id SERIAL PRIMARY KEY,
  original_session_id INTEGER,
  class_id INTEGER,
  session_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled_count INTEGER DEFAULT 0,
  instructor_id INTEGER,
  status VARCHAR(20) DEFAULT 'completed',
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_reason VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create historical enrollments table
CREATE TABLE IF NOT EXISTS historical_enrollments (
  id SERIAL PRIMARY KEY,
  original_enrollment_id INTEGER,
  user_id INTEGER,
  class_id INTEGER,
  session_id INTEGER,
  historical_session_id INTEGER REFERENCES historical_sessions(id),
  payment_status VARCHAR(20),
  enrollment_status VARCHAR(20),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by INTEGER,
  enrolled_at TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_reason VARCHAR(100)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_deleted_at ON classes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_class_sessions_deleted_at ON class_sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_historical_sessions_class_id ON historical_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_historical_sessions_original_id ON historical_sessions(original_session_id);
CREATE INDEX IF NOT EXISTS idx_historical_enrollments_class_id ON historical_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_historical_enrollments_user_id ON historical_enrollments(user_id);

-- Add comments for documentation
COMMENT ON TABLE historical_sessions IS 'Preserves session data when sessions are deleted or modified';
COMMENT ON TABLE historical_enrollments IS 'Preserves enrollment data when sessions are deleted or modified';
COMMENT ON COLUMN classes.deleted_at IS 'Soft delete timestamp - records are not actually deleted';
COMMENT ON COLUMN class_sessions.deleted_at IS 'Soft delete timestamp - records are not actually deleted'; 