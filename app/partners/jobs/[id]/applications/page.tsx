/**
 * Job Interest & Engagement Management Page - Climate Economy Assistant
 * View and manage candidate interest/engagement for a specific job listing
 * Applications are processed externally on partner websites
 * Location: app/partners/jobs/[id]/applications/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ACTCard, ACTButton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  ExternalLink,
  Download,
  Filter,
  TrendingUp,
  Eye
} from "lucide-react";
import Link from "next/link";

interface JobEngagementPageProps {
  params: {
    id: string;
  };
}

export default async function JobEngagementPage({ params }: JobEngagementPageProps) {
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

  // Get job details
  const { data: job } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', params.id)
    .eq('partner_id', partner.id)
    .single();

  if (!job) {
    notFound();
  }

  // Get candidate interest/engagement with job seeker details
  const { data: candidateInterest, error } = await supabase
    .from('user_interests')
    .select(`
      *,
      job_seeker_profiles (
        id,
        full_name,
        email,
        phone,
        location,
        current_title,
        experience_level,
        climate_focus_areas,
        resume_filename,
        resume_storage_path,
        profile_completed
      )
    `)
    .eq('resource_id', job.id)
    .eq('resource_type', 'job_listing')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidate interest:', error);
  }

  // Filter for qualified candidates (80%+ match threshold logic)
  const interestedCandidates = candidateInterest?.filter(interest => interest.job_seeker_profiles) || [];
  const qualifiedCandidates = interestedCandidates.filter(interest => {
    // This would integrate with your FastAPI backend matching logic
    // For now, using profile completeness as a proxy for qualification
    return interest.job_seeker_profiles?.profile_completed;
  });

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
            <Link href={`/partners/jobs/${job.id}`} className="hover:text-foreground">
              {job.title}
            </Link>
            <span>/</span>
            <span>Candidate Interest</span>
          </div>
          <h1 className="text-3xl font-bold">
            Candidate Interest: {job.title}
          </h1>
          <div className="space-y-1">
            <p className="text-muted-foreground">
              {interestedCandidates.length} candidate{interestedCandidates.length !== 1 ? 's' : ''} have shown interest in this position
            </p>
            <p className="text-sm text-muted-foreground">
              💡 <strong>Platform Logic:</strong> Applications are processed on your external website. 
              Qualified candidates (80%+ match) will be directly connected to you.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Interest Data
          </Button>
        </div>
      </div>

      {/* Interest Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{interestedCandidates.length}</div>
              <div className="text-sm text-muted-foreground">Total Interest</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{qualifiedCandidates.length}</div>
              <div className="text-sm text-muted-foreground">Qualified Matches</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {interestedCandidates.filter(interest => interest.job_seeker_profiles?.resume_filename).length}
              </div>
              <div className="text-sm text-muted-foreground">With Resumes</div>
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
                {interestedCandidates.length > 0 
                  ? new Date(interestedCandidates[0].created_at).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-muted-foreground">Latest Interest</div>
            </div>
          </div>
        </ACTCard>
      </div>

      {/* Ecosystem Application Flow Notice */}
      <ACTCard variant="outlined" className="p-4 bg-spring-green/5 border-spring-green/20">
        <div className="flex items-start gap-3">
          <ExternalLink className="h-5 w-5 text-spring-green mt-0.5" />
          <div>
            <h3 className="font-semibold text-midnight-forest mb-1">
              External Application Processing
            </h3>
            <p className="text-sm text-midnight-forest/80">
              Candidates apply directly on your website via: 
              <a 
                href={job.application_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-spring-green hover:underline font-medium"
              >
                {job.application_url || 'Your application URL'}
              </a>
            </p>
            <p className="text-xs text-midnight-forest/60 mt-1">
              Our platform tracks candidate interest and provides smart matching to connect you with qualified talent.
            </p>
          </div>
        </div>
      </ACTCard>

      {/* Candidate Interest List */}
      {interestedCandidates.length > 0 ? (
        <div className="space-y-4">
          {interestedCandidates.map((interest) => {
            const profile = interest.job_seeker_profiles;
            if (!profile) return null;

            const isQualified = profile.profile_completed; // Simplified qualification logic
            
            return (
              <ACTCard key={interest.id} variant="outlined" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-spring-green to-moss-green rounded-full flex items-center justify-center text-white font-semibold">
                      {profile.full_name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {profile.full_name || 'Anonymous Candidate'}
                        </h3>
                        <Badge variant={isQualified ? "default" : "secondary"}>
                          {isQualified ? "Qualified Match" : "Interested"}
                        </Badge>
                        {profile.resume_filename && (
                          <Badge variant="outline">
                            Resume Available
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        {profile.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{profile.email}</span>
                          </div>
                        )}
                        
                        {profile.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{profile.phone}</span>
                          </div>
                        )}

                        {profile.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                        )}

                        {profile.current_title && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span>{profile.current_title}</span>
                          </div>
                        )}
                      </div>

                      {profile.climate_focus_areas && profile.climate_focus_areas.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm text-muted-foreground mb-2">Climate Focus Areas:</div>
                          <div className="flex flex-wrap gap-1">
                            {profile.climate_focus_areas.slice(0, 3).map((area: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {profile.climate_focus_areas.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.climate_focus_areas.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-muted-foreground">
                        Showed interest on {new Date(interest.created_at).toLocaleDateString()} at{' '}
                        {new Date(interest.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {profile.resume_filename && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </ACTCard>
            );
          })}
        </div>
      ) : (
        <ACTCard variant="outlined" className="p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Candidate Interest Yet</h3>
          <p className="text-muted-foreground mb-4">
            This job listing hasn't generated candidate interest yet. Share it with potential candidates or promote it through your channels.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/partners/jobs/${job.id}/edit`}>
                Edit Job Listing
              </Link>
            </Button>
            <Button asChild>
              <Link href={job.application_url || '#'}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Application Page
              </Link>
            </Button>
          </div>
        </ACTCard>
      )}
    </div>
  );
}

export const metadata = {
  title: "Candidate Interest - Partner Dashboard", 
  description: "View candidate interest and engagement for your job listings",
}; 