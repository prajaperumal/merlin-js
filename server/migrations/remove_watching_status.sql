-- Migration: Remove "watching" status from watchstream_movies
-- This script updates any existing "watching" records to "backlog"

-- Update existing "watching" records to "backlog"
UPDATE watchstream_movies 
SET watch_status = 'backlog' 
WHERE watch_status = 'watching';

-- Optional: Add check constraint to prevent "watching" values in the future
-- Uncomment the following lines if you want to enforce this at the database level:
-- ALTER TABLE watchstream_movies
-- DROP CONSTRAINT IF EXISTS watch_status_check;
-- 
-- ALTER TABLE watchstream_movies
-- ADD CONSTRAINT watch_status_check 
-- CHECK (watch_status IN ('backlog', 'watched'));
