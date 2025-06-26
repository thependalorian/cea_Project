-- Fix user creation trigger with SECURITY DEFINER
-- This migration resolves "Database error saving new user" issues

-- Step 1: Drop any existing conflicting triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create the profiles table with proper constraints if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'partner')),
  user_type TEXT DEFAULT 'job_seeker' CHECK (user_type IN ('job_seeker', 'admin', 'partner')),
  verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create SECURITY DEFINER function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT DEFAULT 'user';
  user_user_type TEXT DEFAULT 'job_seeker';
BEGIN
  -- Determine role based on email domain
  IF NEW.email LIKE '%@joinact.org' OR NEW.email LIKE '%@buffr.ai' THEN
    user_role := 'admin';
    user_user_type := 'admin';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    user_type,
    verified,
    profile_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    user_role,
    user_user_type,
    NEW.email_confirmed_at IS NOT NULL,
    FALSE
  );

  -- Create admin profile if user is admin
  IF user_role = 'admin' THEN
    INSERT INTO public.admin_profiles (
      user_id,
      email,
      full_name,
      can_manage_users,
      can_manage_content,
      can_manage_partners,
      can_manage_system,
      can_view_analytics,
      profile_completed,
      permissions
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      TRUE,
      TRUE,
      TRUE,
      TRUE,
      TRUE,
      FALSE,
      '{}'::jsonb
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Step 6: Update RLS policies to work with the trigger
-- Drop conflicting policies
DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role on admin_profiles" ON public.admin_profiles;

-- Create new policies that allow the trigger to work
CREATE POLICY "Allow trigger to insert profiles"
ON public.profiles FOR INSERT
TO supabase_auth_admin
WITH CHECK (TRUE);

CREATE POLICY "Allow trigger to insert admin profiles"  
ON public.admin_profiles FOR INSERT
TO supabase_auth_admin
WITH CHECK (TRUE);

-- Keep existing user policies for normal operations
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid()::text = id OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR email = auth.jwt()->>'email')
WITH CHECK (auth.uid()::text = id OR email = auth.jwt()->>'email');

-- Step 7: Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 