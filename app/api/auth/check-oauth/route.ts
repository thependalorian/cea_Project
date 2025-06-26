/**
 * OAuth provider check endpoint
 * Purpose: Check if OAuth providers are properly configured
 * Location: /app/api/auth/check-oauth/route.ts
 */
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.APP_URL || 
                  'http://localhost:3000'
    
    // Check if Google OAuth is configured
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    
    const isGoogleConfigured = Boolean(googleClientId && googleClientSecret)
    
    if (!isGoogleConfigured) {
      console.warn('Google OAuth is not properly configured')
    }
    
    return NextResponse.json({
      success: true,
      enabledProviders: isGoogleConfigured ? ['google'] : [],
      redirectUrl: appUrl,
      callbackUrl: `${appUrl}/api/auth/callback`,
      isConfigured: {
        google: isGoogleConfigured
      }
    })
  } catch (error) {
    console.error('Error checking OAuth providers:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check OAuth providers',
        enabledProviders: [],
        redirectUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
        isConfigured: {
          google: false
        }
      },
      { status: 500 }
    )
  }
} 