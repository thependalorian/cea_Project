import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function JobSeekersPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Climate Economy Assistant</h1>
        <p className="text-muted-foreground">
          Your AI-powered assistant for skills translation for the Massachusetts Climate Economy. Ask me about the Massachusetts Climate Economy,
          Chat with your resume, Explore career pathways, Upskill yourself, and more!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Job Search</h3>
            <p>Find Massachusetts Climate Economy jobs matching your skills and interests</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary btn-sm">Start Search</button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Skills Translation</h3>
            <p>Translate your skills to the Massachusetts Climate Economy</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary btn-sm">Translate Skills</button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Career Pathways</h3>
            <p>Explore career pathways in the Massachusetts Climate Economy</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary btn-sm">Explore Pathways</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Chat with your Climate Ecosystem Assistant</h2>
        <ChatWindow context="job-seeker" />
      </div>
    </div>
  );
} 