/**
 * Privacy Policy Page - Climate Economy Assistant
 * Modern iOS-inspired privacy policy and data protection information
 * Location: app/privacy/page.tsx
 */

import { MainLayout } from "@/components/layout/MainLayout";
import { ModernHero } from "@/components/layout/ModernHero";
import { ContentSection } from "@/components/layout/ContentSection";
import { Shield, Eye, Settings } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <MainLayout showBottomCTA={false}>
      {/* Modern Hero Section */}
      <ModernHero 
        title={
          <span>
            Privacy <span className="text-spring-green">Policy</span>
          </span>
        }
        subtitle="Learn how we protect your data and respect your privacy while connecting you to climate career opportunities."
        imageSrc="/images/privacy-protection-illustration.svg"
        imagePosition="left"
        variant="default"
        fullHeight={false}
        primaryCTA={{
          text: "View Settings",
          href: "/settings"
        }}
        secondaryCTA={{
          text: "Contact Us",
          href: "/contact"
        }}
        highlightedStats={[
          { value: "GDPR", label: "Compliant" },
          { value: "256-bit", label: "Encryption" },
          { value: "100%", label: "Transparency" }
        ]}
      />

      {/* Privacy Features */}
      <ContentSection
        title="Your Data Protection Rights"
        subtitle="Comprehensive privacy controls for the climate economy platform"
        content="We believe in complete transparency about how your data is collected, used, and protected. Our privacy-first approach ensures you maintain full control over your personal information while receiving personalized climate career guidance."
        imageSrc="/images/privacy-dashboard.jpg"
        imageAlt="Privacy settings dashboard"
        imagePosition="right"
        variant="feature"
        features={[
          {
            icon: <Shield className="h-5 w-5 text-spring-green" />,
            title: "Data Protection",
            description: "Industry-standard encryption and security measures protect your personal information."
          },
          {
            icon: <Eye className="h-5 w-5 text-spring-green" />,
            title: "Full Transparency",
            description: "Clear visibility into what data we collect and how it's used for your career guidance."
          },
          {
            icon: <Settings className="h-5 w-5 text-spring-green" />,
            title: "Your Control",
            description: "Granular privacy controls allow you to customize your data sharing preferences."
          }
        ]}
      />

      {/* Privacy Policy Content */}
      <section className="py-16 bg-sand-gray/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8 md:p-12">
              <div className="prose max-w-none">
                <div className="space-y-8">
                  {/* Last Updated */}
                  <div className="text-center pb-8 border-b border-sand-gray/20">
                    <p className="text-midnight-forest/60 font-helvetica">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* Information Collection */}
                  <section>
                    <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-4">
                      1. Information We Collect
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-spring-green/5 to-seafoam-blue/5 rounded-xl p-6 border border-spring-green/20">
                        <h3 className="font-helvetica font-medium text-midnight-forest mb-3">Information You Provide:</h3>
                        <ul className="list-disc pl-6 space-y-2 text-midnight-forest/80">
                          <li>Account information (name, email, password)</li>
                          <li>Resume and career documents</li>
                          <li>Career preferences and interests</li>
                          <li>Professional background and skills</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gradient-to-r from-seafoam-blue/5 to-moss-green/5 rounded-xl p-6 border border-seafoam-blue/20">
                        <h3 className="font-helvetica font-medium text-midnight-forest mb-3">Public Social Profile Information:</h3>
                        <p className="text-midnight-forest/80 mb-3">
                          <strong>With your consent</strong>, we may collect publicly available information from:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-midnight-forest/80">
                          <li>LinkedIn professional profiles</li>
                          <li>GitHub repositories and contributions</li>
                          <li>Personal websites and portfolios</li>
                          <li>Professional blog posts and publications</li>
                        </ul>
                        <div className="mt-4 p-4 bg-spring-green/10 rounded-lg border border-spring-green/30">
                          <p className="text-sm text-midnight-forest/80 font-helvetica">
                            <strong>Important:</strong> You can disable social profile analysis in Settings → Data & Privacy
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Data Usage */}
                  <section>
                    <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-4">
                      2. How We Use Your Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-sand-gray/20">
                          <div className="w-8 h-8 bg-spring-green/10 rounded-lg flex items-center justify-center">
                            <span className="text-spring-green font-helvetica font-bold text-sm">1</span>
                          </div>
                          <span className="text-midnight-forest/80 font-helvetica">Provide personalized career recommendations</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-sand-gray/20">
                          <div className="w-8 h-8 bg-seafoam-blue/10 rounded-lg flex items-center justify-center">
                            <span className="text-seafoam-blue font-helvetica font-bold text-sm">2</span>
                          </div>
                          <span className="text-midnight-forest/80 font-helvetica">Match skills with relevant opportunities</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-sand-gray/20">
                          <div className="w-8 h-8 bg-moss-green/10 rounded-lg flex items-center justify-center">
                            <span className="text-moss-green font-helvetica font-bold text-sm">3</span>
                          </div>
                          <span className="text-midnight-forest/80 font-helvetica">Enhance resume analysis</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-sand-gray/20">
                          <div className="w-8 h-8 bg-spring-green/10 rounded-lg flex items-center justify-center">
                            <span className="text-spring-green font-helvetica font-bold text-sm">4</span>
                          </div>
                          <span className="text-midnight-forest/80 font-helvetica">Connect with climate partners</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-sand-gray/20">
                          <div className="w-8 h-8 bg-seafoam-blue/10 rounded-lg flex items-center justify-center">
                            <span className="text-seafoam-blue font-helvetica font-bold text-sm">5</span>
                          </div>
                          <span className="text-midnight-forest/80 font-helvetica">Improve AI-powered guidance</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-4">
                      3. Contact Us
                    </h2>
                    <div className="bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 rounded-xl p-8 border border-spring-green/20">
                      <p className="text-midnight-forest/80 font-helvetica mb-6">
                        For privacy questions, data requests, or to opt out of social profile analysis:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="font-helvetica font-medium text-midnight-forest">Email</div>
                          <div className="text-spring-green font-helvetica">privacy@climateeconomy.org</div>
                        </div>
                        <div className="text-center">
                          <div className="font-helvetica font-medium text-midnight-forest">Support</div>
                          <div className="text-seafoam-blue font-helvetica">support@climateeconomy.org</div>
                        </div>
                        <div className="text-center">
                          <div className="font-helvetica font-medium text-midnight-forest">Settings</div>
                          <a href="/settings" className="text-moss-green hover:text-moss-green/80 font-helvetica transition-colors">
                            Update Preferences
                          </a>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export const metadata = {
  title: "Privacy Policy - Climate Economy Assistant",
  description: "Privacy Policy detailing data collection and usage practices",
}; 