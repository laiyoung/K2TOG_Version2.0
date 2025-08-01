-- =====================================================
-- Remove Specific Admin User
-- =====================================================
-- Replace 'admin@example.com' with the email you want to remove
-- =====================================================

-- Show current admin users
SELECT 'Current admin users:' as info;
SELECT id, email, first_name, last_name, role, status, created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- Remove specific admin user (replace email below)
DELETE FROM users 
WHERE email = 'admin@example.com' 
AND role = 'admin';

-- Show remaining admin users
SELECT 'Remaining admin users:' as info;
SELECT id, email, first_name, last_name, role, status, created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- =====================================================
-- Admin User Removed!
-- ===================================================== 