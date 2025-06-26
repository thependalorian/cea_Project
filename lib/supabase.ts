/**
 * Supabase Client Configuration
 * Purpose: Client-side Supabase instance for browser usage
 * Location: /lib/supabase.ts
 */
import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export default function createClient() {
  return createBrowserClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Backward compatibility exports
export const createBrowserClient = createClient
export const supabase = createClient() 