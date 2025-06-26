/**
 * Dashboard Page Component - ACT Brand Compliant
 * Purpose: Main dashboard implementing ACT brand guidelines
 * Location: /app/dashboard/page.tsx
 * 
 * Brand Compliance:
 * - Uses ACT navigation component
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Accessibility compliant
 */

'use client'

import { useState } from 'react'
import Navigation from '@/components/shared/Navigation'
import { AgentSelector } from '@/components/AgentSelector'
import { ChatInterface } from '@/components/ChatInterface'
import { useAgents, useAgentTeams } from '@/hooks/useAgents'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BrandFrame } from '@/components/brand/BrandFrame'

export default function Dashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [view, setView] = useState<'agents' | 'chat'>('agents')
  const { agents, loading, error } = useAgents()
  const { teams } = useAgentTeams()

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="act-loading">
          <div className="text-center animate-on-scroll">
            <LoadingSpinner />
            <p className="act-body text-moss-green mt-act-1">Loading your climate career specialists...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="act-section">
          <div className="act-content">
            <div className="max-w-md mx-auto text-center">
              <div className="act-card border-2 border-moss-green-60">
                <div className="flex items-center gap-act-1 mb-act-1">
                  <svg 
                    className="w-6 h-6 text-moss-green-60 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span className="act-h4">Error Loading Agents</span>
                </div>
                <p className="act-body text-moss-green">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
    setView('chat')
  }

  const handleBackToAgents = () => {
    setView('agents')
    setSelectedAgent('')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ACT Brand Navigation */}
      <Navigation />

      {/* Page Header */}
      <section className="act-section bg-gradient-seafoam">
        <div className="act-content">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-act-2 animate-on-scroll">
            <div className="text-center lg:text-left">
              <h1 className="act-h1 mb-act-1">
                Climate Career Dashboard
              </h1>
              <p className="act-body-large text-moss-green">
                Connect with specialized AI agents for your climate career journey
              </p>
            </div>
            {view === 'chat' && (
              <button
                onClick={handleBackToAgents}
                className="act-btn act-btn-secondary"
                aria-label="Return to agent selection"
              >
                ← Back to Agents
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      {agents && view === 'agents' && (
        <section className="act-section bg-sand-gray-10" aria-label="Dashboard statistics">
          <div className="act-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-act-2 animate-on-scroll">
              <div className="act-card text-center">
                <div className="act-caption text-moss-green mb-act-0.5">Total Agents</div>
                <div className="act-h1 text-spring-green mb-act-0.5">{agents.total_agents}</div>
                <div className="act-body-small text-moss-green">Ready to assist you</div>
              </div>
              <div className="act-card text-center">
                <div className="act-caption text-moss-green mb-act-0.5">Specialized Teams</div>
                <div className="act-h1 text-spring-green mb-act-0.5">{agents.total_teams}</div>
                <div className="act-body-small text-moss-green">Different expertise areas</div>
              </div>
              <div className="act-card text-center">
                <div className="act-caption text-moss-green mb-act-0.5">Most Popular</div>
                <div className="act-h1 text-spring-green mb-act-0.5">Pendo</div>
                <div className="act-body-small text-moss-green">Climate policy coordinator</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="act-section">
        <div className="act-content">
          {view === 'agents' ? (
            <div className="space-y-act-4">
              {/* Welcome Section */}
              <div className="text-center max-w-4xl mx-auto animate-on-scroll">
                <h2 className="act-h2 mb-act-1">
                  Choose Your Climate Career Specialist
                </h2>
                <p className="act-body text-moss-green mb-act-2">
                  Our team of {agents?.total_agents} AI specialists are organized into {agents?.total_teams} teams, 
                  each with unique expertise to help you navigate the Massachusetts climate economy.
                </p>
                
                {/* Team Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-act-1 mb-act-4">
                  {teams.map((team) => (
                    <div key={team.id} className="act-card text-center p-act-1">
                      <div className="text-2xl mb-act-0.5" aria-hidden="true">
                        {team.id === 'specialists' && '🎯'}
                        {team.id === 'veterans' && '🇺🇸'}
                        {team.id === 'environmental_justice' && '⚖️'}
                        {team.id === 'international' && '🌍'}
                        {team.id === 'support' && '🛠️'}
                      </div>
                      <h3 className="act-h4 text-sm mb-act-0.5">{team.name}</h3>
                      <p className="act-caption text-moss-green">{team.agent_count} agents</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Selector */}
              <div className="animate-on-scroll">
                <AgentSelector
                  selectedAgent={selectedAgent}
                  onSelectAgent={handleAgentSelect}
                  showTeamFilter={true}
                />
              </div>

              {/* How It Works Section */}
              <div className="animate-on-scroll">
                <BrandFrame size="lg" color="spring-green" className="p-act-2">
                  <h3 className="act-h3 mb-act-2 text-center">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-act-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-spring-green text-midnight-forest rounded-full flex items-center justify-center text-lg font-bold mb-act-1">
                        1
                      </div>
                      <h4 className="act-h4 mb-act-0.5">Choose Your Agent</h4>
                      <p className="act-body-small text-moss-green">
                        Select an agent based on your specific needs and background
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-spring-green text-midnight-forest rounded-full flex items-center justify-center text-lg font-bold mb-act-1">
                        2
                      </div>
                      <h4 className="act-h4 mb-act-0.5">Start Conversation</h4>
                      <p className="act-body-small text-moss-green">
                        Begin chatting about your climate career goals and challenges
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-spring-green text-midnight-forest rounded-full flex items-center justify-center text-lg font-bold mb-act-1">
                        3
                      </div>
                      <h4 className="act-h4 mb-act-0.5">Get Personalized Guidance</h4>
                      <p className="act-body-small text-moss-green">
                        Receive tailored advice, resources, and action plans
                      </p>
                    </div>
                  </div>
                </BrandFrame>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-act-2 animate-on-scroll">
                <QuickActionCard
                  title="Upload Resume"
                  description="Get AI-powered analysis of your transferable skills"
                  icon="📄"
                  href="/dashboard/resume"
                />
                <QuickActionCard
                  title="View Conversations"
                  description="Access your previous chats and advice history"
                  icon="💬"
                  href="/dashboard/conversations"
                />
                <QuickActionCard
                  title="Explore Resources"
                  description="Browse training programs and funding opportunities"
                  icon="📚"
                  href="/resources"
                />
                <QuickActionCard
                  title="Profile Settings"
                  description="Update your preferences and career goals"
                  icon="⚙️"
                  href="/profile"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto animate-on-scroll">
              <BrandFrame size="lg" color="seafoam-blue" className="min-h-[70vh] p-act-2">
                <ChatInterface agentId="marcus" />
              </BrandFrame>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  icon: string
  href: string
}

function QuickActionCard({ title, description, icon, href }: QuickActionCardProps) {
  return (
    <a 
      href={href}
      className="act-card hover:shadow-act-card-hover transition-all duration-300 block"
    >
      <div className="text-center">
        <div className="text-3xl mb-act-1" aria-hidden="true">
          {icon}
        </div>
        <h3 className="act-h4 mb-act-0.5">
          {title}
        </h3>
        <p className="act-body-small text-moss-green">
          {description}
        </p>
      </div>
    </a>
  )
} 