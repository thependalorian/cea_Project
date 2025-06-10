/**
 * Contact Page - Climate Economy Assistant
 * Get in touch with our team
 * Location: app/contact/page.tsx
 */

import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard, ACTButton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Calendar,
  MessageSquare,
  Users,
  Briefcase,
  Building
} from "lucide-react";

export default function ContactPage() {
  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-helvetica font-medium text-midnight-forest mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-midnight-forest/80 max-w-3xl mx-auto">
              Have questions about climate careers? Need partnership opportunities? 
              We're here to help you navigate the transition to a clean energy economy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-6">
                Send us a message
              </h2>
              
              <ACTCard variant="outlined" className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-midnight-forest">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Your first name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-midnight-forest">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Your last name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-midnight-forest">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-midnight-forest">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What can we help you with?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-midnight-forest">
                      I'm reaching out as a...
                    </Label>
                    <select
                      id="category"
                      className="mt-1 w-full px-3 py-2 border border-sand-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-spring-green"
                    >
                      <option value="">Select your role</option>
                      <option value="job-seeker">Job Seeker</option>
                      <option value="employer">Employer/Partner</option>
                      <option value="educator">Educator/Training Provider</option>
                      <option value="community">Community Organization</option>
                      <option value="government">Government Agency</option>
                      <option value="media">Media/Press</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-midnight-forest">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your question or how we can help..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-spring-green hover:bg-spring-green/90 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </ACTCard>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-helvetica font-medium text-midnight-forest mb-6">
                  Get in touch
                </h2>
                
                <div className="space-y-6">
                  <ACTCard variant="outlined" className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-spring-green/10 rounded-full">
                        <Mail className="h-5 w-5 text-spring-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-midnight-forest">Email</h3>
                        <p className="text-midnight-forest/70 text-sm">
                          info@climateeconomyassistant.org
                        </p>
                        <p className="text-midnight-forest/60 text-xs mt-1">
                          We respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </ACTCard>

                  <ACTCard variant="outlined" className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-moss-green/10 rounded-full">
                        <MapPin className="h-5 w-5 text-moss-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-midnight-forest">Location</h3>
                        <p className="text-midnight-forest/70 text-sm">
                          Massachusetts, USA
                        </p>
                        <p className="text-midnight-forest/60 text-xs mt-1">
                          Serving the Commonwealth
                        </p>
                      </div>
                    </div>
                  </ACTCard>

                  <ACTCard variant="outlined" className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-seafoam-blue/10 rounded-full">
                        <Calendar className="h-5 w-5 text-seafoam-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-midnight-forest">Office Hours</h3>
                        <p className="text-midnight-forest/70 text-sm">
                          Monday - Friday: 9:00 AM - 5:00 PM EST
                        </p>
                        <p className="text-midnight-forest/60 text-xs mt-1">
                          Platform available 24/7
                        </p>
                      </div>
                    </div>
                  </ACTCard>
                </div>
              </div>

              {/* Contact Categories */}
              <div>
                <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
                  Specific Inquiries
                </h3>
                
                <div className="space-y-3">
                  <ACTCard variant="glass" className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-spring-green" />
                      <div>
                        <div className="font-medium text-midnight-forest text-sm">Job Seekers</div>
                        <div className="text-xs text-midnight-forest/60">Career guidance and platform support</div>
                      </div>
                    </div>
                  </ACTCard>

                  <ACTCard variant="glass" className="p-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-moss-green" />
                      <div>
                        <div className="font-medium text-midnight-forest text-sm">Employers</div>
                        <div className="text-xs text-midnight-forest/60">Partnership and hiring opportunities</div>
                      </div>
                    </div>
                  </ACTCard>

                  <ACTCard variant="glass" className="p-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-seafoam-blue" />
                      <div>
                        <div className="font-medium text-midnight-forest text-sm">Training Providers</div>
                        <div className="text-xs text-midnight-forest/60">Program integration and collaboration</div>
                      </div>
                    </div>
                  </ACTCard>
                </div>
              </div>

              {/* FAQ Link */}
              <ACTCard variant="outlined" className="p-6 text-center">
                <h3 className="font-semibold text-midnight-forest mb-2">
                  Have a quick question?
                </h3>
                <p className="text-midnight-forest/70 text-sm mb-4">
                  Check out our frequently asked questions for immediate answers.
                </p>
                <Button variant="outline" size="sm">
                  Visit FAQ
                </Button>
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
  title: "Contact - Climate Economy Assistant",
  description: "Get in touch with our team for questions about climate careers and partnerships",
}; 