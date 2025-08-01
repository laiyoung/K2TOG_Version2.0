-- =====================================================
-- Debug API Test Script
-- =====================================================
-- Run this to test if your database and API are working
-- =====================================================

-- 1. Check if users exist
SELECT 'Users in database:' as info;
SELECT id, email, first_name, last_name, role, status FROM users;

-- 2. Check specifically for users with role 'user'
SELECT 'Users with role "user":' as info;
SELECT id, email, first_name, last_name, role, status FROM users WHERE role = 'user';

-- 3. Check if classes exist
SELECT 'Classes in database:' as info;
SELECT id, title FROM classes;

-- 4. Check if admin user exists
SELECT 'Admin users:' as info;
SELECT id, email, first_name, last_name, role FROM users WHERE role = 'admin';

-- 5. Test the exact query that the API uses
SELECT 'API Query Test (users with role "user"):' as info;
SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC; 