-- Add end_date column to class_sessions table
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN class_sessions.end_date IS 'End date for multi-day sessions. If NULL, session is single-day.'; 