-- Fix Conversation Relationship Issues
-- Purpose: Ensure conversation analytics can be properly linked to conversations
-- Date: 2025-01-26

-- Step 1: Make foreign key constraints deferrable to allow proper creation order
ALTER TABLE conversation_analytics 
DROP CONSTRAINT IF EXISTS conversation_analytics_conversation_id_fkey;

ALTER TABLE conversation_analytics 
ADD CONSTRAINT conversation_analytics_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) 
DEFERRABLE INITIALLY DEFERRED;

-- Step 2: Add an index for better performance on conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_id_lookup ON conversations(id);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_conversation_id ON conversation_analytics(conversation_id);

-- Step 3: Add a function to automatically create conversation if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_conversation_exists(
    p_conversation_id TEXT,
    p_user_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Check if conversation exists
    IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = p_conversation_id) THEN
        -- Create the conversation
        INSERT INTO conversations (
            id,
            user_id,
            created_at,
            updated_at,
            last_activity,
            conversation_type,
            status
        ) VALUES (
            p_conversation_id,
            p_user_id,
            NOW(),
            NOW(),
            NOW(),
            'general',
            'active'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a trigger function to auto-create conversations for analytics
CREATE OR REPLACE FUNCTION auto_create_conversation_for_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure conversation exists before inserting analytics
    PERFORM ensure_conversation_exists(NEW.conversation_id, NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_create_conversation ON conversation_analytics;
CREATE TRIGGER trigger_auto_create_conversation
    BEFORE INSERT ON conversation_analytics
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_conversation_for_analytics();

-- Step 6: Create similar auto-creation for conversation_messages
CREATE OR REPLACE FUNCTION auto_create_conversation_for_messages()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract user_id from metadata if available
    DECLARE
        extracted_user_id UUID;
    BEGIN
        -- Try to extract user_id from metadata
        IF NEW.metadata ? 'user_id' THEN
            extracted_user_id := (NEW.metadata->>'user_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            extracted_user_id := NULL;
        END;
        
        -- Ensure conversation exists
        PERFORM ensure_conversation_exists(NEW.conversation_id, extracted_user_id);
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_conversation_messages ON conversation_messages;
CREATE TRIGGER trigger_auto_create_conversation_messages
    BEFORE INSERT ON conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_conversation_for_messages();

-- Step 7: Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_conversation_exists(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_create_conversation_for_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_create_conversation_for_messages() TO authenticated;

-- Step 9: Add a cleanup function for orphaned analytics (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_analytics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete analytics records that don't have corresponding conversations
    DELETE FROM conversation_analytics 
    WHERE conversation_id NOT IN (SELECT id FROM conversations);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_orphaned_analytics() IS 'Cleanup function to remove orphaned analytics records';

-- Step 10: Create a view for easy conversation analytics lookup
CREATE OR REPLACE VIEW conversation_analytics_with_details AS
SELECT 
    ca.*,
    c.user_id as conversation_user_id,
    c.created_at as conversation_created_at,
    c.status as conversation_status,
    c.conversation_type
FROM conversation_analytics ca
JOIN conversations c ON ca.conversation_id = c.id; 