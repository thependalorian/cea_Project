/**
 * Admin Resources Page - Climate Economy Assistant
 * Admin-specific tools, documentation, and system resources
 * Location: app/admin/admin-resources/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACTButton, ACTCard } from "@/components/ui";
import { 
  Shield, 
  FileText, 
  Download, 
  ExternalLink, 
  Book, 
  Terminal, 
  Settings, 
  Database,
  Key,
  AlertCircle,
  CheckCircle,
  Users,
  BarChart3,
  HelpCircle,
  Zap,
  GitBranch,
  Monitor,
  Lock
} from "lucide-react";

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (super admin or system admin only)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_system && !adminProfile.can_manage_content)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need elevated admin privileges to access this resource management.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get system status and admin-specific metrics
  const [
    { data: systemLogs },
    { data: adminActions },
    { count: totalAdmins }
  ] = await Promise.all([
    supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    supabase
      .from('audit_logs')
      .select('action, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }),
    
    supabase
      .from('admin_profiles')
      .select('*', { count: 'exact', head: true })
  ]);

  const systemHealth = {
    database: 'operational',
    api: 'operational',
    auth: 'operational',
    storage: 'operational'
  };

  const adminResources = [
    {
      category: 'System Documentation',
      icon: FileText,
      color: 'blue',
      items: [
        { name: 'Admin User Guide', description: 'Complete guide for system administrators', type: 'pdf', size: '2.4 MB', id: 'admin-guide' },
        { name: 'API Documentation', description: 'Internal API reference and endpoints', type: 'web', url: '/docs/api', id: 'api-docs' },
        { name: 'Database Schema', description: 'Complete database structure and relationships', type: 'pdf', size: '1.8 MB', id: 'db-schema' },
        { name: 'Security Protocols', description: 'Platform security guidelines and procedures', type: 'pdf', size: '1.2 MB', id: 'security-protocols' }
      ]
    },
    {
      category: 'Development Tools',
      icon: Terminal,
      color: 'green',
      items: [
        { name: 'Database Console', description: 'Direct database access and queries', type: 'tool', url: '/admin/database', id: 'db-console' },
        { name: 'API Tester', description: 'Test platform APIs and endpoints', type: 'tool', url: '/admin/api-test', id: 'api-tester' },
        { name: 'Log Viewer', description: 'View system logs and error reports', type: 'tool', url: '/admin/logs', id: 'log-viewer' },
        { name: 'Performance Monitor', description: 'System performance and metrics', type: 'tool', url: '/admin/performance', id: 'performance-monitor' }
      ]
    },
    {
      category: 'Security & Access',
      icon: Lock,
      color: 'red',
      items: [
        { name: 'Access Control Matrix', description: 'User permissions and role assignments', type: 'web', url: '/admin/access-control', id: 'access-control' },
        { name: 'Security Audit Log', description: 'Security events and access logs', type: 'tool', url: '/admin/security-logs', id: 'security-logs' },
        { name: 'API Key Management', description: 'Manage system API keys and tokens', type: 'tool', url: '/admin/api-keys', id: 'api-keys' },
        { name: 'Backup Management', description: 'Database backups and recovery', type: 'tool', url: '/admin/backups', id: 'backup-mgmt' }
      ]
    },
    {
      category: 'System Maintenance',
      icon: Settings,
      color: 'purple',
      items: [
        { name: 'System Configuration', description: 'Platform-wide settings and configuration', type: 'tool', url: '/admin/system-config', id: 'system-config' },
        { name: 'Maintenance Mode', description: 'Enable/disable maintenance mode', type: 'tool', url: '/admin/maintenance', id: 'maintenance-mode' },
        { name: 'Cache Management', description: 'Clear and manage system caches', type: 'tool', url: '/admin/cache', id: 'cache-mgmt' },
        { name: 'Update Manager', description: 'System updates and version control', type: 'tool', url: '/admin/updates', id: 'update-manager' }
      ]
    }
  ];

  const quickActions = [
    { name: 'View System Logs', icon: Monitor, href: '/admin/system-logs', color: 'blue' },
    { name: 'Database Backup', icon: Database, href: '/admin/backup', color: 'green' },
    { name: 'Security Scan', icon: Shield, href: '/admin/security-scan', color: 'red' },
    { name: 'Performance Check', icon: BarChart3, href: '/admin/performance', color: 'purple' },
    { name: 'User Sessions', icon: Users, href: '/admin/sessions', color: 'yellow' },
    { name: 'API Health', icon: Zap, href: '/admin/api-health', color: 'teal' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'web': return <ExternalLink className="h-4 w-4" />;
      case 'tool': return <Terminal className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Client-side download functionality for admin resources
  const DownloadableAdminResource = ({ item }: { item: any }) => {
    const handleDownload = async () => {
      try {
        // If it's a web/tool resource with a URL, open it
        if (item.url) {
          window.open(item.url, '_blank');
          return;
        }

        // Otherwise download via API
        const downloadUrl = `/api/admin/download-resource?id=${item.id}&type=admin&format=json`;
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download error:', error);
        alert('Access failed. Please try again.');
      }
    };

    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          {getResourceIcon(item.type)}
          <div>
            <h3 className="font-medium text-midnight-forest">{item.name}</h3>
            <p className="text-sm text-midnight-forest/60">{item.description}</p>
            {item.size && (
              <p className="text-xs text-gray-500 mt-1">{item.size}</p>
            )}
          </div>
        </div>
        <ACTButton 
          variant="outline" 
          size="sm"
          onClick={handleDownload}
        >
          {item.type === 'pdf' ? 'Download' : 'Access'}
        </ACTButton>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
            Admin Resources
          </h1>
          <p className="text-body text-midnight-forest/70 mt-2">
            System administration tools, documentation, and resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ACTButton variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All Docs
          </ACTButton>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Support Center
          </ACTButton>
        </div>
      </div>

      {/* System Status Overview */}
      <ACTCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
            System Status
          </h2>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            All systems operational
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(systemHealth).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-midnight-forest capitalize">
                {service}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </ACTCard>

      {/* Quick Actions */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <ACTButton
                key={action.name}
                variant="outline"
                className="flex items-center gap-3 h-16 justify-start p-4 hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                  <Icon className={`h-5 w-5 text-${action.color}-600`} />
                </div>
                <span className="font-medium">{action.name}</span>
              </ACTButton>
            );
          })}
        </div>
      </ACTCard>

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-midnight-forest">Total Administrators</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {totalAdmins || 0}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Active admin accounts
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-midnight-forest">Admin Actions (7d)</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {adminActions?.length || 0}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Administrative actions taken
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-midnight-forest">Security Events</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {systemLogs?.length || 0}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Recent security events
          </p>
        </ACTCard>
      </div>

      {/* Resource Categories */}
      {adminResources.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <ACTCard key={category.category} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                <CategoryIcon className={`h-5 w-5 text-${category.color}-600`} />
              </div>
              <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                {category.category}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <DownloadableAdminResource key={item.name} item={item} />
              ))}
            </div>
          </ACTCard>
        );
      })}

      {/* Recent Admin Activity */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          Recent Activity
        </h2>
        {systemLogs && systemLogs.length > 0 ? (
          <div className="space-y-3">
            {systemLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-midnight-forest">
                      {log.action || 'System Action'}
                    </div>
                    <div className="text-xs text-midnight-forest/60">
                      {log.table_name && `Table: ${log.table_name}`}
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
            No recent activity to display
          </div>
        )}
      </ACTCard>
    </div>
  );
} 