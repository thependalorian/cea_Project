/**
 * Authentication Callback Handler
 * 
 * Handles email verification, password reset confirmations, and other auth callbacks
 * Following rule #4: Vercel-compatible endpoint design
 * 
 * Location: app/auth/callback/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the user to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update verification status in profiles table
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              verified: true,
              email_confirmed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating verification status:', updateError);
          }
        } catch (err) {
          console.error('Error in verification update:', err);
        }

        // Redirect based on user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        let redirectUrl = '/dashboard';
        if (profile?.user_type === 'job_seeker') {
          redirectUrl = '/job-seekers';
        } else if (profile?.user_type === 'partner') {
          redirectUrl = '/partners';
        } else if (profile?.user_type === 'admin') {
          redirectUrl = '/admin';
        }

        return NextResponse.redirect(`${origin}${redirectUrl}?verified=true`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
} 