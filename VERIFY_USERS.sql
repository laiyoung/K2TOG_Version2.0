-- =====================================================
-- Verify Users After Seed Script
-- =====================================================
-- Run this to check if users exist and their roles
-- =====================================================

-- Check all users and their roles
SELECT 'All Users:' as info;
SELECT id, email, first_name, last_name, role, status FROM users ORDER BY role, first_name;

-- Check specifically for users with role 'user'
SELECT 'Users with role "user":' as info;
SELECT id, email, first_name, last_name, role, status FROM users WHERE role = 'user' ORDER BY first_name;

-- Check specifically for users with role 'student'
SELECT 'Users with role "student":' as info;
SELECT id, email, first_name, last_name, role, status FROM users WHERE role = 'student' ORDER BY first_name;

-- Check specifically for users with role 'admin'
SELECT 'Users with role "admin":' as info;
SELECT id, email, first_name, last_name, role, status FROM users WHERE role = 'admin' ORDER BY first_name;

-- Check specifically for users with role 'instructor'
SELECT 'Users with role "instructor":' as info;
SELECT id, email, first_name, last_name, role, status FROM users WHERE role = 'instructor' ORDER BY first_name;

-- Count users by role
SELECT 'User Count by Role:' as info;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;

-- =====================================================
-- Verification Complete!
-- ===================================================== 