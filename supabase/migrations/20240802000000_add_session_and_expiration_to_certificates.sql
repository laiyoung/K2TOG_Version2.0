-- Add session_id and expiration_date columns to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES class_sessions(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_certificates_session_id ON certificates(session_id);
CREATE INDEX IF NOT EXISTS idx_certificates_expiration_date ON certificates(expiration_date);

-- Add comments for better documentation
COMMENT ON COLUMN certificates.session_id IS 'Reference to the specific class session this certificate is for';
COMMENT ON COLUMN certificates.expiration_date IS 'Date when this certificate expires. NULL means no expiration'; 