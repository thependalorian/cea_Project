import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Climate Economy Assistant</h1>
      <ChatWindow />
    </div>
  );
}
