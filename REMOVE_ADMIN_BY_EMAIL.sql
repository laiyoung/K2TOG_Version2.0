-- =====================================================
-- Remove Admin User by Email
-- =====================================================
-- This script removes a specific admin user by email address
-- =====================================================

-- First, let's see all admin users
SELECT 'Current admin users:' as info;
SELECT id, email, first_name, last_name, role, status, created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- Replace 'admin@example.com' with the email you want to remove
-- Uncomment and modify the email address below:

-- DELETE FROM users WHERE email = 'admin@example.com' AND role = 'admin';

-- Or use this safer version that shows what would be deleted first:
-- SELECT 'This admin user would be deleted:' as info;
-- SELECT id, email, first_name, last_name, role, status, created_at
-- FROM users 
-- WHERE email = 'admin@example.com' AND role = 'admin';

-- =====================================================
-- Instructions:
-- =====================================================
-- 1. Replace 'admin@example.com' with the actual email you want to remove
-- 2. Uncomment the DELETE statement above
-- 3. Run the script
-- =====================================================

-- Example: To remove admin@example.com, uncomment this line:
-- DELETE FROM users WHERE email = 'admin@example.com' AND role = 'admin';

-- Example: To remove admin@yjchildcare.com, uncomment this line:
-- DELETE FROM users WHERE email = 'admin@yjchildcare.com' AND role = 'admin';

-- =====================================================
-- Safety Check - Show remaining admin users after deletion
-- =====================================================
-- Uncomment this to see remaining admins after deletion:
-- SELECT 'Remaining admin users:' as info;
-- SELECT id, email, first_name, last_name, role, status, created_at
-- FROM users 
-- WHERE role = 'admin'
-- ORDER BY created_at;

-- =====================================================
-- Remove Admin User by Email - Complete!
-- ===================================================== 