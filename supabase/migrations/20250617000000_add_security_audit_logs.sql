-- Add security_audit_logs table for audit logging
-- Migration: 20250617000000_add_security_audit_logs.sql

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  endpoint TEXT,
  status_code INTEGER,
  request_method TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp ON security_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_endpoint ON security_audit_logs(endpoint);

-- Enable RLS
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only access)
CREATE POLICY "Admins can view security audit logs" ON security_audit_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "System can insert security audit logs" ON security_audit_logs FOR INSERT 
WITH CHECK (true); -- Allow system inserts

-- Grant necessary permissions
GRANT INSERT ON security_audit_logs TO service_role;
GRANT SELECT ON security_audit_logs TO service_role; 