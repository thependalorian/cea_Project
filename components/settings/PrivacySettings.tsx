/**
 * Privacy Settings Component - Climate Economy Assistant
 * Handles user privacy preferences with real-time updates
 * Location: components/settings/PrivacySettings.tsx
 */

"use client";

import { useState, useEffect } from 'react';
import { ACTCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Download, Trash2, ExternalLink } from 'lucide-react';

interface PrivacySettingsProps {
  userId: string;
}

interface UserPreferences {
  social_profile_analysis_enabled: boolean;
  data_sharing_enabled: boolean;
  marketing_emails_enabled: boolean;
  newsletter_enabled: boolean;
  email_notifications: boolean;
  job_alerts_enabled: boolean;
  partner_updates_enabled: boolean;
}

export function PrivacySettings({ userId }: PrivacySettingsProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    social_profile_analysis_enabled: true,
    data_sharing_enabled: false,
    marketing_emails_enabled: true,
    newsletter_enabled: true,
    email_notifications: true,
    job_alerts_enabled: true,
    partner_updates_enabled: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { toast } = useToast();

  // Load user preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/v1/user/preferences');
      const data = await response.json();
      
      if (data.success && data.preferences) {
        setPreferences({
          social_profile_analysis_enabled: data.preferences.social_profile_analysis_enabled ?? true,
          data_sharing_enabled: data.preferences.data_sharing_enabled ?? false,
          marketing_emails_enabled: data.preferences.marketing_emails_enabled ?? true,
          newsletter_enabled: data.preferences.newsletter_enabled ?? true,
          email_notifications: data.preferences.email_notifications ?? true,
          job_alerts_enabled: data.preferences.job_alerts_enabled ?? true,
          partner_updates_enabled: data.preferences.partner_updates_enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error loading preferences",
        description: "Failed to load your privacy settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/v1/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPreferences(prev => ({ ...prev, [key]: value }));
        
        // Show specific message for social profile toggle
        if (key === 'social_profile_analysis_enabled') {
          toast({
            title: value ? "Social profile analysis enabled" : "Social profile analysis disabled",
            description: value 
              ? "Enhanced career recommendations using your public profiles" 
              : "Resume analysis will use only uploaded resume data",
          });
        } else {
          toast({
            title: "Preference updated",
            description: "Your privacy setting has been saved",
          });
        }
      } else {
        throw new Error(data.error || 'Failed to update preference');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update preference",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/v1/user/export');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cea-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Data export successful",
          description: "Your data has been downloaded",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your data",
        variant: "destructive"
      });
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      toast({
        title: "Invalid confirmation",
        description: 'Please type "DELETE MY ACCOUNT" exactly',
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/v1/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          confirmation_text: deleteConfirmText,
          reason: 'User requested deletion'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Account deleted",
          description: "Your account and all data have been permanently deleted",
        });
        // Redirect to home page after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error(data.error || 'Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <ACTCard variant="outlined" title="Privacy & Data Settings">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-sand-gray/20 rounded w-3/4"></div>
          <div className="h-4 bg-sand-gray/20 rounded w-1/2"></div>
          <div className="h-4 bg-sand-gray/20 rounded w-2/3"></div>
        </div>
      </ACTCard>
    );
  }

  return (
    <ACTCard
      variant="outlined"
      title="Privacy & Data Settings"
      description="Control your data and privacy preferences"
    >
      <div className="space-y-6">
        {/* Social Profile Analysis */}
        <div className="p-4 bg-seafoam-blue/5 rounded-lg border border-seafoam-blue/20">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="font-medium text-midnight-forest mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Social Profile Analysis
              </div>
              <div className="text-sm text-midnight-forest/70 mb-2">
                Allow enhanced career analysis using public LinkedIn, GitHub, and website data
              </div>
              <div className="text-xs text-midnight-forest/60">
                Helps provide better career recommendations by analyzing your complete professional profile
              </div>
            </div>
            <input 
              type="checkbox" 
              className="toggle toggle-primary ml-4" 
              checked={preferences.social_profile_analysis_enabled}
              onChange={(e) => updatePreference('social_profile_analysis_enabled', e.target.checked)}
              disabled={isSaving}
            />
          </div>
          <div className="text-xs text-spring-green">
            <a href="/privacy" className="hover:underline flex items-center gap-1">
              Learn more about data usage <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Email Preferences */}
        <div className="space-y-3">
          <h3 className="font-medium text-midnight-forest">Email Preferences</h3>
          
          <div className="flex items-center justify-between p-3 bg-moss-green/5 rounded-lg">
            <div>
              <div className="font-medium text-midnight-forest text-sm">Job Alerts</div>
              <div className="text-xs text-midnight-forest/70">Notifications about relevant job opportunities</div>
            </div>
            <input 
              type="checkbox" 
              className="toggle toggle-sm toggle-primary" 
              checked={preferences.job_alerts_enabled}
              onChange={(e) => updatePreference('job_alerts_enabled', e.target.checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-moss-green/5 rounded-lg">
            <div>
              <div className="font-medium text-midnight-forest text-sm">Newsletter</div>
              <div className="text-xs text-midnight-forest/70">Weekly climate economy insights and updates</div>
            </div>
            <input 
              type="checkbox" 
              className="toggle toggle-sm toggle-primary" 
              checked={preferences.newsletter_enabled}
              onChange={(e) => updatePreference('newsletter_enabled', e.target.checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-moss-green/5 rounded-lg">
            <div>
              <div className="font-medium text-midnight-forest text-sm">Partner Updates</div>
              <div className="text-xs text-midnight-forest/70">Updates from climate economy partners</div>
            </div>
            <input 
              type="checkbox" 
              className="toggle toggle-sm toggle-primary" 
              checked={preferences.partner_updates_enabled}
              onChange={(e) => updatePreference('partner_updates_enabled', e.target.checked)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Data Export */}
        <div className="p-4 bg-midnight-forest/5 rounded-lg">
          <div className="font-medium text-midnight-forest mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Data Export
          </div>
          <div className="text-sm text-midnight-forest/70 mb-3">
            Download a complete copy of your data in JSON format
          </div>
          <Button 
            onClick={handleDataExport}
            variant="outline"
            size="sm"
            className="text-spring-green border-spring-green hover:bg-spring-green/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export My Data
          </Button>
        </div>

        {/* Account Deletion */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </div>
          <div className="text-sm text-red-600 mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </div>
          
          {!showDeleteConfirm ? (
            <Button 
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-red-700 font-medium">
                Type "DELETE MY ACCOUNT" to confirm:
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full p-2 border border-red-300 rounded text-sm"
                placeholder="DELETE MY ACCOUNT"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleAccountDeletion}
                  disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Deletion
                </Button>
                <Button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ACTCard>
  );
} 