
-- Add projects column to resumes table
ALTER TABLE public.resumes 
ADD COLUMN projects jsonb DEFAULT '[]'::jsonb;
