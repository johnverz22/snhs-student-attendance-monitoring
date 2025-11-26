-- Check what FCM tokens are currently in the database for parent 2

-- View all tokens for parent 2
SELECT 
    id,
    parent_id,
    LEFT(device_token, 60) as token_preview,
    platform,
    is_active,
    created_at,
    updated_at
FROM push_tokens 
WHERE parent_id = 2
ORDER BY created_at DESC;

-- Expected output should show:
-- 1. Real FCM tokens (long, starting with random chars)
-- 2. Test tokens (starting with 'test_fcm_')

-- If you see test tokens, delete them:
-- DELETE FROM push_tokens WHERE parent_id = 2 AND device_token LIKE 'test_fcm%';

-- If you see NO tokens at all, the parent app needs to register again
-- If you see a real token but is_active = false, activate it:
-- UPDATE push_tokens SET is_active = true WHERE parent_id = 2 AND device_token NOT LIKE 'test_fcm%';
