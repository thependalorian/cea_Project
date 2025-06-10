/**
 * Partner Resources Page - Climate Economy Assistant
 * Management interface for partner-specific resources and tools
 * Location: app/admin/partner-resources/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACTButton, ACTCard } from "@/components/ui";
import { 
  Globe, 
  FileText, 
  Download, 
  ExternalLink, 
  Building2, 
  Users, 
  Briefcase,
  BookOpen,
  Plus,
  Shield,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";

export default async function PartnerResourcesPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (partner management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_partners && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need partner management privileges to access partner resources.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get partner-related data
  const [
    { data: partners },
    { data: partnerJobs },
    { data: partnerEducation },
    { data: partnerResources }
  ] = await Promise.all([
    supabase
      .from('partner_profiles')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles!inner(organization_name, verified)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
    
    supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles!partner_id(organization_name, verified)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
    
    supabase
      .from('knowledge_resources')
      .select(`
        *,
        partner_profiles(organization_name, verified)
      `)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // Calculate partner statistics
  const totalPartners = partners?.length || 0;
  const verifiedPartners = partners?.filter(p => p.verified).length || 0;
  const totalJobs = partnerJobs?.length || 0;
  const totalPrograms = partnerEducation?.length || 0;
  const totalResources = partnerResources?.length || 0;

  const partnerResourceCategories = [
    {
      title: 'Onboarding Materials',
      icon: BookOpen,
      color: 'blue',
      count: 8,
      items: [
        { name: 'Partner Welcome Guide', type: 'PDF', size: '2.1 MB', status: 'active', id: 'welcome-guide' },
        { name: 'Platform Tutorial Videos', type: 'Video', size: '45 min', status: 'active', id: 'tutorial-videos' },
        { name: 'Best Practices Guide', type: 'PDF', size: '1.8 MB', status: 'active', id: 'best-practices' },
        { name: 'FAQ Document', type: 'PDF', size: '890 KB', status: 'active', id: 'faq-doc' }
      ]
    },
    {
      title: 'Technical Resources',
      icon: Settings,
      color: 'green',
      count: 12,
      items: [
        { name: 'API Integration Guide', type: 'PDF', size: '3.2 MB', status: 'active', id: 'api-integration' },
        { name: 'Data Export Templates', type: 'Excel', size: '145 KB', status: 'active', id: 'data-templates' },
        { name: 'Custom Branding Kit', type: 'ZIP', size: '15.3 MB', status: 'active', id: 'branding-kit' },
        { name: 'Integration Examples', type: 'Code', size: '2.1 MB', status: 'active', id: 'integration-examples' }
      ]
    },
    {
      title: 'Marketing Materials',
      icon: TrendingUp,
      color: 'purple',
      count: 15,
      items: [
        { name: 'Co-branding Guidelines', type: 'PDF', size: '4.5 MB', status: 'active', id: 'cobranding-guidelines' },
        { name: 'Social Media Assets', type: 'ZIP', size: '28.7 MB', status: 'active', id: 'social-assets' },
        { name: 'Press Release Templates', type: 'Word', size: '125 KB', status: 'active', id: 'press-templates' },
        { name: 'Case Study Templates', type: 'Word', size: '89 KB', status: 'active', id: 'case-templates' }
      ]
    },
    {
      title: 'Training & Support',
      icon: Users,
      color: 'yellow',
      count: 6,
      items: [
        { name: 'Admin Training Modules', type: 'Video', size: '2.5 hours', status: 'active', id: 'training-modules' },
        { name: 'User Management Guide', type: 'PDF', size: '1.9 MB', status: 'active', id: 'user-mgmt-guide' },
        { name: 'Support Ticket System', type: 'Web', size: '-', status: 'active', id: 'support-system' },
        { name: 'Monthly Webinar Series', type: 'Video', size: 'Live', status: 'active', id: 'webinar-series' }
      ]
    }
  ];

  const partnerTools = [
    { name: 'Partner Dashboard', description: 'Analytics and management tools', icon: BarChart3, url: '/partner/dashboard' },
    { name: 'Resource Library', description: 'Downloadable partner resources', icon: FileText, url: '/partner/resources' },
    { name: 'Job Posting Tool', description: 'Create and manage job listings', icon: Briefcase, url: '/partner/jobs' },
    { name: 'User Analytics', description: 'Track engagement and usage', icon: Users, url: '/partner/analytics' },
    { name: 'Support Center', description: 'Help desk and documentation', icon: Shield, url: '/partner/support' },
    { name: 'API Console', description: 'Integration and API management', icon: Settings, url: '/partner/api' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'video': return <ExternalLink className="h-4 w-4 text-blue-500" />;
      case 'excel': return <FileText className="h-4 w-4 text-green-500" />;
      case 'word': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'zip': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'code': return <FileText className="h-4 w-4 text-gray-600" />;
      case 'web': return <Globe className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Client-side download functionality
  const DownloadableResource = ({ item }: { item: any }) => {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          {getResourceIcon(item.type)}
          <div>
            <h3 className="font-medium text-midnight-forest">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-midnight-forest/60">{item.type}</span>
              <span className="text-xs text-midnight-forest/40">•</span>
              <span className="text-xs text-midnight-forest/60">{item.size}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          </div>
        </div>
        <ACTButton 
          variant="outline" 
          size="sm"
          onClick={async () => {
            try {
              const downloadUrl = `/api/admin/download-resource?id=${item.id}&type=partner&format=json`;
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
              alert('Download failed. Please try again.');
            }
          }}
        >
          Download
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
            Partner Resources
          </h1>
          <p className="text-body text-midnight-forest/70 mt-2">
            Manage resources, tools, and documentation for partner organizations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ACTButton variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Resources
          </ACTButton>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </ACTButton>
        </div>
      </div>

      {/* Partner Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-midnight-forest">Total Partners</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {totalPartners}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            {verifiedPartners} verified
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-midnight-forest">Active Jobs</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {totalJobs}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Job listings posted
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-midnight-forest">Education Programs</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {totalPrograms}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Available programs
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-midnight-forest">Resources</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {totalResources}
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Knowledge resources
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-5 w-5 text-orange-600" />
            <h3 className="font-medium text-midnight-forest">Satisfaction</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            4.8
          </div>
          <p className="text-sm text-midnight-forest/60 mt-1">
            Average rating
          </p>
        </ACTCard>
      </div>

      {/* Partner Tools */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          Partner Tools & Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.name} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-midnight-forest">{tool.name}</h3>
                  <p className="text-sm text-midnight-forest/60">{tool.description}</p>
                </div>
                <ACTButton variant="outline" size="sm">
                  Access
                </ACTButton>
              </div>
            );
          })}
        </div>
      </ACTCard>

      {/* Resource Categories */}
      {partnerResourceCategories.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <ACTCard key={category.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                  <CategoryIcon className={`h-5 w-5 text-${category.color}-600`} />
                </div>
                <div>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
                    {category.title}
                  </h2>
                  <p className="text-sm text-midnight-forest/60">
                    {category.count} resources available
                  </p>
                </div>
              </div>
              <ACTButton variant="outline" size="sm">
                View All
              </ACTButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <DownloadableResource key={item.name} item={item} />
              ))}
            </div>
          </ACTCard>
        );
      })}

      {/* Recent Partner Activity */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          Recent Partner Activity
        </h2>
        {partnerJobs && partnerJobs.length > 0 ? (
          <div className="space-y-3">
            {partnerJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded">
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-midnight-forest">
                      {job.title}
                    </div>
                    <div className="text-xs text-midnight-forest/60">
                      {job.partner_profiles?.organization_name} • {job.location}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-midnight-forest/60">
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-midnight-forest/60">
            No recent partner activity to display
          </div>
        )}
      </ACTCard>
    </div>
  );
} 