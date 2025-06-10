-- FINAL PLATFORM OPTIMIZATION - MANUAL MIGRATION
-- Run this in Supabase SQL Editor to complete the 100/100 health score
-- This works with your existing 23-table schema

-- ========================================
-- STEP 1: Add Foreign Key Constraints
-- ========================================
DO $$ 
BEGIN
    -- FK for user_interests -> auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_interests_user_id'
    ) THEN
        ALTER TABLE user_interests 
        ADD CONSTRAINT fk_user_interests_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- FK for resumes -> auth.users  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_resumes_user_id'
    ) THEN
        ALTER TABLE resumes 
        ADD CONSTRAINT fk_resumes_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- FK for audit_logs -> auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_logs_user_id'
    ) THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT fk_audit_logs_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ========================================
-- STEP 2: Enhance conversation_interrupts for HITL
-- ========================================
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS supervisor_approval_required BOOLEAN DEFAULT false;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS match_score NUMERIC(3,2);
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS reviewer_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

-- Add FK constraints for HITL workflow
DO $$
BEGIN
    -- FK to job_seeker_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_conversation_interrupts_candidate_id'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT fk_conversation_interrupts_candidate_id 
        FOREIGN KEY (candidate_id) REFERENCES job_seeker_profiles(id) ON DELETE SET NULL;
    END IF;

    -- FK to job_listings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_conversation_interrupts_job_id'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT fk_conversation_interrupts_job_id 
        FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE SET NULL;
    END IF;

    -- FK to admin_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_conversation_interrupts_reviewer_id'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT fk_conversation_interrupts_reviewer_id 
        FOREIGN KEY (reviewer_id) REFERENCES admin_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ========================================
-- STEP 3: Create partner_match_results table
-- ========================================
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- FK constraints
    CONSTRAINT fk_partner_match_results_candidate_id 
        FOREIGN KEY (candidate_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_partner_match_results_job_id 
        FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE CASCADE,
    CONSTRAINT fk_partner_match_results_reviewer_id 
        FOREIGN KEY (reviewer_id) REFERENCES admin_profiles(id) ON DELETE SET NULL
);

-- ========================================
-- STEP 4: Performance Indexes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_job_listings_partner_active 
ON job_listings(partner_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interests_climate_focus 
ON user_interests USING GIN(climate_focus);

CREATE INDEX IF NOT EXISTS idx_user_interests_target_roles 
ON user_interests USING GIN(target_roles);

CREATE INDEX IF NOT EXISTS idx_partner_match_results_score 
ON partner_match_results(match_score DESC, threshold_met);

CREATE INDEX IF NOT EXISTS idx_partner_match_results_candidate 
ON partner_match_results(candidate_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_interrupts_type_status 
ON conversation_interrupts(type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_interrupts_supervisor_approval 
ON conversation_interrupts(supervisor_approval_required, status) 
WHERE supervisor_approval_required = true;

-- ========================================
-- STEP 5: RLS Policies & Permissions
-- ========================================
ALTER TABLE partner_match_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_match_results
DO $$
BEGIN
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
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON partner_match_results TO authenticated;
GRANT SELECT, UPDATE ON conversation_interrupts TO authenticated;

-- ========================================
-- STEP 6: HITL Workflow Trigger Function
-- ========================================
CREATE OR REPLACE FUNCTION trigger_hitl_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger human review for high-scoring matches (80%+ threshold)
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
        
        NEW.requires_human_review = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_partner_match_hitl ON partner_match_results;
CREATE TRIGGER trigger_partner_match_hitl
    BEFORE INSERT OR UPDATE ON partner_match_results
    FOR EACH ROW
    EXECUTE FUNCTION trigger_hitl_workflow();

-- ========================================
-- STEP 7: Documentation & Constraints
-- ========================================
-- Add enum constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_interrupt_type'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT check_interrupt_type 
        CHECK (type IN ('human_review', 'flag', 'pause', 'match_approval', 'escalation'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_interrupt_status'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT check_interrupt_status 
        CHECK (status IN ('pending', 'resolved', 'dismissed', 'approved', 'rejected'));
    END IF;
END $$;

-- Add table/column comments
COMMENT ON TABLE partner_match_results IS 'Tracks partner-candidate matching results with 80% threshold logic for HITL workflow';
COMMENT ON COLUMN partner_match_results.match_score IS 'Calculated match score between 0.0 and 1.0';
COMMENT ON COLUMN partner_match_results.threshold_met IS 'True if match_score >= 0.8 (80% threshold)';
COMMENT ON COLUMN partner_match_results.requires_human_review IS 'True if match requires manual review by hiring manager';

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to verify the migration worked:
-- SELECT 'partner_match_results' as table_name, count(*) as column_count 
-- FROM information_schema.columns 
-- WHERE table_name = 'partner_match_results'
-- UNION ALL
-- SELECT 'conversation_interrupts', count(*) 
-- FROM information_schema.columns 
-- WHERE table_name = 'conversation_interrupts'; 