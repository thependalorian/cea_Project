import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";

export default async function AdminPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest mb-8">
            Admin Dashboard
          </h1>
          <p className="text-body text-midnight-forest/70">
            Manage the Climate Economy Assistant platform.
          </p>
        </div>
      </IOSSection>
      
      <Footer />
    </IOSLayout>
  );
} 