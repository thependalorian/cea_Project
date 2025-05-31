-- Create resume storage table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  context TEXT DEFAULT 'general',
  embedding VECTOR(1536),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own resumes
CREATE POLICY "Users can view their own resumes"
  ON public.resumes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own resumes
CREATE POLICY "Users can insert their own resumes"
  ON public.resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own resumes
CREATE POLICY "Users can update their own resumes"
  ON public.resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
  ON public.resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for user documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Set up storage policy for authenticated users to view their own files
CREATE POLICY "Authenticated users can view their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Set up storage policy for authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Set up storage policy for authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  ); 