/**
 * AuthProvider Component
 * Purpose: Provides authentication context for the application using Supabase Auth
 * Location: /providers/AuthProvider.tsx
 */
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import createClient from '@/lib/supabase/client'

// Create context for Supabase auth
const AuthContext = createContext<{
  session: Session | null
  user: User | null
  error: Error | null
  isLoading: boolean
}>({
  session: null,
  user: null,
  error: null,
  isLoading: true
})

// Export the default AuthProvider
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        
        setSession(supabaseSession)
        setUser(supabaseSession?.user ?? null)
      } catch (e) {
        setError(e as Error)
        console.error('Error fetching session:', e)
      } finally {
        setIsLoading(false)
      }
    }

    // Get initial session
    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ session, user, error, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export the hook for accessing Supabase auth context
export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider')
  }
  return context
}

// Add useAuth hook for authentication functions
export const useAuth = () => {
  const supabase = createClient()
  const { session, user, isLoading } = useSupabaseAuth()

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metadata,
      },
    })
    return { error, user: data.user }
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  return {
    signIn,
    signUp,
    signOut,
    session,
    user,
    isLoading
  }
} 