-- Add user preferences table for privacy and settings
-- Migration: 20241220000000_add_user_preferences.sql

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Privacy Settings
  social_profile_analysis_enabled BOOLEAN DEFAULT true,
  data_sharing_enabled BOOLEAN DEFAULT false,
  marketing_emails_enabled BOOLEAN DEFAULT true,
  newsletter_enabled BOOLEAN DEFAULT true,
  
  -- Notification Settings
  email_notifications BOOLEAN DEFAULT true,
  job_alerts_enabled BOOLEAN DEFAULT true,
  partner_updates_enabled BOOLEAN DEFAULT true,
  
  -- Other Settings
  theme_preference TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
  language_preference TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create default preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_user_preferences();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_user_preferences_updated_at(); 