import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

interface EducationProgram {
  id: string;
  program_name: string;
  description: string;
  program_type: string;
  duration?: string;
  format?: string;
  cost?: string;
  prerequisites?: string;
  climate_focus?: string[];
  skills_taught?: string[];
  certification_offered?: boolean;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  contact_info?: Record<string, unknown>;
  application_url?: string;
  created_at: string;
  updated_at: string;
  partner_id: string;
  profiles?: {
    organization_name?: string;
    organization_type?: string;
    website?: string;
    climate_focus?: string[];
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
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

    // Format response with proper typing
    const formattedPrograms = (programs || []).map((program: EducationProgram) => {
      const partnerProfile = Array.isArray(program.profiles) && program.profiles.length > 0 
        ? program.profiles[0] 
        : undefined;

      return {
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
          name: partnerProfile?.organization_name,
          type: partnerProfile?.organization_type,
          website: partnerProfile?.website,
          climate_focus: partnerProfile?.climate_focus
        },
        // Additional computed fields
        is_accepting_applications: !program.application_deadline || 
          new Date(program.application_deadline) > new Date(),
        is_upcoming: !program.start_date || 
          new Date(program.start_date) > new Date(),
        is_ongoing: program.start_date && program.end_date &&
          new Date(program.start_date) <= new Date() && 
          new Date(program.end_date) >= new Date()
      };
    });

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
    const supabase = await createClient();
    
    // Authentication check for partner users
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user is a partner
    const { data: partnerProfile } = await supabase
      .from('partner_profiles')
      .select('id, organization_name, status, verified')
      .eq('user_id', user.id)
      .single();

    if (!partnerProfile) {
      return NextResponse.json(
        { error: "Partner access required" },
        { status: 403 }
      );
    }

    if (partnerProfile.status !== 'active' || !partnerProfile.verified) {
      return NextResponse.json(
        { error: "Active, verified partner status required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const {
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
    if (!program_name || !description) {
      return NextResponse.json(
        { error: 'program_name and description are required' },
        { status: 400 }
      );
    }

    const programData = {
      partner_id: partnerProfile.id,
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

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'education_programs',
        action_type: 'create',
        record_id: newProgram.id,
        new_values: programData,
        details: { 
          action: 'education_program_create',
          partner_id: partnerProfile.id 
        }
      });

    return NextResponse.json({
      success: true,
      program: newProgram,
      message: "Education program created successfully"
    });

  } catch (error) {
    console.error('POST education error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authentication check - ensure user owns this education program
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('id');
    
    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this program
    const { data: existingProgram } = await supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles!education_programs_partner_id_fkey (
          user_id,
          status,
          verified
        )
      `)
      .eq('id', programId)
      .single();

    if (!existingProgram || 
        existingProgram.partner_profiles.user_id !== user.id ||
        existingProgram.partner_profiles.status !== 'active' ||
        !existingProgram.partner_profiles.verified) {
      return NextResponse.json(
        { error: "Unauthorized or program not found" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ...updateData } = body;

    const { data: updatedProgram, error } = await supabase
      .from('education_programs')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
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

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'education_programs',
        action_type: 'update',
        record_id: programId,
        old_values: existingProgram,
        new_values: updateData,
        details: { 
          action: 'education_program_update',
          partner_id: existingProgram.partner_id 
        }
      });

    return NextResponse.json({
      success: true,
      program: updatedProgram,
      message: "Education program updated successfully"
    });

  } catch (error) {
    console.error('PUT education error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authentication check - ensure user owns this education program
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('id');
    
    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this program
    const { data: existingProgram } = await supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles!education_programs_partner_id_fkey (
          user_id,
          status,
          verified
        )
      `)
      .eq('id', programId)
      .single();

    if (!existingProgram || 
        existingProgram.partner_profiles.user_id !== user.id ||
        existingProgram.partner_profiles.status !== 'active' ||
        !existingProgram.partner_profiles.verified) {
      return NextResponse.json(
        { error: "Unauthorized or program not found" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('education_programs')
      .delete()
      .eq('id', programId);

    if (error) {
      console.error('Education program deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete education program', details: error.message },
        { status: 500 }
      );
    }

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'education_programs',
        action_type: 'delete',
        record_id: programId,
        old_values: existingProgram,
        details: { 
          action: 'education_program_delete',
          partner_id: existingProgram.partner_id 
        }
      });

    return NextResponse.json({
      success: true,
      message: "Education program deleted successfully"
    });

  } catch (error) {
    console.error('DELETE education error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 