-- =====================================================
-- Remove Duplicate Users
-- =====================================================
-- This script identifies and removes duplicate users
-- =====================================================

-- First, let's see what duplicates exist
SELECT 'Checking for duplicate emails:' as info;
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1 
ORDER BY count DESC;

-- Show all users with duplicate emails
SELECT 'All users with duplicate emails:' as info;
SELECT id, email, first_name, last_name, role, status, created_at
FROM users 
WHERE email IN (
    SELECT email 
    FROM users 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
ORDER BY email, created_at;

-- Remove duplicates (keep the oldest record for each email)
-- This creates a temporary table with the IDs to delete
WITH duplicates_to_remove AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
    FROM users
    WHERE email IN (
        SELECT email 
        FROM users 
        GROUP BY email 
        HAVING COUNT(*) > 1
    )
)
DELETE FROM users 
WHERE id IN (
    SELECT id 
    FROM duplicates_to_remove 
    WHERE rn > 1
);

-- Verify duplicates are removed
SELECT 'After removing duplicates - checking for duplicate emails:' as info;
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1 
ORDER BY count DESC;

-- Show final user count by role
SELECT 'Final user count by role:' as info;
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;

-- Show all remaining users
SELECT 'All remaining users:' as info;
SELECT id, email, first_name, last_name, role, status, created_at
FROM users 
ORDER BY role, first_name;

-- =====================================================
-- Duplicate Removal Complete!
-- ===================================================== 