/**
 * Agents hook for managing agent data and interactions
 * Purpose: Centralized agent management with caching and error handling
 * Location: /hooks/useAgents.ts
 */

import { useState, useEffect, useCallback } from 'react'

export interface Agent {
  id: string
  name: string
  description: string
  specialization: string
  team: string
  status: string
}

export interface AgentTeam {
  name: string
  agent_count: number
  agents: {
    id: string
    name: string
    specialization: string
  }[]
}

export interface AgentsResponse {
  teams: Record<string, AgentTeam>
  agents: Record<string, Agent>
  total_agents: number
  total_teams: number
}

export interface ChatRequest {
  message: string
  context?: Record<string, any>
  stream?: boolean
}

export interface ChatResponse {
  agent_id: string
  agent_name: string
  response: {
    content: string
    agent: string
    type: string
    metadata?: Record<string, any>
    error?: string
  }
  timestamp: string
}

// Main agents hook
export function useAgents() {
  const [agents, setAgents] = useState<AgentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/agents')
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }
      
      const data: AgentsResponse = await response.json()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const getAgent = useCallback((agentId: string): Agent | null => {
    return agents?.agents[agentId] || null
  }, [agents])

  const getTeamAgents = useCallback((teamId: string): Agent[] => {
    if (!agents) return []
    return Object.values(agents.agents).filter(agent => agent.team === teamId)
  }, [agents])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    getAgent,
    getTeamAgents
  }
}

// Agent chat hook
export function useAgentChat(agentId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (request: ChatRequest): Promise<ChatResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      const data: ChatResponse = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [agentId])

  return {
    sendMessage,
    loading,
    error
  }
}

// Agent teams hook
export function useAgentTeams() {
  const { agents, loading, error } = useAgents()

  const teams = agents?.teams || {}
  const teamList = Object.entries(teams).map(([id, team]) => ({
    id,
    ...team
  }))

  const getTeam = useCallback((teamId: string) => {
    return teams[teamId] || null
  }, [teams])

  return {
    teams: teamList,
    teamsData: teams,
    loading,
    error,
    getTeam
  }
}

// Utility function to get agent avatar
export function getAgentAvatar(agent: Agent): string {
  const specializations: Record<string, string> = {
    'Climate policy and career coordination': '🌱',
    'Equitable climate solutions': '⚖️',
    'Mental health and crisis support': '🆘',
    'MA-specific climate programs': '🏛️',
    'Military-to-civilian transition': '🎖️',
    'Translating military skills to climate careers': '🔄',
    'Career coaching for veterans': '👨‍🏫',
    'VA benefits and crisis resources': '🏥',
    'Environmental justice advocacy': '✊',
    'Community organizing and outreach': '👥',
    'Workforce development for EJ communities': '🏢',
    'Cultural adaptation and community relations': '🤝',
    'International populations and credentials': '📜',
    'Regional climate solutions': '🌏',
    'Regional climate adaptation': '🌊',
    'Green Deal and African partnerships': '🤝',
    'Resume optimization and analysis': '📄',
    'Technical troubleshooting and support': '⚙️',
    'UX research and design optimization': '🎨',
    'Data analysis and insights': '📊'
  }
  return specializations[agent.specialization] || '👤'
}

// Utility function to get team avatar
export function getTeamAvatar(teamName: string): string {
  const avatars: Record<string, string> = {
    'specialists': '🎯',
    'veterans': '🇺🇸',
    'environmental_justice': '⚖️',
    'international': '🌍',
    'support': '🛠️'
  }
  return avatars[teamName] || '👤'
} 