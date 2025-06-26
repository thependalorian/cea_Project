-- Resume Storage Tables Migration
-- Purpose: Create tables for resume file storage and vector embeddings
-- Date: 2025-01-25

-- Create resume_files table
CREATE TABLE IF NOT EXISTS resume_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    content_preview TEXT,
    chunk_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resume_chunks table for vector storage
CREATE TABLE IF NOT EXISTS resume_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id UUID NOT NULL REFERENCES resume_files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-ada-002 dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_files_user_id ON resume_files(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_files_uploaded_at ON resume_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_resume_chunks_file_id ON resume_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_resume_chunks_user_id ON resume_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_chunks_embedding ON resume_chunks USING ivfflat (embedding vector_cosine_ops);

-- Row Level Security (RLS) policies
ALTER TABLE resume_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for resume_files
CREATE POLICY "Users can view their own resume files" ON resume_files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume files" ON resume_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume files" ON resume_files
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume files" ON resume_files
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for resume_chunks
CREATE POLICY "Users can view their own resume chunks" ON resume_chunks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume chunks" ON resume_chunks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume chunks" ON resume_chunks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume chunks" ON resume_chunks
    FOR DELETE USING (auth.uid() = user_id);

-- Functions for vector similarity search
CREATE OR REPLACE FUNCTION search_resume_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 10,
    target_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    file_id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rc.id,
        rc.file_id,
        rc.content,
        1 - (rc.embedding <=> query_embedding) AS similarity
    FROM resume_chunks rc
    WHERE 
        (target_user_id IS NULL OR rc.user_id = target_user_id)
        AND 1 - (rc.embedding <=> query_embedding) > match_threshold
    ORDER BY rc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_resume_files_updated_at
    BEFORE UPDATE ON resume_files
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_files_updated_at(); 