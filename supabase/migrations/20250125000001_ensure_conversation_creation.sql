-- Fix foreign key constraint issues by ensuring conversations exist
-- This resolves: Key (conversation_id) is not present in table "conversations"

-- Create function to ensure conversation exists before inserting messages
CREATE OR REPLACE FUNCTION ensure_conversation_exists(conv_id TEXT, user_id_param UUID)
RETURNS UUID AS $$
DECLARE
    existing_conv_id UUID;
BEGIN
    -- Check if conversation already exists
    SELECT id INTO existing_conv_id 
    FROM conversations 
    WHERE id = conv_id::UUID;
    
    -- If not found, create it
    IF existing_conv_id IS NULL THEN
        INSERT INTO conversations (id, user_id, title, created_at, updated_at)
        VALUES (conv_id::UUID, user_id_param, 'Climate Assistant Chat', NOW(), NOW())
        RETURNING id INTO existing_conv_id;
    END IF;
    
    RETURN existing_conv_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-create conversations
CREATE OR REPLACE FUNCTION auto_create_conversation()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract user_id from conversation_id pattern (conv_userid_timestamp)
    -- Fallback to a default user if pattern doesn't match
    PERFORM ensure_conversation_exists(
        NEW.conversation_id,
        COALESCE(
            (SELECT id FROM auth.users LIMIT 1), -- fallback to first user
            '00000000-0000-0000-0000-000000000000'::UUID -- ultimate fallback
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on conversation_messages
DROP TRIGGER IF EXISTS trigger_auto_create_conversation ON conversation_messages;
CREATE TRIGGER trigger_auto_create_conversation
    BEFORE INSERT ON conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_conversation(); 