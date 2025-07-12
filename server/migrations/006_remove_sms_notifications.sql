-- Remove SMS notifications column from users table
ALTER TABLE users DROP COLUMN IF EXISTS sms_notifications; 