import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    console.log("📁 API: check-user-resume called")
    const { user_id } = await req.json();
    
    if (!user_id) {
      console.log("📁 API: No user_id provided")
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log("📁 API: Checking resume for user:", user_id)
    
    // Connect to Supabase
    const supabase = await createClient();
    
    // Verify current authenticated user matches requested user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // In production, enforce authentication
    if (!isDevelopment) {
      if (!user || authError) {
        console.log("📁 API: Authentication failed")
        return NextResponse.json(
          { error: 'Authentication required', auth_error: authError?.message },
          { status: 401 }
        );
      }
      
      if (user.id !== user_id) {
        console.log("📁 API: User ID mismatch")
        return NextResponse.json(
          { error: 'Unauthorized: User ID mismatch' },
          { status: 403 }
        );
      }
    } else {
      // In development, log but don't restrict
      if (!user || authError) {
        console.log("📁 API: Auth check failed - continuing for debugging (development mode)")
      } else if (user.id !== user_id) {
        console.log("📁 API: User ID mismatch - continuing for debugging (development mode)")
      }
    }
    
    // Query for the most recent resume for this user
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('id, file_name, linkedin_url, github_url, personal_website, social_data, processed')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('📁 API: Error checking user resume:', error);
      return NextResponse.json(
        { error: 'Failed to check resume status', details: error.message },
        { status: 500 }
      );
    }
    
    if (!resumes || resumes.length === 0) {
      console.log("📁 API: No resume found for user:", user_id)
      return NextResponse.json({
        has_resume: false,
        has_social_data: false,
        social_links: {}
      });
    }
    
    const resume = resumes[0];
    const has_social_data = Boolean(resume.social_data);
    const is_processed = Boolean(resume.processed);
    
    const social_links = {
      linkedin_url: resume.linkedin_url || null,
      github_url: resume.github_url || null,
      personal_website: resume.personal_website || null
    };
    
    console.log("📁 API: Resume found:", {
      id: resume.id,
      filename: resume.file_name,
      processed: is_processed,
      has_social_data
    });
    
    return NextResponse.json({
      has_resume: true,
      resume_id: resume.id,
      file_name: resume.file_name,
      has_social_data: has_social_data,
      is_processed: is_processed,
      social_links: social_links
    });
    
  } catch (error) {
    console.error('📁 API: Error in check-user-resume:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 