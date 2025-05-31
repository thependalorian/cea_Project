import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/protected");
  }

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-5xl px-3">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex flex-col gap-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Welcome Administrator!</h2>
            <p>This is your protected admin dashboard where you can manage users, view system analytics, and control platform settings.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">User Management</h3>
              <p>Manage user accounts and permissions.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">System Analytics</h3>
              <p>View platform usage and performance metrics.</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Settings</h3>
              <p>Configure platform settings and features.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 