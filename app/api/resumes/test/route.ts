/**
 * Resume Processing Test Route - Verify DeepSeek Integration
 * Purpose: Test resume processing pipeline with sample data
 * Location: /app/api/resumes/test/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Sample resume text for testing
    const sampleResumeText = `
John Smith
Climate Energy Engineer
john.smith@email.com | (555) 123-4567

SUMMARY
Experienced renewable energy engineer with 5+ years in solar panel installation, 
wind turbine maintenance, and energy efficiency consulting. Passionate about 
climate action and sustainable technology solutions.

EXPERIENCE
Senior Solar Engineer - GreenTech Solutions (2020-2024)
- Designed and implemented 50+ solar installations
- Reduced client energy costs by average 40%
- Led team of 8 technicians in renewable energy projects
- Expertise in photovoltaic systems and energy storage

Wind Energy Technician - EcoWind Corp (2018-2020)
- Maintained and repaired wind turbines
- Performed safety inspections and troubleshooting
- Improved turbine efficiency by 15% through optimization

SKILLS
- Solar panel installation and design
- Wind energy systems
- Energy efficiency auditing
- Climate impact assessment
- Project management
- Sustainability consulting

EDUCATION
B.S. Environmental Engineering - State University (2018)
Renewable Energy Certification - Clean Energy Institute (2019)
    `

    // Call backend processing API
    const processorResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/resumes/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-123'
      },
      body: JSON.stringify({
        user_id: 'test-user-123',
        filename: 'test_climate_engineer_resume.txt',
        content: sampleResumeText
      })
    })

    if (!processorResponse.ok) {
      const errorData = await processorResponse.json()
      console.error('Backend processing test failed:', errorData)
      return NextResponse.json({ 
        success: false,
        error: 'Resume processing test failed',
        details: errorData.error || 'Unknown backend error'
      }, { status: 500 })
    }

    const result = await processorResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Resume processing test completed successfully with DeepSeek',
      test_results: {
        resume_id: result.resume_id,
        chunks_processed: result.chunks_processed,
        skills_extracted: result.skills_extracted,
        climate_relevance_score: result.climate_relevance_score,
        processing_method: 'DeepSeek LLM + Free Embeddings'
      },
      sample_resume_analyzed: true
    })

  } catch (error) {
    console.error('Resume processing test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Resume processing test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 