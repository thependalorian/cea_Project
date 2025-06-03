import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Jobs API Endpoint - Climate Economy Job Listings
 * 
 * Handles CRUD operations and search for job listings from partner organizations.
 * 
 * Routes:
 * - GET: Search and filter job listings
 * - POST: Create new job listing (partner auth required)
 * - PUT: Update job listing (partner auth required)
 * - DELETE: Delete job listing (partner auth required)
 * 
 * Location: /app/api/jobs/route.ts
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    let query = supabase
      .from('job_listings')
      .select(`
        id,
        title,
        description,
        requirements,
        responsibilities,
        location,
        employment_type,
        experience_level,
        salary_range,
        climate_focus,
        skills_required,
        benefits,
        application_url,
        application_email,
        expires_at,
        created_at,
        updated_at,
        partner_id,
        profiles!inner(
          organization_name,
          organization_type,
          website,
          climate_focus
        )
      `)
      .eq('is_active', true);

    // Apply filters
    const partnerId = searchParams.get('partner_id');
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    const partnerType = searchParams.get('partner_type');
    if (partnerType) {
      query = query.eq('profiles.organization_type', partnerType);
    }

    const location = searchParams.get('location');
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const employmentType = searchParams.get('employment_type');
    if (employmentType) {
      query = query.eq('employment_type', employmentType);
    }

    const experienceLevel = searchParams.get('experience_level');
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    const climateFocus = searchParams.get('climate_focus');
    if (climateFocus) {
      query = query.contains('climate_focus', [climateFocus]);
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting and pagination
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Jobs fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedJobs = (jobs || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      location: job.location,
      employment_type: job.employment_type,
      experience_level: job.experience_level,
      salary_range: job.salary_range,
      climate_focus: job.climate_focus,
      skills_required: job.skills_required,
      benefits: job.benefits,
      application_url: job.application_url,
      application_email: job.application_email,
      expires_at: job.expires_at,
      created_at: job.created_at,
      updated_at: job.updated_at,
      partner: {
        id: job.partner_id,
        name: job.profiles?.organization_name,
        type: job.profiles?.organization_type,
        website: job.profiles?.website,
        climate_focus: job.profiles?.climate_focus
      }
    }));

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
      count: formattedJobs.length,
      total: count,
      pagination: {
        limit,
        offset,
        has_more: formattedJobs.length === limit
      }
    });

  } catch (error) {
    console.error('Jobs API GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication check for partner users
    // For now, we'll accept any valid job data
    
    const {
      partner_id,
      title,
      description,
      requirements,
      responsibilities,
      location,
      employment_type,
      experience_level,
      salary_range,
      climate_focus,
      skills_required,
      benefits,
      application_url,
      application_email,
      expires_at
    } = body;

    // Validate required fields
    if (!partner_id || !title || !description) {
      return NextResponse.json(
        { error: 'partner_id, title, and description are required' },
        { status: 400 }
      );
    }

    const jobData = {
      partner_id,
      title,
      description,
      requirements,
      responsibilities,
      location,
      employment_type: employment_type || 'full_time',
      experience_level: experience_level || 'entry_level',
      salary_range,
      climate_focus: climate_focus || [],
      skills_required: skills_required || [],
      benefits,
      application_url,
      application_email,
      expires_at,
      is_active: true
    };

    const { data: newJob, error } = await supabase
      .from('job_listings')
      .insert(jobData)
      .select(`
        *,
        profiles!inner(
          organization_name,
          organization_type,
          website
        )
      `)
      .single();

    if (error) {
      console.error('Job creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create job listing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        ...newJob,
        partner: {
          id: newJob.partner_id,
          name: newJob.profiles?.organization_name,
          type: newJob.profiles?.organization_type,
          website: newJob.profiles?.website
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Jobs API POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check - ensure user owns this job listing

    const { data: updatedJob, error } = await supabase
      .from('job_listings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        profiles!inner(
          organization_name,
          organization_type,
          website
        )
      `)
      .single();

    if (error) {
      console.error('Job update error:', error);
      return NextResponse.json(
        { error: 'Failed to update job listing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        ...updatedJob,
        partner: {
          id: updatedJob.partner_id,
          name: updatedJob.profiles?.organization_name,
          type: updatedJob.profiles?.organization_type,
          website: updatedJob.profiles?.website
        }
      }
    });

  } catch (error) {
    console.error('Jobs API PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check - ensure user owns this job listing

    const { error } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Job deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete job listing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job listing deleted successfully'
    });

  } catch (error) {
    console.error('Jobs API DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 