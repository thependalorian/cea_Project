'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SignUpData {
  email: string
  password: string
  user_type: 'job_seeker' | 'partner'
  first_name: string
  last_name: string
  organization_name?: string
  phone?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (userData: SignUpData) => Promise<{ error: any; data?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (userData: SignUpData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: { message: result.error || 'Failed to create account' } };
      }

      return { error: null, data: result.data };
    } catch (error) {
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to create account' 
        } 
      };
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}