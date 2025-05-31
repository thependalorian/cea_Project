import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "user";

  // Ensure user is admin
  if (userRole !== "admin") {
    redirect("/protected/job-seekers");
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Admin specific navigation */}
      <div className="w-full border-b bg-base-200/50">
        <div className="max-w-5xl mx-auto py-2 px-4">
          <div className="flex gap-4 items-center text-sm">
            <Link 
              href="/protected/admin" 
              className="btn btn-ghost btn-sm"
            >
              Dashboard
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
            <Link 
              href="/protected/admin/analytics" 
              className="btn btn-ghost btn-sm"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 