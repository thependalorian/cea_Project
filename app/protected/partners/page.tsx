import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function PartnersDashboard() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has partner role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "partner") {
    redirect("/protected");
  }

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-5xl px-3">
      <h1 className="text-3xl font-bold">Partner Dashboard</h1>
      <div className="flex flex-col gap-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Welcome Partner!</h2>
            <p>This is your protected partner dashboard where you can manage your partnership settings and view analytics.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Partnership Stats</h3>
              <p>View your partnership performance and metrics here.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Partner Resources</h3>
              <p>Access exclusive partner resources and materials.</p>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">Partner Support Chat</h2>
          <ChatWindow />
        </div>
      </div>
    </div>
  );
} 