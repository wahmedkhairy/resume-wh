
-- Add email_notifications column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Create RLS policies for user_settings if they don't exist
DO $$ 
BEGIN
    -- Check if RLS is enabled, if not enable it
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can view their own settings'
    ) THEN
        CREATE POLICY "Users can view their own settings" 
        ON public.user_settings 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can update their own settings'
    ) THEN
        CREATE POLICY "Users can update their own settings" 
        ON public.user_settings 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can insert their own settings'
    ) THEN
        CREATE POLICY "Users can insert their own settings" 
        ON public.user_settings 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
