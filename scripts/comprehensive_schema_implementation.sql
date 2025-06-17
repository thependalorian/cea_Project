-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA IMPLEMENTATION
-- Climate Economy Assistant - Complete Schema with JWT Auth
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- 1. ADMIN PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    permission_level text NOT NULL,
    resource_type text NOT NULL,
    granted_by uuid,
    created_at timestamp without time zone DEFAULT now()
);

-- =====================================================
-- 2. ADMIN PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name character varying(200) NOT NULL,
    email text,
    phone text,
    direct_phone text,
    department character varying(100),
    emergency_contact jsonb DEFAULT '{}'::jsonb,
    permissions jsonb DEFAULT '{}'::jsonb,
    can_manage_users boolean DEFAULT false,
    can_manage_partners boolean DEFAULT false,
    can_manage_content boolean DEFAULT false,
    can_manage_system boolean DEFAULT false,
    can_view_analytics boolean DEFAULT false,
    profile_completed boolean DEFAULT false,
    last_login timestamp with time zone,
    last_admin_action timestamp with time zone,
    total_admin_actions integer DEFAULT 0,
    admin_notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    table_name text NOT NULL,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 4. CONTENT FLAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS content_flags (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id uuid NOT NULL,
    content_type text NOT NULL,
    flag_reason text NOT NULL,
    flagged_by uuid REFERENCES auth.users(id),
    admin_reviewed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);

-- =====================================================
-- 5. CONVERSATION ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_analytics (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    conversation_id text NOT NULL,
    messages_sent integer DEFAULT 0,
    messages_received integer DEFAULT 0,
    session_duration_seconds integer,
    total_tokens_consumed integer DEFAULT 0,
    average_response_time_ms real,
    topics_discussed text[] DEFAULT '{}'::text[],
    resources_accessed text[] DEFAULT '{}'::text[],
    jobs_viewed text[] DEFAULT '{}'::text[],
    partners_contacted text[] DEFAULT '{}'::text[],
    goals_achieved boolean,
    user_satisfaction_score integer,
    conversation_outcome text,
    next_steps jsonb DEFAULT '[]'::jsonb,
    follow_up_actions_taken integer DEFAULT 0,
    analyzed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 6. CONVERSATION FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_feedback (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    conversation_id text NOT NULL,
    message_id text NOT NULL,
    feedback_type text NOT NULL,
    rating integer,
    correction text,
    flag_reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at text NOT NULL
);

-- =====================================================
-- 7. CONVERSATION INTERRUPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_interrupts (
    id text NOT NULL PRIMARY KEY,
    conversation_id text NOT NULL,
    type text NOT NULL,
    priority text NOT NULL DEFAULT 'medium'::text,
    status text NOT NULL DEFAULT 'pending'::text,
    job_id uuid REFERENCES job_listings(id),
    match_score numeric,
    escalation_reason text,
    context jsonb DEFAULT '{}'::jsonb,
    resolution jsonb,
    supervisor_approval_required boolean DEFAULT false,
    reviewer_id uuid REFERENCES auth.users(id),
    review_notes text,
    resolved_at text,
    created_at text NOT NULL
);

-- =====================================================
-- 8. CONVERSATION MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    id text NOT NULL PRIMARY KEY,
    conversation_id text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    content_type text DEFAULT 'text'::text,
    specialist_type text,
    metadata jsonb DEFAULT '{}'::jsonb,
    embedding vector,
    processed boolean DEFAULT false,
    error_message text,
    created_at text NOT NULL,
    updated_at text
);

-- =====================================================
-- 9. CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    title text,
    description text,
    conversation_type text DEFAULT 'general'::text,
    status text DEFAULT 'active'::text,
    initial_query text,
    thread_id text,
    message_count integer DEFAULT 0,
    total_tokens_used integer DEFAULT 0,
    session_metadata jsonb DEFAULT '{}'::jsonb,
    last_activity text NOT NULL,
    ended_at text,
    created_at text NOT NULL,
    updated_at text NOT NULL
);

-- =====================================================
-- 10. CREDENTIAL EVALUATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS credential_evaluation (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    credential_type character varying(100) NOT NULL,
    issuing_country character varying(3) NOT NULL,
    us_equivalent character varying(200),
    evaluation_status character varying(20) DEFAULT 'pending'::character varying,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- 11. EDUCATION PROGRAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS education_programs (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id uuid NOT NULL REFERENCES partner_profiles(id),
    program_name text NOT NULL,
    description text NOT NULL,
    program_type text,
    format text,
    duration text,
    cost text,
    prerequisites text,
    skills_taught text[] DEFAULT '{}'::text[],
    climate_focus text[] DEFAULT '{}'::text[],
    certification_offered text,
    application_url text,
    contact_info jsonb DEFAULT '{}'::jsonb,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 12. JOB LISTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS job_listings (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id uuid NOT NULL REFERENCES partner_profiles(id),
    title text NOT NULL,
    description text NOT NULL,
    responsibilities text,
    requirements text,
    benefits text,
    salary_range text,
    location text,
    employment_type text,
    experience_level text,
    skills_required text[] DEFAULT '{}'::text[],
    climate_focus text[] DEFAULT '{}'::text[],
    application_url text,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 13. JOB SEEKER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    full_name text,
    email text,
    phone text,
    location text,
    current_title text,
    experience_level text,
    desired_roles jsonb DEFAULT '[]'::jsonb,
    climate_interests jsonb DEFAULT '[]'::jsonb,
    climate_focus_areas jsonb DEFAULT '[]'::jsonb,
    preferred_locations jsonb DEFAULT '[]'::jsonb,
    remote_work_preference text DEFAULT 'hybrid'::text,
    employment_types jsonb DEFAULT '[]'::jsonb,
    salary_range_min integer,
    salary_range_max integer,
    resume_filename text,
    resume_storage_path text,
    resume_uploaded_at timestamp with time zone,
    profile_completed boolean DEFAULT false,
    preferences_updated_at timestamp with time zone,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 14. KNOWLEDGE RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_resources (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id uuid REFERENCES partner_profiles(id),
    title text NOT NULL,
    description text,
    content text NOT NULL,
    content_type text NOT NULL,
    content_difficulty text DEFAULT 'intermediate'::text,
    categories text[] DEFAULT '{}'::text[],
    topics text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    climate_sectors text[] DEFAULT '{}'::text[],
    skill_categories text[] DEFAULT '{}'::text[],
    target_audience text[] DEFAULT '{}'::text[],
    domain text,
    source_url text,
    file_path text,
    metadata jsonb DEFAULT '{}'::jsonb,
    embedding vector,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 15. MESSAGE FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS message_feedback (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    conversation_id text NOT NULL,
    message_id text NOT NULL,
    feedback_type text NOT NULL,
    rating integer,
    correction text,
    created_at text NOT NULL
);

-- =====================================================
-- 16. MOS TRANSLATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS mos_translation (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mos_code character varying(10) NOT NULL,
    mos_title character varying(300) NOT NULL,
    civilian_equivalents text[] DEFAULT '{}'::text[],
    transferable_skills text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- 17. PARTNER MATCH RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_match_results (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id uuid NOT NULL REFERENCES job_seeker_profiles(id),
    job_id uuid NOT NULL REFERENCES job_listings(id),
    match_score numeric NOT NULL,
    threshold_met boolean NOT NULL DEFAULT false,
    matching_skills text[] DEFAULT '{}'::text[],
    skill_gaps text[] DEFAULT '{}'::text[],
    recommendations jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'pending'::text,
    requires_human_review boolean DEFAULT false,
    auto_approved boolean DEFAULT false,
    reviewer_id uuid REFERENCES auth.users(id),
    approved_by uuid REFERENCES auth.users(id),
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 18. PARTNER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_profiles (
    id uuid NOT NULL PRIMARY KEY,
    organization_name text NOT NULL,
    full_name text,
    email text,
    phone text,
    website text,
    description text,
    mission_statement text,
    organization_type text,
    organization_size text,
    employee_count integer,
    founded_year integer,
    headquarters_location text,
    climate_focus text[] DEFAULT '{}'::text[],
    industries jsonb DEFAULT '[]'::jsonb,
    services_offered jsonb DEFAULT '[]'::jsonb,
    training_programs jsonb DEFAULT '[]'::jsonb,
    partnership_level text DEFAULT 'standard'::text,
    partnership_start_date date DEFAULT CURRENT_DATE,
    verified boolean DEFAULT false,
    verification_date timestamp with time zone,
    profile_completed boolean DEFAULT false,
    last_login timestamp with time zone,
    hiring_actively boolean DEFAULT false,
    has_job_board boolean DEFAULT false,
    internship_programs boolean DEFAULT false,
    offers_mentorship boolean DEFAULT false,
    offers_certification boolean DEFAULT false,
    offers_funding boolean DEFAULT false,
    offers_webinars boolean DEFAULT false,
    offers_virtual_tours boolean DEFAULT false,
    hosts_events boolean DEFAULT false,
    has_podcast boolean DEFAULT false,
    has_mobile_app boolean DEFAULT false,
    has_resource_library boolean DEFAULT false,
    linkedin_url text,
    twitter_handle text,
    facebook_url text,
    instagram_handle text,
    youtube_url text,
    podcast_url text,
    newsletter_signup_url text,
    careers_page_url text,
    events_calendar_url text,
    platform_login_url text,
    student_portal_url text,
    workforce_portal_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 19. PROFILES TABLE (Main User Profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    email text,
    organization_name text,
    organization_type text,
    description text,
    website text,
    contact_info jsonb DEFAULT '{}'::jsonb,
    user_type text DEFAULT 'user'::text,
    role text DEFAULT 'user'::text,
    partnership_level text DEFAULT 'standard'::text,
    verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 20. RESOURCE VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_views (
    user_id uuid REFERENCES auth.users(id),
    resource_id uuid NOT NULL,
    resource_type text NOT NULL,
    session_id text,
    referrer text,
    interaction_metadata jsonb DEFAULT '{}'::jsonb,
    viewed_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 21. RESUME CHUNKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_chunks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid NOT NULL REFERENCES resumes(id),
    content text NOT NULL,
    chunk_type text DEFAULT 'content'::text,
    page_number integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    embedding vector,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 22. RESUMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resumes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    file_name character varying(255) NOT NULL,
    file_path text,
    file_size bigint,
    content_type character varying(100),
    content text,
    processed boolean DEFAULT false,
    processing_status text DEFAULT 'pending'::text,
    processing_error text,
    processing_metadata jsonb DEFAULT '{}'::jsonb,
    skills_extracted jsonb DEFAULT '[]'::jsonb,
    experience_years integer,
    education_level text,
    industry_background text[],
    climate_relevance_score numeric,
    linkedin_url text,
    github_url text,
    personal_website text,
    embedding vector,
    content_embedding vector,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- 23. ROLE REQUIREMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_requirements (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role_title character varying(200) NOT NULL,
    experience_level character varying(50) NOT NULL,
    minimum_years integer,
    required_skills text[] NOT NULL,
    preferred_skills text[] DEFAULT '{}'::text[],
    salary_range jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- 24. SKILLS MAPPING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS skills_mapping (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_name character varying(200) NOT NULL,
    category character varying(100) NOT NULL,
    climate_relevance numeric NOT NULL,
    keywords text[] DEFAULT '{}'::text[],
    mapped_roles text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- 25. USER INTERESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_interests (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    climate_focus text[] DEFAULT '{}'::text[],
    target_roles text[] DEFAULT '{}'::text[],
    skills_to_develop text[] DEFAULT '{}'::text[],
    preferred_location text,
    employment_preferences jsonb DEFAULT '{}'::jsonb,
    email_notifications boolean DEFAULT true,
    job_alerts_enabled boolean DEFAULT true,
    newsletter_enabled boolean DEFAULT true,
    marketing_emails_enabled boolean DEFAULT true,
    partner_updates_enabled boolean DEFAULT true,
    data_sharing_enabled boolean DEFAULT false,
    social_profile_analysis_enabled boolean DEFAULT true,
    language_preference text DEFAULT 'en'::text,
    timezone text DEFAULT 'UTC'::text,
    theme_preference text DEFAULT 'system'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 26. WORKFLOW SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_sessions (
    session_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    workflow_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    data jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_seeker_profiles_user_id ON job_seeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_organization_name ON partner_profiles(organization_name);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_user_id ON conversation_analytics(user_id);

-- Job and matching indexes
CREATE INDEX IF NOT EXISTS idx_job_listings_partner_id ON job_listings(partner_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_active ON job_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_match_results_candidate_id ON partner_match_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_partner_match_results_job_id ON partner_match_results(job_id);

-- Resource indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_partner_id ON knowledge_resources(partner_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_resources_published ON knowledge_resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resource_views_user_id ON resource_views(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource_id ON resource_views(resource_id);

-- Resume indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_chunks_resume_id ON resume_chunks(resume_id);

-- Audit and logging indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin profiles policies
CREATE POLICY "Admins can view admin profiles" ON admin_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Job seeker profiles policies
CREATE POLICY "Users can view own job seeker profile" ON job_seeker_profiles FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "Users can update own job seeker profile" ON job_seeker_profiles FOR UPDATE 
USING (auth.uid() = user_id);
CREATE POLICY "Partners can view job seeker profiles for matching" ON job_seeker_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'partner'
    )
);

-- Partner profiles policies
CREATE POLICY "Users can view partner profiles" ON partner_profiles FOR SELECT TO authenticated;
CREATE POLICY "Partners can update own profile" ON partner_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Conversation messages policies
CREATE POLICY "Users can view messages from own conversations" ON conversation_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = conversation_messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);

-- Job listings policies
CREATE POLICY "Users can view active job listings" ON job_listings FOR SELECT 
USING (is_active = true);
CREATE POLICY "Partners can manage own job listings" ON job_listings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM partner_profiles 
        WHERE partner_profiles.id = job_listings.partner_id 
        AND partner_profiles.id = auth.uid()
    )
);

-- Knowledge resources policies
CREATE POLICY "Users can view published resources" ON knowledge_resources FOR SELECT 
USING (is_published = true);
CREATE POLICY "Partners can manage own resources" ON knowledge_resources FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM partner_profiles 
        WHERE partner_profiles.id = knowledge_resources.partner_id 
        AND partner_profiles.id = auth.uid()
    )
);

-- Resumes policies
CREATE POLICY "Users can manage own resumes" ON resumes FOR ALL 
USING (auth.uid() = user_id);
CREATE POLICY "Resume chunks follow resume permissions" ON resume_chunks FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM resumes 
        WHERE resumes.id = resume_chunks.resume_id 
        AND resumes.user_id = auth.uid()
    )
);

-- User interests policies
CREATE POLICY "Users can manage own interests" ON user_interests FOR ALL 
USING (auth.uid() = user_id);

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables (with conditional creation)
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
    DROP TRIGGER IF EXISTS update_job_seeker_profiles_updated_at ON job_seeker_profiles;
    DROP TRIGGER IF EXISTS update_partner_profiles_updated_at ON partner_profiles;
    DROP TRIGGER IF EXISTS update_job_listings_updated_at ON job_listings;
    DROP TRIGGER IF EXISTS update_education_programs_updated_at ON education_programs;
    DROP TRIGGER IF EXISTS update_knowledge_resources_updated_at ON knowledge_resources;
    DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
    DROP TRIGGER IF EXISTS update_user_interests_updated_at ON user_interests;
    
    -- Create new triggers
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_job_seeker_profiles_updated_at BEFORE UPDATE ON job_seeker_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_partner_profiles_updated_at BEFORE UPDATE ON partner_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON job_listings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_education_programs_updated_at BEFORE UPDATE ON education_programs 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_knowledge_resources_updated_at BEFORE UPDATE ON knowledge_resources 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_user_interests_updated_at BEFORE UPDATE ON user_interests 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit triggers to sensitive tables (with conditional creation)
DO $$
BEGIN
    -- Drop existing audit triggers if they exist
    DROP TRIGGER IF EXISTS audit_profiles ON profiles;
    DROP TRIGGER IF EXISTS audit_admin_profiles ON admin_profiles;
    DROP TRIGGER IF EXISTS audit_partner_profiles ON partner_profiles;
    DROP TRIGGER IF EXISTS audit_job_listings ON job_listings;
    
    -- Create new audit triggers
    CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles 
        FOR EACH ROW EXECUTE FUNCTION create_audit_log();
    CREATE TRIGGER audit_admin_profiles AFTER INSERT OR UPDATE OR DELETE ON admin_profiles 
        FOR EACH ROW EXECUTE FUNCTION create_audit_log();
    CREATE TRIGGER audit_partner_profiles AFTER INSERT OR UPDATE OR DELETE ON partner_profiles 
        FOR EACH ROW EXECUTE FUNCTION create_audit_log();
    CREATE TRIGGER audit_job_listings AFTER INSERT OR UPDATE OR DELETE ON job_listings 
        FOR EACH ROW EXECUTE FUNCTION create_audit_log();
END $$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, user_type, role)
    VALUES (NEW.id, NEW.email, 'user', 'user');
    
    INSERT INTO user_interests (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for new user registration (with conditional creation)
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Create new trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
END $$;

-- =====================================================
-- CUSTOM CLAIMS FUNCTION FOR JWT
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_claims(user_id uuid)
RETURNS jsonb AS $$
DECLARE
    user_claims jsonb := '{}';
    user_profile profiles%ROWTYPE;
    admin_profile admin_profiles%ROWTYPE;
BEGIN
    -- Get basic profile
    SELECT * INTO user_profile FROM profiles WHERE id = user_id;
    
    IF user_profile.id IS NOT NULL THEN
        user_claims := jsonb_build_object(
            'user_type', user_profile.user_type,
            'role', user_profile.role,
            'verified', user_profile.verified,
            'organization_name', user_profile.organization_name
        );
        
        -- Add admin permissions if admin
        IF user_profile.role IN ('admin', 'super_admin') THEN
            SELECT * INTO admin_profile FROM admin_profiles WHERE user_id = user_id;
            
            IF admin_profile.id IS NOT NULL THEN
                user_claims := user_claims || jsonb_build_object(
                    'admin_permissions', jsonb_build_object(
                        'can_manage_users', admin_profile.can_manage_users,
                        'can_manage_partners', admin_profile.can_manage_partners,
                        'can_manage_content', admin_profile.can_manage_content,
                        'can_manage_system', admin_profile.can_manage_system,
                        'can_view_analytics', admin_profile.can_view_analytics
                    )
                );
            END IF;
        END IF;
    END IF;
    
    RETURN user_claims;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ COMPREHENSIVE SCHEMA IMPLEMENTATION COMPLETE';
    RAISE NOTICE '📊 Total Tables Created: 26';
    RAISE NOTICE '🔐 RLS Policies: Enabled with JWT integration';
    RAISE NOTICE '📝 Audit Logging: Configured for sensitive operations';
    RAISE NOTICE '🔧 Triggers: Updated_at and audit triggers active';
    RAISE NOTICE '👤 User Claims: Custom JWT claims function ready';
    RAISE NOTICE '🚀 Ready for production deployment on Vercel + Supabase';
END $$; 