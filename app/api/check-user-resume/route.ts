import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to Supabase
    const supabase = await createClient();
    
    // Query for the most recent resume for this user
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('id, file_name, linkedin_url, github_url, personal_website, social_data')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error checking user resume:', error);
      return NextResponse.json(
        { error: 'Failed to check resume status' },
        { status: 500 }
      );
    }
    
    if (!resumes || resumes.length === 0) {
      return NextResponse.json({
        has_resume: false,
        has_social_data: false,
        social_links: {}
      });
    }
    
    const resume = resumes[0];
    const has_social_data = Boolean(resume.social_data);
    
    const social_links = {
      linkedin_url: resume.linkedin_url || null,
      github_url: resume.github_url || null,
      personal_website: resume.personal_website || null
    };
    
    return NextResponse.json({
      has_resume: true,
      resume_id: resume.id,
      file_name: resume.file_name,
      has_social_data: has_social_data,
      social_links: social_links
    });
    
  } catch (error) {
    console.error('Error in check-user-resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 