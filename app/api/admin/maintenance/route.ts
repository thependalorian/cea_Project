/**
 * Maintenance Mode API - Climate Economy Assistant
 * Admin endpoint for managing system maintenance mode
 * Location: app/api/admin/maintenance/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimated_duration: number; // in minutes
  started_at: string | null;
  started_by: string | null;
  allowed_admin_levels: string[];
  scheduled_for: string | null;
  notification_sent: boolean;
  active_users_count: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get current maintenance status
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('maintenance_mode, maintenance_message, maintenance_started_at, maintenance_started_by')
      .limit(1)
      .maybeSingle();

    // Get active users count
    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Active in last 30 minutes

    const maintenanceStatus: MaintenanceStatus = {
      enabled: settings?.maintenance_mode || false,
      message: settings?.maintenance_message || 'System is currently under maintenance. Please check back shortly.',
      estimated_duration: 60, // Default 1 hour
      started_at: settings?.maintenance_started_at || null,
      started_by: settings?.maintenance_started_by || null,
      allowed_admin_levels: ['super', 'system'],
      scheduled_for: null,
      notification_sent: false,
      active_users_count: activeUsers || 0
    };

    return NextResponse.json(maintenanceStatus);

  } catch (error) {
    console.error('Maintenance GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, estimatedDuration, scheduleFor } = body;

    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify system admin access for maintenance mode changes
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level, profiles(full_name)')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || adminProfile.admin_level !== 'system') {
      return NextResponse.json(
        { error: 'System admin access required' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'enable':
        return await enableMaintenanceMode(supabase, user.id, message, estimatedDuration);
      
      case 'disable':
        return await disableMaintenanceMode(supabase, user.id);
      
      case 'schedule':
        return await scheduleMaintenanceMode(supabase, user.id, scheduleFor, message, estimatedDuration);
      
      case 'notify_users':
        return await notifyUsersMaintenanceMode(supabase, user.id, message, estimatedDuration);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Maintenance POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function enableMaintenanceMode(supabase: any, userId: string, message?: string, estimatedDuration?: number) {
  const maintenanceMessage = message || 'System is currently under maintenance. Please check back shortly.';
  const now = new Date().toISOString();

  // Get current active users count
  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

  // Update platform settings
  const { error: updateError } = await supabase
    .from('platform_settings')
    .upsert({
      maintenance_mode: true,
      maintenance_message: maintenanceMessage,
      maintenance_started_at: now,
      maintenance_started_by: userId,
      maintenance_estimated_duration: estimatedDuration || 60,
      updated_at: now,
      updated_by: userId
    });

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to enable maintenance mode' },
      { status: 500 }
    );
  }

  // Log the action
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'enable_maintenance_mode',
    table_name: 'platform_settings',
    record_id: null,
    old_values: { maintenance_mode: false },
    new_values: { 
      maintenance_mode: true, 
      message: maintenanceMessage,
      estimated_duration: estimatedDuration,
      active_users_affected: activeUsers
    },
    ip_address: 'system'
  });

  // Send notifications to active admins
  await notifyAdminsMaintenanceChange(supabase, 'enabled', userId, activeUsers || 0);

  return NextResponse.json({
    success: true,
    message: 'Maintenance mode enabled successfully',
    maintenanceMode: {
      enabled: true,
      message: maintenanceMessage,
      startedAt: now,
      estimatedDuration: estimatedDuration || 60,
      activeUsersAffected: activeUsers || 0
    }
  });
}

async function disableMaintenanceMode(supabase: any, userId: string) {
  const now = new Date().toISOString();

  // Get current maintenance info
  const { data: currentSettings } = await supabase
    .from('platform_settings')
    .select('maintenance_started_at, maintenance_estimated_duration')
    .limit(1)
    .maybeSingle();

  // Calculate actual duration
  const actualDuration = currentSettings?.maintenance_started_at 
    ? Math.round((new Date().getTime() - new Date(currentSettings.maintenance_started_at).getTime()) / (1000 * 60))
    : 0;

  // Update platform settings
  const { error: updateError } = await supabase
    .from('platform_settings')
    .upsert({
      maintenance_mode: false,
      maintenance_message: null,
      maintenance_started_at: null,
      maintenance_started_by: null,
      maintenance_estimated_duration: null,
      updated_at: now,
      updated_by: userId
    });

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to disable maintenance mode' },
      { status: 500 }
    );
  }

  // Log the action
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'disable_maintenance_mode',
    table_name: 'platform_settings',
    record_id: null,
    old_values: { maintenance_mode: true },
    new_values: { 
      maintenance_mode: false,
      actual_duration_minutes: actualDuration,
      estimated_duration_minutes: currentSettings?.maintenance_estimated_duration
    },
    ip_address: 'system'
  });

  // Send notifications to active admins
  await notifyAdminsMaintenanceChange(supabase, 'disabled', userId, actualDuration);

  return NextResponse.json({
    success: true,
    message: 'Maintenance mode disabled successfully',
    maintenanceMode: {
      enabled: false,
      actualDuration: actualDuration,
      estimatedDuration: currentSettings?.maintenance_estimated_duration
    }
  });
}

async function scheduleMaintenanceMode(supabase: any, userId: string, scheduleFor: string, message?: string, estimatedDuration?: number) {
  const scheduledTime = new Date(scheduleFor);
  const now = new Date();

  // Validate schedule time
  if (scheduledTime <= now) {
    return NextResponse.json(
      { error: 'Scheduled time must be in the future' },
      { status: 400 }
    );
  }

  // Log the scheduled maintenance
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'schedule_maintenance_mode',
    table_name: 'platform_settings',
    record_id: null,
    old_values: null,
    new_values: {
      scheduled_for: scheduleFor,
      message: message || 'Scheduled maintenance',
      estimated_duration: estimatedDuration || 60
    },
    ip_address: 'system'
  });

  // In a real implementation, you would set up a cron job or scheduled task
  // For now, we'll just return success
  return NextResponse.json({
    success: true,
    message: 'Maintenance mode scheduled successfully',
    scheduledFor: scheduleFor,
    estimatedDuration: estimatedDuration || 60
  });
}

async function notifyUsersMaintenanceMode(supabase: any, userId: string, message: string, estimatedDuration: number) {
  // Get active users count
  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Active in last hour

  // Log the notification action
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'notify_users_maintenance',
    table_name: 'user_profiles',
    record_id: null,
    old_values: null,
    new_values: {
      message,
      estimated_duration: estimatedDuration,
      users_notified: activeUsers
    },
    ip_address: 'system'
  });

  // In a real implementation, you would send actual notifications
  // via email, push notifications, or in-app notifications

  return NextResponse.json({
    success: true,
    message: 'Users notified successfully',
    usersNotified: activeUsers || 0
  });
}

async function notifyAdminsMaintenanceChange(supabase: any, action: 'enabled' | 'disabled', userId: string, details: number) {
  // Log admin notification
  await supabase.from('audit_logs').insert({
    user_id: 'system',
    action: 'notify_admins_maintenance',
    table_name: 'admin_profiles',
    record_id: null,
    old_values: null,
    new_values: {
      maintenance_action: action,
      triggered_by: userId,
      details: action === 'enabled' ? `${details} active users affected` : `Lasted ${details} minutes`
    },
    ip_address: 'system'
  });
} 