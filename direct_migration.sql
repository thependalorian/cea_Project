-- Direct Migration for Final Platform Optimization
-- Run this directly on the production database

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

-- 2. Add HITL workflow support columns to conversation_interrupts
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS supervisor_approval_required BOOLEAN DEFAULT false;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS match_score NUMERIC(3,2);
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS reviewer_id UUID;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

-- 3. Create partner matching results table for 80% threshold tracking
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

-- 4. Add performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_job_listings_partner_active 
ON job_listings(partner_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interests_climate_focus 
ON user_interests USING GIN(climate_focus);

CREATE INDEX IF NOT EXISTS idx_user_interests_target_roles 
ON user_interests USING GIN(target_roles);

CREATE INDEX IF NOT EXISTS idx_partner_match_results_score 
ON partner_match_results(match_score DESC, threshold_met);

CREATE INDEX IF NOT EXISTS idx_conversation_interrupts_type_status 
ON conversation_interrupts(type, status, created_at DESC);

-- 5. Enhanced RLS policies for new tables
ALTER TABLE partner_match_results ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON partner_match_results TO authenticated;
GRANT SELECT, UPDATE ON conversation_interrupts TO authenticated;

-- 7. Add comments for documentation
COMMENT ON TABLE partner_match_results IS 'Tracks partner-candidate matching results with 80% threshold logic for HITL workflow';
COMMENT ON COLUMN partner_match_results.match_score IS 'Calculated match score between 0.0 and 1.0';
COMMENT ON COLUMN partner_match_results.threshold_met IS 'True if match_score >= 0.8 (80% threshold)';
COMMENT ON COLUMN partner_match_results.requires_human_review IS 'True if match requires manual review by hiring manager'; 