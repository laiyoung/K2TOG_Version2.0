-- =====================================================
-- Identify Duplicate Users (Safe - No Deletion)
-- =====================================================
-- This script only identifies duplicates without removing them
-- =====================================================

-- Check for duplicate emails
SELECT 'Duplicate emails found:' as info;
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1 
ORDER BY count DESC;

-- Show detailed information about duplicate users
SELECT 'Detailed duplicate user information:' as info;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    status,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as duplicate_rank
FROM users 
WHERE email IN (
    SELECT email 
    FROM users 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
ORDER BY email, created_at;

-- Show which records would be kept vs deleted
SELECT 'Records that would be KEPT (oldest per email):' as info;
WITH duplicates AS (
    SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        status,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
    FROM users
    WHERE email IN (
        SELECT email 
        FROM users 
        GROUP BY email 
        HAVING COUNT(*) > 1
    )
)
SELECT id, email, first_name, last_name, role, status, created_at
FROM duplicates 
WHERE rn = 1
ORDER BY email;

SELECT 'Records that would be DELETED (newer duplicates):' as info;
WITH duplicates AS (
    SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        status,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
    FROM users
    WHERE email IN (
        SELECT email 
        FROM users 
        GROUP BY email 
        HAVING COUNT(*) > 1
    )
)
SELECT id, email, first_name, last_name, role, status, created_at
FROM duplicates 
WHERE rn > 1
ORDER BY email;

-- Show current user count by role
SELECT 'Current user count by role:' as info;
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;

-- =====================================================
-- Identification Complete - No changes made!
-- =====================================================
-- Run REMOVE_DUPLICATES.sql to actually remove duplicates
-- ===================================================== 