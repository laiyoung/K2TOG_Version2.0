-- Add Supabase path column to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS supabase_path VARCHAR(255);

-- Create index for Supabase path
CREATE INDEX IF NOT EXISTS idx_certificates_supabase_path ON certificates(supabase_path);

-- Add comment for documentation
COMMENT ON COLUMN certificates.supabase_path IS 'Supabase storage path for the certificate file'; 