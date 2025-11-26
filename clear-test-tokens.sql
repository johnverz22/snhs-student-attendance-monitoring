-- Clear test FCM tokens from database
-- Run this on your PostgreSQL database

-- Show current tokens
SELECT id, parent_id, device_token, platform, is_active, created_at 
FROM push_tokens 
WHERE parent_id = 2;

-- Delete test tokens (tokens starting with 'test_fcm')
DELETE FROM push_tokens 
WHERE parent_id = 2 
AND device_token LIKE 'test_fcm%';

-- Verify deletion
SELECT id, parent_id, device_token, platform, is_active, created_at 
FROM push_tokens 
WHERE parent_id = 2;

-- Expected result: No rows (all test tokens deleted)
-- Now the parent app can register a real FCM token
