/**
 * Partner Job Details Page - Climate Economy Assistant
 * Individual job listing management for partners
 * Location: app/partners/jobs/[id]/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ACTCard, ACTButton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Briefcase,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const supabase = await createClient();
  
  // Get current user and verify partner access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Get partner profile
  const { data: partner } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('email', user.email)
    .single();

  if (!partner) {
    redirect("/partners");
  }

  // Get job details with application analytics
  const { data: job, error } = await supabase
    .from('job_listings')
    .select(`
      *,
      user_interests (
        id,
        created_at,
        user_id
      )
    `)
    .eq('id', params.id)
    .eq('partner_id', partner.id)
    .single();

  if (error || !job) {
    notFound();
  }

  // Get job analytics
  const { data: analytics } = await supabase
    .from('resource_views')
    .select('*')
    .eq('resource_id', job.id)
    .eq('resource_type', 'job_listing');

  const applicationCount = job.user_interests?.length || 0;
  const viewCount = analytics?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/partners/jobs" className="hover:text-foreground">
              Jobs
            </Link>
            <span>/</span>
            <span>{job.title}</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {job.title}
            <Badge variant={job.is_active ? "default" : "secondary"}>
              {job.is_active ? "Active" : "Inactive"}
            </Badge>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/partners/jobs/${job.id}/applications`}>
              <Users className="h-4 w-4 mr-2" />
              {applicationCount} Interested
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/partners/jobs/${job.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Job Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{viewCount}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{applicationCount}</div>
              <div className="text-sm text-muted-foreground">Candidate Interest</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {new Date(job.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Posted</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : 'No expiry'}
              </div>
              <div className="text-sm text-muted-foreground">Expires</div>
            </div>
          </div>
        </ACTCard>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <ACTCard variant="outlined" title="Job Description">
            <div className="prose max-w-none">
              <p className="text-muted-foreground">{job.description}</p>
            </div>
          </ACTCard>

          {job.responsibilities && (
            <ACTCard variant="outlined" title="Responsibilities">
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{job.responsibilities}</p>
              </div>
            </ACTCard>
          )}

          {job.requirements && (
            <ACTCard variant="outlined" title="Requirements">
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{job.requirements}</p>
              </div>
            </ACTCard>
          )}

          {job.benefits && (
            <ACTCard variant="outlined" title="Benefits">
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{job.benefits}</p>
              </div>
            </ACTCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ACTCard variant="outlined" title="Job Details">
            <div className="space-y-4">
              {job.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.location}</span>
                </div>
              )}

              {job.employment_type && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{job.employment_type}</span>
                </div>
              )}

              {job.experience_level && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{job.experience_level}</span>
                </div>
              )}

              {job.salary_range && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.salary_range}</span>
                </div>
              )}
            </div>
          </ACTCard>

          {job.skills_required && job.skills_required.length > 0 && (
            <ACTCard variant="outlined" title="Required Skills">
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </ACTCard>
          )}

          {job.climate_focus && job.climate_focus.length > 0 && (
            <ACTCard variant="outlined" title="Climate Focus">
              <div className="flex flex-wrap gap-2">
                {job.climate_focus.map((focus: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {focus}
                  </Badge>
                ))}
              </div>
            </ACTCard>
          )}

          {job.application_url && (
            <ACTCard variant="outlined" title="External Application">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Candidates apply directly on your website:
                </p>
                <Button asChild className="w-full">
                  <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply on Partner Site
                  </a>
                </Button>
              </div>
            </ACTCard>
          )}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Job Details - Partner Dashboard",
  description: "Manage individual job listing details and applications",
}; 