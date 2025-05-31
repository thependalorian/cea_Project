import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResumeSearch } from "@/components/resume-search";

export default async function ResumeSearchPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Resume Search</h1>
        <p className="text-muted-foreground">
          Search through your uploaded resumes using natural language queries.
        </p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <ResumeSearch userId={user.id} />
      </div>
    </div>
  );
} 