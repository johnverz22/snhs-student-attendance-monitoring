-- Fix push_tokens table schema if is_active column is wrong type

-- Check current column type
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'push_tokens' 
AND column_name = 'is_active';

-- If the above shows data_type as 'integer' instead of 'boolean', run this:
-- ALTER TABLE push_tokens ALTER COLUMN is_active TYPE boolean USING is_active::boolean;

-- If you need to recreate the table with correct schema:
/*
-- Backup existing data
CREATE TABLE push_tokens_backup AS SELECT * FROM push_tokens;

-- Drop and recreate table
DROP TABLE push_tokens;

CREATE TABLE push_tokens (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, device_token)
);

-- Create indexes
CREATE INDEX idx_push_tokens_parent_id ON push_tokens(parent_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active);

-- Restore data (convert integer to boolean)
INSERT INTO push_tokens (id, parent_id, device_token, platform, is_active, created_at, updated_at)
SELECT id, parent_id, device_token, platform, 
       CASE WHEN is_active = 1 THEN true ELSE false END,
       created_at, updated_at
FROM push_tokens_backup;

-- Drop backup
DROP TABLE push_tokens_backup;

-- Reset sequence
SELECT setval('push_tokens_id_seq', (SELECT MAX(id) FROM push_tokens));
*/