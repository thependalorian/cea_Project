-- Climate Economy Ecosystem Extension Migration
-- Extends existing system with partner profiles, knowledge base, and resource management
-- Updated June 2025 - Compatible with seed script requirements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Ensure profiles table exists with all required columns
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  user_type TEXT DEFAULT 'user',
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add partner-specific columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partnership_level TEXT DEFAULT 'standard';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS climate_focus TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';

-- 2. Create knowledge_resources table for ingested content
CREATE TABLE IF NOT EXISTS knowledge_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'webpage', 'pdf', 'document', 'job_training', 'internship'
  content TEXT NOT NULL,
  source_url TEXT,
  file_path TEXT,
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  domain TEXT, -- 'clean_energy', 'workforce_development', 'career_pathways', 'equity', 'policy'
  topics TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{}', -- 'veterans', 'ej_communities', 'international_professionals'
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create job_listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  location TEXT,
  employment_type TEXT, -- 'full_time', 'part_time', 'contract', 'internship'
  experience_level TEXT, -- 'entry_level', 'mid_level', 'senior_level'
  salary_range TEXT,
  climate_focus TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  benefits TEXT,
  application_url TEXT,
  application_email TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create education_programs table
CREATE TABLE IF NOT EXISTS education_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  description TEXT NOT NULL,
  program_type TEXT, -- 'certificate', 'degree', 'bootcamp', 'workshop', 'online_course'
  duration TEXT,
  format TEXT, -- 'in_person', 'online', 'hybrid'
  cost TEXT,
  prerequisites TEXT,
  climate_focus TEXT[] DEFAULT '{}',
  skills_taught TEXT[] DEFAULT '{}',
  certification_offered TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  contact_info JSONB DEFAULT '{}',
  application_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create user_interests table for personalization
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  climate_focus TEXT[] DEFAULT '{}',
  career_stage TEXT, -- 'entry_level', 'career_change', 'mid_career', 'senior_level'
  target_roles TEXT[] DEFAULT '{}',
  preferred_location TEXT,
  employment_preferences JSONB DEFAULT '{}',
  skills_to_develop TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 6. Create resource_views table for analytics
CREATE TABLE IF NOT EXISTS resource_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_id UUID NOT NULL REFERENCES knowledge_resources(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'knowledge_resource', 'job_listing', 'education_program'
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT,
  referrer TEXT
);

-- 7. Set up Row Level Security policies

-- Profiles policies (if not already set)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON profiles
  FOR ALL
  USING (id = auth.uid());

-- Knowledge Resources policies
ALTER TABLE knowledge_resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published knowledge resources" ON knowledge_resources;
DROP POLICY IF EXISTS "Partners can manage their own knowledge resources" ON knowledge_resources;
DROP POLICY IF EXISTS "Admins can manage all knowledge resources" ON knowledge_resources;

CREATE POLICY "Anyone can view published knowledge resources"
  ON knowledge_resources
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Partners can manage their own knowledge resources"
  ON knowledge_resources
  FOR ALL
  USING (partner_id = auth.uid());

CREATE POLICY "Admins can manage all knowledge resources"
  ON knowledge_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR user_type = 'admin')
    )
  );

-- Job Listings policies
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active job listings" ON job_listings;
DROP POLICY IF EXISTS "Partners can manage their own job listings" ON job_listings;

CREATE POLICY "Anyone can view active job listings"
  ON job_listings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Partners can manage their own job listings"
  ON job_listings
  FOR ALL
  USING (
    partner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR user_type = 'admin')
    )
  );

-- Education Programs policies
ALTER TABLE education_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active education programs" ON education_programs;
DROP POLICY IF EXISTS "Partners can manage their own education programs" ON education_programs;

CREATE POLICY "Anyone can view active education programs"
  ON education_programs
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Partners can manage their own education programs"
  ON education_programs
  FOR ALL
  USING (
    partner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR user_type = 'admin')
    )
  );

-- User Interests policies
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own interests" ON user_interests;

CREATE POLICY "Users can manage their own interests"
  ON user_interests
  FOR ALL
  USING (user_id = auth.uid());

-- Resource Views policies
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own resource views" ON resource_views;
DROP POLICY IF EXISTS "Anyone can insert resource views" ON resource_views;
DROP POLICY IF EXISTS "Admins can view all resource views" ON resource_views;

CREATE POLICY "Users can view their own resource views"
  ON resource_views
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert resource views"
  ON resource_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all resource views"
  ON resource_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR user_type = 'admin')
    )
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_partner_id ON knowledge_resources(partner_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_domain ON knowledge_resources(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_categories ON knowledge_resources USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_tags ON knowledge_resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_published ON knowledge_resources(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_listings_partner_id ON job_listings(partner_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_active ON job_listings(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_climate_focus ON job_listings USING GIN(climate_focus);
CREATE INDEX IF NOT EXISTS idx_job_listings_location ON job_listings(location);

CREATE INDEX IF NOT EXISTS idx_education_programs_partner_id ON education_programs(partner_id);
CREATE INDEX IF NOT EXISTS idx_education_programs_active ON education_programs(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_education_programs_climate_focus ON education_programs USING GIN(climate_focus);

CREATE INDEX IF NOT EXISTS idx_resource_views_user_id ON resource_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource ON resource_views(resource_id, resource_type);

CREATE INDEX IF NOT EXISTS idx_profiles_organization_type ON profiles(organization_type);
CREATE INDEX IF NOT EXISTS idx_profiles_climate_focus ON profiles USING GIN(climate_focus);

-- 9. Create functions for knowledge base search
CREATE OR REPLACE FUNCTION match_knowledge_resources(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_domain TEXT DEFAULT NULL,
  filter_categories TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  resource_id UUID,
  title TEXT,
  description TEXT,
  content TEXT,
  similarity FLOAT,
  domain TEXT,
  categories TEXT[],
  partner_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kr.id as resource_id,
    kr.title,
    kr.description,
    substring(kr.content, 1, 500) as content,
    1 - (kr.embedding <=> query_embedding) AS similarity,
    kr.domain,
    kr.categories,
    p.organization_name as partner_name
  FROM
    knowledge_resources kr
  LEFT JOIN
    profiles p ON kr.partner_id = p.id
  WHERE
    kr.is_published = true
  AND
    kr.embedding IS NOT NULL
  AND
    1 - (kr.embedding <=> query_embedding) > match_threshold
  AND
    (filter_domain IS NULL OR kr.domain = filter_domain)
  AND
    (filter_categories IS NULL OR kr.categories && filter_categories)
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$;

-- 10. Create function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_personalized_resources(
  user_id_param UUID,
  filter_type TEXT DEFAULT 'all', -- 'knowledge', 'jobs', 'education', 'all'
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  resource_id UUID,
  resource_type TEXT,
  title TEXT,
  description TEXT,
  relevance_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_climate_focus TEXT[];
  user_career_stage TEXT;
BEGIN
  -- Get user interests
  SELECT ui.climate_focus, ui.career_stage
  INTO user_climate_focus, user_career_stage
  FROM user_interests ui
  WHERE ui.user_id = user_id_param;

  -- If no interests found, return general results
  IF user_climate_focus IS NULL THEN
    user_climate_focus := ARRAY[]::TEXT[];
  END IF;

  RETURN QUERY
  -- Knowledge resources
  SELECT 
    kr.id as resource_id,
    'knowledge'::TEXT as resource_type,
    kr.title,
    kr.description,
    CASE 
      WHEN kr.climate_focus && user_climate_focus THEN 1.0
      ELSE 0.5
    END as relevance_score
  FROM knowledge_resources kr
  WHERE 
    kr.is_published = true
  AND 
    (filter_type = 'all' OR filter_type = 'knowledge')
  
  UNION ALL
  
  -- Job listings
  SELECT 
    jl.id as resource_id,
    'job'::TEXT as resource_type,
    jl.title,
    jl.description,
    CASE 
      WHEN jl.climate_focus && user_climate_focus THEN 1.0
      WHEN jl.experience_level = user_career_stage THEN 0.8
      ELSE 0.5
    END as relevance_score
  FROM job_listings jl
  WHERE 
    jl.is_active = true
  AND 
    (filter_type = 'all' OR filter_type = 'jobs')
  
  UNION ALL
  
  -- Education programs
  SELECT 
    ep.id as resource_id,
    'education'::TEXT as resource_type,
    ep.program_name as title,
    ep.description,
    CASE 
      WHEN ep.climate_focus && user_climate_focus THEN 1.0
      ELSE 0.5
    END as relevance_score
  FROM education_programs ep
  WHERE 
    ep.is_active = true
  AND 
    (filter_type = 'all' OR filter_type = 'education')
  
  ORDER BY relevance_score DESC, title
  LIMIT limit_count;
END;
$$;

-- 11. Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_knowledge_resources_updated_at ON knowledge_resources;
DROP TRIGGER IF EXISTS update_job_listings_updated_at ON job_listings;
DROP TRIGGER IF EXISTS update_education_programs_updated_at ON education_programs;
DROP TRIGGER IF EXISTS update_user_interests_updated_at ON user_interests;

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_resources_updated_at
  BEFORE UPDATE ON knowledge_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_programs_updated_at
  BEFORE UPDATE ON education_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_interests_updated_at
  BEFORE UPDATE ON user_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Clean up any existing test data (script will create proper records)
-- Delete any existing knowledge resources from previous test runs
DELETE FROM knowledge_resources WHERE partner_id IN (
  SELECT id FROM profiles WHERE email IN ('tps@example.com', 'franklin@example.com')
);

-- Delete any existing test profiles (script will create proper ones with auth.users)
DELETE FROM profiles WHERE email IN ('tps@example.com', 'franklin@example.com');

-- Note: The Python seed script will create proper auth.users and profiles records
-- with matching IDs that satisfy the foreign key constraints

-- Final verification queries (commented out for SQL editor)
-- SELECT 'Schema update completed successfully' as status;
-- SELECT table_name, column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'climate_focus';
-- SELECT COUNT(*) as total_tables FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

COMMENT ON TABLE profiles IS 'Extended profiles table with partner organization information for climate economy ecosystem';
COMMENT ON TABLE knowledge_resources IS 'AI-optimized knowledge base with vector embeddings for semantic search';
COMMENT ON TABLE job_listings IS 'Climate-focused job opportunities from partner organizations';
COMMENT ON TABLE education_programs IS 'Training and education programs in clean energy sector';
COMMENT ON COLUMN knowledge_resources.embedding IS 'Vector embedding for semantic similarity search using OpenAI text-embedding-3-small model'; 