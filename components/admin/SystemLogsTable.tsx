/**
 * System Logs Table Component - Climate Economy Assistant
 * Admin table for viewing audit logs and system activity
 * Location: components/admin/SystemLogsTable.tsx
 */

'use client'

import { useState } from 'react';
import { 
  Eye, 
  Download, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  User,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react';
import { ACTButton, ACTCard } from '@/components/ui';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  admin_profiles?: {
    admin_level: string;
  };
}

interface SystemLogsTableProps {
  logs: AuditLog[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function SystemLogsTable({ 
  logs, 
  totalCount, 
  currentPage, 
  onPageChange, 
  onRefresh 
}: SystemLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip_address.includes(searchTerm);
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesSeverity = severityFilter === 'all' || getLogSeverity(log.action) === severityFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case '1h':
          matchesDate = logDate.getTime() > now.getTime() - 60 * 60 * 1000;
          break;
        case '24h':
          matchesDate = logDate.getTime() > now.getTime() - 24 * 60 * 60 * 1000;
          break;
        case '7d':
          matchesDate = logDate.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesSeverity && matchesDate;
  });

  const getLogSeverity = (action: string): 'info' | 'warning' | 'error' | 'success' => {
    if (action.includes('error') || action.includes('fail') || action.includes('delete')) {
      return 'error';
    }
    if (action.includes('warn') || action.includes('ban') || action.includes('suspend')) {
      return 'warning';
    }
    if (action.includes('create') || action.includes('verify') || action.includes('approve')) {
      return 'success';
    }
    return 'info';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'error': 'bg-red-100 text-red-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'success': 'bg-green-100 text-green-800',
      'info': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[severity as keyof typeof colors] || colors['info']}`}>
        {severity}
      </span>
    );
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/admin/export-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            search: searchTerm,
            action: actionFilter,
            severity: severityFilter,
            date: dateFilter
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-helvetica font-medium text-midnight-forest">
            System Audit Logs
          </h2>
          <p className="text-sm text-midnight-forest/60 mt-1">
            {totalCount} total entries • {filteredLogs.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ACTButton 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </ACTButton>
          <ACTButton 
            variant="outline" 
            size="sm" 
            onClick={handleExportLogs}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </ACTButton>
        </div>
      </div>

      {/* Filters */}
      <ACTCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="admin">Admin Actions</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Time</option>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">Quick filters</span>
          </div>
        </div>
      </ACTCard>

      {/* Logs Table */}
      <ACTCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const severity = getLogSeverity(log.action);
                const isExpanded = expandedLog === log.id;
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.profiles?.full_name || 'System'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatAction(log.action)}
                          </div>
                          {log.admin_profiles && (
                            <div className="text-xs text-blue-600 mt-1">
                              {log.admin_profiles.admin_level} admin
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {log.table_name || 'System'}
                          </div>
                          {log.record_id && (
                            <div className="text-xs text-gray-500">
                              ID: {log.record_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(severity)}
                        {getSeverityBadge(severity)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="text-xs">
                        {log.ip_address}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ACTButton 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {isExpanded ? 'Hide' : 'Details'}
                      </ACTButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded Log Details */}
        {expandedLog && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            {(() => {
              const log = filteredLogs.find(l => l.id === expandedLog);
              if (!log) return null;

              return (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Log Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h5>
                      <div className="space-y-1 text-sm">
                        <div><strong>Log ID:</strong> {log.id}</div>
                        <div><strong>User ID:</strong> {log.user_id}</div>
                        <div><strong>Action:</strong> {formatAction(log.action)}</div>
                        <div><strong>Table:</strong> {log.table_name}</div>
                        <div><strong>Record ID:</strong> {log.record_id || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Context Information</h5>
                      <div className="space-y-1 text-sm">
                        <div><strong>IP Address:</strong> {log.ip_address}</div>
                        <div><strong>User Agent:</strong> {log.user_agent || 'N/A'}</div>
                        <div><strong>Timestamp:</strong> {new Date(log.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {(log.old_values || log.new_values) && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Data Changes</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.old_values && (
                          <div>
                            <h6 className="text-xs font-medium text-gray-600 mb-1">Previous Values</h6>
                            <pre className="text-xs bg-red-50 p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && (
                          <div>
                            <h6 className="text-xs font-medium text-gray-600 mb-1">New Values</h6>
                            <pre className="text-xs bg-green-50 p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <ACTButton
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </ACTButton>
                
                <ACTButton
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </ACTButton>
              </div>
            </div>
          </div>
        )}
      </ACTCard>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <ACTCard className="p-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-500">
              {searchTerm || actionFilter !== 'all' || severityFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No audit logs have been recorded yet.'
              }
            </p>
          </div>
        </ACTCard>
      )}
    </div>
  );
} 