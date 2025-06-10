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
        href="/job-seekers" 
        className="btn btn-ghost btn-sm"
      >
        Job Search
      </Link>

      {/* Partner specific links */}
      {userRole === "partner" && (
        <>
          <Link 
            href="/partners" 
            className="btn btn-ghost btn-sm"
          >
            Partner Dashboard
          </Link>
          <Link 
            href="/partners/listings" 
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
            href="/admin" 
            className="btn btn-ghost btn-sm"
          >
            Admin Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="btn btn-ghost btn-sm"
          >
            User Management
          </Link>
          <Link 
            href="/admin/partners" 
            className="btn btn-ghost btn-sm"
          >
            Partner Management
          </Link>
        </>
      )}
    </div>
  );
} 