-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  certificate_name VARCHAR(255) NOT NULL,
  certificate_url VARCHAR(255),
  cloudinary_id VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  verification_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for certificates table
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_class_id ON certificates(class_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);

-- Create trigger for certificates updated_at
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for better documentation
COMMENT ON TABLE certificates IS 'Stores user certificates and their verification details';
COMMENT ON COLUMN certificates.verification_code IS 'Unique code for verifying certificate authenticity';
COMMENT ON COLUMN certificates.cloudinary_id IS 'Cloudinary storage ID for the certificate file';
COMMENT ON COLUMN certificates.metadata IS 'Additional certificate metadata in JSON format'; 