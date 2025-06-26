/**
 * Agent status card with brand styling
 * Purpose: Show current active agent with their specialization
 * Location: /components/conversation/AgentStatusCard.tsx
 */
import { AgentAvatar } from './AgentAvatar'

interface AgentStatusCardProps {
  agent: string
}

export function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const agentInfo = {
    marcus: { 
      name: 'Marcus', 
      role: 'Veterans Specialist', 
      color: 'moss-green',
      description: 'Military skill translation & VA resources'
    },
    liv: { 
      name: 'Liv', 
      role: 'International Support', 
      color: 'seafoam-blue',
      description: 'Immigration & credential recognition'
    },
    miguel: { 
      name: 'Miguel', 
      role: 'Environmental Justice', 
      color: 'spring-green',
      description: 'Community organizing & environmental careers'
    },
    alex: { 
      name: 'Alex', 
      role: 'Crisis Support', 
      color: 'midnight-forest',
      description: 'Mental health & trauma-informed guidance'
    },
    lauren: { 
      name: 'Lauren', 
      role: 'Climate Careers', 
      color: 'spring-green',
      description: 'Green economy jobs & sustainability'
    },
    mai: { 
      name: 'Mai', 
      role: 'Resume Expert', 
      color: 'moss-green',
      description: 'Resume optimization & career marketing'
    },
    jasmine: { 
      name: 'Jasmine', 
      role: 'MA Resources', 
      color: 'seafoam-blue',
      description: 'Massachusetts programs & opportunities'
    },
  }

  const info = agentInfo[agent as keyof typeof agentInfo]
  if (!info) return null

  return (
    <div className="bg-[var(--sand-gray)] rounded-lg p-4 min-w-64">
      <div className="flex items-center space-x-3">
        <AgentAvatar agent={agent} size="md" />
        <div>
          <div className="text-body font-body-semibold text-[var(--midnight-forest)]">
            {info.name}
          </div>
          <div className="text-body-small text-[var(--moss-green)]">
            {info.role}
          </div>
          <div className="text-caption text-[var(--moss-green)] mt-1">
            {info.description}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center">
        <div className="w-2 h-2 bg-[var(--spring-green)] rounded-full animate-pulse"></div>
        <span className="text-caption text-[var(--moss-green)] ml-2">
          Currently assisting
        </span>
      </div>
    </div>
  )
} 