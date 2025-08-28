-- Migration: Add performance indexes for notifications
-- This migration adds indexes to improve notification query performance

-- Add index for user_notifications table to improve broadcast queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_type_sender_created 
ON user_notifications(type, sender_id, created_at);

-- Add index for user_notifications table to improve user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id_created 
ON user_notifications(user_id, created_at DESC);

-- Add index for users table to improve status-based queries
CREATE INDEX IF NOT EXISTS idx_users_status_active 
ON users(status) WHERE status = 'active';

-- Add index for notification_templates table
CREATE INDEX IF NOT EXISTS idx_notification_templates_name 
ON notification_templates(name);

-- Add composite index for better notification filtering
CREATE INDEX IF NOT EXISTS idx_user_notifications_composite 
ON user_notifications(user_id, type, is_read, created_at DESC);

-- Add index for metadata JSONB queries (if using PostgreSQL 9.4+)
-- CREATE INDEX IF NOT EXISTS idx_user_notifications_metadata_gin 
-- ON user_notifications USING GIN (metadata);

COMMENT ON INDEX idx_user_notifications_type_sender_created IS 'Improves queries for broadcast notifications by sender';
COMMENT ON INDEX idx_user_notifications_user_id_created IS 'Improves queries for user-specific notifications';
COMMENT ON INDEX idx_users_status_active IS 'Improves queries for active users in broadcasts';
COMMENT ON INDEX idx_notification_templates_name IS 'Improves template lookup performance';
COMMENT ON INDEX idx_user_notifications_composite IS 'Improves complex notification filtering queries';
