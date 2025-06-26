-- Fix missing agent_used column in conversation_analytics table
-- This resolves the error: Could not find the 'agent_used' column

-- Add missing agent_used column
ALTER TABLE conversation_analytics 
ADD COLUMN IF NOT EXISTS agent_used TEXT;

-- Add missing columns for better analytics
ALTER TABLE conversation_analytics 
ADD COLUMN IF NOT EXISTS team_used TEXT,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS routing_reason TEXT;

-- Update any existing records with default values
UPDATE conversation_analytics 
SET agent_used = 'pendo', 
    team_used = 'specialists',
    confidence_score = 0.8
WHERE agent_used IS NULL; 