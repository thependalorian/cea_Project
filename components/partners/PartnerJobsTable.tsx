/**
 * PartnerJobsTable Component - Climate Economy Assistant
 * Displays and manages job listings for partner organizations
 * Location: components/partners/PartnerJobsTable.tsx
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  Copy,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  salary_range_min?: number;
  salary_range_max?: number;
  status: string;
  created_at: string;
  expires_at?: string;
  user_interests?: Array<{
    id: string;
    created_at: string;
    job_seekers: {
      first_name: string;
      last_name: string;
      email: string;
      climate_experience_level: string;
    };
  }>;
}

interface PartnerJobsTableProps {
  jobs: Job[];
  currentPage: number;
  totalPages: number;
  partnerId: string;
}

export default function PartnerJobsTable({
  jobs,
  currentPage,
  totalPages,
  partnerId,
}: PartnerJobsTableProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      draft: { label: "Draft", variant: "secondary" as const },
      expired: { label: "Expired", variant: "destructive" as const },
      paused: { label: "Paused", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Simple Table using DaisyUI */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Location</th>
              <th>Type</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className="space-y-1">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-base-content/70 line-clamp-2">
                      {job.description.substring(0, 100)}...
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-base-content/70" />
                    {job.location}
                  </div>
                </td>
                <td>
                  <div className="badge badge-outline">{job.employment_type}</div>
                </td>
                <td>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-1 text-base-content/70" />
                    {formatSalary(job.salary_range_min, job.salary_range_max)}
                  </div>
                </td>
                <td>{getStatusBadge(job.status)}</td>
                <td>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-base-content/70" />
                    {job.user_interests?.length || 0}
                  </div>
                </td>
                <td>
                  <div className="flex items-center text-sm text-base-content/70">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(job.created_at)}
                  </div>
                </td>
                <td>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                      <li>
                        <Link href={`/partners/jobs/${job.id}`}>
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </li>
                      <li>
                        <Link href={`/partners/jobs/${job.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          Edit Job
                        </Link>
                      </li>
                      <li>
                        <Link href={`/partners/jobs/${job.id}/applications`}>
                          <Users className="h-4 w-4" />
                          View Applications
                        </Link>
                      </li>
                      <li>
                        <a>
                          <Copy className="h-4 w-4" />
                          Duplicate Job
                        </a>
                      </li>
                      <li>
                        <a className="text-error">
                          <Trash2 className="h-4 w-4" />
                          Delete Job
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">
            Page {currentPage} of {totalPages}
          </div>
          <div className="join">
            <Link
              href={`?page=${currentPage - 1}`}
              className={`join-item btn ${currentPage <= 1 ? 'btn-disabled' : ''}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
            <Link
              href={`?page=${currentPage + 1}`}
              className={`join-item btn ${currentPage >= totalPages ? 'btn-disabled' : ''}`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 