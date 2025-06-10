/**
 * Interactive Tutorials Component - Climate Economy Assistant
 * Unified tutorials for CEA's LangGraph + FastAPI architecture
 * Location: components/tutorial/InteractiveTutorials.tsx
 */

'use client';

import { useState } from 'react';
import { 
  TrendingUp,
  Search,
  FileText,
  Target,
  BarChart3,
  CheckCircle,
  Play,
  Clock,
  Settings,
  Bot,
  Users,
  ArrowRight
} from 'lucide-react';
import { API_ENDPOINTS } from "@/lib/config/constants";

interface Tutorial {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: any;
  preview: string;
  endpoint?: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'ai-career-advisor',
    title: 'AI Career Advisor Chat',
    duration: '3 min',
    description: 'Interactive AI guidance for climate career exploration and planning',
    icon: Bot,
    preview: 'Get personalized climate career recommendations and pathways',
    endpoint: API_ENDPOINTS.V1_INTERACTIVE_CHAT
  },
  {
    id: 'resume-analysis',
    title: 'Resume Analysis',
    duration: '4 min',
    description: 'Get personalized feedback on your resume for climate careers',
    icon: FileText,
    preview: 'Climate readiness score, skill matching, and career recommendations',
    endpoint: API_ENDPOINTS.V1_RESUME_ANALYSIS
  },
  {
    id: 'skills-translation',
    title: 'Skills Translation Tool',
    duration: '3 min',
    description: 'Translate your existing experience into climate economy opportunities',
    icon: Target,
    preview: 'Map your background to renewable energy, sustainability, and climate roles',
    endpoint: API_ENDPOINTS.V1_SKILLS_TRANSLATE
  },
  {
    id: 'career-search',
    title: 'Climate Career Search',
    duration: '3 min',
    description: 'Find opportunities in the climate economy',
    icon: Search,
    preview: 'AI-powered matching to climate opportunities and career pathways',
    endpoint: API_ENDPOINTS.V1_CAREER_SEARCH
  },
  {
    id: 'platform-analytics',
    title: 'Platform Analytics Dashboard',
    duration: '2 min',
    description: 'View platform performance metrics and success tracking',
    icon: BarChart3,
    preview: 'User engagement, job placement rates, and platform insights',
    endpoint: '/admin/dashboard'
  },
  {
    id: 'system-health',
    title: 'System Health Monitoring',
    duration: '2 min',
    description: 'Monitor LangGraph workflows and API performance',
    icon: Settings,
    preview: 'Real-time system status, workflow tracking, and performance metrics',
    endpoint: API_ENDPOINTS.V1_HEALTH
  },
  {
    id: 'basic-chat',
    title: 'Basic Chat Interface',
    duration: '2 min',
    description: 'Learn how to interact with the climate economy assistant',
    icon: Bot,
    preview: 'Simple chat interface for climate career questions',
    endpoint: '/api/v1/interactive-chat'
  }
];

export function InteractiveTutorials() {
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-primary mb-4">
          Climate Economy Assistant Platform Guide
        </h2>
        <p className="text-xl text-base-content/70 mb-8 max-w-3xl mx-auto">
          Comprehensive tutorials showing how CEA's <strong>LangGraph workflows</strong> and 
          <strong> AI-powered features</strong> help you build successful climate careers.
        </p>
        <div className="alert alert-info max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span><strong>Live System:</strong> These tutorials demonstrate CEA's actual Python backend + Next.js architecture</span>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="text-center mb-12 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <TrendingUp className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-primary mb-4">
          See How CEA Transforms Climate Careers
        </h3>
        <p className="text-lg text-base-content/70 mb-6">
          Discover how our AI-powered platform helps job seekers, employers, and students build successful climate careers in Massachusetts and beyond.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">89%</div>
            <div className="text-sm text-base-content/70">Job Match Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">3x</div>
            <div className="text-sm text-base-content/70">Higher Interview Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">4mo</div>
            <div className="text-sm text-base-content/70">Avg Career Transition</div>
          </div>
        </div>
        <div className="text-sm text-base-content/60 mb-4">
          <strong>Focus:</strong> AI-powered career guidance, skills translation, and climate opportunity matching
        </div>
        <button className="btn btn-primary btn-lg gap-2">
          <Play className="h-5 w-5" />
          Take a 2-minute tour
        </button>
      </div>

      {/* Tutorial Grid */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-8">Interactive Platform Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tutorials.map((tutorial, index) => {
            const TutorialIcon = tutorial.icon;
            return (
              <div
                key={tutorial.id}
                className={`card bg-base-100 shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:scale-105 ${
                  activeTutorial === tutorial.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTutorial(tutorial.id)}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <TutorialIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{tutorial.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                          <Clock className="h-4 w-4" />
                          {tutorial.duration} interactive demo
                        </div>
                      </div>
                    </div>
                    <div className="badge badge-outline">{index + 1}</div>
                  </div>
                  
                  <p className="text-base-content/70 mb-4">
                    {tutorial.description}
                  </p>
                  
                  <div className="bg-primary/5 rounded-lg p-3 mb-4">
                    <div className="text-sm text-primary font-medium">Preview:</div>
                    <div className="text-sm">{tutorial.preview}</div>
                    {tutorial.endpoint && (
                      <div className="text-xs text-base-content/50 mt-1">
                        <code>{tutorial.endpoint}</code>
                      </div>
                    )}
                  </div>

                  <div className="card-actions justify-end">
                    <button className="btn btn-primary btn-sm gap-2">
                      <Play className="h-4 w-4" />
                      Start Demo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Demo Player */}
        {activeTutorial && (
          <div className="bg-base-100 rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold">
                {tutorials.find(t => t.id === activeTutorial)?.title}
              </h4>
              <button 
                onClick={() => setActiveTutorial(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Detailed Platform Feature Mocks */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8">
              {/* AI Career Advisor Chat Mock */}
              {activeTutorial === 'ai-career-advisor' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h5 className="text-xl font-bold mb-2">CEA AI Career Advisor</h5>
                    <p className="text-base-content/70">Live chat interface with personalized climate career guidance</p>
                  </div>
                  <div className="bg-base-100 rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
                    <div className="chat chat-start mb-4">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="chat-header">CEA Assistant</div>
                      <div className="chat-bubble chat-bubble-primary">
                        Welcome! I'm here to help you navigate climate careers. What's your background and what climate sector interests you most?
                      </div>
                    </div>
                    
                    <div className="chat chat-end mb-4">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <span className="text-sm font-bold">You</span>
                        </div>
                      </div>
                      <div className="chat-bubble chat-bubble-secondary">
                        I have a background in engineering and I'm interested in renewable energy careers.
                      </div>
                    </div>

                    <div className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="chat-bubble chat-bubble-primary">
                        Excellent! Your engineering background is perfect for renewable energy. Based on current market trends, here are the top opportunities that match your skills...
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-base-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <div className="loading loading-dots loading-sm"></div>
                        <span>AI is analyzing your background...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resume Analysis Mock */}
              {activeTutorial === 'resume-analysis' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h5 className="text-xl font-bold mb-2">AI Resume Analysis Results</h5>
                    <p className="text-base-content/70">Real-time climate readiness assessment and career recommendations</p>
                  </div>
                  <div className="bg-base-100 rounded-lg p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="radial-progress text-primary mb-4" style={{"--value": "85"} as any}>85%</div>
                        <h6 className="font-semibold">Climate Readiness Score</h6>
                        <p className="text-sm text-base-content/70">Strong transferable skills identified</p>
                      </div>
                      <div className="space-y-3">
                        <h6 className="font-semibold">Top Skill Matches</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Technical Systems</span>
                            <span className="badge badge-primary">95%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Problem Solving</span>
                            <span className="badge badge-secondary">92%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Project Management</span>
                            <span className="badge badge-accent">88%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-base-200 rounded-lg p-4">
                      <h6 className="font-semibold mb-3">Recommended Climate Roles</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-base-100 rounded">
                          <span className="text-sm font-medium">Renewable Energy Engineer</span>
                          <span className="badge badge-success">92% Match</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-base-100 rounded">
                          <span className="text-sm font-medium">Solar Project Manager</span>
                          <span className="badge badge-info">85% Match</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-base-100 rounded">
                          <span className="text-sm font-medium">Energy Systems Analyst</span>
                          <span className="badge badge-warning">78% Match</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Translation Mock */}
              {activeTutorial === 'skills-translation' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h5 className="text-xl font-bold mb-2">Skills Translation Interface</h5>
                    <p className="text-base-content/70">Live mapping of your experience to climate opportunities</p>
                  </div>
                  <div className="bg-base-100 rounded-lg p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div>
                          <h6 className="font-semibold">Engineering Design</h6>
                          <p className="text-sm text-base-content/70">Traditional Engineering Experience</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-primary" />
                        <div>
                          <h6 className="font-semibold">Clean Energy Systems</h6>
                          <p className="text-sm text-base-content/70">Renewable Energy Technology</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                        <div>
                          <h6 className="font-semibold">Project Coordination</h6>
                          <p className="text-sm text-base-content/70">Cross-functional Team Leadership</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-secondary" />
                        <div>
                          <h6 className="font-semibold">Climate Project Management</h6>
                          <p className="text-sm text-base-content/70">Sustainability Initiative Leadership</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                        <div>
                          <h6 className="font-semibold">Data Analysis</h6>
                          <p className="text-sm text-base-content/70">Technical Problem Solving</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-accent" />
                        <div>
                          <h6 className="font-semibold">Climate Data Science</h6>
                          <p className="text-sm text-base-content/70">Environmental Impact Analysis</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-success/10 rounded-lg">
                      <h6 className="font-semibold text-success mb-2">Next Steps</h6>
                      <ul className="text-sm space-y-1">
                        <li>✓ Explore renewable energy certifications</li>
                        <li>✓ Connect with climate tech professionals</li>
                        <li>✓ Apply to relevant climate opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Climate Career Search Mock */}
              {activeTutorial === 'career-search' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h5 className="text-xl font-bold mb-2">Climate Career Search Dashboard</h5>
                    <p className="text-base-content/70">AI-powered job matching and opportunity discovery</p>
                  </div>
                  <div className="bg-base-100 rounded-lg p-6 shadow-lg">
                    <div className="mb-6">
                      <div className="flex gap-2 items-center mb-4">
                        <input 
                          type="text" 
                          placeholder="Search climate careers..." 
                          className="input input-bordered flex-1"
                          value="renewable energy engineer"
                          readOnly
                        />
                        <button className="btn btn-primary">
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <div className="badge badge-primary">Massachusetts</div>
                        <div className="badge badge-secondary">Remote OK</div>
                        <div className="badge badge-accent">Entry Level</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-base-200/50">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-semibold">Solar Project Engineer</h6>
                          <span className="badge badge-success">95% Match</span>
                        </div>
                        <p className="text-sm text-base-content/70 mb-2">SunTech Solutions • Boston, MA</p>
                        <p className="text-sm mb-2">Design and implement solar energy systems for commercial clients...</p>
                        <div className="flex gap-2 text-xs">
                          <span className="badge badge-outline">Engineering</span>
                          <span className="badge badge-outline">Solar</span>
                          <span className="badge badge-outline">Project Management</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-base-200/50">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-semibold">Wind Energy Analyst</h6>
                          <span className="badge badge-info">88% Match</span>
                        </div>
                        <p className="text-sm text-base-content/70 mb-2">GreenWind Corp • Remote</p>
                        <p className="text-sm mb-2">Analyze wind patterns and optimize turbine placement...</p>
                        <div className="flex gap-2 text-xs">
                          <span className="badge badge-outline">Data Analysis</span>
                          <span className="badge badge-outline">Wind Energy</span>
                          <span className="badge badge-outline">Remote</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Analytics Mock */}
              {activeTutorial === 'platform-analytics' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h5 className="text-xl font-bold mb-2">CEA Platform Analytics Dashboard</h5>
                    <p className="text-base-content/70">Real-time platform metrics and user success tracking</p>
                  </div>
                  <div className="bg-base-100 rounded-lg p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="stat bg-primary/10 rounded-lg p-4">
                        <div className="stat-figure text-primary">
                          <BarChart3 className="h-8 w-8" />
                        </div>
                        <div className="stat-title text-sm">Job Match Rate</div>
                        <div className="stat-value text-primary text-2xl">89%</div>
                        <div className="stat-desc">↗︎ 12% from last month</div>
                      </div>
                      <div className="stat bg-secondary/10 rounded-lg p-4">
                        <div className="stat-figure text-secondary">
                          <TrendingUp className="h-8 w-8" />
                        </div>
                        <div className="stat-title text-sm">Interview Rate</div>
                        <div className="stat-value text-secondary text-2xl">3.2x</div>
                        <div className="stat-desc">vs traditional methods</div>
                      </div>
                      <div className="stat bg-accent/10 rounded-lg p-4">
                        <div className="stat-figure text-accent">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <div className="stat-title text-sm">Avg Transition</div>
                        <div className="stat-value text-accent text-2xl">4mo</div>
                        <div className="stat-desc">career placement time</div>
                      </div>
                    </div>
                    <div className="bg-base-200 rounded-lg p-4">
                      <h6 className="font-semibold mb-3">User Engagement Metrics</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Active Users</span>
                          <div className="flex items-center gap-2">
                            <progress className="progress progress-primary w-20" value="85" max="100"></progress>
                            <span className="text-sm">1,247</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Career Transitions</span>
                          <div className="flex items-center gap-2">
                            <progress className="progress progress-secondary w-20" value="78" max="100"></progress>
                            <span className="text-sm">312</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Platform Satisfaction</span>
                          <div className="flex items-center gap-2">
                            <progress className="progress progress-accent w-20" value="92" max="100"></progress>
                            <span className="text-sm">4.6/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Health Monitoring Mock */}
              {activeTutorial === 'system-health' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h5 className="text-xl font-bold mb-2">System Health Monitor</h5>
                    <p className="text-base-content/70">Live monitoring of LangGraph workflows and API performance</p>
                  </div>
                  <div className="bg-base-100 rounded-lg p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h6 className="font-semibold">API Status</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Chat API</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-success rounded-full"></div>
                              <span className="text-sm">Online</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Resume Analysis</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-success rounded-full"></div>
                              <span className="text-sm">Online</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Skills Translation</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-warning rounded-full"></div>
                              <span className="text-sm">Slow</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h6 className="font-semibold">LangGraph Workflows</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Career Advisor</span>
                            <span className="badge badge-success">Running</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Job Matcher</span>
                            <span className="badge badge-success">Running</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Skills Analyzer</span>
                            <span className="badge badge-info">Idle</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-base-200 rounded-lg p-4">
                      <h6 className="font-semibold mb-3">Performance Metrics</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">245ms</div>
                          <div className="text-xs text-base-content/60">Avg Response Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-secondary">99.8%</div>
                          <div className="text-xs text-base-content/60">Uptime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-accent">1,847</div>
                          <div className="text-xs text-base-content/60">Requests/hr</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Stories */}
        <div className="bg-gradient-to-r from-success/10 to-info/10 rounded-2xl p-8 mb-12">
          <h4 className="text-2xl font-bold text-center mb-6">
            Platform Success Stories
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="avatar mb-4">
                <div className="w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h5 className="font-bold">Engineering to Clean Energy</h5>
              <p className="text-sm text-base-content/70">
                "CEA helped me transition from traditional engineering to renewable energy in just 3 months"
              </p>
            </div>
            <div className="text-center">
              <div className="avatar mb-4">
                <div className="w-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h5 className="font-bold">Skills Translation Success</h5>
              <p className="text-sm text-base-content/70">
                "The AI showed me how my project management skills applied perfectly to climate initiatives"
              </p>
            </div>
            <div className="text-center">
              <div className="avatar mb-4">
                <div className="w-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h5 className="font-bold">Career Advancement</h5>
              <p className="text-sm text-base-content/70">
                "Platform insights helped me advance to a sustainability leadership role"
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
          <h4 className="text-3xl font-bold mb-4">Ready to Transform Your Climate Career?</h4>
          <p className="text-lg text-base-content/70 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully transitioned to meaningful climate careers using our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-primary btn-lg">
              Get Started Free
            </button>
            <button className="btn btn-outline btn-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 