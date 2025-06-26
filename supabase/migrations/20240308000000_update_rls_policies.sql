-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for service role"
ON public.profiles FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable update for users based on email"
ON public.profiles FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email');

-- Same for admin_profiles and job_seeker_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on admin_profiles"
ON public.admin_profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for service role on admin_profiles"
ON public.admin_profiles FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable read access for all users on job_seeker_profiles"
ON public.job_seeker_profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for service role on job_seeker_profiles"
ON public.job_seeker_profiles FOR INSERT
TO service_role
WITH CHECK (true); 