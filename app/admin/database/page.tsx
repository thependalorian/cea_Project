/**
 * Database Management Page - Climate Economy Assistant
 * System-level database administration and monitoring tools
 * Location: app/admin/database/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACTButton, ACTCard } from "@/components/ui";
import { 
  Database, 
  HardDrive, 
  Activity, 
  Shield, 
  RefreshCw,
  Download,
  Upload,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Monitor,
  Zap,
  Archive,
  FileText,
  Terminal,
  Eye
} from "lucide-react";

export default async function DatabaseManagementPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (system admins only)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || !adminProfile.can_manage_system) {
    redirect("/admin");
  }

  // Get database statistics from various tables
  const [
    { count: totalProfiles },
    { count: totalPartners },
    { count: totalJobs },
    { count: totalConversations },
    { count: totalAuditLogs },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('partner_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // Mock database health metrics (in real implementation, these would come from actual monitoring)
  const databaseHealth = {
    status: 'healthy',
    uptime: '99.97%',
    connections: {
      active: 42,
      max: 100,
      percentage: 42
    },
    storage: {
      used: '2.3 GB',
      total: '10 GB',
      percentage: 23
    },
    performance: {
      avgQueryTime: '1.2ms',
      slowQueries: 3,
      totalQueries: 15420
    }
  };

  const databaseTables = [
    { name: 'profiles', rows: totalProfiles || 0, size: '45.2 MB', status: 'healthy' },
    { name: 'partner_profiles', rows: totalPartners || 0, size: '12.8 MB', status: 'healthy' },
    { name: 'job_listings', rows: totalJobs || 0, size: '23.4 MB', status: 'healthy' },
    { name: 'conversations', rows: totalConversations || 0, size: '156.7 MB', status: 'healthy' },
    { name: 'audit_logs', rows: totalAuditLogs || 0, size: '89.3 MB', status: 'healthy' },
    { name: 'job_seeker_profiles', rows: 1250, size: '34.1 MB', status: 'healthy' },
    { name: 'education_programs', rows: 89, size: '5.6 MB', status: 'healthy' },
    { name: 'knowledge_resources', rows: 342, size: '67.8 MB', status: 'healthy' }
  ];

  const backupHistory = [
    { id: 1, type: 'Full Backup', size: '1.2 GB', status: 'completed', created: '2024-01-15 02:00:00' },
    { id: 2, type: 'Incremental', size: '45 MB', status: 'completed', created: '2024-01-14 02:00:00' },
    { id: 3, type: 'Full Backup', size: '1.1 GB', status: 'completed', created: '2024-01-08 02:00:00' },
    { id: 4, type: 'Incremental', size: '38 MB', status: 'completed', created: '2024-01-07 02:00:00' },
    { id: 5, type: 'Full Backup', size: '1.0 GB', status: 'completed', created: '2024-01-01 02:00:00' }
  ];

  const maintenanceTasks = [
    { name: 'Analyze Tables', description: 'Update table statistics for query optimization', status: 'scheduled', nextRun: '2024-01-16 03:00:00' },
    { name: 'Vacuum Database', description: 'Reclaim storage space and optimize performance', status: 'scheduled', nextRun: '2024-01-17 02:00:00' },
    { name: 'Index Maintenance', description: 'Rebuild and optimize database indexes', status: 'scheduled', nextRun: '2024-01-18 01:00:00' },
    { name: 'Log Cleanup', description: 'Archive old audit logs and system logs', status: 'pending', nextRun: '2024-01-16 04:00:00' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed': return 'text-green-600 bg-green-100';
      case 'warning':
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'scheduled': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
            Database Management
          </h1>
          <p className="text-body text-midnight-forest/70 mt-2">
            Monitor database health, manage backups, and perform system maintenance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ACTButton variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </ACTButton>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Create Backup
          </ACTButton>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ACTCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-midnight-forest">Database Status</h3>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(databaseHealth.status)}`}>
              {databaseHealth.status}
            </span>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {databaseHealth.uptime}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Uptime this month
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-midnight-forest">Active Connections</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {databaseHealth.connections.active}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${databaseHealth.connections.percentage}%` }}
              />
            </div>
            <span className="text-xs text-midnight-forest/60">
              /{databaseHealth.connections.max}
            </span>
          </div>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-midnight-forest">Storage Used</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {databaseHealth.storage.used}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${databaseHealth.storage.percentage}%` }}
              />
            </div>
            <span className="text-xs text-midnight-forest/60">
              /{databaseHealth.storage.total}
            </span>
          </div>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-midnight-forest">Performance</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {databaseHealth.performance.avgQueryTime}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Avg query time
          </p>
        </ACTCard>
      </div>

      {/* Database Tables Overview */}
      <ACTCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
            Database Tables
          </h2>
          <ACTButton variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </ACTButton>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rows
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {databaseTables.map((table) => (
                <tr key={table.name} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-midnight-forest">{table.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-midnight-forest">
                    {table.rows.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-midnight-forest">
                    {table.size}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(table.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(table.status)}`}>
                        {table.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <ACTButton variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </ACTButton>
                      <ACTButton variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </ACTButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ACTCard>

      {/* Backup Management and Maintenance Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup History */}
        <ACTCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              Backup History
            </h2>
            <ACTButton variant="outline" size="sm" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              New Backup
            </ACTButton>
          </div>
          
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(backup.status)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-midnight-forest">
                      {backup.type}
                    </div>
                    <div className="text-xs text-midnight-forest/60">
                      {backup.size} • {new Date(backup.created).toLocaleString()}
                    </div>
                  </div>
                </div>
                <ACTButton variant="outline" size="sm">
                  <Download className="h-3 w-3" />
                </ACTButton>
              </div>
            ))}
          </div>
        </ACTCard>

        {/* Maintenance Tasks */}
        <ACTCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              Maintenance Tasks
            </h2>
            <ACTButton variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Schedule
            </ACTButton>
          </div>
          
          <div className="space-y-3">
            {maintenanceTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <div className="text-sm font-medium text-midnight-forest">
                      {task.name}
                    </div>
                    <div className="text-xs text-midnight-forest/60">
                      {task.description}
                    </div>
                    <div className="text-xs text-midnight-forest/60 mt-1">
                      Next: {new Date(task.nextRun).toLocaleString()}
                    </div>
                  </div>
                </div>
                <ACTButton variant="outline" size="sm">
                  Run Now
                </ACTButton>
              </div>
            ))}
          </div>
        </ACTCard>
      </div>

      {/* Recent Database Activity */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          Recent Database Activity
        </h2>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="space-y-3">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-midnight-forest">
                      {log.action || 'Database Operation'}
                    </div>
                    <div className="text-xs text-midnight-forest/60">
                      Table: {log.table_name} • User: {log.user_id}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-midnight-forest/60">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-midnight-forest/60">
            No recent database activity to display
          </div>
        )}
      </ACTCard>
    </div>
  );
} 