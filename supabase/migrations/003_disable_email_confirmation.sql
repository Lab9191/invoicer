-- Migration: Disable email confirmation for development
-- This allows users to log in immediately after signup without email verification
--
-- IMPORTANT: This is for DEVELOPMENT only!
-- For PRODUCTION, you should enable email confirmation in Supabase dashboard:
-- Authentication -> Settings -> Enable email confirmations

-- Note: Email confirmation settings are controlled in Supabase Dashboard, not via SQL
-- This file is a placeholder reminder to configure it properly

-- For development:
-- 1. Go to Supabase Dashboard
-- 2. Authentication -> Settings
-- 3. Uncheck "Enable email confirmations" (for development only)
-- 4. Set session timeout as needed

-- The auth.signUp function in the code now includes auto-confirm for development
-- But you still need to disable it in Supabase Dashboard for it to work fully

COMMENT ON SCHEMA auth IS 'Development mode: Email confirmation disabled. Remember to enable for production!';
