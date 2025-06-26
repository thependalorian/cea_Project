/**
 * Message bubble component with brand styling
 * Purpose: Display messages with proper brand visual hierarchy
 * Location: /components/conversation/MessageBubble.tsx
 */
import { BrandBrackets } from '@/components/brand/BrandBrackets'
import { AgentAvatar } from './AgentAvatar'

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'human' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    agent?: string;
    metadata?: {
      tools_used?: string[];
    };
  };
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'human'
  const isAssistant = message.role === 'assistant'

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(new Date(date))
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl">
          <div className="bg-[var(--spring-green)] text-[var(--midnight-forest)] rounded-2xl rounded-br-md px-4 py-3">
            <p className="text-body font-body-regular">
              {message.content}
            </p>
          </div>
          <div className="text-caption text-[var(--moss-green)] mt-1 text-right">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  if (isAssistant) {
    return (
      <div className="flex justify-start">
        <div className="max-w-3xl">
          <BrandBrackets size="sm">
            <div className="bg-white border border-[var(--sand-gray)] rounded-2xl rounded-bl-md px-6 py-4">
              {message.agent && (
                <div className="flex items-center mb-3">
                  <AgentAvatar agent={message.agent} size="sm" />
                  <div className="ml-3">
                    <div className="text-body-small font-body-medium text-[var(--midnight-forest)]">
                      {getAgentName(message.agent)}
                    </div>
                    <div className="text-caption text-[var(--moss-green)]">
                      {getAgentRole(message.agent)}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                <MessageContent content={message.content} />
              </div>
              
              {message.metadata?.tools_used && (
                <ToolsUsedIndicator tools={message.metadata.tools_used} />
              )}
            </div>
          </BrandBrackets>
          
          <div className="text-caption text-[var(--moss-green)] mt-1 ml-6">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  return null
}

function getAgentName(agent: string): string {
  const agentNames = {
    marcus: 'Marcus',
    liv: 'Liv',
    miguel: 'Miguel',
    alex: 'Alex',
    lauren: 'Lauren',
    mai: 'Mai',
    jasmine: 'Jasmine',
  }
  
  return agentNames[agent as keyof typeof agentNames] || 'Assistant'
}

function getAgentRole(agent: string): string {
  const agentRoles = {
    marcus: 'Veterans Specialist',
    liv: 'International Support',
    miguel: 'Environmental Justice',
    alex: 'Crisis Support',
    lauren: 'Climate Careers',
    mai: 'Resume Expert',
    jasmine: 'MA Resources',
  }
  
  return agentRoles[agent as keyof typeof agentRoles] || 'Assistant'
}

function MessageContent({ content }: { content: string }) {
  // In a real implementation, we would parse markdown or HTML
  // For now, just return the content as is
  return <p>{content}</p>
}

function ToolsUsedIndicator({ tools }: { tools: string[] }) {
  if (!tools || tools.length === 0) return null
  
  return (
    <div className="mt-3 pt-3 border-t border-[var(--sand-gray)]">
      <div className="text-caption text-[var(--moss-green)]">
        Tools used: {tools.join(', ')}
      </div>
    </div>
  )
} 