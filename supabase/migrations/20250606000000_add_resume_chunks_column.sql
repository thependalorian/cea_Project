-- Migration: Add chunks column to resumes table
-- Date: June 6, 2025
-- Purpose: Support enhanced search functionality with resume text chunks

-- Add chunks column to store segmented resume text for better RAG performance
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS chunks TEXT[] DEFAULT '{}';

-- Add index for efficient chunk searching
CREATE INDEX IF NOT EXISTS idx_resumes_chunks_gin 
ON public.resumes USING GIN(chunks);

-- Update comment on resumes table
COMMENT ON COLUMN public.resumes.chunks IS 'Segmented text chunks from resume content for enhanced RAG performance';

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'resumes' 
        AND column_name = 'chunks'
    ) THEN
        RAISE NOTICE 'SUCCESS: chunks column added to resumes table';
    ELSE
        RAISE EXCEPTION 'FAILED: chunks column was not added to resumes table';
    END IF;
END $$; 