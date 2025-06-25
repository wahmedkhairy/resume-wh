
-- Check the current constraint on the subscriptions table
SELECT conname, pg_get_constraintdef(c.oid) 
FROM pg_constraint c 
JOIN pg_class t ON c.conrelid = t.oid 
WHERE t.relname = 'subscriptions' AND contype = 'c';

-- Drop the existing tier check constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

-- Create a new check constraint that includes all valid tier values
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tier_check 
CHECK (tier IN ('demo', 'basic', 'premium', 'unlimited'));

-- Verify the constraint was updated correctly
SELECT conname, pg_get_constraintdef(c.oid) 
FROM pg_constraint c 
JOIN pg_class t ON c.conrelid = t.oid 
WHERE t.relname = 'subscriptions' AND contype = 'c';
