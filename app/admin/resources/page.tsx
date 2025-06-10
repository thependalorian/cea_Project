/**
 * Resources Management Page - Climate Economy Assistant
 * Admin interface for managing knowledge resources and content
 * Location: app/admin/resources/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResourcesTable } from "@/components/admin/ResourcesTable";
import { ACTCard, ACTButton } from "@/components/ui";
import { Plus, FileText, BookOpen, ExternalLink, Download, Users, Calendar, Shield } from "lucide-react";

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (content management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_content, can_manage_system, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_content && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need content management privileges to access resource management functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  try {
    // Fetch all knowledge resources with partner information
    const { data: resources, error: resourcesError } = await supabase
      .from('knowledge_resources')
      .select(`
        *,
        partner_profiles(
          organization_name,
          verified
        )
      `)
      .order('created_at', { ascending: false });

    if (resourcesError) {
      console.error('Error fetching resources:', resourcesError);
    }

    // Get resource statistics
    const totalResources = resources?.length || 0;
    const publishedResources = resources?.filter(resource => resource.is_published).length || 0;
    const resourcesThisMonth = resources?.filter(resource => {
      const createdDate = new Date(resource.created_at);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return createdDate >= thisMonth;
    }).length || 0;

    // Get external resources (those with source_url)
    const externalResources = resources?.filter(resource => 
      resource.source_url
    ).length || 0;

    // Get resource type distribution
    const resourceTypes = resources?.reduce((acc: any, resource) => {
      const type = resource.content_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get difficulty distribution
    const difficulties = resources?.reduce((acc: any, resource) => {
      const difficulty = resource.content_difficulty || 'intermediate';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {}) || {};

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Knowledge Resources Management
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Manage knowledge base articles, guides, and educational content
            </p>
          </div>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Resource
          </ACTButton>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Total Resources</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalResources}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Published</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {publishedResources}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Added This Month</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {resourcesThisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">External Links</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {externalResources}
                </p>
              </div>
              <ExternalLink className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Resource Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Types */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Content Types
            </h3>
            <div className="space-y-3">
              {Object.entries(resourceTypes).map(([type, count]) => {
                const percentage = totalResources > 0 ? ((count as number) / totalResources) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-midnight-forest/70 capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-blue-500 rounded"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-midnight-forest w-8">
                        {count as number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Levels */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Difficulty Levels
            </h3>
            <div className="space-y-3">
              {Object.entries(difficulties).map(([difficulty, count]) => {
                const percentage = totalResources > 0 ? ((count as number) / totalResources) * 100 : 0;
                return (
                  <div key={difficulty} className="flex items-center justify-between">
                    <span className="text-sm text-midnight-forest/70 capitalize">{difficulty}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-midnight-forest w-8">
                        {count as number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <Plus className="h-4 w-4" />
              Create Article
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <FileText className="h-4 w-4" />
              Add Guide
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <ExternalLink className="h-4 w-4" />
              Link Resource
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <Download className="h-4 w-4" />
              Import Content
            </ACTButton>
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              All Knowledge Resources
            </h2>
            <p className="text-body text-midnight-forest/70 mt-1">
              Review and manage articles, guides, and educational content
            </p>
          </div>
          
          <ResourcesTable resources={resources || []} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in admin resources page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Resources</h2>
          <p className="text-red-600">
            There was an error loading the resources data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Resources Management - Admin Dashboard",
  description: "Manage knowledge resources and educational content in the Climate Economy Assistant platform",
}; 