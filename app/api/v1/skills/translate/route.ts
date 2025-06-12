/**
 * Skills Translation API v1 - RESTful Operations
 * 
 * Handles skill translation and mapping:
 * - GET /api/v1/skills/translate - Get supported skill translations
 * - POST /api/v1/skills/translate - Translate skills to climate careers
 * 
 * Location: /app/api/v1/skills/translate/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

interface SkillTranslation {
  original_skill: string;
  climate_skills: string[];
  relevance_score: number;
  career_paths: string[];
  description: string;
}

function createErrorResponse(message: string, status: number, details?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    } as ApiResponse<null>,
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

// Skill translation mappings (could be moved to database later)
const SKILL_MAPPINGS: Record<string, SkillTranslation> = {
  "project management": {
    original_skill: "project management",
    climate_skills: ["sustainable project coordination", "environmental program management", "climate initiative leadership"],
    relevance_score: 0.9,
    career_paths: ["sustainability consultant", "environmental project manager", "climate program director"],
    description: "Project management skills are highly transferable to climate initiatives and sustainability programs"
  },
  "data analysis": {
    original_skill: "data analysis",
    climate_skills: ["climate data modeling", "environmental impact assessment", "carbon footprint analysis"],
    relevance_score: 0.95,
    career_paths: ["climate data scientist", "environmental analyst", "sustainability metrics specialist"],
    description: "Data analysis is crucial for measuring environmental impact and climate solutions effectiveness"
  },
  "marketing": {
    original_skill: "marketing",
    climate_skills: ["sustainability communications", "green product marketing", "climate advocacy campaigns"],
    relevance_score: 0.8,
    career_paths: ["sustainability marketing manager", "environmental communications specialist", "climate advocacy coordinator"],
    description: "Marketing skills can promote climate solutions and drive sustainable behavior change"
  },
  "software engineering": {
    original_skill: "software engineering",
    climate_skills: ["climate tech development", "environmental monitoring systems", "energy efficiency platforms"],
    relevance_score: 0.85,
    career_paths: ["climate tech engineer", "sustainability software developer", "environmental systems architect"],
    description: "Software engineering powers climate tech solutions and environmental monitoring systems"
  },
  "finance": {
    original_skill: "finance",
    climate_skills: ["green finance", "carbon market analysis", "sustainable investment evaluation"],
    relevance_score: 0.9,
    career_paths: ["green finance analyst", "sustainability investment manager", "carbon market specialist"],
    description: "Financial expertise is essential for climate investments and green economic transitions"
  }
};

// GET /api/v1/skills/translate - Get supported skill translations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // If specific skill requested
    if (skill) {
      const skillLower = skill.toLowerCase();
      const translation = SKILL_MAPPINGS[skillLower];
      
      if (translation) {
        return createSuccessResponse(
          translation,
          `Translation found for skill: ${skill}`
        );
      } else {
        // Generate dynamic translation for unmapped skills
        const dynamicTranslation: SkillTranslation = {
          original_skill: skill,
          climate_skills: [`green ${skill}`, `sustainable ${skill}`, `climate-focused ${skill}`],
          relevance_score: 0.6,
          career_paths: [`climate ${skill} specialist`, `environmental ${skill} coordinator`],
          description: `${skill} can be applied to climate and sustainability initiatives with appropriate training`
        };
        
        return createSuccessResponse(
          dynamicTranslation,
          `Dynamic translation generated for skill: ${skill}`,
          { type: 'dynamic', confidence: 'medium' }
        );
      }
    }

    // Return all available translations
    const allTranslations = Object.values(SKILL_MAPPINGS);
    
    // Filter by category if provided
    let filteredTranslations = allTranslations;
    if (category) {
      filteredTranslations = allTranslations.filter(t => 
        t.career_paths.some(path => 
          path.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply limit
    const limitedTranslations = filteredTranslations.slice(0, limit);

    return createSuccessResponse(
      limitedTranslations,
      'Skill translations retrieved successfully',
      { 
        total_available: allTranslations.length,
        filtered_count: filteredTranslations.length,
        returned_count: limitedTranslations.length,
        filters: { skill, category, limit }
      }
    );

  } catch (error: any) {
    console.error('GET /api/v1/skills/translate error:', error);
    return createErrorResponse('Failed to retrieve skill translations', 500);
  }
}

// POST /api/v1/skills/translate - Translate skills to climate careers
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Optional authentication (can work without auth for basic translation)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { 
      skills = [], 
      career_interests = [], 
      experience_level = 'intermediate',
      include_training_recommendations = true 
    } = body;

    // Validation
    if (!Array.isArray(skills) || skills.length === 0) {
      return createErrorResponse('Skills array is required and cannot be empty', 400);
    }

    if (skills.length > 20) {
      return createErrorResponse('Maximum 20 skills allowed per request', 400);
    }

    // Process each skill
    const translations: SkillTranslation[] = [];
    const unmappedSkills: string[] = [];
    
    for (const skill of skills) {
      if (typeof skill !== 'string') {
        continue;
      }
      
      const skillLower = skill.toLowerCase().trim();
      const translation = SKILL_MAPPINGS[skillLower];
      
      if (translation) {
        translations.push(translation);
      } else {
        unmappedSkills.push(skill);
        
        // Generate dynamic translation
        const dynamicTranslation: SkillTranslation = {
          original_skill: skill,
          climate_skills: [`sustainable ${skill}`, `environmental ${skill}`, `green ${skill}`],
          relevance_score: calculateRelevanceScore(skill, career_interests),
          career_paths: generateCareerPaths(skill, experience_level),
          description: `Your ${skill} experience can be valuable in climate and sustainability roles with some additional green skills training`
        };
        
        translations.push(dynamicTranslation);
      }
    }

    // Generate summary insights
    const averageRelevance = translations.reduce((sum, t) => sum + t.relevance_score, 0) / translations.length;
    const topCareerPaths = [...new Set(translations.flatMap(t => t.career_paths))].slice(0, 5);
    const recommendedSkills = [...new Set(translations.flatMap(t => t.climate_skills))].slice(0, 10);

    const response = {
      translations,
      summary: {
        total_skills_processed: skills.length,
        average_climate_relevance: Math.round(averageRelevance * 100) / 100,
        top_career_paths: topCareerPaths,
        recommended_climate_skills: recommendedSkills,
        experience_level,
        unmapped_skills_count: unmappedSkills.length
      },
      training_recommendations: include_training_recommendations ? generateTrainingRecommendations(translations) : null,
      next_steps: [
        "Review recommended career paths that match your skills",
        "Consider developing the suggested climate-specific skills",
        "Explore training programs for your target career paths",
        "Connect with professionals in your areas of interest"
      ]
    };

    // Log usage if user is authenticated
    if (user) {
      try {
        await supabase.from('skill_translation_logs').insert({
          user_id: user.id,
          skills_input: skills,
          translations_count: translations.length,
          average_relevance: averageRelevance,
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        // Don't fail the request if logging fails
        console.warn('Failed to log skill translation usage:', logError);
      }
    }

    return createSuccessResponse(
      response,
      'Skills translated successfully',
      { 
        user_authenticated: !!user,
        processing_time: Date.now()
      }
    );

  } catch (error: any) {
    console.error('POST /api/v1/skills/translate error:', error);
    return createErrorResponse('Failed to translate skills', 500);
  }
}

// Helper functions
function calculateRelevanceScore(skill: string, careerInterests: string[]): number {
  // Basic relevance calculation
  let score = 0.6; // Base score
  
  // Boost score if skill contains sustainability/climate keywords
  const climateKeywords = ['environment', 'sustain', 'green', 'climate', 'renewable', 'clean'];
  if (climateKeywords.some(keyword => skill.toLowerCase().includes(keyword))) {
    score += 0.3;
  }
  
  // Boost score if aligns with career interests
  if (careerInterests.some(interest => 
    skill.toLowerCase().includes(interest.toLowerCase()) ||
    interest.toLowerCase().includes(skill.toLowerCase())
  )) {
    score += 0.1;
  }
  
  return Math.min(score, 1.0);
}

function generateCareerPaths(skill: string, experienceLevel: string): string[] {
  const levelMap: Record<string, string> = {
    'entry': 'coordinator',
    'intermediate': 'specialist',
    'senior': 'manager',
    'expert': 'director'
  };
  
  const level = levelMap[experienceLevel] || 'specialist';
  
  return [
    `sustainability ${level}`,
    `environmental ${skill} ${level}`,
    `climate ${skill} ${level}`
  ];
}

function generateTrainingRecommendations(translations: SkillTranslation[]): string[] {
  const recommendations = [
    "Climate Science Fundamentals - Understanding climate change basics",
    "Sustainability Frameworks - Learn about ESG, SDGs, and sustainability standards",
    "Environmental Impact Assessment - Methods for measuring environmental effects"
  ];
  
  // Add specific recommendations based on translations
  const hasDataSkills = translations.some(t => t.original_skill.includes('data') || t.original_skill.includes('analysis'));
  const hasBusinessSkills = translations.some(t => t.original_skill.includes('business') || t.original_skill.includes('management'));
  const hasTechSkills = translations.some(t => t.original_skill.includes('software') || t.original_skill.includes('engineering'));
  
  if (hasDataSkills) {
    recommendations.push("Climate Data Analysis - Working with environmental datasets and modeling");
  }
  
  if (hasBusinessSkills) {
    recommendations.push("Sustainable Business Strategy - Integrating sustainability into business operations");
  }
  
  if (hasTechSkills) {
    recommendations.push("Climate Tech Development - Building solutions for climate challenges");
  }
  
  return recommendations;
}

// OPTIONS - CORS preflight support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 