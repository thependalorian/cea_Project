/**
 * Dashboard Page - Climate Economy Assistant
 * Modern iOS-inspired role-based redirect hub for authenticated users
 * Location: app/dashboard/page.tsx
 */

// 🚨 TEMPORARY: AUTH DISABLED FOR TESTING PAGES AND FLOWS
// import { createClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModernHero } from "@/components/layout/ModernHero";
import { Users, Briefcase, Shield } from "lucide-react";

export default async function DashboardPage() {
  // 🚨 AUTH DISABLED - Show page selector instead of redirects
  /*
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user type from auth metadata and redirect accordingly
  const userType = user.user_metadata?.user_type || 'job_seeker'; // Default to job_seeker
  
  console.log('Dashboard redirect for user:', user.id, 'type:', userType);
  
  // Direct redirect based on user type
  switch (userType) {
    case 'admin':
      redirect("/admin");
      break;
    case 'partner':
      redirect("/partners");
      break;
    case 'job_seeker':
    default:
      redirect("/job-seekers");
  }
  */

  // Role options for the interactive cards
  const roleFeatures = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Job Seeker",
      description: "Explore climate career opportunities and connect with AI specialists for personalized guidance",
      color: "spring-green" as const,
      href: "/job-seekers"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Partner Organization", 
      description: "Access top climate talent and manage your sustainable workforce recruitment",
      color: "seafoam-blue" as const,
      href: "/partners"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Platform Administrator",
      description: "Comprehensive platform management and system administration tools",
      color: "moss-green" as const,
      href: "/admin"
    }
  ];

  return (
    <MainLayout showBottomCTA={false}>
      {/* Modern Hero Section with Testing Notice */}
      <ModernHero 
        title={
          <span>
            Choose Your <span className="text-spring-green">Dashboard</span>
          </span>
        }
        subtitle="Authentication is temporarily disabled for testing. Select which role dashboard you want to explore in the Climate Economy Assistant platform."
        imageSrc="/images/dashboard-selection-illustration.svg"
        imagePosition="right"
        variant="light"
        fullHeight={false}
        backgroundPattern={true}
        primaryCTA={{
          text: "Job Seeker Dashboard",
          href: "/job-seekers"
        }}
        secondaryCTA={{
          text: "Partner Dashboard", 
          href: "/partners"
        }}
      />

      {/* Role Selection Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-helvetica font-medium text-midnight-forest mb-4">
                Explore Platform Roles
              </h2>
              <p className="text-lg text-midnight-forest/70 max-w-2xl mx-auto">
                Discover the comprehensive tools and features available for each user type in Massachusetts' climate economy platform
              </p>
            </div>

            {/* Interactive Role Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {roleFeatures.map((role, index) => (
                <a 
                  key={index}
                  href={role.href} 
                  className="block group"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8 text-center hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      role.color === 'spring-green' ? 'bg-gradient-to-br from-spring-green/10 to-spring-green/5' :
                      role.color === 'seafoam-blue' ? 'bg-gradient-to-br from-seafoam-blue/10 to-seafoam-blue/5' :
                      'bg-gradient-to-br from-moss-green/10 to-moss-green/5'
                    }`}>
                      <div className={`w-10 h-10 ${
                        role.color === 'spring-green' ? 'text-spring-green' :
                        role.color === 'seafoam-blue' ? 'text-seafoam-blue' :
                        'text-moss-green'
                      }`}>
                        {role.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                      {role.title}
                    </h3>
                    <p className="text-midnight-forest/70 leading-relaxed mb-6">
                      {role.description}
                    </p>
                    <div className={`font-helvetica font-medium transition-colors ${
                      role.color === 'spring-green' ? 'text-spring-green group-hover:text-spring-green/80' :
                      role.color === 'seafoam-blue' ? 'text-seafoam-blue group-hover:text-seafoam-blue/80' :
                      'text-moss-green group-hover:text-moss-green/80'
                    }`}>
                      Explore Dashboard →
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testing Notice Section */}
      <section className="py-16 bg-sand-gray/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 border border-spring-green/20 rounded-xl p-8 max-w-lg">
              <div className="text-spring-green font-helvetica font-medium mb-3 text-lg">
                🧪 Testing Mode Active
              </div>
              <p className="text-midnight-forest/70 font-helvetica leading-relaxed">
                Authentication is temporarily disabled to allow exploration of all platform features. 
                Role-based redirects will be enabled in production.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export const metadata = {
  title: "Dashboard - Climate Economy Assistant",
  description: "Redirecting to your personalized dashboard",
}; 