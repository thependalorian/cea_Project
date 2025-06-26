import { NextResponse } from "next/server";
import createClient from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fetch user and user_type for redirect
      const { data: { user } } = await supabase.auth.getUser();
      let redirectTo = "/dashboard";
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
        if (!profile?.user_type) redirectTo = "/onboarding";
        else if (profile.user_type === "admin") redirectTo = "/dashboard/admin";
        else if (profile.user_type === "partner") redirectTo = "/dashboard/partner";
      }
      if (next) redirectTo = next;
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
} 