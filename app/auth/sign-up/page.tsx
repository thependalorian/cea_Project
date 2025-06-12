import { SignUpForm } from "@/components/auth/SignUpForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModernHero } from "@/components/layout/ModernHero";

interface SignUpPageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { type } = await searchParams;
  
  return (
    <MainLayout showBottomCTA={false}>
      {/* Modern Hero Section */}
      <ModernHero 
        title={
          <span>
            Start Your <span className="text-spring-green">Climate Career</span> Journey
          </span>
        }
        subtitle="Join Massachusetts' climate economy platform and discover opportunities in the clean energy sector"
        imageSrc="/images/signup-climate-illustration.svg"
        imagePosition="right"
        variant="light"
        fullHeight={false}
        backgroundPattern={true}
        primaryCTA={{
          text: "Sign In",
          href: "/auth/login"
        }}
        secondaryCTA={{
          text: "Learn More",
          href: "/about"
        }}
      />

      {/* Sign Up Form Section */}
      <section className="py-16 bg-sand-gray/5">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-2">
                  Create Your Account
                </h2>
                <p className="text-midnight-forest/70">
                  Join the climate economy community
                </p>
              </div>
              
              <SignUpForm defaultUserType={type as any} />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
