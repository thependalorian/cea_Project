-- Modify the resume_processor.py approach

-- 1. Add function to help convert arrays to vectors
CREATE OR REPLACE FUNCTION array_to_vector(arr FLOAT[]) RETURNS VECTOR(1536)
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT arr::VECTOR(1536);
$$;

-- 2. Create simpler match function that doesn't rely on complex casting
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
  WITH chunk_data AS (
    SELECT
      r.id as r_id,
      c->>'content' as chunk_content,
      c->'embedding' as embedding_json
    FROM
      public.resumes r,
      jsonb_array_elements(r.chunks) AS c
    WHERE
      r.user_id = match_resume_content.user_id
      AND c->'embedding' IS NOT NULL
      AND jsonb_array_length(c->'embedding') > 0
  )
  SELECT
    r_id as resume_id,
    chunk_content as content,
    1 - (array_to_vector(ARRAY(SELECT jsonb_array_elements_text(embedding_json)::float)) <=> query_embedding) AS similarity
  FROM
    chunk_data
  WHERE
    1 - (array_to_vector(ARRAY(SELECT jsonb_array_elements_text(embedding_json)::float)) <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 