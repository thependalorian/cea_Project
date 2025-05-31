-- Alternative fix for vector casting from JSONB
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
    1 - (array_to_vector(ARRAY(SELECT jsonb_array_elements_text(c->'embedding')::float)) <=> query_embedding) AS similarity
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
    1 - (array_to_vector(ARRAY(SELECT jsonb_array_elements_text(c->'embedding')::float)) <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 