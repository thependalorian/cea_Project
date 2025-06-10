/**
 * Settings Page - Climate Economy Assistant
 * User settings and preferences management
 * Location: app/settings/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard } from "@/components/ui";
import { PrivacySettings } from "@/components/settings/PrivacySettings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login?redirect=/settings");
  }

  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-helvetica font-medium text-midnight-forest mb-4">
                Settings
              </h1>
              <p className="text-body text-midnight-forest/70">
                Manage your account settings and preferences.
              </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Settings */}
              <ACTCard
                variant="outlined"
                title="Account Settings"
                description="Manage your account information and security"
              >
                <div className="space-y-4">
                  <div className="p-4 bg-spring-green/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-midnight-forest">Email Address</div>
                        <div className="text-sm text-midnight-forest/70">{user.email}</div>
                      </div>
                      <div className="text-sm text-spring-green font-medium">Verified</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-sand-gray/5 rounded-lg">
                    <div className="font-medium text-midnight-forest mb-2">Password</div>
                    <div className="text-sm text-midnight-forest/70 mb-3">
                      Last updated: {new Date(user.updated_at || user.created_at).toLocaleDateString()}
                    </div>
                    <button className="text-sm text-spring-green hover:text-spring-green/80 font-medium">
                      Change Password
                    </button>
                  </div>
                </div>
              </ACTCard>

              {/* Preferences */}
              <ACTCard
                variant="outlined"
                title="Preferences"
                description="Customize your Climate Economy Assistant experience"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-seafoam-blue/5 rounded-lg">
                    <div>
                      <div className="font-medium text-midnight-forest">Email Notifications</div>
                      <div className="text-sm text-midnight-forest/70">Job alerts and updates</div>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-moss-green/5 rounded-lg">
                    <div>
                      <div className="font-medium text-midnight-forest">Newsletter</div>
                      <div className="text-sm text-midnight-forest/70">Weekly climate economy insights</div>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                </div>
              </ACTCard>

              {/* Privacy Settings - Full Width */}
              <div className="lg:col-span-2">
                <PrivacySettings userId={user.id} />
              </div>

              {/* Support */}
              <ACTCard
                variant="outlined"
                title="Support & Help"
                description="Get help and contact support"
              >
                <div className="space-y-3">
                  <a 
                    href="/assistant" 
                    className="block w-full p-3 bg-spring-green/5 rounded-lg hover:bg-spring-green/10 transition-colors"
                  >
                    <div className="font-medium text-midnight-forest">AI Assistant</div>
                    <div className="text-sm text-midnight-forest/70">Get instant help from our AI</div>
                  </a>
                  
                  <a 
                    href="mailto:support@climateeconomy.org" 
                    className="block w-full p-3 bg-seafoam-blue/5 rounded-lg hover:bg-seafoam-blue/10 transition-colors"
                  >
                    <div className="font-medium text-midnight-forest">Contact Support</div>
                    <div className="text-sm text-midnight-forest/70">Email our support team</div>
                  </a>
                </div>
              </ACTCard>
            </div>
          </div>
        </div>
      </IOSSection>
      
      <Footer />
    </IOSLayout>
  );
}

export const metadata = {
  title: "Settings - Climate Economy Assistant",
  description: "Manage your account settings and preferences",
}; 