
-- Add missing columns to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_auth BOOLEAN DEFAULT false;
