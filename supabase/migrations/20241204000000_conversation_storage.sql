-- Conversation Storage Migration - Climate Economy Assistant
-- Simple long-term conversation persistence for RLHF and admin analytics
-- Complements Redis short-term memory with Supabase long-term storage

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================
-- 1. CONVERSATIONS TABLE
-- ========================================
-- Simple conversation tracking for CEA interactions

CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY, -- Redis-generated conversation IDs like 'conv_1234567890_abc123'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Conversation Info
  title TEXT,
  conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'career_guidance', 'job_search', 'resume_analysis', 'skill_development', 'recommendations')),
  
  -- Simple Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  
  -- Basic Analytics
  message_count INTEGER DEFAULT 0,
  
  -- Timestamps (ISO strings to match Redis format)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ========================================
-- 2. CONVERSATION_MESSAGES TABLE
-- ========================================
-- Long-term message storage for RLHF training

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id TEXT PRIMARY KEY, -- Redis-generated message IDs like 'msg_1234567890_abc123'
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Message Content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Simple Metadata
  metadata JSONB DEFAULT '{}', -- recommendations, analysis results, citations, etc.
  
  -- Vector Embedding for Training Data
  embedding VECTOR(1536),
  
  -- Timestamps
  created_at TEXT NOT NULL
);

-- ========================================
-- 3. MESSAGE_FEEDBACK TABLE
-- ========================================
-- RLHF feedback collection for model training

CREATE TABLE IF NOT EXISTS public.message_feedback (
  id TEXT PRIMARY KEY, -- Redis-generated feedback IDs like 'fb_1234567890_abc123'
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES public.conversation_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Simple Feedback Types
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'correction', 'flag')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  correction TEXT, -- For RLHF training data
  
  -- Timestamp
  created_at TEXT NOT NULL
);

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON public.conversation_messages(role);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON public.conversation_messages(created_at DESC);

-- Vector similarity search index for RLHF training
CREATE INDEX IF NOT EXISTS idx_conversation_messages_embedding ON public.conversation_messages 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Feedback indexes for admin analytics
CREATE INDEX IF NOT EXISTS idx_message_feedback_conversation_id ON public.message_feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_feedback_message_id ON public.message_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_message_feedback_feedback_type ON public.message_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_message_feedback_created_at ON public.message_feedback(created_at DESC);

-- ========================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.conversation_messages;

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.message_feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.message_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON public.message_feedback;

DROP POLICY IF EXISTS "Admins can view all conversations for analytics" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view all messages for training" ON public.conversation_messages;
DROP POLICY IF EXISTS "Admins can view all feedback for RLHF" ON public.message_feedback;

-- Conversations policies
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from their conversations" 
ON public.conversation_messages FOR SELECT 
USING (
  conversation_id IN (
    SELECT id FROM public.conversations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their conversations" 
ON public.conversation_messages FOR INSERT 
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations WHERE user_id = auth.uid()
  )
);

-- Feedback policies
CREATE POLICY "Users can view their own feedback" 
ON public.message_feedback FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" 
ON public.message_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin policies for analytics (role-based access)
CREATE POLICY "Admins can view all conversations for analytics" 
ON public.conversations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can view all messages for training" 
ON public.conversation_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can view all feedback for RLHF" 
ON public.message_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- ========================================
-- 6. FUNCTIONS FOR RLHF AND ANALYTICS
-- ========================================

-- Function to search messages for training data
CREATE OR REPLACE FUNCTION search_training_messages(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 50
)
RETURNS TABLE (
  message_id TEXT,
  conversation_id TEXT,
  content TEXT,
  role TEXT,
  similarity FLOAT,
  has_feedback BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.id as message_id,
    cm.conversation_id,
    cm.content,
    cm.role,
    1 - (cm.embedding <=> query_embedding) AS similarity,
    EXISTS(SELECT 1 FROM public.message_feedback mf WHERE mf.message_id = cm.id) as has_feedback
  FROM
    public.conversation_messages cm
  WHERE
    cm.embedding IS NOT NULL
  AND
    1 - (cm.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$;

-- Function to get feedback analytics for admin
CREATE OR REPLACE FUNCTION get_feedback_analytics()
RETURNS TABLE (
  total_messages BIGINT,
  total_feedback BIGINT,
  helpful_feedback BIGINT,
  not_helpful_feedback BIGINT,
  corrections_provided BIGINT,
  flagged_messages BIGINT,
  avg_rating FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.conversation_messages WHERE role = 'assistant') as total_messages,
    COUNT(*) as total_feedback,
    COUNT(*) FILTER (WHERE feedback_type = 'helpful') as helpful_feedback,
    COUNT(*) FILTER (WHERE feedback_type = 'not_helpful') as not_helpful_feedback,
    COUNT(*) FILTER (WHERE correction IS NOT NULL AND correction != '') as corrections_provided,
    COUNT(*) FILTER (WHERE feedback_type = 'flag') as flagged_messages,
    AVG(rating) as avg_rating
  FROM
    public.message_feedback;
END;
$$;

-- Function to get conversation type analytics
CREATE OR REPLACE FUNCTION get_conversation_type_analytics()
RETURNS TABLE (
  conversation_type TEXT,
  total_conversations BIGINT,
  avg_messages_per_conversation FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.conversation_type,
    COUNT(*) as total_conversations,
    AVG(c.message_count::FLOAT) as avg_messages_per_conversation
  FROM
    public.conversations c
  GROUP BY
    c.conversation_type
  ORDER BY
    total_conversations DESC;
END;
$$;

-- ========================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update conversation message count
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    message_count = message_count + 1,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message insertion
DROP TRIGGER IF EXISTS trigger_update_conversation_message_count ON public.conversation_messages;
CREATE TRIGGER trigger_update_conversation_message_count
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_message_count();

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.conversations IS 'Simple conversation tracking for CEA interactions with RLHF focus';
COMMENT ON TABLE public.conversation_messages IS 'Long-term message storage with vector embeddings for RLHF training';
COMMENT ON TABLE public.message_feedback IS 'Human feedback collection for RLHF and model training';

COMMENT ON COLUMN public.conversations.id IS 'Redis-generated conversation IDs for seamless integration';
COMMENT ON COLUMN public.conversation_messages.embedding IS 'Vector embedding for semantic search and RLHF training';
COMMENT ON COLUMN public.message_feedback.correction IS 'User corrections for RLHF training data'; 