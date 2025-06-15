
-- Fix the search_path warnings for database functions
-- This sets a secure search_path for all functions to prevent potential security issues

-- Update cleanup_expired_tailored_resumes function
CREATE OR REPLACE FUNCTION public.cleanup_expired_tailored_resumes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.tailored_resumes 
  WHERE expires_at < now();
END;
$$;

-- Update reset_monthly_tailoring_usage function
CREATE OR REPLACE FUNCTION public.reset_monthly_tailoring_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tailoring_usage 
  SET monthly_count = 0, last_reset_date = now()
  WHERE last_reset_date < date_trunc('month', now());
END;
$$;

-- Update increment_tailoring_usage function
CREATE OR REPLACE FUNCTION public.increment_tailoring_usage(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Reset monthly count if needed
  PERFORM public.reset_monthly_tailoring_usage();
  
  -- Insert or update usage record
  INSERT INTO public.tailoring_usage (user_id, monthly_count)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    monthly_count = tailoring_usage.monthly_count + 1,
    last_reset_date = CASE 
      WHEN tailoring_usage.last_reset_date < date_trunc('month', now()) 
      THEN now() 
      ELSE tailoring_usage.last_reset_date 
    END;
  
  -- Return current count
  SELECT monthly_count INTO current_count
  FROM public.tailoring_usage 
  WHERE user_id = user_uuid;
  
  RETURN current_count;
END;
$$;

-- Update handle_new_user function (if it exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.subscriptions (user_id, tier, max_scans)
  VALUES (new.id, 'demo', 2);
  
  RETURN new;
END;
$$;
