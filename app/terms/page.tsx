/**
 * Terms of Service Page - Climate Economy Assistant
 * Legal terms and conditions
 * Location: app/terms/page.tsx
 */

import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard } from "@/components/ui";

export default function TermsOfServicePage() {
  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest mb-8">
            Terms of Service
          </h1>
          <p className="text-body text-midnight-forest/70">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <ACTCard variant="outlined" className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-midnight-forest/80">
                  By creating an account with the Climate Economy Assistant, you agree to these Terms of Service 
                  and our Privacy Policy. These terms govern your use of our platform and services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                  2. Data Collection and Social Profile Enhancement
                </h2>
                <p className="text-midnight-forest/80 mb-3">
                  To provide enhanced career recommendations, we may collect and analyze:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-midnight-forest/80">
                  <li>Resume and career information you provide</li>
                  <li>Public social profile information (LinkedIn, GitHub, personal websites) when available</li>
                  <li>Professional background and skills data from public sources</li>
                  <li>Career interests and preferences you specify</li>
                </ul>
                <p className="text-midnight-forest/80 mt-3">
                  <strong>You can opt out of social profile analysis at any time in your Settings.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                  3. Your Data Rights
                </h2>
                <p className="text-midnight-forest/80 mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-midnight-forest/80">
                  <li>Access your personal data</li>
                  <li>Export your data in a portable format</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of social profile analysis</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                  4. Use of AI and Analytics
                </h2>
                <p className="text-midnight-forest/80">
                  Our platform uses artificial intelligence to analyze your profile and provide career recommendations. 
                  This analysis may include data from your resume, social profiles (if consented), and career preferences 
                  to match you with relevant opportunities in the climate economy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                  5. Contact Information
                </h2>
                <p className="text-midnight-forest/80">
                  For questions about these terms or your data rights, contact us at:
                  <br />
                  <strong>support@climateeconomy.org</strong>
                </p>
              </section>
            </div>
          </ACTCard>
        </div>
      </IOSSection>

      <Footer />
    </IOSLayout>
  );
}

export const metadata = {
  title: "Terms of Service - Climate Economy Assistant",
  description: "Terms of Service for the Climate Economy Assistant platform",
}; 