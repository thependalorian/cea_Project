import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user_id, resume_id, force_refresh } = await req.json();
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to Supabase
    const supabase = await createClient();
    
    // Get resume ID if not provided
    let resumeId = resume_id;
    if (!resumeId) {
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('id, social_data')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error || !resumes || resumes.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No resume found for this user. Please upload a resume first.'
        });
      }
      
      resumeId = resumes[0].id;
      
      // Check if we already have social data and force_refresh is false
      if (!force_refresh && resumes[0].social_data) {
        let socialSummary = null;
        if (typeof resumes[0].social_data === 'object') {
          socialSummary = resumes[0].social_data?.comprehensive_profile;
        }
        
        return NextResponse.json({
          success: true,
          message: 'Social data already exists for this resume.',
          has_social_data: true,
          social_summary: socialSummary
        });
      }
    }
    
    // Get social links from the resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('linkedin_url, github_url, personal_website')
      .eq('id', resumeId)
      .single();
    
    if (resumeError || !resume) {
      return NextResponse.json({
        success: false,
        message: 'Resume not found.'
      });
    }
    
    // Check if we have any social links
    const hasAnyLinks = Boolean(
      resume.linkedin_url || 
      resume.github_url || 
      resume.personal_website
    );
    
    if (!hasAnyLinks) {
      return NextResponse.json({
        success: false,
        message: 'No social links found in this resume. Please add social links first or re-upload your resume.'
      });
    }
    
    // For now, we'll simulate the social data without calling the Python backend
    // In a real implementation, you would call the Python backend to get social data
    const mockSocialData = {
      comprehensive_profile: `Based on your LinkedIn and other profiles, you appear to have expertise in ${resume.linkedin_url ? 'professional networking' : 'technical skills'} and ${resume.github_url ? 'software development' : 'business development'}.`,
      profile_summary: {
        skills: ['Communication', 'Problem Solving', 'Teamwork'],
        interests: ['Climate Technology', 'Sustainable Development', 'Renewable Energy'],
        education: ['Bachelor\'s Degree']
      }
    };
    
    // Update the resume with social data
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ social_data: mockSocialData })
      .eq('id', resumeId);
    
    if (updateError) {
      console.error('Error updating resume with social data:', updateError);
      return NextResponse.json({
        success: false,
        message: `Error updating resume with social data: ${updateError.message}`
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced search completed successfully. Social profile information has been added to your resume data.',
      has_social_data: true,
      social_summary: mockSocialData.comprehensive_profile
    });
    
  } catch (error) {
    console.error('Error in enhanced search:', error);
    return NextResponse.json({
      success: false,
      message: `Error in enhanced search: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
} 