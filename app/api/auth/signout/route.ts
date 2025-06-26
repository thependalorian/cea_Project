/**
 * Auth Sign Out Route
 * Purpose: Handle user sign out requests
 * Location: /app/api/auth/signout/route.ts
 */
import { NextRequest, NextResponse } from 'next/server'
import createClient from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Signed out successfully' })
  } catch (error) {
    console.error('Error signing out:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 