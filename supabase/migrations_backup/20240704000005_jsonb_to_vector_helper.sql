-- Create helper function to convert JSONB arrays to vectors
CREATE OR REPLACE FUNCTION jsonb_to_vector(jsonb_array jsonb)
RETURNS vector AS $$
DECLARE
  arr float8[];
BEGIN
  SELECT array_agg(value::float8)
  INTO arr
  FROM jsonb_array_elements_text(jsonb_array) as val(value);

  RETURN arr::vector;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fix match_resume_content function to use the helper
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
    1 - (jsonb_to_vector(c->'embedding') <=> query_embedding) AS similarity
  FROM
    public.resumes r,
    jsonb_array_elements(r.chunks) AS c
  WHERE
    r.user_id = match_resume_content.user_id
  AND
    c->'embedding' IS NOT NULL
  AND
    jsonb_array_length(c->'embedding') > 0
  AND
    1 - (jsonb_to_vector(c->'embedding') <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 