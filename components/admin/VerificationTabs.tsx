/**
 * Verification Tabs Component - Climate Economy Assistant
 * Tabbed interface for different verification workflows
 * Location: components/admin/VerificationTabs.tsx
 */

'use client'

import { useState } from 'react';
import { Flag, Building2, Users, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { ACTButton } from '@/components/ui';

interface VerificationData {
  contentFlags: any[];
  unverifiedPartners: any[];
  pendingProfiles: any[];
  recentVerifications: any[];
}

interface VerificationTabsProps {
  data: VerificationData;
}

export function VerificationTabs({ data }: VerificationTabsProps) {
  const [activeTab, setActiveTab] = useState('flags');

  const tabs = [
    {
      id: 'flags',
      label: 'Content Flags',
      icon: Flag,
      count: data.contentFlags.length,
      color: 'text-red-600'
    },
    {
      id: 'partners',
      label: 'Partner Verification',
      icon: Building2,
      count: data.unverifiedPartners.length,
      color: 'text-yellow-600'
    },
    {
      id: 'users',
      label: 'User Verification',
      icon: Users,
      count: data.pendingProfiles.length,
      color: 'text-blue-600'
    }
  ];

  const getFlagSeverityColor = (reason: string) => {
    switch (reason) {
      case 'inappropriate':
      case 'spam':
        return 'bg-red-100 text-red-800';
      case 'misleading':
        return 'bg-yellow-100 text-yellow-800';
      case 'duplicate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContentFlags = () => (
    <div className="space-y-4">
      {data.contentFlags.length > 0 ? (
        data.contentFlags.map((flag) => (
          <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFlagSeverityColor(flag.flag_reason)}`}>
                    {flag.flag_reason}
                  </span>
                  <span className="text-sm text-gray-500">
                    {flag.content_type} • Flagged {new Date(flag.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-900 mb-2">
                  Content ID: {flag.content_id}
                </div>
                {flag.profiles && (
                  <div className="text-sm text-gray-600">
                    Reported by: {flag.profiles.first_name} {flag.profiles.last_name} ({flag.profiles.email})
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Review
                </ACTButton>
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Approve
                </ACTButton>
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3 w-3" />
                  Remove
                </ACTButton>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Flags</h3>
          <p className="text-gray-500">All content has been reviewed and approved.</p>
        </div>
      )}
    </div>
  );

  const renderPartnerVerification = () => (
    <div className="space-y-4">
      {data.unverifiedPartners.length > 0 ? (
        data.unverifiedPartners.map((partner) => (
          <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {partner.organization_name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Pending Verification
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <strong>Type:</strong> {partner.organization_type || 'Not specified'}
                  </div>
                  <div>
                    <strong>Size:</strong> {partner.employee_count ? `${partner.employee_count} employees` : 'Not specified'}
                  </div>
                  <div>
                    <strong>Location:</strong> {partner.headquarters_location || 'Not specified'}
                  </div>
                  <div>
                    <strong>Applied:</strong> {new Date(partner.created_at).toLocaleDateString()}
                  </div>
                </div>
                {partner.website && (
                  <div className="text-sm text-blue-600 mb-2">
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {partner.website}
                    </a>
                  </div>
                )}
                {partner.description && (
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {partner.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Review
                </ACTButton>
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Verify
                </ACTButton>
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3 w-3" />
                  Reject
                </ACTButton>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Partners</h3>
          <p className="text-gray-500">All partner applications have been processed.</p>
        </div>
      )}
    </div>
  );

  const renderUserVerification = () => (
    <div className="space-y-4">
      {data.pendingProfiles.length > 0 ? (
        data.pendingProfiles.slice(0, 10).map((profile) => (
          <div key={profile.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile.full_name || 'Unnamed User'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    profile.profiles?.verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.profiles?.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <strong>Email:</strong> {profile.email || profile.profiles?.email || 'Not provided'}
                  </div>
                  <div>
                    <strong>Experience:</strong> {profile.experience_level || 'Not specified'}
                  </div>
                  <div>
                    <strong>Current Role:</strong> {profile.current_title || 'Not specified'}
                  </div>
                  <div>
                    <strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
                {profile.location && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Location:</strong> {profile.location}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ACTButton variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Review
                </ACTButton>
                {!profile.profiles?.verified && (
                  <ACTButton variant="outline" size="sm" className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Verify
                  </ACTButton>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Users</h3>
          <p className="text-gray-500">All user profiles have been reviewed.</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'flags':
        return renderContentFlags();
      case 'partners':
        return renderPartnerVerification();
      case 'users':
        return renderUserVerification();
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
} 