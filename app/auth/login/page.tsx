import { LoginForm } from "@/components/auth/LoginForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModernHero } from "@/components/layout/ModernHero";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;
  
  return (
    <MainLayout showBottomCTA={false}>
      {/* Modern Hero Section */}
      <ModernHero 
        title={
          <span>
            Welcome Back to <span className="text-spring-green">Climate Careers</span>
          </span>
        }
        subtitle="Sign in to continue your journey in Massachusetts' clean energy economy"
        imageSrc="/images/login-climate-illustration.svg"
        imagePosition="left"
        variant="gradient"
        fullHeight={false}
        primaryCTA={{
          text: "Create Account",
          href: "/auth/sign-up"
        }}
        secondaryCTA={{
          text: "Learn More",
          href: "/about"
        }}
      />

      {/* Login Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-2">
                  Sign In
                </h2>
                <p className="text-midnight-forest/70">
                  Access your climate career dashboard
                </p>
              </div>
              
              <LoginForm redirectTo={redirect} />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
