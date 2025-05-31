import { createClient as createServiceClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key
// This bypasses RLS policies and should ONLY be used in server-side code
// that requires admin privileges
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 