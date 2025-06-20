import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // In Server Components, cookies can only be set in Route Handlers or Server Actions
          // We'll handle this gracefully by not attempting to set cookies in server components
          return
        },
        remove(name: string, options: any) {
          // In Server Components, cookies can only be removed in Route Handlers or Server Actions
          // We'll handle this gracefully by not attempting to remove cookies in server components
          return
        },
      },
    }
  )
}

// Helper function to safely get user with proper error handling
export async function getUser() {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()
    
    console.log('🔍 SERVER: getUser called, result:', {
      hasUser: !!user,
      userEmail: user?.email || null,
      error: error?.message || null,
      errorName: error?.name || null
    });
    
    // Handle AuthSessionMissingError properly - this is expected when user is not logged in
    if (error && error.name === 'AuthSessionMissingError') {
      return { user: null, error: null }
    }
    
    if (error) {
      console.error('🚨 SERVER: Unexpected auth error:', error)
      return { user: null, error }
    }
    
    if (user) {
      console.log('✅ SERVER: User authenticated successfully:', user.email)
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('🚨 SERVER: Error getting user:', error)
    return { user: null, error }
  }
}

// Alternative client for Route Handlers and Server Actions where cookies can be modified
export async function createClientForRouteHandler() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            console.log('Cookie set error in route handler:', error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', {
              ...options,
              maxAge: 0,
            })
          } catch (error) {
            console.log('Cookie remove error in route handler:', error)
          }
        },
      },
    }
  )
}
