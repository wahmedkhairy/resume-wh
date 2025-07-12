
-- Insert the admin user profile if it doesn't exist
INSERT INTO public.profiles (id, email) 
SELECT 'a0000000-0000-0000-0000-000000000000'::uuid, 'w.ahmedkhairy@gmail.com'
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'w.ahmedkhairy@gmail.com'
);

-- Create an admin_users table to store admin privileges
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users table (only admins can access)
CREATE POLICY "Only admins can access admin_users" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Insert the admin user
INSERT INTO public.admin_users (email, user_id) 
VALUES ('w.ahmedkhairy@gmail.com', 'a0000000-0000-0000-0000-000000000000')
ON CONFLICT (email) DO NOTHING;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.admin_users au
        JOIN public.profiles p ON p.email = au.email
        WHERE CASE 
            WHEN user_email IS NULL THEN p.id = auth.uid()
            ELSE au.email = user_email
        END
    );
$$;

-- Update profiles table to allow admin access for user management
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Update subscriptions table to allow admin access for plan management  
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
    FOR UPDATE USING (public.is_admin());

-- Update resumes table to allow admin read access
CREATE POLICY "Admins can view all resumes" ON public.resumes
    FOR SELECT USING (public.is_admin());
