import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Skills Translation API Endpoint - KEY SELLING POINT
 * 
 * AI-powered skills translation specialized for CEA's target communities:
 * - Veterans: Military skill translation with leadership, systems thinking, security clearances
 * - Environmental Justice Communities: Community organizing, advocacy, lived experience assets  
 * - International Professionals: Global perspectives, multilingual capabilities, diverse backgrounds
 * 
 * Provides:
 * - Community-specific transferability scoring and positioning advice
 * - Barrier identification and mitigation strategies
 * - Cultural asset recognition and amplification
 * - Community-specific success stories and pathways
 * - Network resources and partner connections
 * - Actionable steps tailored to community needs
 * 
 * Location: /app/api/skills-translation/route.ts
 */

interface SkillTranslationRequest {
  user_id: string;
  target_climate_sector?: string;
  current_industry?: string;
  experience_level?: string;
  community_background?: 'veteran' | 'environmental_justice' | 'international_professional';
  military_branch?: string;
  country_of_origin?: string;
  languages_spoken?: string[];
  community_connections?: string[];
}

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

async function checkBackendHealth(): Promise<{ isHealthy: boolean; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { isHealthy: false, error: 'Backend health check failed' };
    }

    return { isHealthy: true };
  } catch {
    return { isHealthy: false, error: 'Failed to connect to Python backend' };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if backend is healthy
    const healthCheck = await checkBackendHealth();
    if (!healthCheck.isHealthy) {
      return NextResponse.json(
        { error: healthCheck.error || 'Python backend is not properly configured.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Verify user can only access their own data
    if (body.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access other user data' },
        { status: 403 }
      );
    }

    // Check if user has a resume
    const { data: resumes, error: resumeError } = await supabase
      .from('resumes')
      .select('id, file_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (resumeError) {
      console.error('Error checking user resume:', resumeError);
      return NextResponse.json(
        { error: 'Error checking user resume' },
        { status: 500 }
      );
    }

    if (!resumes || resumes.length === 0) {
      return NextResponse.json(
        { error: 'No resume found. Please upload a resume before using skills translation.' },
        { status: 404 }
      );
    }

    // Prepare request for Python backend
    const skillsTranslationRequest: SkillTranslationRequest = {
      user_id: body.user_id,
      target_climate_sector: body.target_climate_sector || 'general',
      current_industry: body.current_industry,
      experience_level: body.experience_level,
      community_background: body.community_background,
      military_branch: body.military_branch,
      country_of_origin: body.country_of_origin,
      languages_spoken: Array.isArray(body.languages_spoken) ? body.languages_spoken : [],
      community_connections: Array.isArray(body.community_connections) ? body.community_connections : []
    };

    try {
      // Call Python backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for complex analysis

      const response = await fetch(`${BACKEND_URL}/api/skills-translation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillsTranslationRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Python backend error:', errorText);
        return NextResponse.json(
          { error: `Backend error: ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Add metadata about the analysis
      const enhancedResponse = {
        ...data,
        metadata: {
          analyzed_at: new Date().toISOString(),
          resume_file: resumes[0].file_name,
          analysis_type: 'comprehensive_skills_translation',
          community_focused: !!body.community_background,
          target_sector: body.target_climate_sector || 'general'
        }
      };

      return NextResponse.json(enhancedResponse);

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Skills translation analysis timed out. This is a complex analysis - please try again.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to Python backend. Please ensure it is running on port 8000.' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Error in skills translation API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process skills translation request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication for GET requests (checking user's translation history)
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Verify user can only access their own data
    if (!userId || userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid user access' },
        { status: 403 }
      );
    }

    // Check if user has resume and when last analysis was done
    const { data: resumes, error: resumeError } = await supabase
      .from('resumes')
      .select('id, file_name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (resumeError) {
      console.error('Error checking user resume:', resumeError);
      return NextResponse.json(
        { error: 'Error checking user resume' },
        { status: 500 }
      );
    }

    const hasResume = resumes && resumes.length > 0;
    const resumeData = hasResume ? resumes[0] : null;

    // Return analysis availability info
    return NextResponse.json({
      user_id: userId,
      has_resume: hasResume,
      resume_info: resumeData ? {
        file_name: resumeData.file_name,
        uploaded_at: resumeData.created_at,
        last_updated: resumeData.updated_at
      } : null,
      available_features: {
        skills_translation: hasResume,
        community_analysis: hasResume,
        career_pathways: hasResume,
        network_resources: true
      },
      supported_communities: [
        'veteran',
        'environmental_justice', 
        'international_professional'
      ],
      supported_sectors: [
        'solar',
        'wind', 
        'energy_efficiency',
        'renewable_energy',
        'climate_policy',
        'environmental_consulting',
        'green_building',
        'general'
      ]
    });

  } catch (error) {
    console.error('Error in skills translation GET:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get skills translation info',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 