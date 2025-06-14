
-- Create table to store job descriptions and tailoring sessions
CREATE TABLE public.tailored_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  job_description TEXT NOT NULL,
  tailored_content JSONB NOT NULL,
  original_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '48 hours')
);

-- Create table to track tailoring usage per user
CREATE TABLE public.tailoring_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  monthly_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tailored_resumes
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tailored resumes" 
  ON public.tailored_resumes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tailored resumes" 
  ON public.tailored_resumes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tailored resumes" 
  ON public.tailored_resumes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tailored resumes" 
  ON public.tailored_resumes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for tailoring_usage
ALTER TABLE public.tailoring_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tailoring usage" 
  ON public.tailoring_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tailoring usage" 
  ON public.tailoring_usage 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Function to clean up expired tailored resumes
CREATE OR REPLACE FUNCTION public.cleanup_expired_tailored_resumes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.tailored_resumes 
  WHERE expires_at < now();
END;
$$;

-- Function to reset monthly usage counts
CREATE OR REPLACE FUNCTION public.reset_monthly_tailoring_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tailoring_usage 
  SET monthly_count = 0, last_reset_date = now()
  WHERE last_reset_date < date_trunc('month', now());
END;
$$;

-- Function to increment tailoring usage
CREATE OR REPLACE FUNCTION public.increment_tailoring_usage(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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
