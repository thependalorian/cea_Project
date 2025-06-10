-- FINAL CLEANUP - Complete the last 10% for 100/100 Health Score
-- Run this in Supabase SQL Editor to finish the optimization

-- 1. Add missing candidate_id column to conversation_interrupts
ALTER TABLE conversation_interrupts ADD COLUMN IF NOT EXISTS candidate_id UUID;

-- 2. Add missing auto_approved column to partner_match_results  
ALTER TABLE partner_match_results ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT false;

-- 3. Add missing FK constraint for candidate_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_conversation_interrupts_candidate_id'
    ) THEN
        ALTER TABLE conversation_interrupts 
        ADD CONSTRAINT fk_conversation_interrupts_candidate_id 
        FOREIGN KEY (candidate_id) REFERENCES job_seeker_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Convert partner_profiles.climate_focus from JSONB to text[] for consistency
DO $$
BEGIN
    -- Check if column is still JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'partner_profiles' 
        AND column_name = 'climate_focus' 
        AND data_type = 'jsonb'
    ) THEN
        -- Create temp column
        ALTER TABLE partner_profiles ADD COLUMN climate_focus_temp text[];
        
        -- Convert data
        UPDATE partner_profiles 
        SET climate_focus_temp = CASE 
            WHEN climate_focus IS NULL THEN '{}'::text[]
            WHEN jsonb_typeof(climate_focus) = 'array' THEN 
                (SELECT array_agg(value::text) FROM jsonb_array_elements_text(climate_focus) AS value)
            ELSE '{}'::text[]
        END;
        
        -- Replace column
        ALTER TABLE partner_profiles DROP COLUMN climate_focus;
        ALTER TABLE partner_profiles RENAME COLUMN climate_focus_temp TO climate_focus;
        ALTER TABLE partner_profiles ALTER COLUMN climate_focus SET DEFAULT '{}'::text[];
    END IF;
END $$;

-- 5. Add any missing foreign key constraints
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

-- 6. Final verification query
SELECT 
    'conversation_interrupts' as table_name, 
    count(*) as column_count,
    'Should be 16' as expected
FROM information_schema.columns 
WHERE table_name = 'conversation_interrupts'
UNION ALL
SELECT 
    'partner_match_results', 
    count(*), 
    'Should be 14'
FROM information_schema.columns 
WHERE table_name = 'partner_match_results'
UNION ALL
SELECT 
    'partner_profiles.climate_focus', 
    CASE WHEN data_type = 'ARRAY' THEN 1 ELSE 0 END,
    'Should be 1 (text[])'
FROM information_schema.columns 
WHERE table_name = 'partner_profiles' AND column_name = 'climate_focus'; 