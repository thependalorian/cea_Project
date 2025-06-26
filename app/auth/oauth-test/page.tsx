/**
 * OAuth Test Page
 * Purpose: Test Google OAuth authentication flow
 * Location: /app/auth/oauth-test/page.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'

export default function OAuthTestPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string>('')
  const [callbackUrl, setCallbackUrl] = useState<string>('')
  const [supabase, setSupabase] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Initialize component as mounted
    setIsMounted(true)
    
    // Initialize Supabase client on the client side
    setSupabase(createBrowserClient())
    
    // Set initial URLs based on environment
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
    setRedirectUrl(appUrl)
    setCallbackUrl(`${appUrl}/api/auth/callback`)
    
    // Check OAuth providers
    async function checkOAuthProviders() {
      try {
        setLoading(true)
        const response = await fetch('/api/auth/check-oauth')
        
        if (!response.ok) {
          throw new Error('Failed to fetch OAuth configuration')
        }
        
        const data = await response.json()
        setRedirectUrl(data.redirectUrl || appUrl)
        setCallbackUrl(data.callbackUrl || `${appUrl}/api/auth/callback`)
      } catch (err) {
        console.error('Error checking OAuth config:', err)
        setError(err instanceof Error ? err.message : 'Failed to check OAuth configuration')
      } finally {
        setLoading(false)
      }
    }
    
    checkOAuthProviders()
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OAuth Configuration Test</h1>
      
      {loading && <p>Loading configuration...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Current Configuration</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Redirect URL:</strong> {redirectUrl}</p>
          <p><strong>Callback URL:</strong> {callbackUrl}</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
        <button
          onClick={() => {
            setLoading(true)
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${redirectUrl}/api/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent'
                }
              }
            }).catch((err: AuthError | Error) => {
              console.error('OAuth error:', err)
              setError(err.message)
            }).finally(() => setLoading(false))
          }}
          className="btn btn-primary"
          disabled={loading}
        >
          Test Google Sign In
        </button>
      </div>
    </div>
  )
} 