-- Add privacy settings to existing user_interests table
-- Migration: 20241220000000_add_privacy_settings.sql

-- Add privacy and preference columns to user_interests table
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS social_profile_analysis_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS data_sharing_enabled BOOLEAN DEFAULT false;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS marketing_emails_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS job_alerts_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS partner_updates_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add constraint for theme preference
ALTER TABLE user_interests ADD CONSTRAINT check_theme_preference 
  CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Create function to auto-create default user interests for new users if not exists
CREATE OR REPLACE FUNCTION public.create_default_user_interests()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_interests (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user interests on signup (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created_interests ON auth.users;
CREATE TRIGGER on_auth_user_created_interests
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_user_interests(); 