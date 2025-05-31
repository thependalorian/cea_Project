-- Consolidated migrations for resume functionality

-- 1. Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  context TEXT DEFAULT 'general',
  processed BOOLEAN DEFAULT false,
  chunks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Set up Row Level Security (RLS) for resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for resumes table
CREATE POLICY "Users can view their own resumes"
  ON public.resumes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create helper function to convert JSONB arrays to vectors
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

-- 5. Create function to match resume content
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

-- 6. Add useful index for user_id to optimize queries
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes (user_id);

-- 7. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 