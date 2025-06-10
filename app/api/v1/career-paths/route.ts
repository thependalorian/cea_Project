import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Career Paths API - Climate Economy Assistant
 * Generates personalized career pathways based on user profile and skills
 * Location: app/api/v1/career-paths/route.ts
 */

interface CareerPathRequest {
  user_id: string;
  current_skills?: string[];
  target_roles?: string[];
  experience_level?: string;
  climate_focus?: string[];
}

interface CareerPath {
  role_title: string;
  match_score: number;
  required_skills: string[];
  skill_gaps: string[];
  training_programs: Array<{
    id: string;
    program_name: string;
    provider: string;
    duration: string;
    skills_covered: string[];
  }>;
  salary_range: string;
  job_opportunities: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CareerPathRequest = await request.json();
    const { user_id, current_skills = [], target_roles = [], experience_level, climate_focus = [] } = body;

    // Verify user can access this data
    if (user_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get user interests and resume data for enhanced recommendations
    const { data: userInterests } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: resumeData } = await supabase
      .from('resumes')
      .select('skills_extracted, experience_years, content')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get role requirements from database
    const { data: roles } = await supabase
      .from('role_requirements')
      .select('*')
      .in('role_title', target_roles.length > 0 ? target_roles : ['Software Engineer', 'Project Manager', 'Data Analyst']);

    // Get available education programs
    const { data: programs } = await supabase
      .from('education_programs')
      .select(`
        id,
        program_name,
        duration,
        skills_taught,
        climate_focus,
        partner_profiles!inner(organization_name)
      `)
      .eq('is_active', true)
      .overlaps('climate_focus', climate_focus.length > 0 ? climate_focus : ['clean_energy']);

    // Generate career paths with matching logic
    const careerPaths: CareerPath[] = [];
    const userSkills = [...current_skills, ...(resumeData?.skills_extracted || [])];
    
    if (roles) {
      for (const role of roles) {
        const requiredSkills = role.required_skills || [];
        
        // Calculate match score based on skill overlap
        const matchingSkills = userSkills.filter(skill => 
          requiredSkills.some((req: string) => req.toLowerCase().includes(skill.toLowerCase()))
        );
        const matchScore = requiredSkills.length > 0 ? 
          (matchingSkills.length / requiredSkills.length) * 100 : 0;

        // Identify skill gaps
        const skillGaps = requiredSkills.filter((skill: string) => 
          !userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
        );

        // Find relevant training programs
        const relevantPrograms = programs?.filter(program => 
          program.skills_taught?.some((skill: string) => skillGaps.includes(skill))
        ).map(program => ({
          id: program.id,
          program_name: program.program_name,
          provider: program.partner_profiles?.[0]?.organization_name || 'Partner Organization',
          duration: program.duration || 'Variable',
          skills_covered: program.skills_taught || []
        })) || [];

        careerPaths.push({
          role_title: role.role_title,
          match_score: Math.round(matchScore),
          required_skills: requiredSkills,
          skill_gaps: skillGaps,
          training_programs: relevantPrograms.slice(0, 3), // Top 3 programs
          salary_range: role.salary_range?.min && role.salary_range?.max ? 
            `$${role.salary_range.min.toLocaleString()} - $${role.salary_range.max.toLocaleString()}` : 
            'Competitive',
          job_opportunities: Math.floor(Math.random() * 50) + 10 // Placeholder - would be real data
        });
      }
    }

    // Sort by match score
    careerPaths.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      success: true,
      career_paths: careerPaths,
      user_profile: {
        current_skills: userSkills,
        experience_level: experience_level || (resumeData?.experience_years ? 
          `${resumeData.experience_years} years` : 'Entry Level'),
        climate_focus: climate_focus.length > 0 ? climate_focus : userInterests?.climate_focus || []
      }
    });

  } catch (error) {
    console.error('Career paths API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Career Paths API",
    description: "POST to generate personalized career pathways",
    example_request: {
      user_id: "uuid",
      current_skills: ["JavaScript", "React"],
      target_roles: ["Software Engineer", "Frontend Developer"],
      experience_level: "mid_level",
      climate_focus: ["clean_energy", "renewable_energy"]
    }
  });
} 