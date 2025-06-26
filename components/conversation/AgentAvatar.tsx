/**
 * Agent avatar component with brand styling
 * Purpose: Display consistent agent avatars across the application
 * Location: /components/conversation/AgentAvatar.tsx
 */

interface AgentAvatarProps {
  agent: string
  size?: 'sm' | 'md' | 'lg'
}

export function AgentAvatar({ agent, size = 'md' }: AgentAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  // Use agent name initials with proper avatar styling
  const firstLetter = agent.charAt(0).toUpperCase()
  
  const agentStyles = {
    marcus: { bg: 'bg-[var(--moss-green)]', text: 'text-white' },
    liv: { bg: 'bg-[var(--seafoam-blue)]', text: 'text-[var(--midnight-forest)]' },
    miguel: { bg: 'bg-[var(--spring-green)]', text: 'text-[var(--midnight-forest)]' },
    alex: { bg: 'bg-[var(--midnight-forest)]', text: 'text-white' },
    lauren: { bg: 'bg-[var(--spring-green)]', text: 'text-[var(--midnight-forest)]' },
    mai: { bg: 'bg-[var(--moss-green)]', text: 'text-white' },
    jasmine: { bg: 'bg-[var(--seafoam-blue)]', text: 'text-[var(--midnight-forest)]' },
  }

  const defaultStyle = { bg: 'bg-gray-500', text: 'text-white' }
  const style = agentStyles[agent.toLowerCase() as keyof typeof agentStyles] || defaultStyle

  return (
    <div 
      className={`${sizeClasses[size]} ${style.bg} ${style.text} rounded-full 
                flex items-center justify-center font-body-medium shadow-sm
                border-2 border-white ring-2 ring-gray-100`}
      title={`${agent} - Climate Economy Assistant`}
    >
      {firstLetter}
    </div>
  )
} 