/**
 * User Account Deletion API - Climate Economy Assistant
 * Handles secure account deletion with complete data cleanup
 * Location: app/api/v1/user/delete/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/v1/user/delete - Delete user account and all associated data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { confirmation_text, reason } = body;

    // Require confirmation text
    if (confirmation_text !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" exactly.' },
        { status: 400 }
      );
    }

    // Log deletion request for audit purposes
    console.log(`Account deletion requested by user ${user.id}. Reason: ${reason || 'Not provided'}`);

    // Start deletion process - Delete related data first (due to foreign key constraints)
    const deletionErrors = [];

    try {
      // Delete user conversations and messages
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', user.id);
      if (conversationsError) deletionErrors.push(`Conversations: ${conversationsError.message}`);

      // Delete conversation analytics
      const { error: analyticsError } = await supabase
        .from('conversation_analytics')
        .delete()
        .eq('user_id', user.id);
      if (analyticsError) deletionErrors.push(`Analytics: ${analyticsError.message}`);

      // Delete conversation feedback
      const { error: feedbackError } = await supabase
        .from('conversation_feedback')
        .delete()
        .eq('user_id', user.id);
      if (feedbackError) deletionErrors.push(`Feedback: ${feedbackError.message}`);

      // Delete message feedback
      const { error: messageFeedbackError } = await supabase
        .from('message_feedback')
        .delete()
        .eq('user_id', user.id);
      if (messageFeedbackError) deletionErrors.push(`Message Feedback: ${messageFeedbackError.message}`);

      // Delete resumes and resume chunks
      // First get resume IDs
      const { data: resumeIds } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id);

      if (resumeIds && resumeIds.length > 0) {
        const { error: resumeChunksError } = await supabase
          .from('resume_chunks')
          .delete()
          .in('resume_id', resumeIds.map(r => r.id));
        if (resumeChunksError) deletionErrors.push(`Resume Chunks: ${resumeChunksError.message}`);
      }

      const { error: resumesError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', user.id);
      if (resumesError) deletionErrors.push(`Resumes: ${resumesError.message}`);

      // Delete job seeker profile
      const { error: jobSeekerError } = await supabase
        .from('job_seeker_profiles')
        .delete()
        .eq('user_id', user.id);
      if (jobSeekerError) deletionErrors.push(`Job Seeker Profile: ${jobSeekerError.message}`);

      // Delete user interests (includes privacy settings)
      const { error: interestsError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);
      if (interestsError) deletionErrors.push(`User Interests: ${interestsError.message}`);

      // Delete resource views
      const { error: resourceViewsError } = await supabase
        .from('resource_views')
        .delete()
        .eq('user_id', user.id);
      if (resourceViewsError) deletionErrors.push(`Resource Views: ${resourceViewsError.message}`);

      // Delete credential evaluations
      const { error: credentialError } = await supabase
        .from('credential_evaluation')
        .delete()
        .eq('user_id', user.id);
      if (credentialError) deletionErrors.push(`Credentials: ${credentialError.message}`);

      // Delete workflow sessions
      const { error: workflowError } = await supabase
        .from('workflow_sessions')
        .delete()
        .eq('user_id', user.id);
      if (workflowError) deletionErrors.push(`Workflows: ${workflowError.message}`);

      // Delete audit logs (if user is referenced)
      const { error: auditError } = await supabase
        .from('audit_logs')
        .delete()
        .eq('user_id', user.id);
      if (auditError) deletionErrors.push(`Audit Logs: ${auditError.message}`);

      // Delete profile (this should cascade to other related tables)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      if (profileError) deletionErrors.push(`Profile: ${profileError.message}`);

    } catch (error) {
      console.error('Error during data deletion:', error);
      deletionErrors.push(`General deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If there were any deletion errors, log them but continue
    if (deletionErrors.length > 0) {
      console.error(`Data deletion errors for user ${user.id}:`, deletionErrors);
    }

    // Finally, delete the auth user (this is the most critical step)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError);
      return NextResponse.json(
        { 
          error: 'Failed to delete account. Please contact support.',
          details: authDeleteError.message 
        },
        { status: 500 }
      );
    }

    // Log successful deletion
    console.log(`Account successfully deleted for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted.',
      deletion_timestamp: new Date().toISOString(),
      data_cleanup_errors: deletionErrors.length > 0 ? deletionErrors : null
    });

  } catch (error) {
    console.error('Error in POST /api/v1/user/delete:', error);
    return NextResponse.json(
      { error: 'Internal server error during account deletion' },
      { status: 500 }
    );
  }
}

// GET /api/v1/user/delete - Get deletion preview (what data will be deleted)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Count data that will be deleted
    const dataCounts = {
      conversations: 0,
      resumes: 0,
      job_applications: 0,
      resource_views: 0,
      feedback_entries: 0
    };

    // Count conversations
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    dataCounts.conversations = conversationsCount || 0;

    // Count resumes
    const { count: resumesCount } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    dataCounts.resumes = resumesCount || 0;

    // Count resource views
    const { count: resourceViewsCount } = await supabase
      .from('resource_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    dataCounts.resource_views = resourceViewsCount || 0;

    // Count feedback entries
    const { count: feedbackCount } = await supabase
      .from('conversation_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    dataCounts.feedback_entries = feedbackCount || 0;

    return NextResponse.json({
      success: true,
      user_id: user.id,
      email: user.email,
      account_created: user.created_at,
      data_to_delete: dataCounts,
      warning: 'This action cannot be undone. All data will be permanently deleted.',
      required_confirmation: 'DELETE MY ACCOUNT'
    });

  } catch (error) {
    console.error('Error in GET /api/v1/user/delete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 