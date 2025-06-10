/**
 * Platform Settings API - Climate Economy Assistant
 * Admin endpoint for managing platform-wide settings
 * Location: app/api/admin/settings/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface PlatformSettings {
  platform_name: string;
  support_email: string;
  maintenance_mode: boolean;
  session_timeout: number;
  password_min_length: number;
  require_special_chars: boolean;
  require_2fa_admin: boolean;
  email_notifications: {
    new_registrations: boolean;
    security_alerts: boolean;
    system_updates: boolean;
    partner_requests: boolean;
  };
  rate_limiting: {
    enabled: boolean;
    requests_per_minute: number;
    burst_limit: number;
  };
  features: {
    public_registration: boolean;
    partner_self_signup: boolean;
    ai_recommendations: boolean;
    analytics_tracking: boolean;
  };
  updated_at: string;
  updated_by: string;
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

    // Get current platform settings
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    const defaultSettings: PlatformSettings = {
      platform_name: 'Climate Economy Assistant',
      support_email: 'support@cea.joinact.org',
      maintenance_mode: false,
      session_timeout: 30,
      password_min_length: 8,
      require_special_chars: true,
      require_2fa_admin: false,
      email_notifications: {
        new_registrations: true,
        security_alerts: true,
        system_updates: true,
        partner_requests: true
      },
      rate_limiting: {
        enabled: true,
        requests_per_minute: 60,
        burst_limit: 100
      },
      features: {
        public_registration: true,
        partner_self_signup: true,
        ai_recommendations: true,
        analytics_tracking: true
      },
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    return NextResponse.json(settings || defaultSettings);

  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify super/system admin access for settings changes
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || !['super', 'system'].includes(adminProfile.admin_level)) {
      return NextResponse.json(
        { error: 'Elevated admin access required' },
        { status: 403 }
      );
    }

    // Validate settings
    const validationError = validateSettings(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Get current settings for audit trail
    const { data: currentSettings } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    // Prepare updated settings
    const updatedSettings = {
      ...body,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    // Upsert settings
    const { data: newSettings, error } = await supabase
      .from('platform_settings')
      .upsert(updatedSettings)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    // Log the settings change
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update_platform_settings',
      table_name: 'platform_settings',
      record_id: newSettings.id,
      old_values: currentSettings,
      new_values: updatedSettings,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Send notifications for critical changes
    await notifySettingsChanges(supabase, currentSettings, updatedSettings, user.id);

    return NextResponse.json(newSettings);

  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateSettings(settings: any): string | null {
  // Platform name validation
  if (!settings.platform_name || settings.platform_name.trim().length < 3) {
    return 'Platform name must be at least 3 characters long';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!settings.support_email || !emailRegex.test(settings.support_email)) {
    return 'Invalid support email address';
  }

  // Session timeout validation
  if (settings.session_timeout < 5 || settings.session_timeout > 480) {
    return 'Session timeout must be between 5 and 480 minutes';
  }

  // Password length validation
  if (settings.password_min_length < 6 || settings.password_min_length > 32) {
    return 'Password minimum length must be between 6 and 32 characters';
  }

  // Rate limiting validation
  if (settings.rate_limiting?.enabled) {
    if (settings.rate_limiting.requests_per_minute < 10 || settings.rate_limiting.requests_per_minute > 1000) {
      return 'Requests per minute must be between 10 and 1000';
    }
    if (settings.rate_limiting.burst_limit < settings.rate_limiting.requests_per_minute) {
      return 'Burst limit must be greater than or equal to requests per minute';
    }
  }

  return null;
}

async function notifySettingsChanges(supabase: any, oldSettings: any, newSettings: any, userId: string) {
  const criticalChanges = [];

  // Check for critical security changes
  if (oldSettings?.maintenance_mode !== newSettings.maintenance_mode) {
    criticalChanges.push(`Maintenance mode ${newSettings.maintenance_mode ? 'enabled' : 'disabled'}`);
  }

  if (oldSettings?.require_2fa_admin !== newSettings.require_2fa_admin) {
    criticalChanges.push(`2FA requirement for admins ${newSettings.require_2fa_admin ? 'enabled' : 'disabled'}`);
  }

  if (oldSettings?.features?.public_registration !== newSettings.features?.public_registration) {
    criticalChanges.push(`Public registration ${newSettings.features.public_registration ? 'enabled' : 'disabled'}`);
  }

  // Log critical changes as high-priority audit events
  if (criticalChanges.length > 0) {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'critical_settings_change',
      table_name: 'platform_settings',
      record_id: null,
      old_values: { changes: criticalChanges },
      new_values: { timestamp: new Date().toISOString() },
      ip_address: 'system'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify system admin access for system actions
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || adminProfile.admin_level !== 'system') {
      return NextResponse.json(
        { error: 'System admin access required' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'reset_to_defaults':
        // Reset settings to default values
        const defaultSettings = {
          platform_name: 'Climate Economy Assistant',
          support_email: 'support@cea.joinact.org',
          maintenance_mode: false,
          session_timeout: 30,
          password_min_length: 8,
          require_special_chars: true,
          require_2fa_admin: false,
          email_notifications: {
            new_registrations: true,
            security_alerts: true,
            system_updates: true,
            partner_requests: true
          },
          rate_limiting: {
            enabled: true,
            requests_per_minute: 60,
            burst_limit: 100
          },
          features: {
            public_registration: true,
            partner_self_signup: true,
            ai_recommendations: true,
            analytics_tracking: true
          },
          updated_at: new Date().toISOString(),
          updated_by: user.id
        };

        const { data: resetSettings, error } = await supabase
          .from('platform_settings')
          .upsert(defaultSettings)
          .select()
          .single();

        if (error) {
          return NextResponse.json(
            { error: 'Failed to reset settings' },
            { status: 500 }
          );
        }

        // Log the reset action
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'reset_platform_settings',
          table_name: 'platform_settings',
          record_id: resetSettings.id,
          old_values: null,
          new_values: defaultSettings,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Settings reset to defaults',
          settings: resetSettings 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 