-- Explore what's in the JSONB chunks

-- 1. Show resume row with user_id and processed status
SELECT id, user_id, file_name, processed FROM public.resumes;

-- 2. Count chunks in each resume
SELECT 
  id, 
  file_name, 
  jsonb_array_length(chunks) as chunk_count 
FROM 
  public.resumes;

-- 3. Show the content and embedding dimensions of the first chunk in each resume
SELECT 
  id,
  file_name,
  (chunks->0->>'content') as first_chunk_content,
  jsonb_array_length(chunks->0->'embedding') as embedding_dimensions
FROM 
  public.resumes
WHERE
  jsonb_array_length(chunks) > 0;

-- 4. Test vector conversion with a sample
WITH sample_resume AS (
  SELECT id, chunks FROM public.resumes 
  WHERE jsonb_array_length(chunks) > 0 
  LIMIT 1
)
SELECT 
  id,
  jsonb_to_vector(chunks->0->'embedding') IS NOT NULL AS vector_conversion_works
FROM 
  sample_resume; 