"use client";

/**
 * Content Flags Moderation Interface - Climate Economy Assistant
 * Admin panel for reviewing and resolving flagged content
 * Location: app/admin/content-flags/page.tsx
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EnhancedErrorBoundary, useErrorReporting } from '@/components/error/ErrorBoundary';
import { ACTCard, ACTButton, ACTBadge, useACTToast } from '@/components/ui';
import { Flag, CheckCircle, XCircle, Eye, MessageSquare, RefreshCw, Filter } from 'lucide-react';
import type { ContentFlag } from '@/types/database';

// Initialize Supabase client
const supabase = createClient();

interface ContentFlagWithDetails extends ContentFlag {
  content_details?: {
    title?: string;
    author_name?: string;
    content_preview?: string;
  };
  flagged_by_user?: {
    full_name: string;
    email: string;
  };
}

interface ModerationFilters {
  status: 'all' | 'pending' | 'reviewed';
  contentType: string;
  flagReason: string;
}

export default function ContentFlagsPage() {
  const { reportError } = useErrorReporting();
  const { addToast } = useACTToast();
  
  // State management
  const [flags, setFlags] = useState<ContentFlagWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<ModerationFilters>({
    status: 'pending',
    contentType: '',
    flagReason: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Selected flag for detailed view
  const [selectedFlag, setSelectedFlag] = useState<ContentFlagWithDetails | null>(null);

  // Fetch flagged content
  const fetchFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('content_flags')
        .select(`
          *,
          flagged_by_user:job_seeker_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status === 'pending') {
        query = query.eq('admin_reviewed', false);
      } else if (filters.status === 'reviewed') {
        query = query.eq('admin_reviewed', true);
      }

      if (filters.contentType) {
        query = query.eq('content_type', filters.contentType);
      }

      if (filters.flagReason) {
        query = query.ilike('flag_reason', `%${filters.flagReason}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(`Failed to fetch content flags: ${queryError.message}`);
      }

      // Enrich with content details
      const enrichedFlags = await Promise.all((data || []).map(async (flag) => {
        let contentDetails = {};
        
        try {
          // Fetch content details based on type
          if (flag.content_type === 'knowledge_resource') {
            const { data: resource } = await supabase
              .from('knowledge_resources')
              .select('title, description')
              .eq('id', flag.content_id)
              .single();
            
            if (resource) {
              contentDetails = {
                title: resource.title,
                content_preview: resource.description?.substring(0, 200) + '...'
              };
            }
          } else if (flag.content_type === 'job_listing') {
            const { data: job } = await supabase
              .from('job_listings')
              .select('title, description')
              .eq('id', flag.content_id)
              .single();
            
            if (job) {
              contentDetails = {
                title: job.title,
                content_preview: job.description?.substring(0, 200) + '...'
              };
            }
          }
        } catch (err) {
          console.warn('Failed to fetch content details:', err);
        }

        return {
          ...flag,
          content_details: contentDetails
        };
      }));

      setFlags(enrichedFlags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      reportError(err as Error, 'fetchFlags');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFlags();
  }, [filters]);

  // Resolve flag (mark as reviewed)
  const resolveFlag = async (flagId: string, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(flagId);

      const { error: updateError } = await supabase
        .from('content_flags')
        .update({
          admin_reviewed: true,
          // Store resolution details in a hypothetical resolution_details column
          // For now, we'll just mark as reviewed
        })
        .eq('id', flagId);

      if (updateError) {
        throw new Error(`Failed to resolve flag: ${updateError.message}`);
      }

      // Create audit log
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'content_flags',
          record_id: flagId,
          operation: 'UPDATE',
          details: {
            action: 'flag_resolved',
            resolution: action,
            resolved_at: new Date().toISOString()
          }
        });

      // Show success toast
      addToast({
        type: 'success',
        message: `Flag ${action} successfully`,
      });

      // Refresh the list
      await fetchFlags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve flag';
      reportError(err as Error, 'resolveFlag');
      
      addToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Get flag reason badge color
  const getFlagReasonColor = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('spam')) return 'error';
    if (lowerReason.includes('inappropriate')) return 'warning';
    if (lowerReason.includes('misleading')) return 'info';
    if (lowerReason.includes('copyright')) return 'neutral';
    return 'neutral';
  };

  // Get content type display name
  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case 'knowledge_resource': return 'Knowledge Resource';
      case 'job_listing': return 'Job Listing';
      case 'partner_profile': return 'Partner Profile';
      case 'comment': return 'Comment';
      default: return type;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <ACTCard variant="outlined" className="text-center p-8 border-ios-red/50 bg-ios-red/5">
          <h2 className="text-ios-title-2 font-sf-pro font-semibold text-ios-red mb-4">
            Failed to Load Content Flags
          </h2>
          <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
            {error}
          </p>
          <ACTButton 
            variant="primary" 
            onClick={fetchFlags}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </ACTButton>
        </ACTCard>
      </div>
    );
  }

  return (
    <EnhancedErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-ios-large-title font-sf-pro font-semibold text-midnight-forest mb-2">
              Content Moderation
            </h1>
            <p className="text-ios-body font-sf-pro text-midnight-forest/70">
              Review and resolve flagged content across the platform
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ACTButton
              variant="secondary"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </ACTButton>
            <ACTButton
              variant="ghost"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchFlags}
              disabled={loading}
            >
              Refresh
            </ACTButton>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ACTCard variant="outlined" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Status
                </label>
                <select
                  className="select-ios"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                >
                  <option value="all">All Flags</option>
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>

              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Content Type
                </label>
                <select
                  className="select-ios"
                  value={filters.contentType}
                  onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="knowledge_resource">Knowledge Resources</option>
                  <option value="job_listing">Job Listings</option>
                  <option value="partner_profile">Partner Profiles</option>
                  <option value="comment">Comments</option>
                </select>
              </div>

              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Flag Reason
                </label>
                <input
                  type="text"
                  placeholder="Search by reason..."
                  className="input-ios"
                  value={filters.flagReason}
                  onChange={(e) => setFilters({ ...filters, flagReason: e.target.value })}
                />
              </div>
            </div>
          </ACTCard>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ACTCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ios-orange/10 rounded-ios-lg">
                <Flag className="w-5 h-5 text-ios-orange" />
              </div>
              <div>
                <div className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest">
                  {flags.filter(f => !f.admin_reviewed).length}
                </div>
                <div className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                  Pending Review
                </div>
              </div>
            </div>
          </ACTCard>

          <ACTCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ios-green/10 rounded-ios-lg">
                <CheckCircle className="w-5 h-5 text-ios-green" />
              </div>
              <div>
                <div className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest">
                  {flags.filter(f => f.admin_reviewed).length}
                </div>
                <div className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                  Resolved
                </div>
              </div>
            </div>
          </ACTCard>

          <ACTCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ios-blue/10 rounded-ios-lg">
                <MessageSquare className="w-5 h-5 text-ios-blue" />
              </div>
              <div>
                <div className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest">
                  {flags.filter(f => f.content_type === 'knowledge_resource').length}
                </div>
                <div className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                  Knowledge Resources
                </div>
              </div>
            </div>
          </ACTCard>

          <ACTCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-spring-green/10 rounded-ios-lg">
                <Flag className="w-5 h-5 text-spring-green" />
              </div>
              <div>
                <div className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest">
                  {flags.filter(f => f.content_type === 'job_listing').length}
                </div>
                <div className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                  Job Listings
                </div>
              </div>
            </div>
          </ACTCard>
        </div>

        {/* Flagged Content List */}
        <div className="space-y-4">
          {loading ? (
            <ACTCard variant="outlined" className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-spring-green border-t-transparent rounded-ios-full mx-auto mb-4"></div>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">Loading flagged content...</p>
            </ACTCard>
          ) : flags.length === 0 ? (
            <ACTCard variant="outlined" className="p-8 text-center">
              <Flag className="w-12 h-12 text-midnight-forest/30 mx-auto mb-4" />
              <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
                No Flagged Content
              </h3>
              <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
                No content flags match your current filter criteria.
              </p>
            </ACTCard>
          ) : (
            flags.map((flag) => (
              <ACTCard key={flag.id} variant="outlined" className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <ACTBadge variant={flag.admin_reviewed ? 'success' : 'warning'}>
                        {flag.admin_reviewed ? 'Reviewed' : 'Pending'}
                      </ACTBadge>
                      <ACTBadge variant="neutral">
                        {getContentTypeDisplay(flag.content_type)}
                      </ACTBadge>
                      <ACTBadge variant={getFlagReasonColor(flag.flag_reason)}>
                        {flag.flag_reason}
                      </ACTBadge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-ios-headline font-sf-pro font-semibold text-midnight-forest">
                        {flag.content_details?.title || 'Content Title Unavailable'}
                      </h3>
                      
                      {flag.content_details?.content_preview && (
                        <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
                          {flag.content_details.content_preview}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-ios-caption-1 font-sf-pro text-midnight-forest/60">
                        <span>
                          Flagged by: {flag.flagged_by_user?.full_name || 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(flag.created_at || '').toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          ID: {flag.content_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ACTButton
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => setSelectedFlag(flag)}
                    >
                      Details
                    </ACTButton>
                    
                    {!flag.admin_reviewed && (
                      <>
                        <ACTButton
                          variant="primary"
                          size="sm"
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => resolveFlag(flag.id, 'approved')}
                          disabled={processingId === flag.id}
                          className="bg-ios-green hover:bg-ios-green/80 text-white"
                        >
                          Approve
                        </ACTButton>
                        
                        <ACTButton
                          variant="secondary"
                          size="sm"
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => resolveFlag(flag.id, 'rejected')}
                          disabled={processingId === flag.id}
                          className="bg-ios-red hover:bg-ios-red/80 text-white"
                        >
                          Reject
                        </ACTButton>
                      </>
                    )}
                  </div>
                </div>
              </ACTCard>
            ))
          )}
        </div>

        {/* Flag Details Modal */}
        {selectedFlag && (
          <div className="fixed inset-0 bg-midnight-forest/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <ACTCard variant="frosted" className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-6 border-b border-sand-gray/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-ios-title-2 font-sf-pro font-semibold text-midnight-forest">
                    Flag Details
                  </h2>
                  <ACTButton
                    variant="ghost"
                    onClick={() => setSelectedFlag(null)}
                  >
                    Close
                  </ACTButton>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
                      Flag Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest/70">Status:</span>
                        <ACTBadge variant={selectedFlag.admin_reviewed ? 'success' : 'warning'}>
                          {selectedFlag.admin_reviewed ? 'Reviewed' : 'Pending'}
                        </ACTBadge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest/70">Content Type:</span>
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest">
                          {getContentTypeDisplay(selectedFlag.content_type)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest/70">Reason:</span>
                        <ACTBadge variant={getFlagReasonColor(selectedFlag.flag_reason)}>
                          {selectedFlag.flag_reason}
                        </ACTBadge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest/70">Flagged By:</span>
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest">
                          {selectedFlag.flagged_by_user?.full_name || 'Anonymous User'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest/70">Date:</span>
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest">
                          {new Date(selectedFlag.created_at || '').toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
                      Content Details
                    </h3>
                    <div className="bg-sand-gray/20 p-4 rounded-ios-lg">
                      <h4 className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                        {selectedFlag.content_details?.title || 'Content Title Unavailable'}
                      </h4>
                      {selectedFlag.content_details?.content_preview && (
                        <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
                          {selectedFlag.content_details.content_preview}
                        </p>
                      )}
                      <div className="text-ios-caption-1 font-sf-mono text-midnight-forest/60 mt-2">
                        Content ID: {selectedFlag.content_id}
                      </div>
                    </div>
                  </div>
                </div>

                {!selectedFlag.admin_reviewed && (
                  <div className="flex gap-3 pt-4 border-t border-sand-gray/20">
                    <ACTButton
                      variant="primary"
                      className="flex-1 bg-ios-green hover:bg-ios-green/80 text-white"
                      icon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => {
                        resolveFlag(selectedFlag.id, 'approved');
                        setSelectedFlag(null);
                      }}
                      disabled={processingId === selectedFlag.id}
                    >
                      Approve Content
                    </ACTButton>
                    
                    <ACTButton
                      variant="secondary"
                      className="flex-1 bg-ios-red hover:bg-ios-red/80 text-white"
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={() => {
                        resolveFlag(selectedFlag.id, 'rejected');
                        setSelectedFlag(null);
                      }}
                      disabled={processingId === selectedFlag.id}
                    >
                      Remove Content
                    </ACTButton>
                  </div>
                )}
              </div>
            </ACTCard>
          </div>
        )}
      </div>
    </EnhancedErrorBoundary>
  );
} 