/**
 * Terms of Service Page - Climate Economy Assistant
 * Modern iOS-inspired legal terms and conditions
 * Location: app/terms/page.tsx
 */

import { MainLayout } from "@/components/layout/MainLayout";
import { ModernHero } from "@/components/layout/ModernHero";

export default function TermsOfServicePage() {
  return (
    <MainLayout showBottomCTA={false}>
      {/* Modern Hero Section */}
      <ModernHero 
        title={
          <span>
            Terms of <span className="text-spring-green">Service</span>
          </span>
        }
        subtitle="Review the terms and conditions that govern your use of the Climate Economy Assistant platform."
        imageSrc="/images/legal-terms-illustration.svg"
        imagePosition="right"
        variant="light"
        fullHeight={false}
        primaryCTA={{
          text: "Privacy Policy",
          href: "/privacy"
        }}
        secondaryCTA={{
          text: "Contact Us",
          href: "/contact"
        }}
      />

      {/* Terms Content */}
      <section className="py-16 bg-sand-gray/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8 md:p-12">
              <div className="text-center pb-8 border-b border-sand-gray/20 mb-8">
                <p className="text-midnight-forest/60 font-helvetica">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="prose max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-midnight-forest/80 leading-relaxed">
                    By creating an account with the Climate Economy Assistant, you agree to these Terms of Service 
                    and our Privacy Policy. These terms govern your use of our platform and services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-4">
                    2. Data Collection and Social Profile Enhancement
                  </h2>
                  <p className="text-midnight-forest/80 mb-4">
                    To provide enhanced career recommendations, we may collect and analyze:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-spring-green/5 to-seafoam-blue/5 rounded-xl p-6 border border-spring-green/20">
                      <ul className="space-y-3 text-midnight-forest/80">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-spring-green rounded-full mt-2 flex-shrink-0"></div>
                          <span>Resume and career information you provide</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-seafoam-blue rounded-full mt-2 flex-shrink-0"></div>
                          <span>Public social profile information (when available)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-r from-moss-green/5 to-midnight-forest/5 rounded-xl p-6 border border-moss-green/20">
                      <ul className="space-y-3 text-midnight-forest/80">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-moss-green rounded-full mt-2 flex-shrink-0"></div>
                          <span>Professional background and skills data</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-midnight-forest rounded-full mt-2 flex-shrink-0"></div>
                          <span>Career interests and preferences you specify</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-6 bg-spring-green/10 rounded-xl border border-spring-green/30">
                    <p className="text-midnight-forest/80 font-helvetica">
                      <strong>You can opt out of social profile analysis at any time in your Settings.</strong>
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-4">
                    3. Contact Information
                  </h2>
                  <div className="bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 rounded-xl p-8 border border-spring-green/20">
                    <p className="text-midnight-forest/80 font-helvetica mb-4">
                      For questions about these terms or your data rights, contact us at:
                    </p>
                    <div className="text-center">
                      <div className="text-spring-green font-helvetica font-medium text-lg">
                        support@climateeconomy.org
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export const metadata = {
  title: "Terms of Service - Climate Economy Assistant",
  description: "Terms of Service for the Climate Economy Assistant platform",
}; 