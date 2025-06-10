-- Final Platform Optimization Migration
-- Adds missing foreign keys, indexes, and standardizes data types
-- Migration: 20250607000000_final_optimization.sql

-- 1. Add missing foreign key constraints for data integrity
DO $$ 
BEGIN
    -- Add FK constraint for user_interests.user_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_interests_user_id'
    ) THEN
        ALTER TABLE user_interests 
        ADD CONSTRAINT fk_user_interests_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add FK constraint for resumes.user_id if not exists  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_resumes_user_id'
    ) THEN
        ALTER TABLE resumes 
        ADD CONSTRAINT fk_resumes_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add FK constraint for audit_logs.user_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_logs_user_id'
    ) THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT fk_audit_logs_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Standardize JSONB to text[] for consistency where appropriate
DO $$
BEGIN
    -- Check if partner_profiles.climate_focus exists and is JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'partner_profiles' 
        AND column_name = 'climate_focus' 
        AND data_type = 'jsonb'
    ) THEN
        -- Create a temporary column for conversion
        ALTER TABLE partner_profiles ADD COLUMN climate_focus_temp text[];
        
        -- Update the temporary column with converted data
        UPDATE partner_profiles 
        SET climate_focus_temp = CASE 
            WHEN climate_focus IS NULL THEN '{}'::text[]
            WHEN jsonb_typeof(climate_focus) = 'array' THEN 
                (SELECT array_agg(value::text) FROM jsonb_array_elements_text(climate_focus) AS value)
            ELSE '{}'::text[]
        END;
        
        -- Drop the old column and rename the new one
        ALTER TABLE partner_profiles DROP COLUMN climate_focus;
        ALTER TABLE partner_profiles RENAME COLUMN climate_focus_temp TO climate_focus;
        
        -- Set default for the new column
        ALTER TABLE partner_profiles ALTER COLUMN climate_focus SET DEFAULT '{}'::text[];
    END IF;
END $$;

-- 3. Add performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_job_listings_partner_active 
ON job_listings(partner_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_listings_climate_location 
ON job_listings USING GIN(climate_focus) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_interests_climate_focus 
ON user_interests USING GIN(climate_focus);

CREATE INDEX IF NOT EXISTS idx_user_interests_target_roles 
ON user_interests USING GIN(target_roles);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_role 
ON conversation_messages(user_id, role, created_at DESC) 
WHERE role IN ('user', 'assistant');

CREATE INDEX IF NOT EXISTS idx_resource_views_analytics 
ON resource_views(user_id, resource_type, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_table_action 
ON audit_logs(user_id, table_name, created_at DESC);

-- 4. Add HITL workflow support columns to conversation_interrupts
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS supervisor_approval_required BOOLEAN DEFAULT false;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS match_score NUMERIC(3,2);
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS reviewer_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

-- Add FK constraints for new HITL fields
DO $$
BEGIN
    -- Check if job_seeker_profiles table exists before adding FK constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_seeker_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_conversation_interrupts_candidate_id'
        ) THEN
            ALTER TABLE conversation_interrupts 
            ADD CONSTRAINT fk_conversation_interrupts_candidate_id 
            FOREIGN KEY (candidate_id) REFERENCES job_seeker_profiles(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- Check if job_listings table exists before adding FK constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_listings') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_conversation_interrupts_job_id'
        ) THEN
            ALTER TABLE conversation_interrupts 
            ADD CONSTRAINT fk_conversation_interrupts_job_id 
            FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- Check if admin_profiles table exists before adding FK constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_conversation_interrupts_reviewer_id'
        ) THEN
            ALTER TABLE conversation_interrupts 
            ADD CONSTRAINT fk_conversation_interrupts_reviewer_id 
            FOREIGN KEY (reviewer_id) REFERENCES admin_profiles(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- 5. Create partner matching results table for 80% threshold tracking
CREATE TABLE IF NOT EXISTS partner_match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL,
    job_id UUID NOT NULL,
    match_score NUMERIC(3,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
    threshold_met BOOLEAN NOT NULL DEFAULT false,
    matching_skills TEXT[] DEFAULT '{}',
    skill_gaps TEXT[] DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    requires_human_review BOOLEAN DEFAULT false,
    auto_approved BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add FK constraints for partner_match_results
DO $$
BEGIN
    -- Add FK constraints only if target tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_seeker_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_partner_match_results_candidate_id'
        ) THEN
            ALTER TABLE partner_match_results 
            ADD CONSTRAINT fk_partner_match_results_candidate_id 
            FOREIGN KEY (candidate_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_listings') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_partner_match_results_job_id'
        ) THEN
            ALTER TABLE partner_match_results 
            ADD CONSTRAINT fk_partner_match_results_job_id 
            FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_partner_match_results_reviewer_id'
        ) THEN
            ALTER TABLE partner_match_results 
            ADD CONSTRAINT fk_partner_match_results_reviewer_id 
            FOREIGN KEY (reviewer_id) REFERENCES admin_profiles(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Index for partner matching queries
CREATE INDEX IF NOT EXISTS idx_partner_match_results_score 
ON partner_match_results(match_score DESC, threshold_met);

CREATE INDEX IF NOT EXISTS idx_partner_match_results_candidate 
ON partner_match_results(candidate_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_match_results_job 
ON partner_match_results(job_id, threshold_met, created_at DESC);

-- 6. Enhanced RLS policies for new tables
ALTER TABLE partner_match_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Create RLS policies only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_match_results' 
        AND policyname = 'Partners can view matches for their jobs'
    ) THEN
        CREATE POLICY "Partners can view matches for their jobs" ON partner_match_results
        FOR SELECT USING (
            job_id IN (
                SELECT id FROM job_listings 
                WHERE partner_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_match_results' 
        AND policyname = 'Admins can view all matches'
    ) THEN
        CREATE POLICY "Admins can view all matches" ON partner_match_results
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM admin_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_match_results' 
        AND policyname = 'System can insert match results'
    ) THEN
        CREATE POLICY "System can insert match results" ON partner_match_results
        FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 7. Add enum constraints for better data consistency
DO $$
BEGIN
    -- Add check constraint for conversation_interrupts type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_interrupt_type'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT check_interrupt_type 
        CHECK (type IN ('human_review', 'flag', 'pause', 'match_approval', 'escalation'));
    END IF;

    -- Add check constraint for conversation_interrupts status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_interrupt_status'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT check_interrupt_status 
        CHECK (status IN ('pending', 'resolved', 'dismissed', 'approved', 'rejected'));
    END IF;
END $$;

-- 8. Create function for automatic HITL workflow triggering
CREATE OR REPLACE FUNCTION trigger_hitl_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger human review for high-scoring matches
    IF NEW.match_score >= 0.8 AND NEW.threshold_met = true THEN
        INSERT INTO conversation_interrupts (
            conversation_id,
            type,
            status,
            priority,
            supervisor_approval_required,
            match_score,
            candidate_id,
            job_id,
            escalation_reason,
            created_at
        ) VALUES (
            'match_' || NEW.id::text,
            'match_approval',
            'pending',
            'high',
            true,
            NEW.match_score,
            NEW.candidate_id,
            NEW.job_id,
            '80% match threshold exceeded - manual review required',
            now()::text
        );
        
        -- Mark as requiring human review
        NEW.requires_human_review = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic HITL workflow
DROP TRIGGER IF EXISTS trigger_partner_match_hitl ON partner_match_results;
CREATE TRIGGER trigger_partner_match_hitl
    BEFORE INSERT OR UPDATE ON partner_match_results
    FOR EACH ROW
    EXECUTE FUNCTION trigger_hitl_workflow();

-- 9. Update timestamp function for new tables
DO $$
BEGIN
    -- Check if update_updated_at_column function exists
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_updated_at_column'
    ) THEN
        DROP TRIGGER IF EXISTS update_partner_match_results_updated_at ON partner_match_results;
        CREATE TRIGGER update_partner_match_results_updated_at
            BEFORE UPDATE ON partner_match_results
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    ELSE
        -- Create a simple update function if it doesn't exist
        CREATE OR REPLACE FUNCTION update_partner_match_results_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_partner_match_results_updated_at ON partner_match_results;
        CREATE TRIGGER update_partner_match_results_updated_at
            BEFORE UPDATE ON partner_match_results
            FOR EACH ROW
            EXECUTE FUNCTION update_partner_match_results_updated_at();
    END IF;
END $$;

-- 10. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON partner_match_results TO authenticated;
GRANT SELECT, UPDATE ON conversation_interrupts TO authenticated;

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_conversation_interrupts_type_status 
ON conversation_interrupts(type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_interrupts_supervisor_approval 
ON conversation_interrupts(supervisor_approval_required, status) 
WHERE supervisor_approval_required = true;

-- Add comments for documentation
COMMENT ON TABLE partner_match_results IS 'Tracks partner-candidate matching results with 80% threshold logic for HITL workflow';
COMMENT ON COLUMN partner_match_results.match_score IS 'Calculated match score between 0.0 and 1.0';
COMMENT ON COLUMN partner_match_results.threshold_met IS 'True if match_score >= 0.8 (80% threshold)';
COMMENT ON COLUMN partner_match_results.requires_human_review IS 'True if match requires manual review by hiring manager'; 