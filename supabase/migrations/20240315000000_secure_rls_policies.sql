-- Secure RLS Policies Migration
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users on admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Enable read access for all users on job_seeker_profiles" ON public.job_seeker_profiles;

-- Profiles table policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid()::text = id OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR email = auth.jwt()->>'email')
WITH CHECK (auth.uid()::text = id OR email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = auth.jwt()->>'email' 
    AND role = 'admin'
  )
);

-- Admin profiles table policies
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = auth.jwt()->>'email' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update own admin profile"
ON public.admin_profiles FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email');

-- Job seeker profiles table policies
CREATE POLICY "Users can view own job seeker profile"
ON public.job_seeker_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = auth.jwt()->>'email' 
    AND id = user_id
  )
);

CREATE POLICY "Users can update own job seeker profile"
ON public.job_seeker_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = auth.jwt()->>'email' 
    AND id = user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = auth.jwt()->>'email' 
    AND id = user_id
  )
);

-- Conversations table policies (if exists)
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Messages table policies (if exists)
CREATE POLICY "Users can view messages in own conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can create messages in own conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND user_id = auth.uid()::text
  )
); 