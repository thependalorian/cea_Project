import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Education Programs API Endpoint - Climate Economy Training & Education
 * 
 * Handles CRUD operations and search for education programs from partner organizations.
 * 
 * Routes:
 * - GET: Search and filter education programs
 * - POST: Create new education program (partner auth required)
 * - PUT: Update education program (partner auth required)
 * - DELETE: Delete education program (partner auth required)
 * 
 * Location: /app/api/education/route.ts
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    let query = supabase
      .from('education_programs')
      .select(`
        id,
        program_name,
        description,
        program_type,
        duration,
        format,
        cost,
        prerequisites,
        climate_focus,
        skills_taught,
        certification_offered,
        application_deadline,
        start_date,
        end_date,
        contact_info,
        application_url,
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

    const programType = searchParams.get('program_type');
    if (programType) {
      query = query.eq('program_type', programType);
    }

    const format = searchParams.get('format');
    if (format) {
      query = query.eq('format', format);
    }

    const climateFocus = searchParams.get('climate_focus');
    if (climateFocus) {
      query = query.contains('climate_focus', [climateFocus]);
    }

    const skillTaught = searchParams.get('skill_taught');
    if (skillTaught) {
      query = query.contains('skills_taught', [skillTaught]);
    }

    const cost = searchParams.get('cost');
    if (cost) {
      if (cost === 'free') {
        query = query.or('cost.ilike.%free%,cost.ilike.%$0%');
      } else if (cost === 'paid') {
        query = query.not('cost', 'ilike', '%free%').not('cost', 'ilike', '%$0%');
      }
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`program_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by availability
    const available = searchParams.get('available');
    if (available === 'true') {
      const now = new Date().toISOString();
      query = query.or(`application_deadline.gte.${now},application_deadline.is.null`);
    }

    // Sorting and pagination
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data: programs, error, count } = await query;

    if (error) {
      console.error('Education programs fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch education programs', details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedPrograms = (programs || []).map((program: any) => ({
      id: program.id,
      program_name: program.program_name,
      description: program.description,
      program_type: program.program_type,
      duration: program.duration,
      format: program.format,
      cost: program.cost,
      prerequisites: program.prerequisites,
      climate_focus: program.climate_focus,
      skills_taught: program.skills_taught,
      certification_offered: program.certification_offered,
      application_deadline: program.application_deadline,
      start_date: program.start_date,
      end_date: program.end_date,
      contact_info: program.contact_info,
      application_url: program.application_url,
      created_at: program.created_at,
      updated_at: program.updated_at,
      partner: {
        id: program.partner_id,
        name: program.profiles?.organization_name,
        type: program.profiles?.organization_type,
        website: program.profiles?.website,
        climate_focus: program.profiles?.climate_focus
      },
      // Additional computed fields
      is_accepting_applications: !program.application_deadline || 
        new Date(program.application_deadline) > new Date(),
      is_upcoming: !program.start_date || 
        new Date(program.start_date) > new Date(),
      is_ongoing: program.start_date && program.end_date &&
        new Date(program.start_date) <= new Date() && 
        new Date(program.end_date) >= new Date()
    }));

    return NextResponse.json({
      success: true,
      programs: formattedPrograms,
      count: formattedPrograms.length,
      total: count,
      pagination: {
        limit,
        offset,
        has_more: formattedPrograms.length === limit
      }
    });

  } catch (error) {
    console.error('Education API GET error:', error);
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
    // For now, we'll accept any valid program data
    
    const {
      partner_id,
      program_name,
      description,
      program_type,
      duration,
      format,
      cost,
      prerequisites,
      climate_focus,
      skills_taught,
      certification_offered,
      application_deadline,
      start_date,
      end_date,
      contact_info,
      application_url
    } = body;

    // Validate required fields
    if (!partner_id || !program_name || !description) {
      return NextResponse.json(
        { error: 'partner_id, program_name, and description are required' },
        { status: 400 }
      );
    }

    const programData = {
      partner_id,
      program_name,
      description,
      program_type: program_type || 'certificate',
      duration,
      format: format || 'in_person',
      cost: cost || 'Contact for pricing',
      prerequisites,
      climate_focus: climate_focus || [],
      skills_taught: skills_taught || [],
      certification_offered,
      application_deadline,
      start_date,
      end_date,
      contact_info: contact_info || {},
      application_url,
      is_active: true
    };

    const { data: newProgram, error } = await supabase
      .from('education_programs')
      .insert(programData)
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
      console.error('Education program creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create education program', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      program: {
        ...newProgram,
        partner: {
          id: newProgram.partner_id,
          name: newProgram.profiles?.organization_name,
          type: newProgram.profiles?.organization_type,
          website: newProgram.profiles?.website
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Education API POST error:', error);
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
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check - ensure user owns this education program

    const { data: updatedProgram, error } = await supabase
      .from('education_programs')
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
      console.error('Education program update error:', error);
      return NextResponse.json(
        { error: 'Failed to update education program', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      program: {
        ...updatedProgram,
        partner: {
          id: updatedProgram.partner_id,
          name: updatedProgram.profiles?.organization_name,
          type: updatedProgram.profiles?.organization_type,
          website: updatedProgram.profiles?.website
        }
      }
    });

  } catch (error) {
    console.error('Education API PUT error:', error);
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
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check - ensure user owns this education program

    const { error } = await supabase
      .from('education_programs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Education program deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete education program', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Education program deleted successfully'
    });

  } catch (error) {
    console.error('Education API DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 