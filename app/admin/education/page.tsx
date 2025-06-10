/**
 * Education Programs Management Page - Climate Economy Assistant
 * Admin interface for managing educational content and programs
 * Location: app/admin/education/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EducationTable } from "@/components/admin/EducationTable";
import { ACTCard, ACTButton } from "@/components/ui";
import { Plus, GraduationCap, BookOpen, Users, Calendar, TrendingUp, Shield } from "lucide-react";

export default async function AdminEducationPage() {
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
            You need content management privileges to access education management functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  try {
    // Fetch all education programs with partner information
    const { data: programs, error: programsError } = await supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles!partner_id(
          organization_name,
          verified
        )
      `)
      .order('created_at', { ascending: false });

    if (programsError) {
      console.error('Error fetching education programs:', programsError);
    }

    // Get education statistics
    const totalPrograms = programs?.length || 0;
    const activePrograms = programs?.filter(program => program.is_active).length || 0;
    const programsThisMonth = programs?.filter(program => {
      const createdDate = new Date(program.created_at);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return createdDate >= thisMonth;
    }).length || 0;

    // Get upcoming programs
    const upcomingPrograms = programs?.filter(program => {
      if (!program.start_date) return false;
      return new Date(program.start_date) > new Date();
    }).length || 0;

    // Get program type distribution
    const programTypes = programs?.reduce((acc: any, program) => {
      const type = program.program_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get format distribution
    const formats = programs?.reduce((acc: any, program) => {
      const format = program.format || 'Not specified';
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {}) || {};

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Education Programs Management
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Manage educational content, courses, and training programs
            </p>
          </div>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Program
          </ACTButton>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Total Programs</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalPrograms}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Active Programs</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {activePrograms}
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
                  {programsThisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Upcoming</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {upcomingPrograms}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Program Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Program Types */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Program Types
            </h3>
            <div className="space-y-3">
              {Object.entries(programTypes).map(([type, count]) => {
                const percentage = totalPrograms > 0 ? ((count as number) / totalPrograms) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-midnight-forest/70">{type}</span>
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

          {/* Program Formats */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Program Formats
            </h3>
            <div className="space-y-3">
              {Object.entries(formats).map(([format, count]) => {
                const percentage = totalPrograms > 0 ? ((count as number) / totalPrograms) * 100 : 0;
                return (
                  <div key={format} className="flex items-center justify-between">
                    <span className="text-sm text-midnight-forest/70">{format}</span>
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
              Create Course
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <BookOpen className="h-4 w-4" />
              Add Workshop
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <GraduationCap className="h-4 w-4" />
              Schedule Training
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <Users className="h-4 w-4" />
              Manage Instructors
            </ACTButton>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              All Education Programs
            </h2>
            <p className="text-body text-midnight-forest/70 mt-1">
              Review and manage educational content and training programs
            </p>
          </div>
          
          <EducationTable programs={programs || []} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in admin education page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Education Programs</h2>
          <p className="text-red-600">
            There was an error loading the education programs data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Education Programs - Admin Dashboard",
  description: "Manage educational content and training programs in the Climate Economy Assistant platform",
}; 