/**
 * Agent selector component for choosing which agent to start conversations with
 * Purpose: Display all available agents organized by teams with selection functionality
 * Location: /components/AgentSelector.tsx
 */
import { useState } from 'react'
import { BrandFrame } from '@/components/brand/BrandFrame'
import { useAgents, getAgentAvatar } from '@/hooks/useAgents'

interface AgentSelectorProps {
  onSelectAgent: (agentId: string) => void
  selectedAgent?: string
  showTeamFilter?: boolean
}

export function AgentSelector({ onSelectAgent, selectedAgent, showTeamFilter = true }: AgentSelectorProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const { agents, loading, error } = useAgents()

  if (loading) {
    return (
      <BrandFrame size="lg" color="spring-green">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--spring-green)] mx-auto mb-4"></div>
          <p className="text-body text-[var(--moss-green)]">Loading agents...</p>
        </div>
      </BrandFrame>
    )
  }

  if (error) {
    return (
      <BrandFrame size="lg" color="spring-green">
        <div className="text-center py-8">
          <p className="text-body text-red-600 mb-4">Failed to load agents: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-outline text-[var(--moss-green)] border-[var(--moss-green)] hover:bg-[var(--moss-green)] hover:text-white"
          >
            Retry
          </button>
        </div>
      </BrandFrame>
    )
  }

  if (!agents || !agents.agents) {
    return (
      <BrandFrame size="lg" color="spring-green">
        <div className="text-center py-8">
          <p className="text-body text-[var(--moss-green)]">No agents available</p>
        </div>
      </BrandFrame>
    )
  }

  const agentsList = Object.values(agents.agents)
  const teams = agents.teams || {}

  const filteredAgents = selectedTeam === 'all' 
    ? agentsList 
    : agentsList.filter(agent => agent.team === selectedTeam)

  const getAgentColor = (teamId: string) => {
    switch (teamId) {
      case 'specialists_team': 
      case 'specialists': 
        return 'bg-[var(--spring-green-20)] text-[var(--midnight-forest)] border-[var(--spring-green)]'
      case 'veterans_team': 
      case 'veterans': 
        return 'bg-[var(--moss-green-20)] text-[var(--midnight-forest)] border-[var(--moss-green)]'
      case 'ej_team': 
      case 'environmental_justice': 
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'international_team': 
      case 'international': 
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'support_team': 
      case 'support': 
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default: 
        return 'bg-[var(--sand-gray)] text-[var(--moss-green)] border-[var(--sand-gray)]'
    }
  }

  const getTeamDisplayName = (teamId: string) => {
    const teamData = teams[teamId]
    if (teamData) return teamData.name
    
    // Fallback for team name formatting
    switch (teamId) {
      case 'specialists_team': 
      case 'specialists': 
        return 'Climate Specialists'
      case 'veterans_team': 
      case 'veterans': 
        return 'Veterans Support'
      case 'ej_team': 
      case 'environmental_justice': 
        return 'Environmental Justice'
      case 'international_team': 
      case 'international': 
        return 'International'
      case 'support_team': 
      case 'support': 
        return 'Support & Wellness'
      default: 
        return teamId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  return (
    <BrandFrame size="lg" color="spring-green">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-h2 font-title-medium text-[var(--midnight-forest)] mb-2">
            Choose Your Climate Career Assistant
          </h2>
          <p className="text-body text-[var(--moss-green)]">
            Select a specialized agent to help with your climate career journey
          </p>
          <p className="text-body-small text-[var(--moss-green)] mt-2">
            {agents.total_agents} agents across {agents.total_teams} teams
          </p>
        </div>

        {showTeamFilter && Object.keys(teams).length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTeam('all')}
              className={`px-4 py-2 rounded-full text-body-small font-body-medium transition-colors
                ${selectedTeam === 'all' 
                  ? 'bg-[var(--spring-green)] text-[var(--midnight-forest)]' 
                  : 'bg-[var(--sand-gray-20)] text-[var(--moss-green)] hover:bg-[var(--spring-green-20)]'
                }`}
            >
              All Agents ({agentsList.length})
            </button>
            {Object.entries(teams).map(([teamId, team]) => (
              <button
                key={teamId}
                onClick={() => setSelectedTeam(teamId)}
                className={`px-4 py-2 rounded-full text-body-small font-body-medium transition-colors
                  ${selectedTeam === teamId 
                    ? 'bg-[var(--spring-green)] text-[var(--midnight-forest)]' 
                    : 'bg-[var(--sand-gray-20)] text-[var(--moss-green)] hover:bg-[var(--spring-green-20)]'
                  }`}
              >
                {team.name} ({team.agent_count})
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`p-4 text-left rounded-lg border-2 transition-all duration-200
                ${selectedAgent === agent.id 
                  ? `${getAgentColor(agent.team)} border-opacity-100 shadow-lg` 
                  : `${getAgentColor(agent.team)} border-opacity-30 hover:border-opacity-60 hover:shadow-md`
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getAgentAvatar(agent)}</span>
                  <h3 className="text-h3 font-title-medium">
                    {agent.name}
                  </h3>
                </div>
                <span className="text-caption text-current opacity-70">
                  {getTeamDisplayName(agent.team)}
                </span>
              </div>
              
              <p className="text-body-small mb-3 opacity-80">
                {agent.description}
              </p>
              
              <div className="space-y-1">
                <p className="text-caption font-body-medium opacity-70">Specialization:</p>
                <span className="text-caption px-2 py-1 bg-current bg-opacity-10 rounded">
                  {agent.specialization}
                </span>
              </div>
              
              <div className="mt-2">
                <span className={`text-caption px-2 py-1 rounded-full
                  ${agent.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {agent.status}
                </span>
              </div>
              
              {selectedAgent === agent.id && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <span className="text-body-small font-body-medium text-current">
                    ✓ Selected - Ready to start conversation
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-body text-[var(--moss-green)]">
              No agents found for the selected team.
            </p>
          </div>
        )}
      </div>
    </BrandFrame>
  )
} 