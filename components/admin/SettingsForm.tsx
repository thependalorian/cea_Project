/**
 * Settings Form Component - Climate Economy Assistant
 * Admin form for managing platform settings and configuration
 * Location: components/admin/SettingsForm.tsx
 */

'use client'

import { useState, useEffect } from 'react';
import { ACTButton, ACTCard } from '@/components/ui';
import { 
  Save, 
  RefreshCw, 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe,
  Key,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PlatformSettings {
  general: {
    platform_name: string;
    support_email: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
    public_signup: boolean;
  };
  security: {
    session_timeout: number;
    password_min_length: number;
    require_special_chars: boolean;
    require_2fa_admin: boolean;
    max_login_attempts: number;
  };
  notifications: {
    email_new_users: boolean;
    email_new_partners: boolean;
    email_system_alerts: boolean;
    email_daily_reports: boolean;
    slack_webhook_url: string;
  };
  ai: {
    openai_model: string;
    max_conversation_length: number;
    confidence_threshold: number;
    enable_learning_mode: boolean;
  };
}

interface SettingsFormProps {
  initialSettings?: Partial<PlatformSettings>;
  onSave?: (settings: PlatformSettings) => Promise<void>;
}

export function SettingsForm({ initialSettings, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platform_name: 'Climate Economy Assistant',
      support_email: 'support@cea.joinact.org',
      maintenance_mode: false,
      registration_enabled: true,
      public_signup: true,
    },
    security: {
      session_timeout: 30,
      password_min_length: 8,
      require_special_chars: true,
      require_2fa_admin: false,
      max_login_attempts: 5,
    },
    notifications: {
      email_new_users: true,
      email_new_partners: true,
      email_system_alerts: true,
      email_daily_reports: false,
      slack_webhook_url: '',
    },
    ai: {
      openai_model: 'gpt-4',
      max_conversation_length: 50,
      confidence_threshold: 0.8,
      enable_learning_mode: true,
    },
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({
        ...prev,
        ...initialSettings,
      }));
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      if (onSave) {
        await onSave(settings);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (category: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Configuration', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
            Platform Configuration
          </h2>
          <p className="text-sm text-midnight-forest/70 mt-1">
            Manage system settings and preferences
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Saved successfully
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Save failed
            </div>
          )}
          
          <ACTButton 
            variant="primary" 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </ACTButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <ACTCard className="p-6">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              General Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.general.platform_name}
                  onChange={(e) => updateSetting('general', 'platform_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.general.support_email}
                  onChange={(e) => updateSetting('general', 'support_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    checked={settings.general.maintenance_mode}
                    onChange={(e) => updateSetting('general', 'maintenance_mode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="maintenance_mode" className="text-sm text-midnight-forest">
                    Enable maintenance mode (disables user access)
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="registration_enabled"
                    checked={settings.general.registration_enabled}
                    onChange={(e) => updateSetting('general', 'registration_enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="registration_enabled" className="text-sm text-midnight-forest">
                    Allow new user registrations
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public_signup"
                    checked={settings.general.public_signup}
                    onChange={(e) => updateSetting('general', 'public_signup', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="public_signup" className="text-sm text-midnight-forest">
                    Enable public signup (no invitation required)
                  </label>
                </div>
              </div>
            </div>
          </ACTCard>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <ACTCard className="p-6">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.session_timeout}
                  onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={settings.security.password_min_length}
                  onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.max_login_attempts}
                  onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="require_special_chars"
                    checked={settings.security.require_special_chars}
                    onChange={(e) => updateSetting('security', 'require_special_chars', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="require_special_chars" className="text-sm text-midnight-forest">
                    Require special characters in passwords
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="require_2fa_admin"
                    checked={settings.security.require_2fa_admin}
                    onChange={(e) => updateSetting('security', 'require_2fa_admin', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="require_2fa_admin" className="text-sm text-midnight-forest">
                    Require 2FA for admin accounts
                  </label>
                </div>
              </div>
            </div>
          </ACTCard>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <ACTCard className="p-6">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Notification Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-midnight-forest mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  {[
                    { key: 'email_new_users', label: 'New user registrations' },
                    { key: 'email_new_partners', label: 'New partner applications' },
                    { key: 'email_system_alerts', label: 'System alerts and errors' },
                    { key: 'email_daily_reports', label: 'Daily analytics reports' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={item.key}
                        checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                        onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label htmlFor={item.key} className="text-sm text-midnight-forest">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Slack Webhook URL (optional)
                </label>
                <input
                  type="url"
                  value={settings.notifications.slack_webhook_url}
                  onChange={(e) => updateSetting('notifications', 'slack_webhook_url', e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  System alerts will be sent to this Slack channel
                </p>
              </div>
            </div>
          </ACTCard>
        )}

        {/* AI Configuration */}
        {activeTab === 'ai' && (
          <ACTCard className="p-6">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              AI Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  OpenAI Model
                </label>
                <select
                  value={settings.ai.openai_model}
                  onChange={(e) => updateSetting('ai', 'openai_model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Max Conversation Length
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={settings.ai.max_conversation_length}
                  onChange={(e) => updateSetting('ai', 'max_conversation_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of message exchanges per conversation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-forest mb-2">
                  Confidence Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={settings.ai.confidence_threshold}
                  onChange={(e) => updateSetting('ai', 'confidence_threshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum confidence score for AI responses (0.1-1.0)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable_learning_mode"
                  checked={settings.ai.enable_learning_mode}
                  onChange={(e) => updateSetting('ai', 'enable_learning_mode', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="enable_learning_mode" className="text-sm text-midnight-forest">
                  Enable learning mode (AI improves from conversations)
                </label>
              </div>
            </div>
          </ACTCard>
        )}
      </div>
    </div>
  );
} 