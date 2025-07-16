
-- Create a table to track resume fixing and export usage
CREATE TABLE public.resume_fix_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  fix_used_count INTEGER NOT NULL DEFAULT 0,
  export_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.resume_fix_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own usage data
CREATE POLICY "Users can view their own resume fix usage" 
  ON public.resume_fix_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume fix usage" 
  ON public.resume_fix_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume fix usage" 
  ON public.resume_fix_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to increment resume fix usage
CREATE OR REPLACE FUNCTION public.increment_resume_fix_usage(user_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
BEGIN
  -- Insert or update usage record
  INSERT INTO public.resume_fix_usage (user_id, fix_used_count)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    fix_used_count = resume_fix_usage.fix_used_count + 1,
    updated_at = now();
  
  -- Return current count
  SELECT fix_used_count INTO current_count
  FROM public.resume_fix_usage 
  WHERE user_id = user_uuid;
  
  RETURN current_count;
END;
$function$

-- Function to increment export usage
CREATE OR REPLACE FUNCTION public.increment_export_usage(user_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
BEGIN
  -- Insert or update usage record
  INSERT INTO public.resume_fix_usage (user_id, export_count)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    export_count = resume_fix_usage.export_count + 1,
    updated_at = now();
  
  -- Return current count
  SELECT export_count INTO current_count
  FROM public.resume_fix_usage 
  WHERE user_id = user_uuid;
  
  RETURN current_count;
END;
$function$
