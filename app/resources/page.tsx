/**
 * Resources Page - Climate Economy Assistant
 * Knowledge base and educational resources for climate careers
 * Location: app/resources/page.tsx
 */

'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { SimpleLayout } from '@/components/SimpleLayout';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  TrendingUp,
  Award,
  Lightbulb,
  Target,
  Zap,
  Globe,
  Play,
  Bookmark,
  Share2,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Tag,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Building2,
  Leaf,
  Plus
} from 'lucide-react';

function ResourcesContent() {
  const { user } = useAuth();

  // Mock resources data based on knowledge_resources schema
  const featuredResources = [
    {
      id: 1,
      title: "Complete Guide to Solar Energy Careers",
      description: "Comprehensive overview of career paths in solar energy, from installation to engineering and project management.",
      content_type: "guide",
      categories: ["renewable_energy", "career_guide"],
      climate_sectors: ["solar_energy"],
      skill_categories: ["technical_skills", "project_management"],
      target_audience: ["job_seekers", "career_changers"],
      content_difficulty: "beginner",
      is_published: true,
      created_at: "2024-01-15",
      views: 2847,
      likes: 156,
      duration: "45 min read",
      partner_name: "Massachusetts Clean Energy Center",
      thumbnail: "📚"
    },
    {
      id: 2,
      title: "Wind Turbine Technician Training Program",
      description: "Interactive video series covering wind turbine maintenance, safety protocols, and troubleshooting techniques.",
      content_type: "video_series",
      categories: ["training", "certification"],
      climate_sectors: ["wind_energy"],
      skill_categories: ["technical_skills", "safety"],
      target_audience: ["technicians", "entry_level"],
      content_difficulty: "intermediate",
      is_published: true,
      created_at: "2024-01-10",
      views: 1923,
      likes: 89,
      duration: "6 hours",
      partner_name: "Vineyard Wind",
      thumbnail: "🎥"
    },
    {
      id: 3,
      title: "Climate Policy Analysis Toolkit",
      description: "Tools and frameworks for analyzing climate policies, including data sources, methodologies, and case studies.",
      content_type: "toolkit",
      categories: ["policy", "analysis"],
      climate_sectors: ["climate_policy"],
      skill_categories: ["analytical_skills", "research"],
      target_audience: ["policy_analysts", "researchers"],
      content_difficulty: "advanced",
      is_published: true,
      created_at: "2024-01-08",
      views: 1456,
      likes: 234,
      duration: "2 hours",
      partner_name: "Boston University Climate Solutions",
      thumbnail: "🔧"
    },
    {
      id: 4,
      title: "Green Building Certification Prep Course",
      description: "Prepare for LEED and other green building certifications with practice exams and study materials.",
      content_type: "course",
      categories: ["certification", "green_building"],
      climate_sectors: ["sustainable_construction"],
      skill_categories: ["certification", "design"],
      target_audience: ["architects", "engineers"],
      content_difficulty: "intermediate",
      is_published: true,
      created_at: "2024-01-05",
      views: 3421,
      likes: 298,
      duration: "12 weeks",
      partner_name: "Green Building Council",
      thumbnail: "🏗️"
    },
    {
      id: 5,
      title: "Electric Vehicle Industry Overview",
      description: "Market trends, career opportunities, and skill requirements in the rapidly growing EV sector.",
      content_type: "report",
      categories: ["industry_analysis", "market_trends"],
      climate_sectors: ["electric_vehicles"],
      skill_categories: ["market_analysis", "industry_knowledge"],
      target_audience: ["job_seekers", "investors"],
      content_difficulty: "intermediate",
      is_published: true,
      created_at: "2024-01-03",
      views: 2156,
      likes: 167,
      duration: "30 min read",
      partner_name: "Tesla Gigafactory",
      thumbnail: "⚡"
    },
    {
      id: 6,
      title: "Sustainable Agriculture Practices Webinar",
      description: "Live webinar series on regenerative farming, soil health, and climate-smart agriculture techniques.",
      content_type: "webinar",
      categories: ["agriculture", "sustainability"],
      climate_sectors: ["sustainable_agriculture"],
      skill_categories: ["farming_techniques", "sustainability"],
      target_audience: ["farmers", "agricultural_professionals"],
      content_difficulty: "beginner",
      is_published: true,
      created_at: "2024-01-01",
      views: 987,
      likes: 76,
      duration: "90 minutes",
      partner_name: "Green City Growers",
      thumbnail: "🌱"
    }
  ];

  const resourceCategories = [
    { name: "Career Guides", count: 45, icon: "📚", color: "blue" },
    { name: "Training Videos", count: 78, icon: "🎥", color: "green" },
    { name: "Certification Prep", count: 23, icon: "🏆", color: "yellow" },
    { name: "Industry Reports", count: 34, icon: "📊", color: "purple" },
    { name: "Toolkits", count: 19, icon: "🔧", color: "orange" },
    { name: "Webinars", count: 56, icon: "💻", color: "indigo" }
  ];

  const skillTracks = [
    {
      name: "Solar Energy Professional",
      description: "Complete pathway from basics to advanced solar installation and design",
      resources: 12,
      duration: "8 weeks",
      level: "Beginner to Advanced",
      icon: "☀️"
    },
    {
      name: "Wind Energy Technician",
      description: "Comprehensive training for wind turbine maintenance and operations",
      resources: 8,
      duration: "6 weeks",
      level: "Intermediate",
      icon: "💨"
    },
    {
      name: "Climate Policy Analyst",
      description: "Research methods, policy analysis, and stakeholder engagement",
      resources: 15,
      duration: "10 weeks",
      level: "Advanced",
      icon: "🏛️"
    },
    {
      name: "Green Building Specialist",
      description: "Sustainable design, LEED certification, and energy efficiency",
      resources: 10,
      duration: "7 weeks",
      level: "Intermediate",
      icon: "🏗️"
    }
  ];

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Header Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest mb-4">
                Climate Career Resources
              </h1>
              <p className="text-xl font-inter text-midnight-forest/70 max-w-3xl mx-auto">
                Access comprehensive guides, training materials, and tools to advance your climate career. Learn from industry experts and leading organizations.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-forest/40" />
                  <input
                    type="text"
                    placeholder="Search resources by topic, skill, or content type..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green text-midnight-forest"
                  />
                </div>
                <ACTButton variant="primary" size="lg" className="px-8">
                  Search Resources
                </ACTButton>
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-3 justify-center">
                <ACTButton variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
                  All Resources
                </ACTButton>
                <ACTButton variant="ghost" size="sm">Career Guides</ACTButton>
                <ACTButton variant="ghost" size="sm">Training Videos</ACTButton>
                <ACTButton variant="ghost" size="sm">Certification</ACTButton>
                <ACTButton variant="ghost" size="sm">Beginner</ACTButton>
                <ACTButton variant="ghost" size="sm">Intermediate</ACTButton>
                <ACTButton variant="ghost" size="sm">Advanced</ACTButton>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Categories */}
        <section className="pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-helvetica font-bold text-midnight-forest mb-8 text-center">
              Browse by Category
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
              {resourceCategories.map((category, index) => (
                <ACTCard 
                  key={index}
                  variant="glass" 
                  className={`p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300 cursor-pointer hover:border-${category.color}-300`}
                  hover={true}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h3 className="font-helvetica font-semibold text-midnight-forest mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-midnight-forest/60">
                      {category.count} resources
                    </p>
                  </div>
                </ACTCard>
              ))}
            </div>

            {/* Featured Resources */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-helvetica font-bold text-midnight-forest">
                  Featured Resources
                </h2>
                <ACTButton variant="outline" href="/resources/all">
                  View All Resources
                </ACTButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredResources.map((resource) => (
                  <ACTCard 
                    key={resource.id}
                    variant="default" 
                    className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle hover:shadow-ios-normal transition-all duration-300"
                    hover={true}
                  >
                    {/* Resource Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{resource.thumbnail}</div>
                        <div className="flex-1">
                          <h3 className="font-helvetica font-semibold text-midnight-forest text-lg leading-tight">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-midnight-forest/60">
                            by {resource.partner_name}
                          </p>
                        </div>
                      </div>
                      <ACTButton variant="ghost" size="sm" className="p-2">
                        <Bookmark className="w-4 h-4" />
                      </ACTButton>
                    </div>

                    {/* Resource Description */}
                    <p className="text-midnight-forest/70 font-inter text-sm mb-4 leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Resource Meta */}
                    <div className="flex items-center space-x-4 text-xs text-midnight-forest/60 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{resource.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{resource.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{resource.likes}</span>
                      </div>
                    </div>

                    {/* Difficulty and Type */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        resource.content_difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        resource.content_difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {resource.content_difficulty}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                        {resource.content_type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {resource.categories.slice(0, 2).map((category, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-spring-green/10 text-spring-green text-xs font-medium rounded-full"
                        >
                          {category.replace('_', ' ')}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <ACTButton 
                        variant="primary" 
                        className="flex-1"
                        href={`/resources/${resource.id}`}
                      >
                        {resource.content_type === 'video_series' || resource.content_type === 'webinar' ? 'Watch Now' : 'Read Now'}
                      </ACTButton>
                      <ACTButton variant="ghost" size="sm" className="p-3">
                        <Share2 className="w-4 h-4" />
                      </ACTButton>
                    </div>
                  </ACTCard>
                ))}
              </div>
            </div>

            {/* Learning Tracks */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-helvetica font-bold text-midnight-forest mb-4">
                  Structured Learning Tracks
                </h2>
                <p className="text-lg font-inter text-midnight-forest/70">
                  Follow curated pathways to master specific climate career skills
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skillTracks.map((track, index) => (
                  <ACTCard 
                    key={index}
                    variant="default" 
                    className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle hover:shadow-ios-normal transition-all duration-300"
                    hover={true}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{track.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-helvetica font-semibold text-midnight-forest mb-2">
                          {track.name}
                        </h3>
                        <p className="text-midnight-forest/70 font-inter mb-4">
                          {track.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-helvetica font-bold text-spring-green">
                              {track.resources}
                            </div>
                            <div className="text-xs text-midnight-forest/60">Resources</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-helvetica font-bold text-midnight-forest">
                              {track.duration}
                            </div>
                            <div className="text-xs text-midnight-forest/60">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-helvetica font-bold text-midnight-forest">
                              {track.level}
                            </div>
                            <div className="text-xs text-midnight-forest/60">Level</div>
                          </div>
                        </div>

                        <ACTButton 
                          variant="primary" 
                          fullWidth
                          icon={<ArrowRight className="w-4 h-4" />}
                          iconPosition="right"
                        >
                          Start Learning Track
                        </ACTButton>
                      </div>
                    </div>
                  </ACTCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-6 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <ACTCard variant="default" className="p-12 bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 border border-spring-green/20">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Lightbulb className="w-8 h-8 text-spring-green" />
                <h2 className="text-3xl font-helvetica font-bold text-midnight-forest">
                  Contribute Your Knowledge
                </h2>
              </div>
              <p className="text-lg font-inter text-midnight-forest/70 mb-8">
                Share your expertise with the climate community. Submit resources, create guides, or host webinars to help others advance their careers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ACTButton 
                  variant="primary" 
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                >
                  Submit Resource
                </ACTButton>
                <ACTButton 
                  variant="outline" 
                  size="lg"
                  icon={<Calendar className="w-5 h-5" />}
                >
                  Host a Webinar
                </ACTButton>
              </div>
            </ACTCard>
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
}

export default function ResourcesPage() {
  return (
    <AuthGuard>
      <ResourcesContent />
    </AuthGuard>
  );
} 