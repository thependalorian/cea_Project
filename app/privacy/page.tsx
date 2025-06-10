/**
 * Privacy Policy Page - Climate Economy Assistant
 * Privacy policy and data protection information
 * Location: app/privacy/page.tsx
 */

import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard } from "@/components/ui";

export default function PrivacyPolicyPage() {
  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest mb-8">
            Privacy Policy
          </h1>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <p className="text-body text-midnight-forest/70">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <ACTCard variant="outlined" className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                    1. Information We Collect
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-midnight-forest mb-2">Information You Provide:</h3>
                      <ul className="list-disc pl-6 space-y-1 text-midnight-forest/80">
                        <li>Account information (name, email, password)</li>
                        <li>Resume and career documents</li>
                        <li>Career preferences and interests</li>
                        <li>Professional background and skills</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-midnight-forest mb-2">Public Social Profile Information:</h3>
                      <p className="text-midnight-forest/80 mb-2">
                        <strong>With your consent</strong>, we may collect publicly available information from:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-midnight-forest/80">
                        <li>LinkedIn professional profiles</li>
                        <li>GitHub repositories and contributions</li>
                        <li>Personal websites and portfolios</li>
                        <li>Professional blog posts and publications</li>
                      </ul>
                      <div className="mt-3 p-3 bg-spring-green/10 rounded-lg">
                        <p className="text-sm text-midnight-forest">
                          <strong>Important:</strong> You can disable social profile analysis in Settings → Data & Privacy
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                    2. How We Use Your Information
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 text-midnight-forest/80">
                    <li>Provide personalized climate career recommendations</li>
                    <li>Match your skills with relevant job opportunities</li>
                    <li>Enhance resume analysis with comprehensive profile data</li>
                    <li>Connect you with climate economy partners and resources</li>
                    <li>Improve our AI-powered career guidance systems</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                    3. Social Profile Data Processing
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-seafoam-blue/10 rounded-lg">
                      <h3 className="font-medium text-midnight-forest mb-2">Enhanced Analysis (Optional)</h3>
                      <p className="text-midnight-forest/80 mb-2">
                        When social profile analysis is enabled, we:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-midnight-forest/80">
                        <li>Search for publicly available professional information</li>
                        <li>Analyze skills and experience from multiple sources</li>
                        <li>Provide more comprehensive career recommendations</li>
                        <li>Identify transferable skills and career pathways</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-moss-green/10 rounded-lg">
                      <h3 className="font-medium text-midnight-forest mb-2">Your Control</h3>
                      <ul className="list-disc pl-6 space-y-1 text-midnight-forest/80">
                        <li>Social profile analysis is <strong>enabled by default</strong> but can be disabled</li>
                        <li>Toggle on/off in Settings → Data & Privacy</li>
                        <li>Changes apply immediately to future analysis</li>
                        <li>Previously collected social data can be deleted on request</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                    4. Data Sharing and Security
                  </h2>
                  <div className="space-y-3">
                    <p className="text-midnight-forest/80">
                      <strong>We do not sell your personal data.</strong> We may share information with:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-midnight-forest/80">
                      <li>Climate economy partners (with your explicit consent for job matching)</li>
                      <li>Service providers who help us operate the platform</li>
                      <li>Legal authorities when required by law</li>
                    </ul>
                    <p className="text-midnight-forest/80">
                      All data is encrypted in transit and at rest. We implement industry-standard security measures.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                    5. Your Rights and Choices
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-sand-gray/10 rounded-lg">
                      <h3 className="font-medium text-midnight-forest mb-2">Access & Export</h3>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-midnight-forest/80">
                        <li>Download your data</li>
                        <li>Review collected information</li>
                        <li>Request data corrections</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-midnight-forest/10 rounded-lg">
                      <h3 className="font-medium text-midnight-forest mb-2">Control & Delete</h3>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-midnight-forest/80">
                        <li>Disable social profile analysis</li>
                        <li>Delete specific data types</li>
                        <li>Close your account completely</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">
                    6. Contact Us
                  </h2>
                  <div className="p-4 bg-spring-green/10 rounded-lg">
                    <p className="text-midnight-forest/80">
                      For privacy questions, data requests, or to opt out of social profile analysis:
                    </p>
                    <div className="mt-3 space-y-1">
                      <div><strong>Email:</strong> privacy@climateeconomy.org</div>
                      <div><strong>Support:</strong> support@climateeconomy.org</div>
                      <div><strong>Settings:</strong> <a href="/settings" className="text-spring-green hover:underline">Update your privacy preferences</a></div>
                    </div>
                  </div>
                </section>
              </div>
            </ACTCard>
          </div>
        </div>
      </IOSSection>
      
      <Footer />
    </IOSLayout>
  );
}

export const metadata = {
  title: "Privacy Policy - Climate Economy Assistant",
  description: "Privacy Policy detailing data collection and usage practices",
}; 