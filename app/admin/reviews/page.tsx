/**
 * HITL Review Dashboard - Climate Economy Assistant
 * Manual review interface for 80% match threshold approvals
 * Location: app/admin/reviews/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACTCard, ACTButton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Filter,
  Shield
} from "lucide-react";
import Link from "next/link";

interface HITLReview {
  id: string;
  type: string;
  status: string;
  priority: string;
  match_score: number;
  candidate_id: string;
  job_id: string;
  escalation_reason: string;
  created_at: string;
  job_seeker_profiles?: {
    full_name: string;
    email: string;
    current_title: string;
    experience_level: string;
  };
  job_listings?: {
    title: string;
    partner_id: string;
    location: string;
    employment_type: string;
    partner_profiles?: {
      organization_name: string;
    };
  };
}

export default async function HITLReviewPage() {
  const supabase = await createClient();
  
  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (user management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_users, can_manage_system, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_users && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need user management privileges to access review functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get pending HITL reviews
  const { data: pendingReviews, error } = await supabase
    .from('conversation_interrupts')
    .select(`
      *,
      job_seeker_profiles!conversation_interrupts_candidate_id_fkey (
        full_name,
        email,
        current_title,
        experience_level
      ),
      job_listings!conversation_interrupts_job_id_fkey (
        title,
        partner_id,
        location,
        employment_type,
        partner_profiles!job_listings_partner_id_fkey (
          organization_name
        )
      )
    `)
    .eq('supervisor_approval_required', true)
    .in('status', ['pending', 'escalated'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching HITL reviews:', error);
  }

  const reviews: HITLReview[] = pendingReviews || [];
  
  // Get review statistics
  const { data: stats } = await supabase
    .from('conversation_interrupts')
    .select('status, priority')
    .eq('supervisor_approval_required', true);

  const reviewStats = {
    total: stats?.length || 0,
    pending: stats?.filter(s => s.status === 'pending').length || 0,
    high_priority: stats?.filter(s => s.priority === 'high').length || 0,
    escalated: stats?.filter(s => s.status === 'escalated').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Human-in-the-Loop Reviews</h1>
          <p className="text-muted-foreground">
            Review high-scoring candidate matches (80%+ threshold) for partner approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Export Reviews
          </Button>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{reviewStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{reviewStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{reviewStats.high_priority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{reviewStats.escalated}</div>
              <div className="text-sm text-muted-foreground">Escalated</div>
            </div>
          </div>
        </ACTCard>
      </div>

      {/* HITL Workflow Notice */}
      <ACTCard variant="outlined" className="p-4 bg-spring-green/5 border-spring-green/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-spring-green mt-0.5" />
          <div>
            <h3 className="font-semibold text-midnight-forest mb-1">
              80% Match Threshold Workflow
            </h3>
            <p className="text-sm text-midnight-forest/80">
              When candidate-job matches score 80% or higher, they automatically trigger human review 
              for hiring manager connection. Review each match below to approve or provide guidance.
            </p>
          </div>
        </div>
      </ACTCard>

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ACTCard key={review.id} variant="outlined" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Review Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Badge 
                      variant={review.priority === 'high' ? 'destructive' : 'secondary'}
                    >
                      {review.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge variant="outline">
                      {(review.match_score * 100).toFixed(0)}% Match
                    </Badge>
                    <Badge variant="secondary">
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Match Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Candidate Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Candidate</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <div className="font-medium">
                          {review.job_seeker_profiles?.full_name || 'Anonymous Candidate'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.job_seeker_profiles?.current_title || 'No title specified'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Experience: {review.job_seeker_profiles?.experience_level || 'Not specified'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.job_seeker_profiles?.email}
                        </div>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Position</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <div className="font-medium">
                          {review.job_listings?.title || 'Job Title Not Available'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.job_listings?.partner_profiles?.organization_name || 'Partner Organization'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.job_listings?.location} • {review.job_listings?.employment_type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Escalation Reason */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium mb-1">Escalation Reason:</div>
                    <div className="text-sm text-muted-foreground">
                      {review.escalation_reason}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-3 text-xs text-muted-foreground">
                    Escalated on {new Date(review.created_at).toLocaleDateString()} at{' '}
                    {new Date(review.created_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-6">
                  <Button size="sm" className="w-24">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" className="w-24">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="ghost" size="sm" className="w-24">
                    View Details
                  </Button>
                </div>
              </div>
            </ACTCard>
          ))}
        </div>
      ) : (
        <ACTCard variant="outlined" className="p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
          <p className="text-muted-foreground mb-4">
            All high-scoring matches have been reviewed. New 80%+ matches will appear here automatically.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin">
              Return to Admin Dashboard
            </Link>
          </Button>
        </ACTCard>
      )}
    </div>
  );
}

export const metadata = {
  title: "HITL Reviews - Admin Dashboard",
  description: "Human-in-the-loop review system for high-scoring candidate matches",
}; 