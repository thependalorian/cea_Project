/**
 * Supabase Server Configuration
 * Purpose: Server-side Supabase instance for SSR and API routes
 * Location: /lib/supabase-server.ts
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export default async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get the current user from the session
 * This is a helper function to get the current user in server components
 */
export const getCurrentUser = async () => {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()
  
  return session?.user || null
}

/**
 * Get the current user's profile
 * This is a helper function to get the current user's profile in server components
 */
export const getUserProfile = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }
  
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
} 