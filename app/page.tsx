"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/hero";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return;
      }

      // Get user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";
      
      // Redirect based on role
      switch (userRole) {
        case "admin":
          router.push("/protected/admin");
          break;
        case "partner":
          router.push("/protected/partners");
          break;
        default:
          router.push("/protected/job-seekers");
          break;
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
    </main>
  );
}
