-- Cleanup script to remove existing resumes with problematic embeddings
-- Uncomment and run these commands to clean up before re-uploading
-- Note: This will delete all resume data, so only use if you're ready to start fresh

-- DELETE FROM public.resumes WHERE processed = true;

-- Alternative approach to just mark resumes as unprocessed so they can be reprocessed
-- UPDATE public.resumes SET processed = false, chunks = '[]'::jsonb; 