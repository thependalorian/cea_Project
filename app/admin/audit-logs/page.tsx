"use client";

/**
 * Admin Audit Logs Interface - Climate Economy Assistant
 * Comprehensive admin panel for viewing system audit logs
 * Location: app/admin/audit-logs/page.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EnhancedErrorBoundary, useErrorReporting } from '@/components/error/ErrorBoundary';
import { ACTCard, ACTButton, ACTBadge } from '@/components/ui';
import { Search, Filter, Download, RefreshCw, Eye, Calendar, Users, Database } from 'lucide-react';
import type { AuditLog, PaginatedResponse } from '@/types/database';

// Initialize Supabase client
const supabase = createClient();

interface AuditLogFilters {
  searchTerm: string;
  operation: string;
  tableName: string;
  userId: string;
  dateRange: {
    start?: string;
    end?: string;
  };
}

interface AuditLogWithUser extends AuditLog {
  user_profile?: {
    full_name: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { reportError } = useErrorReporting();
  
  // State management
  const [logs, setLogs] = useState<AuditLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Filters state
  const [filters, setFilters] = useState<AuditLogFilters>({
    searchTerm: '',
    operation: '',
    tableName: '',
    userId: '',
    dateRange: {}
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Selected log for details modal
  const [selectedLog, setSelectedLog] = useState<AuditLogWithUser | null>(null);

  // Fetch audit logs with error handling
  const fetchAuditLogs = async (page: number = 1, currentFilters: AuditLogFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user_profile:job_seeker_profiles(full_name, email),
          admin_profile:admin_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (currentFilters.searchTerm) {
        query = query.or(`
          table_name.ilike.%${currentFilters.searchTerm}%,
          operation.ilike.%${currentFilters.searchTerm}%,
          details->>reason.ilike.%${currentFilters.searchTerm}%
        `);
      }

      if (currentFilters.operation) {
        query = query.eq('operation', currentFilters.operation);
      }

      if (currentFilters.tableName) {
        query = query.eq('table_name', currentFilters.tableName);
      }

      if (currentFilters.userId) {
        query = query.eq('user_id', currentFilters.userId);
      }

      if (currentFilters.dateRange.start) {
        query = query.gte('created_at', currentFilters.dateRange.start);
      }

      if (currentFilters.dateRange.end) {
        query = query.lte('created_at', currentFilters.dateRange.end);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw new Error(`Failed to fetch audit logs: ${queryError.message}`);
      }

      setLogs(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      reportError(err as Error, 'fetchAuditLogs');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchAuditLogs(1, updatedFilters);
  };

  // Export logs functionality
  const exportLogs = async () => {
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000); // Cap at 10k records for export

      if (data) {
        const csvContent = [
          // CSV headers
          'ID,User ID,Table Name,Operation,Record ID,IP Address,Created At',
          // CSV data
          ...data.map(log => [
            log.id,
            log.user_id || '',
            log.table_name,
            log.operation,
            log.record_id || '',
            log.ip_address || '',
            log.created_at
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      reportError(err as Error, 'exportLogs');
    }
  };

  // Get operation badge color
  const getOperationColor = (operation: string) => {
    switch (operation.toLowerCase()) {
      case 'insert': return 'success';
      case 'update': return 'warning';
      case 'delete': return 'error';
      case 'select': return 'info';
      default: return 'neutral';
    }
  };

  // Format JSON for display
  const formatJSON = (json: any) => {
    if (!json) return 'None';
    return JSON.stringify(json, null, 2);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  if (error) {
    return (
      <div className="p-6">
        <ACTCard variant="outlined" className="text-center p-8 border-red-200 bg-red-50">
          <h2 className="text-ios-title-2 font-sf-pro font-semibold text-ios-red mb-4">
            Failed to Load Audit Logs
          </h2>
          <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
            {error}
          </p>
          <ACTButton 
            variant="primary" 
            onClick={() => fetchAuditLogs(currentPage)}
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
              System Audit Logs
            </h1>
            <p className="text-ios-body font-sf-pro text-midnight-forest/70">
              Monitor and review all system activities and data changes
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
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={exportLogs}
            >
              Export
            </ACTButton>
            <ACTButton
              variant="ghost"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchAuditLogs(currentPage)}
              disabled={loading}
            >
              Refresh
            </ACTButton>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ACTCard variant="outlined" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-forest/50" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="input-ios pl-10"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Operation
                </label>
                <select
                  className="select-ios"
                  value={filters.operation}
                  onChange={(e) => handleFilterChange({ operation: e.target.value })}
                >
                  <option value="">All Operations</option>
                  <option value="INSERT">Insert</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="SELECT">Select</option>
                </select>
              </div>

              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Table
                </label>
                <select
                  className="select-ios"
                  value={filters.tableName}
                  onChange={(e) => handleFilterChange({ tableName: e.target.value })}
                >
                  <option value="">All Tables</option>
                  <option value="job_seeker_profiles">Job Seeker Profiles</option>
                  <option value="partner_profiles">Partner Profiles</option>
                  <option value="admin_profiles">Admin Profiles</option>
                  <option value="job_listings">Job Listings</option>
                  <option value="knowledge_resources">Knowledge Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-ios-subheadline font-sf-pro font-medium text-midnight-forest mb-2">
                  Date Range
                </label>
                <input
                  type="date"
                  className="input-ios"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <ACTButton
                variant="ghost"
                onClick={() => {
                  const resetFilters = {
                    searchTerm: '',
                    operation: '',
                    tableName: '',
                    userId: '',
                    dateRange: {}
                  };
                  setFilters(resetFilters);
                  fetchAuditLogs(1, resetFilters);
                }}
              >
                Clear Filters
              </ACTButton>
            </div>
          </ACTCard>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
            Showing {startRecord}-{endRecord} of {totalCount} audit logs
          </p>
        </div>

        {/* Audit Logs Table */}
        <ACTCard variant="outlined" className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-spring-green border-t-transparent rounded-ios-full mx-auto mb-4"></div>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Database className="w-12 h-12 text-midnight-forest/30 mx-auto mb-4" />
              <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
                No Audit Logs Found
              </h3>
              <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
                No logs match your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand-gray/20">
                  <tr>
                    <th className="text-left p-4 text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                      Timestamp
                    </th>
                    <th className="text-left p-4 text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                      User
                    </th>
                    <th className="text-left p-4 text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                      Operation
                    </th>
                    <th className="text-left p-4 text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                      Table
                    </th>
                    <th className="text-left p-4 text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                      IP Address
                    </th>
                    <th className="text-left p-4 text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-gray/20">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-sand-gray/10 transition-colors">
                      <td className="p-4">
                        <div className="text-ios-subheadline font-sf-pro text-midnight-forest">
                          {new Date(log.created_at || '').toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-ios-subheadline font-sf-pro text-midnight-forest">
                          {log.user_profile?.full_name || 'System'}
                        </div>
                        <div className="text-ios-caption-1 font-sf-pro text-midnight-forest/60">
                          {log.user_profile?.email || log.user_id}
                        </div>
                      </td>
                      <td className="p-4">
                        <ACTBadge variant={getOperationColor(log.operation)}>
                          {log.operation}
                        </ACTBadge>
                      </td>
                      <td className="p-4">
                        <div className="text-ios-subheadline font-sf-pro text-midnight-forest">
                          {log.table_name}
                        </div>
                        {log.record_id && (
                          <div className="text-ios-caption-1 font-sf-mono text-midnight-forest/60">
                            ID: {log.record_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-ios-caption-1 font-sf-mono text-midnight-forest/70">
                          {log.ip_address || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <ACTButton
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => setSelectedLog(log)}
                        >
                          Details
                        </ACTButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ACTCard>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ACTButton
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchAuditLogs(currentPage - 1)}
              >
                Previous
              </ACTButton>
              <span className="text-ios-subheadline font-sf-pro text-midnight-forest/70 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <ACTButton
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchAuditLogs(currentPage + 1)}
              >
                Next
              </ACTButton>
            </div>
          </div>
        )}

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-midnight-forest/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <ACTCard variant="frosted" className="max-w-4xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-6 border-b border-sand-gray/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-ios-title-2 font-sf-pro font-semibold text-midnight-forest">
                    Audit Log Details
                  </h2>
                  <ACTButton
                    variant="ghost"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close
                  </ACTButton>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-3">
                      Basic Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">ID:</span>
                        <span className="text-ios-subheadline font-sf-mono text-midnight-forest ml-2">
                          {selectedLog.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">Operation:</span>
                        <ACTBadge variant={getOperationColor(selectedLog.operation)} className="ml-2">
                          {selectedLog.operation}
                        </ACTBadge>
                      </div>
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">Table:</span>
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest ml-2">
                          {selectedLog.table_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">Record ID:</span>
                        <span className="text-ios-subheadline font-sf-mono text-midnight-forest ml-2">
                          {selectedLog.record_id || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">Timestamp:</span>
                        <span className="text-ios-subheadline font-sf-pro text-midnight-forest ml-2">
                          {new Date(selectedLog.created_at || '').toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-3">
                      User & System Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">User ID:</span>
                        <span className="text-ios-subheadline font-sf-mono text-midnight-forest ml-2">
                          {selectedLog.user_id || 'System'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">IP Address:</span>
                        <span className="text-ios-subheadline font-sf-mono text-midnight-forest ml-2">
                          {selectedLog.ip_address || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70">User Agent:</span>
                        <span className="text-ios-caption-1 font-sf-mono text-midnight-forest ml-2 break-all">
                          {selectedLog.user_agent || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Changes */}
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <div>
                    <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-3">
                      Data Changes
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedLog.old_values && (
                        <div>
                          <h4 className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70 mb-2">
                            Old Values
                          </h4>
                          <pre className="bg-sand-gray/20 p-3 rounded-ios-lg text-ios-caption-1 font-sf-mono text-midnight-forest overflow-auto">
                            {formatJSON(selectedLog.old_values)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.new_values && (
                        <div>
                          <h4 className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest/70 mb-2">
                            New Values
                          </h4>
                          <pre className="bg-sand-gray/20 p-3 rounded-ios-lg text-ios-caption-1 font-sf-mono text-midnight-forest overflow-auto">
                            {formatJSON(selectedLog.new_values)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {selectedLog.details && (
                  <div>
                    <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-3">
                      Additional Details
                    </h3>
                    <pre className="bg-sand-gray/20 p-3 rounded-ios-lg text-ios-caption-1 font-sf-mono text-midnight-forest overflow-auto">
                      {formatJSON(selectedLog.details)}
                    </pre>
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