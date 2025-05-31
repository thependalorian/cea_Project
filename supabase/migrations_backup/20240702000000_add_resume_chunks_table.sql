-- Create resume chunks table for storing vectorized content
CREATE TABLE IF NOT EXISTS public.resume_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  page INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster vector similarity search
CREATE INDEX IF NOT EXISTS resume_chunks_embedding_idx ON public.resume_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Set up Row Level Security (RLS)
ALTER TABLE public.resume_chunks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own resume chunks
CREATE POLICY "Users can view their own resume chunks"
  ON public.resume_chunks
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.resumes WHERE id = resume_id
    )
  );

-- Create policy for users to insert their own resume chunks
CREATE POLICY "Users can insert their own resume chunks"
  ON public.resume_chunks
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.resumes WHERE id = resume_id
    )
  );

-- Create policy for users to update their own resume chunks
CREATE POLICY "Users can update their own resume chunks"
  ON public.resume_chunks
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.resumes WHERE id = resume_id
    )
  );

-- Create policy for users to delete their own resume chunks
CREATE POLICY "Users can delete their own resume chunks"
  ON public.resume_chunks
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.resumes WHERE id = resume_id
    )
  );

-- Create function to search resume chunks by similarity
CREATE OR REPLACE FUNCTION match_resume_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  resume_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.resume_id,
    rc.content,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM
    public.resume_chunks rc
  JOIN
    public.resumes r ON r.id = rc.resume_id
  WHERE
    r.user_id = match_resume_chunks.user_id
  AND
    1 - (rc.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 