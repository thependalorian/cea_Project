/**
 * Partners Page - Climate Economy Assistant
 * Showcase partner organizations and their opportunities
 * Location: app/partners/page.tsx
 */

'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ui/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { SimpleLayout } from '@/components/SimpleLayout';
import { 
  Building2, 
  MapPin, 
  Users, 
  Globe, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Award,
  ExternalLink,
  Search,
  Filter,
  Star,
  Heart,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  Youtube
} from 'lucide-react';

function PartnersContent() {
  const { user } = useAuth();

  // Mock partner data based on partner_profiles schema
  const featuredPartners = [
    {
      id: 1,
      organization_name: "Massachusetts Clean Energy Center",
      organization_type: "government_agency",
      description: "Leading the clean energy transformation in Massachusetts through innovation, investment, and industry development.",
      climate_focus: ["renewable_energy", "energy_storage", "green_building"],
      employee_count: 150,
      founded_year: 2009,
      headquarters_location: "Boston, MA",
      website: "https://masscec.com",
      linkedin_url: "https://linkedin.com/company/masscec",
      hiring_actively: true,
      offers_certification: true,
      offers_mentorship: true,
      offers_funding: true,
      partnership_level: "premium",
      verified: true,
      logo: "🏛️"
    },
    {
      id: 2,
      organization_name: "Vineyard Wind",
      organization_type: "private_company",
      description: "Developing America's first commercial-scale offshore wind energy facility, creating jobs and clean energy for Massachusetts.",
      climate_focus: ["offshore_wind", "renewable_energy", "marine_energy"],
      employee_count: 75,
      founded_year: 2018,
      headquarters_location: "New Bedford, MA",
      website: "https://vineyardwind.com",
      linkedin_url: "https://linkedin.com/company/vineyard-wind",
      hiring_actively: true,
      offers_certification: false,
      offers_mentorship: true,
      offers_funding: false,
      partnership_level: "premium",
      verified: true,
      logo: "🌊"
    },
    {
      id: 3,
      organization_name: "Green City Growers",
      organization_type: "social_enterprise",
      description: "Creating sustainable food systems through urban agriculture, education, and community engagement.",
      climate_focus: ["sustainable_agriculture", "urban_farming", "food_security"],
      employee_count: 25,
      founded_year: 2008,
      headquarters_location: "Somerville, MA",
      website: "https://greencitygrowers.com",
      linkedin_url: "https://linkedin.com/company/green-city-growers",
      hiring_actively: true,
      offers_certification: true,
      offers_mentorship: true,
      offers_funding: false,
      partnership_level: "standard",
      verified: true,
      logo: "🌱"
    },
    {
      id: 4,
      organization_name: "Boston University Climate Solutions",
      organization_type: "educational_institution",
      description: "Advancing climate science research and training the next generation of climate professionals.",
      climate_focus: ["climate_science", "policy_research", "education"],
      employee_count: 200,
      founded_year: 2019,
      headquarters_location: "Boston, MA",
      website: "https://bu.edu/climate",
      linkedin_url: "https://linkedin.com/school/boston-university",
      hiring_actively: true,
      offers_certification: true,
      offers_mentorship: true,
      offers_funding: true,
      partnership_level: "premium",
      verified: true,
      logo: "🎓"
    },
    {
      id: 5,
      organization_name: "Tesla Gigafactory",
      organization_type: "private_company",
      description: "Manufacturing sustainable energy products and electric vehicles to accelerate the world's transition to sustainable energy.",
      climate_focus: ["electric_vehicles", "battery_technology", "solar_energy"],
      employee_count: 500,
      founded_year: 2021,
      headquarters_location: "Fremont, CA",
      website: "https://tesla.com",
      linkedin_url: "https://linkedin.com/company/tesla-motors",
      hiring_actively: true,
      offers_certification: false,
      offers_mentorship: false,
      offers_funding: false,
      partnership_level: "premium",
      verified: true,
      logo: "⚡"
    },
    {
      id: 6,
      organization_name: "Climate Action Business Association",
      organization_type: "nonprofit",
      description: "Mobilizing the business community to take meaningful climate action through advocacy, education, and collaboration.",
      climate_focus: ["business_sustainability", "carbon_reduction", "policy_advocacy"],
      employee_count: 15,
      founded_year: 2015,
      headquarters_location: "Cambridge, MA",
      website: "https://caba.org",
      linkedin_url: "https://linkedin.com/company/climate-action-business",
      hiring_actively: false,
      offers_certification: true,
      offers_mentorship: true,
      offers_funding: true,
      partnership_level: "standard",
      verified: true,
      logo: "🤝"
    }
  ];

  const partnerStats = {
    totalPartners: 67,
    activelyHiring: 34,
    offeringCertification: 23,
    providingMentorship: 45,
    offeringFunding: 12
  };

  const climateAreas = [
    "Renewable Energy",
    "Energy Storage", 
    "Green Building",
    "Sustainable Transportation",
    "Climate Policy",
    "Carbon Management",
    "Sustainable Agriculture",
    "Clean Technology",
    "Environmental Justice",
    "Climate Finance"
  ];

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Header Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest mb-4">
                Climate Economy Partners
              </h1>
              <p className="text-xl font-inter text-midnight-forest/70 max-w-3xl mx-auto">
                Discover leading organizations driving Massachusetts' clean energy transition. Connect with employers, educators, and innovators shaping our sustainable future.
              </p>
            </div>

            {/* Partner Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <div className="text-center">
                <div className="text-3xl font-helvetica font-bold text-midnight-forest">
                  {partnerStats.totalPartners}
                </div>
                <div className="text-sm font-inter text-midnight-forest/60">
                  Partner Organizations
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-helvetica font-bold text-spring-green">
                  {partnerStats.activelyHiring}
                </div>
                <div className="text-sm font-inter text-midnight-forest/60">
                  Actively Hiring
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-helvetica font-bold text-seafoam-blue">
                  {partnerStats.offeringCertification}
                </div>
                <div className="text-sm font-inter text-midnight-forest/60">
                  Offer Certification
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-helvetica font-bold text-moss-green">
                  {partnerStats.providingMentorship}
                </div>
                <div className="text-sm font-inter text-midnight-forest/60">
                  Provide Mentorship
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-helvetica font-bold text-midnight-forest">
                  {partnerStats.offeringFunding}
                </div>
                <div className="text-sm font-inter text-midnight-forest/60">
                  Offer Funding
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-forest/40" />
                  <input
                    type="text"
                    placeholder="Search partners by name, focus area, or location..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green text-midnight-forest"
                  />
                </div>
                <ACTButton variant="primary" size="lg" className="px-8">
                  Search Partners
                </ACTButton>
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-3 justify-center">
                <ACTButton variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
                  All Partners
                </ACTButton>
                <ACTButton variant="ghost" size="sm">Actively Hiring</ACTButton>
                <ACTButton variant="ghost" size="sm">Offer Certification</ACTButton>
                <ACTButton variant="ghost" size="sm">Provide Mentorship</ACTButton>
                <ACTButton variant="ghost" size="sm">Government</ACTButton>
                <ACTButton variant="ghost" size="sm">Private Companies</ACTButton>
                <ACTButton variant="ghost" size="sm">Nonprofits</ACTButton>
                <ACTButton variant="ghost" size="sm">Educational</ACTButton>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Partners Grid */}
        <section className="pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPartners.map((partner) => (
                <ACTCard 
                  key={partner.id}
                  variant="default" 
                  className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle hover:shadow-ios-normal transition-all duration-300"
                  hover={true}
                >
                  {/* Partner Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{partner.logo}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-helvetica font-semibold text-midnight-forest text-lg leading-tight">
                            {partner.organization_name}
                          </h3>
                          {partner.verified && (
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-midnight-forest/60 capitalize">
                          {partner.organization_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {partner.partnership_level === 'premium' && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>

                  {/* Partner Description */}
                  <p className="text-midnight-forest/70 font-inter text-sm mb-4 leading-relaxed">
                    {partner.description}
                  </p>

                  {/* Partner Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-midnight-forest/60">
                      <MapPin className="w-4 h-4" />
                      <span>{partner.headquarters_location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-midnight-forest/60">
                      <Users className="w-4 h-4" />
                      <span>{partner.employee_count} employees</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-midnight-forest/60">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {partner.founded_year}</span>
                    </div>
                  </div>

                  {/* Climate Focus Areas */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {partner.climate_focus.slice(0, 3).map((focus, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-spring-green/10 text-spring-green text-xs font-medium rounded-full"
                        >
                          {focus.replace('_', ' ')}
                        </span>
                      ))}
                      {partner.climate_focus.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{partner.climate_focus.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Partner Offerings */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {partner.hiring_actively && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <Briefcase className="w-3 h-3" />
                        <span>Hiring</span>
                      </div>
                    )}
                    {partner.offers_certification && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <Award className="w-3 h-3" />
                        <span>Certification</span>
                      </div>
                    )}
                    {partner.offers_mentorship && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        <Users className="w-3 h-3" />
                        <span>Mentorship</span>
                      </div>
                    )}
                    {partner.offers_funding && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        <Target className="w-3 h-3" />
                        <span>Funding</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <ACTButton 
                      variant="primary" 
                      className="flex-1"
                      href={`/partners/${partner.id}`}
                    >
                      View Details
                    </ACTButton>
                    <ACTButton 
                      variant="outline" 
                      className="flex-1"
                      icon={<ExternalLink className="w-4 h-4" />}
                      href={partner.website}
                      target="_blank"
                    >
                      Website
                    </ACTButton>
                  </div>
                </ACTCard>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center pt-12">
              <ACTButton variant="outline" size="lg">
                Load More Partners
              </ACTButton>
            </div>
          </div>
        </section>

        {/* Climate Focus Areas */}
        <section className="py-16 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-helvetica font-bold text-midnight-forest mb-4">
                Climate Focus Areas
              </h2>
              <p className="text-lg font-inter text-midnight-forest/70">
                Explore partners by their climate specialization
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {climateAreas.map((area, index) => (
                <ACTButton 
                  key={index}
                  variant="outline" 
                  fullWidth
                  className="h-16 text-center justify-center border-spring-green/20 hover:border-spring-green hover:bg-spring-green/5"
                >
                  <div>
                    <div className="font-semibold text-sm">{area}</div>
                    <div className="text-xs text-midnight-forest/60">
                      {Math.floor(Math.random() * 15) + 3} partners
                    </div>
                  </div>
                </ACTButton>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ACTCard variant="default" className="p-12 bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 border border-spring-green/20">
              <h2 className="text-3xl font-helvetica font-bold text-midnight-forest mb-4">
                Become a Climate Economy Partner
              </h2>
              <p className="text-lg font-inter text-midnight-forest/70 mb-8">
                Join our network of leading organizations committed to building Massachusetts' clean energy future. Connect with top talent and showcase your climate impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ACTButton 
                  variant="primary" 
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Apply for Partnership
                </ACTButton>
                <ACTButton 
                  variant="outline" 
                  size="lg"
                  icon={<Phone className="w-5 h-5" />}
                >
                  Schedule a Call
                </ACTButton>
              </div>
            </ACTCard>
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
}

export default function PartnersPage() {
  return (
    <AuthGuard>
      <PartnersContent />
    </AuthGuard>
  );
}

// Removing metadata export as it's not allowed with 'use client' directive
// // Removing metadata export as it is not allowed with use client directive
// export const metadata = {
//   title: "Climate Economy Partners - Climate Economy Assistant",
//   description: "Discover leading organizations driving Massachusetts' clean energy transition",
// }; 