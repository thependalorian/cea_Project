import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RoleBasedNav } from "@/components/role-based-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Use getUser() for secure authentication
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

  return (
    <main className="min-h-screen flex flex-col items-center bg-base-100">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full bg-base-200 border-b">
          <div className="navbar max-w-5xl mx-auto">
            <div className="flex-1">
              <Link href="/" className="text-xl font-bold">
                Climate Economy Assistant
              </Link>
            </div>
            <div className="flex-none gap-4">
              <RoleBasedNav userRole={userRole} />
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </div>
        </nav>

        <div className="flex-1 w-full max-w-5xl p-4 md:p-8">
          {children}
        </div>

        <footer className="w-full border-t bg-base-200">
          <div className="max-w-5xl mx-auto py-8 px-4 flex justify-between items-center text-sm">
            <p>
              © {new Date().getFullYear()} Climate Economy Assistant. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="link link-hover">
                Privacy Policy
              </Link>
              <Link href="/terms" className="link link-hover">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
