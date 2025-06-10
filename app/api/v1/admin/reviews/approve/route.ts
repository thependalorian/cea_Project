/**
 * HITL Match Approval API - Approve 80%+ threshold matches
 * Location: app/api/v1/admin/reviews/approve/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      interrupt_id, 
      approval_notes, 
      connect_to_hiring_manager = true,
      escalate_to_supervisor = false 
    } = body;

    if (!interrupt_id) {
      return NextResponse.json(
        { error: "Interrupt ID is required" },
        { status: 400 }
      );
    }

    // Get the conversation interrupt details
    const { data: interrupt, error: interruptError } = await supabase
      .from('conversation_interrupts')
      .select(`
        *,
        job_seeker_profiles!conversation_interrupts_candidate_id_fkey (
          full_name,
          email,
          user_id
        ),
        job_listings!conversation_interrupts_job_id_fkey (
          title,
          partner_id,
          partner_profiles!job_listings_partner_id_fkey (
            organization_name,
            contact_email
          )
        )
      `)
      .eq('id', interrupt_id)
      .single();

    if (interruptError || !interrupt) {
      return NextResponse.json(
        { error: "Match review not found" },
        { status: 404 }
      );
    }

    // Update conversation interrupt with approval
    const { data: updatedInterrupt, error: updateError } = await supabase
      .from('conversation_interrupts')
      .update({
        status: escalate_to_supervisor ? 'escalated' : 'approved',
        resolved_at: new Date().toISOString(),
        reviewer_id: user.id,
        review_notes: approval_notes || null,
        supervisor_approval_required: escalate_to_supervisor
      })
      .eq('id', interrupt_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update match review" },
        { status: 500 }
      );
    }

    // Update partner match result if it exists
    if (interrupt.candidate_id && interrupt.job_id) {
      await supabase
        .from('partner_match_results')
        .update({
          status: escalate_to_supervisor ? 'escalated' : 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          auto_approved: false,
          approval_notes: approval_notes || null
        })
        .eq('candidate_id', interrupt.candidate_id)
        .eq('job_id', interrupt.job_id);
    }

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'conversation_interrupts',
        action_type: escalate_to_supervisor ? 'escalate' : 'approve',
        record_id: interrupt_id,
        new_values: {
          status: escalate_to_supervisor ? 'escalated' : 'approved',
          reviewer_id: user.id,
          review_notes: approval_notes
        },
        details: {
          action: 'hitl_match_approval',
          match_score: interrupt.match_score,
          candidate_id: interrupt.candidate_id,
          job_id: interrupt.job_id,
          connect_to_hiring_manager
        }
      });

    // Update admin activity
    await supabase
      .from('admin_profiles')
      .update({
        last_admin_action: new Date().toISOString(),
        total_admin_actions: (adminProfile.total_admin_actions || 0) + 1
      })
      .eq('user_id', user.id);

    const responseMessage = escalate_to_supervisor 
      ? "Match escalated to supervisor for review"
      : connect_to_hiring_manager
        ? "Match approved - candidate will be connected to hiring manager"
        : "Match approved for further review";

    return NextResponse.json({
      success: true,
      message: responseMessage,
      interrupt: updatedInterrupt,
      next_action: escalate_to_supervisor ? 'supervisor_review' : 'hiring_manager_connection'
    });

  } catch (error) {
    console.error('HITL approval error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 