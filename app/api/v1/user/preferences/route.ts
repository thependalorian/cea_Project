/**
 * User Preferences API - Climate Economy Assistant
 * GDPR-compliant user preference management
 * Location: app/api/v1/user/preferences/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface UserPreferences {
  // Privacy Settings
  social_profile_analysis_enabled?: boolean;
  data_sharing_enabled?: boolean;
  marketing_emails_enabled?: boolean;
  newsletter_enabled?: boolean;
  
  // Notification Settings
  email_notifications?: boolean;
  job_alerts_enabled?: boolean;
  partner_updates_enabled?: boolean;
  
  // Other Settings
  theme_preference?: 'light' | 'dark' | 'system';
  language_preference?: string;
  timezone?: string;
}

// GET - Retrieve user preferences
export async function GET(request: NextRequest) {
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

    // Get user preferences from user_interests table
    const { data: preferences, error } = await supabase
      .from('user_interests')
      .select(`
        social_profile_analysis_enabled,
        data_sharing_enabled,
        marketing_emails_enabled,
        newsletter_enabled,
        email_notifications,
        job_alerts_enabled,
        partner_updates_enabled,
        theme_preference,
        language_preference,
        timezone,
        updated_at
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const defaultPreferences: UserPreferences = {
          social_profile_analysis_enabled: true,
          data_sharing_enabled: false,
          marketing_emails_enabled: true,
          newsletter_enabled: true,
          email_notifications: true,
          job_alerts_enabled: true,
          partner_updates_enabled: true,
          theme_preference: 'system',
          language_preference: 'en',
          timezone: 'UTC'
        };

        const { data: newPreferences, error: insertError } = await supabase
          .from('user_interests')
          .insert({
            user_id: user.id,
            ...defaultPreferences
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default preferences:', insertError);
          return NextResponse.json(
            { error: "Failed to create user preferences" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          preferences: defaultPreferences,
          message: "Default preferences created"
        });
      }

      console.error('Error fetching user preferences:', error);
      return NextResponse.json(
        { error: "Failed to fetch user preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: preferences
    });

  } catch (error) {
    console.error('GET user preferences error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user preferences
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body: UserPreferences = await request.json();

    // Validate theme preference if provided
    if (body.theme_preference && !['light', 'dark', 'system'].includes(body.theme_preference)) {
      return NextResponse.json(
        { error: "Invalid theme preference. Must be 'light', 'dark', or 'system'" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that are provided
    const allowedFields = [
      'social_profile_analysis_enabled',
      'data_sharing_enabled', 
      'marketing_emails_enabled',
      'newsletter_enabled',
      'email_notifications',
      'job_alerts_enabled',
      'partner_updates_enabled',
      'theme_preference',
      'language_preference',
      'timezone'
    ];

    allowedFields.forEach(field => {
      if (body[field as keyof UserPreferences] !== undefined) {
        updateData[field] = body[field as keyof UserPreferences];
      }
    });

    // Update user preferences
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('user_interests')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user preferences:', updateError);
      return NextResponse.json(
        { error: "Failed to update user preferences" },
        { status: 500 }
      );
    }

    // Log the preference change for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'user_interests',
        action_type: 'update',
        record_id: updatedPreferences.id,
        new_values: updateData,
        details: { action: 'preference_update' }
      });

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      message: "Preferences updated successfully"
    });

  } catch (error) {
    console.error('PUT user preferences error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Reset preferences to defaults
export async function DELETE(request: NextRequest) {
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

    // Reset to default preferences
    const defaultPreferences: UserPreferences = {
      social_profile_analysis_enabled: true,
      data_sharing_enabled: false,
      marketing_emails_enabled: true,
      newsletter_enabled: true,
      email_notifications: true,
      job_alerts_enabled: true,
      partner_updates_enabled: true,
      theme_preference: 'system',
      language_preference: 'en',
      timezone: 'UTC'
    };

    const { data: resetPreferences, error: resetError } = await supabase
      .from('user_interests')
      .update({
        ...defaultPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (resetError) {
      console.error('Error resetting user preferences:', resetError);
      return NextResponse.json(
        { error: "Failed to reset user preferences" },
        { status: 500 }
      );
    }

    // Log the preference reset
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'user_interests',
        action_type: 'update',
        record_id: resetPreferences.id,
        new_values: defaultPreferences,
        details: { action: 'preference_reset' }
      });

    return NextResponse.json({
      success: true,
      preferences: resetPreferences,
      message: "Preferences reset to defaults"
    });

  } catch (error) {
    console.error('DELETE user preferences error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 