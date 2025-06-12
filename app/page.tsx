/**
 * Home Page - Climate Economy Assistant
 * Clean homepage with consistent ACTHero branding and footer
 * Location: app/page.tsx
 */

import { ContentSection } from "@/components/layout/ContentSection";
import AgentShowcase from "@/components/layout/AgentShowcase";
import { ClimateAdvisoryChatSection } from "@/components/layout/ClimateAdvisoryChatSection";
import { MainLayout } from "@/components/layout/MainLayout";
import { Shield, Database, Briefcase, BookOpen, BadgeCheck, BarChart3 } from "lucide-react";
import { ACTHero, ACTButton } from "../act-brand-demo/components/ui";

export default function HomePage() {
  return (
    <MainLayout showBottomCTA={false}>
      {/* Main Hero Section - Consistent with other pages */}
      <ACTHero
        title={<span>Connect to the <span className="text-spring-green">Clean Energy</span> Economy</span>}
        subtitle="AI-powered career guidance for navigating the transition to a sustainable future in Massachusetts"
        description="Upload your resume, chat with our 7 AI specialists, and discover your path in the climate economy."
        image="/images/hero-large.jpg"
        size="full"
        align="center"
        variant="default"
        cta={<ACTButton href="/job-seekers" variant="primary">Start Your Journey</ACTButton>}
        secondaryCta={<ACTButton href="/partners" variant="outline">For Employers</ACTButton>}
      />

      {/* Mission Section */}
      <ContentSection
        title="Bridging the Climate Career Gap"
        subtitle="Addressing the 39% information gap in clean energy workforce development"
        content="The Climate Economy Assistant uses advanced AI technology to connect workers with opportunities in Massachusetts' growing clean energy sector, providing personalized guidance through the transition to a sustainable economy."
        imageSrc="/images/climate-action.jpg"
        imageAlt="Climate action and clean energy transition"
        imagePosition="left"
        variant="feature"
        features={[
          {
            icon: <Shield className="h-5 w-5 text-spring-green" />,
            title: "Industry-Verified Data",
            description: "All career information is vetted by industry partners and subject matter experts."
          },
          {
            icon: <Database className="h-5 w-5 text-spring-green" />,
            title: "Real-Time Insights",
            description: "Stay current with the latest trends, skills, and opportunities in the clean energy sector."
          },
          {
            icon: <Briefcase className="h-5 w-5 text-spring-green" />,
            title: "Personalized Guidance",
            description: "Receive tailored advice based on your unique skills, experience, and career goals."
          }
        ]}
      />

      {/* Agent Showcase Section */}
      <AgentShowcase />

      {/* Climate Advisory Chat Section */}
      <ClimateAdvisoryChatSection />

      {/* Benefits Section */}
      <ContentSection
        title="Why Choose Climate Economy Assistant?"
        subtitle="Our unique approach combines AI technology with industry expertise"
        variant="highlight"
        imagePosition="center"
        imageSrc="/images/dashboard-analytics.jpg"
        imageAlt="Climate Economy Assistant analytics dashboard"
        features={[
          {
            icon: <BookOpen className="h-5 w-5 text-spring-green" />,
            title: "Comprehensive Knowledge Base",
            description: "Access detailed information about clean energy careers, skills requirements, and industry trends."
          },
          {
            icon: <BadgeCheck className="h-5 w-5 text-spring-green" />,
            title: "Verified Opportunities",
            description: "All job listings and educational pathways are verified by our industry partners."
          },
          {
            icon: <BarChart3 className="h-5 w-5 text-spring-green" />,
            title: "Data-Driven Insights",
            description: "Make informed career decisions based on real market data and industry forecasts."
          }
        ]}
      />
    </MainLayout>
  );
}
