-- Drop the existing resume_chunks table
DROP TABLE IF EXISTS public.resume_chunks;

-- Add chunks JSONB column to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS chunks JSONB DEFAULT '[]'::jsonb;

-- Create or replace the function to search within resume chunks
CREATE OR REPLACE FUNCTION match_resume_content(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE (
  resume_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as resume_id,
    c->>'content' as content,
    1 - (CAST(c->>'embedding' AS VECTOR(1536)) <=> query_embedding) AS similarity
  FROM
    public.resumes r,
    jsonb_array_elements(r.chunks) AS c
  WHERE
    r.user_id = match_resume_content.user_id
  AND
    1 - (CAST(c->>'embedding' AS VECTOR(1536)) <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 