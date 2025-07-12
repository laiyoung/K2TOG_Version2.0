-- Fix waitlist status constraint to allow 'waiting' status
ALTER TABLE class_waitlist DROP CONSTRAINT IF EXISTS class_waitlist_status_check;
ALTER TABLE class_waitlist ADD CONSTRAINT class_waitlist_status_check 
CHECK (status IN ('waiting', 'pending', 'approved', 'rejected', 'cancelled')); 