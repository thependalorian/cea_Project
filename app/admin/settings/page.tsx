/**
 * Settings Page - Climate Economy Assistant
 * Admin interface for platform configuration and settings
 * Location: app/admin/settings/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ACTButton, ACTCard } from "@/components/ui";
import { Settings, Shield, Bell, Database, Users, Globe, Key, Zap } from "lucide-react";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  try {
    // Fetch current admin user and settings
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Verify admin access - only system admins can access settings
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || !adminProfile.can_manage_system) {
      return (
        <div className="container mx-auto py-8">
          <ACTCard variant="outlined" className="p-8 text-center">
            <Shield className="h-16 w-16 text-error mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
            <p className="text-base-content/70">
              You need system management privileges to access system settings.
            </p>
          </ACTCard>
        </div>
      )
    }

    // Get platform settings (if we have a settings table)
    const { data: platformSettings } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Platform Settings
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Configure platform settings, security, and administrative preferences
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <ACTCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                General Settings
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  defaultValue="Climate Economy Assistant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  defaultValue="support@cea.joinact.org"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Maintenance Mode
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-midnight-forest/70">
                    Enable maintenance mode (disables user access)
                  </span>
                </div>
              </div>
            </div>

            <ACTButton variant="primary" className="mt-6 w-full">
              Save General Settings
            </ACTButton>
          </ACTCard>

          {/* Security Settings */}
          <ACTCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                Security Settings
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  min="5"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Password Requirements
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      Require special characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      Require 2FA for admins
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ACTButton variant="secondary" className="mt-6 w-full">
              Update Security Settings
            </ACTButton>
          </ACTCard>

          {/* Notification Settings */}
          <ACTCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                Notification Settings
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-midnight-forest mb-3">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      New user registrations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      Partner applications
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      Daily analytics reports
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-midnight-forest/70">
                      System errors and alerts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ACTButton variant="outline" className="mt-6 w-full">
              Save Notification Settings
            </ACTButton>
          </ACTCard>

          {/* User Management Settings */}
          <ACTCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                User Management
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  User Registration
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="open">Open registration</option>
                  <option value="approval">Require admin approval</option>
                  <option value="invite">Invite only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Default User Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="job_seeker">Job Seeker</option>
                  <option value="basic">Basic User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Account Verification
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-midnight-forest/70">
                    Require email verification
                  </span>
                </div>
              </div>
            </div>

            <ACTButton variant="outline" className="mt-6 w-full">
              Update User Settings
            </ACTButton>
          </ACTCard>
        </div>

        {/* API & Integration Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ACTCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                API Configuration
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  OpenAI API Status
                </label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                  <span className="text-xs text-gray-500 ml-auto">Last checked: 2 min ago</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Supabase Status
                </label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                  <span className="text-xs text-gray-500 ml-auto">Healthy</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Rate Limiting
                </label>
                <input
                  type="number"
                  defaultValue="100"
                  placeholder="Requests per minute"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <ACTButton variant="outline" className="mt-6 w-full">
              Test API Connections
            </ACTButton>
          </ACTCard>

          <ACTCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                System Information
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-midnight-forest/70">Application Version</span>
                <span className="text-sm font-medium text-midnight-forest">v1.0.0</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-midnight-forest/70">Database Version</span>
                <span className="text-sm font-medium text-midnight-forest">PostgreSQL 15</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-midnight-forest/70">Environment</span>
                <span className="text-sm font-medium text-midnight-forest">Development</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-midnight-forest/70">Last Backup</span>
                <span className="text-sm font-medium text-midnight-forest">2 hours ago</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-midnight-forest/70">Uptime</span>
                <span className="text-sm font-medium text-midnight-forest">7 days, 3 hours</span>
              </div>
            </div>

            <ACTButton variant="outline" className="mt-6 w-full">
              View System Logs
            </ACTButton>
          </ACTCard>
        </div>

        {/* Admin Profile Settings */}
        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              Admin Profile Settings
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-midnight-forest mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={adminProfile?.full_name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-midnight-forest mb-2">
                Department
              </label>
              <input
                type="text"
                defaultValue={adminProfile?.department || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-midnight-forest mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue={adminProfile?.phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-midnight-forest mb-2">
                Admin Level
              </label>
              <input
                type="text"
                value={adminProfile?.admin_level || 'Standard'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <ACTButton variant="primary">
              Update Profile
            </ACTButton>
            <ACTButton variant="outline">
              Change Password
            </ACTButton>
          </div>
        </ACTCard>
      </div>
    );
  } catch (error) {
    console.error('Error in admin settings page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Settings</h2>
          <p className="text-red-600">
            There was an error loading the settings page. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Settings - Admin Dashboard",
  description: "Platform configuration and administrative settings for Climate Economy Assistant",
}; 