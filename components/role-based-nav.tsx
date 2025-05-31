import Link from "next/link";
import type { UserRole } from "@/hooks/use-role-navigation";

interface RoleBasedNavProps {
  userRole: UserRole;
}

export function RoleBasedNav({ userRole }: RoleBasedNavProps) {
  return (
    <div className="hidden md:flex gap-4 mr-4">
      {/* Common links for all users */}
      <Link 
        href="/protected/job-seekers" 
        className="btn btn-ghost btn-sm"
      >
        Job Search
      </Link>

      {/* Partner specific links */}
      {userRole === "partner" && (
        <>
          <Link 
            href="/protected/partners" 
            className="btn btn-ghost btn-sm"
          >
            Partner Dashboard
          </Link>
          <Link 
            href="/protected/partners/listings" 
            className="btn btn-ghost btn-sm"
          >
            Job Listings
          </Link>
        </>
      )}

      {/* Admin specific links */}
      {userRole === "admin" && (
        <>
          <Link 
            href="/protected/admin" 
            className="btn btn-ghost btn-sm"
          >
            Admin Dashboard
          </Link>
          <Link 
            href="/protected/admin/users" 
            className="btn btn-ghost btn-sm"
          >
            User Management
          </Link>
          <Link 
            href="/protected/admin/partners" 
            className="btn btn-ghost btn-sm"
          >
            Partner Management
          </Link>
        </>
      )}
    </div>
  );
} 