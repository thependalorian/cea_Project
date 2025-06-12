/**
 * Agent Showcase Component - Enhanced Version
 * Highlights the 7-agent Climate Economy Assistant system with diverse representation
 * Location: components/layout/AgentShowcase.tsx
 * Last Updated: December 2024
 */

'use client';

import { useState } from 'react';
import { ACTCard, ACTButton } from '@/components/ui';
import { 
  User, 
  Building, 
  Shield, 
  Heart, 
  MapPin, 
  Globe, 
  FileText,
  Leaf,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  description: string;
  personality: string;
  skills: string[];
  chatUrl: string;
  avatar?: string; // Only Pendo has an image
  avatarColor: string;
  avatarDescription: string; // For diverse representation
  roleIcon: React.ReactNode;
  age?: string;
  background?: string;
  status?: string;
  sampleQuestions?: { question: string; preview: string }[];
}

const agents: Agent[] = [
  {
    id: 'pendo',
    name: 'Pendo',
    role: 'Climate Economy Supervisor',
    specialization: 'Systems Coordination & Strategic Oversight',
    description: 'As the Climate Economy Supervisor, I orchestrate our entire 7-agent system to provide you with comprehensive climate career guidance. I analyze your unique situation, coordinate with specialist agents, and ensure you receive personalized, actionable advice for your climate career journey. Think of me as your personal climate career strategist who brings together the best insights from our expert team. I have deep experience in workforce development, climate policy, and career transitions, having helped thousands of professionals navigate the evolving clean energy landscape.',
    personality: 'Strategic, empathetic, decisive, and deeply committed to climate action with a collaborative leadership style',
    skills: ['System Coordination', 'Strategic Planning', 'Career Assessment', 'Agent Management', 'Climate Policy', 'Workflow Optimization'],
    chatUrl: '/chat/pendo',
    avatar: '/images/avatars/avatar.png',
    avatarColor: 'bg-spring-green',
    avatarDescription: 'Professional leader with warm, approachable demeanor',
    roleIcon: <Sparkles className="h-4 w-4" />,
    background: 'Climate policy and workforce development expert',
    status: 'online',
    sampleQuestions: [
      { question: 'What is the current state of the climate economy?', preview: 'The climate economy is evolving rapidly...' },
      { question: 'How can I prepare for a career in climate policy?', preview: 'You can start by understanding the basics...' },
      { question: 'What are the key skills required for a climate economist?', preview: 'Analytical skills, communication skills...' }
    ]
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Veterans Climate Specialist',
    specialization: 'Military-to-Climate Career Transitions',
    description: 'I specialize in helping military veterans transition their leadership skills, strategic thinking, and mission-driven mindset into impactful climate careers. Having served myself, I understand the unique challenges veterans face and how to translate military experience into climate sector success. I provide targeted guidance on leveraging security clearances, leadership experience, and operational expertise in climate roles. My approach combines military precision with environmental passion, helping veterans find meaningful second careers in clean energy, climate resilience, and environmental protection. I understand the veteran hiring process and have connections with climate employers who value military experience.',
    personality: 'Disciplined, supportive, mission-focused, and results-oriented with strong mentorship skills',
    skills: ['Military Transition', 'Security Clearances', 'Leadership Development', 'Operations Management', 'Climate Security', 'Team Building'],
    chatUrl: '/chat/marcus',
    avatarColor: 'bg-moss-green',
    avatarDescription: 'Distinguished African American veteran, mid-50s, with graying temples and confident bearing',
    roleIcon: <Shield className="h-4 w-4" />,
    age: 'Mid-50s',
    background: 'Former Marine Corps officer, 20+ years military service',
    status: 'online',
    sampleQuestions: [
      { question: 'How can I leverage my military experience in a climate career?', preview: 'You can start by identifying relevant skills...' },
      { question: 'What are the key challenges in transitioning from military to civilian climate careers?', preview: 'Finding the right opportunities...' },
      { question: 'How can I prepare for a climate career interview?', preview: 'Practice your climate knowledge and experience...' }
    ]
  },
  {
    id: 'liv',
    name: 'Liv',
    role: 'International Climate Specialist',
    specialization: 'Global Climate Careers & Cross-Border Opportunities',
    description: 'I focus on international climate career opportunities, helping professionals navigate global climate initiatives, international organizations, and cross-border climate projects. Whether you are interested in working with the UN, international NGOs, or multinational climate companies, I provide insights on global career paths, cultural considerations, and international climate policy frameworks. My expertise spans from Nordic climate innovation to developing country adaptation programs. I help professionals understand visa requirements, credential recognition, and cultural nuances for international climate work. Having worked across four continents, I bring a truly global perspective to climate career development.',
    personality: 'Globally-minded, culturally aware, diplomatic, and collaborative with excellent cross-cultural communication',
    skills: ['International Relations', 'Global Climate Policy', 'Cross-Cultural Communication', 'UN System Knowledge', 'International Development', 'Multilingual Support'],
    chatUrl: '/chat/liv',
    avatarColor: 'bg-seafoam-blue',
    avatarDescription: 'Scandinavian professional with blonde hair, warm smile, early 40s',
    roleIcon: <Globe className="h-4 w-4" />,
    age: 'Early 40s',
    background: 'Norwegian climate diplomat with extensive UN experience',
    status: 'online',
    sampleQuestions: [
      { question: 'What are the key challenges in international climate cooperation?', preview: 'Building trust and cooperation...' },
      { question: 'How can I prepare for an international climate conference?', preview: 'Research the conference agenda and background...' },
      { question: 'What are the key skills required for an international climate specialist?', preview: 'Intercultural communication skills...' }
    ]
  },
  {
    id: 'miguel',
    name: 'Miguel',
    role: 'Environmental Justice Specialist',
    specialization: 'Community-Centered Climate Work & Social Equity',
    description: 'I am passionate about environmental justice and helping professionals find careers that address climate change while advancing social equity. I specialize in community-based climate work, environmental justice organizations, and roles that prioritize frontline communities. I help you understand how to center equity and justice in your climate career path. Growing up in an environmental justice community in Massachusetts, I understand firsthand the intersection of climate action and social justice. My work focuses on ensuring that climate solutions benefit everyone, especially those most impacted by environmental harm. I help professionals find roles in community organizing, policy advocacy, and grassroots climate action where they can make a real difference in people\'s lives.',
    personality: 'Justice-oriented, community-focused, passionate, and inclusive with strong advocacy skills',
    skills: ['Environmental Justice', 'Community Organizing', 'Equity Analysis', 'Grassroots Mobilization', 'Policy Advocacy', 'Social Impact Measurement'],
    chatUrl: '/chat/miguel',
    avatarColor: 'bg-ios-orange',
    avatarDescription: 'Portuguese-American community organizer, early 30s, with warm brown eyes and engaging smile',
    roleIcon: <Heart className="h-4 w-4" />,
    age: 'Early 30s',
    background: 'Portuguese-American environmental justice advocate from Chelsea, MA',
    status: 'online',
    sampleQuestions: [
      { question: 'How can I contribute to environmental justice in my community?', preview: 'You can start by learning about local issues...' },
      { question: 'What are the key challenges in addressing environmental injustice?', preview: 'Building community power and awareness...' },
      { question: 'How can I prepare for a climate justice conference?', preview: 'Research the conference agenda and background...' }
    ]
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    role: 'Massachusetts Resources Analyst',
    specialization: 'Local Climate Opportunities & State-Specific Resources',
    description: 'As your Massachusetts specialist, I have deep knowledge of local climate initiatives, state programs, regional employers, and Massachusetts-specific resources. I help you navigate the robust climate ecosystem in Massachusetts, from Boston climate tech startups to state government green jobs, university research positions, and regional climate organizations. My expertise covers everything from the Cape Wind legacy to the latest offshore wind developments, from Boston Harbor climate resilience projects to Western Mass forest carbon initiatives. I maintain relationships with local employers, understand state incentive programs, and can guide you through Massachusetts-specific career pathways. Whether you\'re interested in working for the state, joining a startup in Kendall Square, or finding opportunities in environmental consulting, I know the local landscape inside and out.',
    personality: 'Local expert, well-connected, resourceful, and community-oriented with deep institutional knowledge',
    skills: ['Local Market Knowledge', 'State Programs', 'Regional Networks', 'Academic Partnerships', 'Government Relations', 'Startup Ecosystem'],
    chatUrl: '/chat/jasmine',
    avatarColor: 'bg-ios-purple',
    avatarDescription: 'African American professional with natural hair, mid-30s, wearing stylish glasses',
    roleIcon: <MapPin className="h-4 w-4" />,
    age: 'Mid-30s',
    background: 'Boston native with deep knowledge of Massachusetts climate ecosystem',
    status: 'online',
    sampleQuestions: [
      { question: 'How can I leverage my local knowledge in a climate career?', preview: 'You can start by identifying local opportunities...' },
      { question: 'What are the key challenges in climate policy implementation?', preview: 'Building public support and addressing barriers...' },
      { question: 'How can I prepare for a climate policy conference?', preview: 'Research the conference agenda and background...' }
    ]
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Empathy & Support Agent',
    specialization: 'Career Transition Support & Mental Wellness',
    description: 'I provide emotional support and guidance throughout your climate career transition. Career changes can be overwhelming, especially when motivated by climate urgency. I help you process career anxiety, maintain motivation during job searches, develop resilience, and create sustainable approaches to climate work that prevent burnout while maximizing your impact. My background in counseling psychology and personal experience with career transitions helps me understand the emotional journey of changing careers for climate action. I provide practical strategies for managing job search stress, dealing with rejection, maintaining work-life balance in high-impact roles, and finding sustainable ways to contribute to climate solutions without burning out. Remember, taking care of yourself is essential for long-term climate impact.',
    personality: 'Empathetic, supportive, patient, and emotionally intelligent with strong active listening skills',
    skills: ['Emotional Support', 'Career Counseling', 'Stress Management', 'Motivation Coaching', 'Burnout Prevention', 'Work-Life Balance'],
    chatUrl: '/chat/alex',
    avatarColor: 'bg-ios-pink',
    avatarDescription: 'Gender-neutral presenting person with short auburn hair, late 20s, kind expression',
    roleIcon: <Heart className="h-4 w-4" />,
    age: 'Late 20s',
    background: 'Licensed counselor specializing in career transitions and climate anxiety',
    status: 'online',
    sampleQuestions: [
      { question: 'How can I cope with climate anxiety during a career transition?', preview: 'You can start by acknowledging your feelings...' },
      { question: 'What are the key strategies for maintaining motivation in a climate career?', preview: 'Setting clear goals and finding sources of inspiration...' },
      { question: 'How can I prepare for a climate career counseling session?', preview: 'Reflect on your climate career goals and challenges...' }
    ]
  },
  {
    id: 'lauren',
    name: 'Lauren',
    role: 'Climate Career Specialist',
    specialization: 'Industry Insights & Career Pathway Guidance',
    description: 'I provide comprehensive guidance on climate career paths across all sectors - from renewable energy and cleantech to policy, finance, and consulting. I help you understand different climate career tracks, industry requirements, growth trajectories, and how to position yourself for success in your chosen climate field. I stay current on industry trends and emerging opportunities. My expertise spans the entire climate economy: from traditional environmental consulting to cutting-edge climate tech, from government climate policy roles to private sector sustainability positions. I help professionals understand salary expectations, required certifications, networking strategies, and career advancement paths in climate fields. Whether you\'re interested in solar development, climate risk analysis, carbon markets, or green building, I can help you chart a clear path forward.',
    personality: 'Knowledgeable, analytical, forward-thinking, and career-focused with excellent strategic planning abilities',
    skills: ['Industry Analysis', 'Career Mapping', 'Trend Forecasting', 'Skill Assessment', 'Professional Development', 'Market Intelligence'],
    chatUrl: '/chat/lauren',
    avatarColor: 'bg-ios-teal',
    avatarDescription: 'Latina professional with long dark hair, early 40s, confident and approachable',
    roleIcon: <Building className="h-4 w-4" />,
    age: 'Early 40s',
    background: 'Former renewable energy executive turned career strategist',
    status: 'online',
    sampleQuestions: [
      { question: 'How can I leverage my industry experience in a climate career?', preview: 'You can start by identifying relevant opportunities...' },
      { question: 'What are the key challenges in climate policy implementation?', preview: 'Building public support and addressing barriers...' },
      { question: 'How can I prepare for a climate policy conference?', preview: 'Research the conference agenda and background...' }
    ]
  },
  {
    id: 'mai',
    name: 'Mai',
    role: 'Resume & Career Transition Specialist',
    specialization: 'Professional Materials & Application Strategy',
    description: 'I specialize in helping you craft compelling resumes, cover letters, and professional materials that effectively communicate your value to climate employers. I help translate your existing experience into climate-relevant skills, optimize your LinkedIn profile, prepare for climate sector interviews, and develop application strategies that get results. My approach combines ATS optimization with authentic storytelling to help your application stand out. I understand how to translate skills from traditional industries into climate-relevant language, highlight transferable experiences, and position career changers as valuable climate talent. Whether you\'re coming from finance, education, healthcare, or any other field, I help you tell your story in a way that resonates with climate employers. My clients consistently see higher response rates and interview success after working with me.',
    personality: 'Detail-oriented, strategic, encouraging, and professionally focused with strong communication skills',
    skills: ['Resume Writing', 'Cover Letter Crafting', 'LinkedIn Optimization', 'Interview Preparation', 'Personal Branding', 'Application Strategy'],
    chatUrl: '/chat/mai',
    avatarColor: 'bg-ios-yellow',
    avatarDescription: 'Asian American professional with shoulder-length black hair, late 30s, wearing a professional blazer',
    roleIcon: <FileText className="h-4 w-4" />,
    age: 'Late 30s',
    background: 'Former Fortune 500 HR director, Vietnamese-American resume strategist',
    status: 'online',
    sampleQuestions: [
      { question: 'How can I tailor my resume for a climate career?', preview: 'Highlight relevant skills and experiences...' },
      { question: 'What are the key strategies for optimizing a LinkedIn profile?', preview: 'Use keywords, showcase your skills...' },
      { question: 'How can I prepare for a climate policy interview?', preview: 'Research the climate policy landscape...' }
    ]
  }
];

export default function AgentShowcase() {
  const [expandedAgents, setExpandedAgents] = useState<string[]>([]);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const toggleExpansion = (agentId: string) => {
    setExpandedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleChatClick = (agent: Agent) => {
    window.open(agent.chatUrl, '_blank');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-seafoam-blue/5 to-moss-green/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-act-display font-helvetica font-medium text-midnight-forest mb-4">
            Meet Your AI Climate Career Team
          </h2>
          <p className="text-act-body font-inter text-midnight-forest/70 mb-6">
            Our team of 7 specialized AI assistants provides comprehensive guidance for your climate career journey.
          </p>
          <div className="flex items-center justify-center gap-2 text-act-small font-inter text-midnight-forest/60">
            <span className="w-2 h-2 bg-spring-green rounded-full animate-pulse"></span>
            All agents are currently online and ready to assist
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents.map((agent, index) => {
            const isExpanded = expandedAgents.includes(agent.id);
            const displayDescription = isExpanded 
              ? agent.description 
              : agent.description.length > 150 
                ? `${agent.description.substring(0, 150)}...`
                : agent.description;

            return (
              <ACTCard
                key={agent.id}
                variant="default"
                className="p-6 hover:shadow-ios-normal transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                onClick={() => handleChatClick(agent)}
              >
                {/* Agent Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl relative overflow-hidden shadow-ios-subtle">
                      {agent.avatar ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.avatarDescription}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`${
                          agent.avatar ? 'absolute inset-0' : 'w-full h-full'
                        } ${agent.avatarColor} text-white text-xl font-helvetica font-bold flex items-center justify-center ${
                          agent.avatar ? 'hidden' : ''
                        }`}
                        style={agent.avatar ? { display: 'none' } : {}}
                        title={agent.avatarDescription}
                      >
                        {agent.name.charAt(0)}
                      </div>
                    </div>
                    {/* Role Icon Badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-ios-subtle flex items-center justify-center">
                      <div className="text-midnight-forest">
                        {agent.roleIcon}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-act-body font-helvetica font-medium text-midnight-forest truncate">
                      {agent.name}
                    </h3>
                    <p className="text-act-small font-inter text-spring-green font-medium truncate">
                      {agent.role}
                    </p>
                    {agent.background && (
                      <p className="text-act-small font-inter text-midnight-forest/50 truncate">
                        {agent.background}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-4">
                  <h4 className="text-act-small font-helvetica font-medium text-midnight-forest mb-2">
                    {agent.specialization}
                  </h4>
                  <p className="text-act-small font-inter text-midnight-forest/70 leading-relaxed">
                    {displayDescription}
                  </p>
                  {agent.description.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpansion(agent.id);
                      }}
                      className="flex items-center gap-1 text-spring-green text-act-small font-inter mt-2 hover:underline transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Read more
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-4 mb-4 pt-4 border-t border-midnight-forest/10">
                    {/* Personality */}
                    <div>
                      <h5 className="text-act-small font-helvetica font-medium text-midnight-forest mb-1">
                        Personality & Approach
                      </h5>
                      <p className="text-act-small font-inter text-midnight-forest/70 italic">
                        "{agent.personality}"
                      </p>
                    </div>

                    {/* Background */}
                    {agent.background && (
                      <div>
                        <h5 className="text-act-small font-helvetica font-medium text-midnight-forest mb-1">
                          Background
                        </h5>
                        <p className="text-act-small font-inter text-midnight-forest/70">
                          {agent.background}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    <div>
                      <h5 className="text-act-small font-helvetica font-medium text-midnight-forest mb-2">
                        Core Skills
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {agent.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-act-small font-inter bg-spring-green/10 text-moss-green rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Button */}
                <ACTButton
                  variant="primary"
                  size="sm"
                  className={`w-full transition-all duration-300 ${
                    hoveredAgent === agent.id ? 'shadow-ios-normal shadow-spring-green/20' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(agent.chatUrl, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with {agent.name}
                </ACTButton>
              </ACTCard>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <ACTCard variant="glass" className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full relative overflow-hidden shadow-ios-elevated">
                <Image
                  src="/images/avatars/avatar.png"
                  alt="Pendo avatar"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="absolute inset-0 bg-spring-green text-white text-2xl font-helvetica font-bold flex items-center justify-center"
                  style={{ display: 'none' }}
                >
                  P
                </div>
              </div>
              <div>
                <h3 className="text-act-title font-helvetica font-medium text-midnight-forest">
                  Ready to Start Your Climate Career Journey?
                </h3>
                <p className="text-act-body font-inter text-spring-green">
                  Meet Pendo, your Climate Economy Supervisor
                </p>
              </div>
            </div>
            <p className="text-act-body font-inter text-midnight-forest/70 mb-6">
              Connect with Pendo, our Climate Economy Supervisor, who will assess your needs and connect you with the right specialist for personalized guidance tailored to your unique background and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ACTButton
                variant="primary"
                size="lg"
                onClick={() => window.open('/chat/pendo', '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Talk to Pendo
              </ACTButton>
              <ACTButton
                variant="outline"
                size="lg"
                onClick={() => window.open('/auth/sign-up', '_blank')}
              >
                <User className="w-5 h-5 mr-2" />
                Create Account
              </ACTButton>
            </div>
          </ACTCard>
        </div>
      </div>
    </section>
  );
} 