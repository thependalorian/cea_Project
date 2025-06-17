/**
 * Supervisor Chat Window Component
 * Advanced AI supervisor interface with enhanced intelligence and workflow management
 * Location: components/chat/SupervisorChatWindow.tsx
 */

"use client";

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

interface SupervisorChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  specialist?: string
  tools_used?: string[]
  next_actions?: string[]
  workflow_state?: string
  quality_metrics?: {
    overall_quality: number
    intelligence_level: string
  }
  metadata?: Record<string, unknown>
}

interface WorkflowStatus {
  state: 'ready' | 'active' | 'completed' | 'pending_human'
  specialist: string
  intelligence_level: 'developing' | 'proficient' | 'advanced' | 'exceptional'
  handoff_count: number
}

interface SupervisorChatWindowProps {
  onToggleMode?: () => void
}

export function SupervisorChatWindow({ onToggleMode }: SupervisorChatWindowProps) {
  const { user, loading } = useAuth() // Use secure auth context instead of direct Supabase
  const [messages, setMessages] = useState<SupervisorChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    state: 'ready',
    specialist: 'Pendo Supervisor',
    intelligence_level: 'developing',
    handoff_count: 0
  })
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user || isLoading) return

    const userMessage: SupervisorChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.supervisorChat({
        message: input.trim(),
        conversation_id: conversationId,
        context: {
          enhanced_intelligence: true,
          robust_framework: true
        },
        metadata: {
          frontend_source: 'supervisor_chat_window',
          user_id: user.id
        }
      }) as any

      // Update conversation ID if not set
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      // Update workflow status
      setWorkflowStatus({
        state: response.workflow_state || 'completed',
        specialist: response.specialist || 'Pendo Supervisor',
        intelligence_level: response.intelligence_level || 'developing',
        handoff_count: response.metadata?.specialist_handoffs?.length || 0
      })

      const assistantMessage: SupervisorChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        specialist: response.specialist,
        tools_used: response.tools_used,
        next_actions: response.next_actions,
        workflow_state: response.workflow_state,
        quality_metrics: response.quality_metrics,
        metadata: response.metadata
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Supervisor chat error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      const errorMessage: SupervisorChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${err instanceof Error ? err.message : 'An error occurred. Please try again.'}`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getWorkflowIcon = () => {
    switch (workflowStatus.state) {
      case 'active': return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending_human': return <AlertCircle className="w-4 h-4 text-orange-500" />
      default: return <Brain className="w-4 h-4 text-blue-500" />
    }
  }

  const getIntelligenceColor = (level: string) => {
    switch (level) {
      case 'exceptional': return 'text-purple-600 bg-purple-100'
      case 'advanced': return 'text-blue-600 bg-blue-100'
      case 'proficient': return 'text-green-600 bg-green-100'
      case 'developing': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spring-green mx-auto mb-4"></div>
          <h3 className="text-act-body text-midnight-forest mb-2">Initializing Supervisor...</h3>
          <p className="text-act-small text-midnight-forest/70">
            Please wait while we connect you to your climate career supervisor.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-ios h-full flex items-center justify-center">
        <div className="text-center spacing-ios-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-ios-xl mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-act-body text-midnight-forest mb-2">Sign In Required</h3>
          <p className="text-act-small text-midnight-forest/70">
            Please sign in to access your climate career supervisor.
          </p>
          <div className="mt-4">
            <a 
              href="/auth/login" 
              className="btn-ios-primary inline-flex items-center px-6 py-3 rounded-ios-full"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full card-ios-glass overflow-hidden"
    >
      {/* Enhanced Header with Workflow Status */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-blue-600/10 backdrop-blur-ios">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-ios-full flex items-center justify-center shadow-ios-subtle">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-ios-headline text-midnight-forest flex items-center gap-2">
                AI Supervisor
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getIntelligenceColor(workflowStatus.intelligence_level)
                )}>
                  {workflowStatus.intelligence_level}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                {getWorkflowIcon()}
                <span className="text-ios-caption-1 text-midnight-forest/70">
                  {workflowStatus.specialist} • {workflowStatus.state}
                </span>
              </div>
            </div>
          </div>
          
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="btn btn-sm btn-ghost text-midnight-forest/70 hover:text-midnight-forest"
            >
              <Bot className="w-4 h-4 mr-2" />
              Switch to Basic
            </button>
          )}
        </div>

        {/* Workflow Metrics */}
        {workflowStatus.handoff_count > 0 && (
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span className="text-midnight-forest/70">
                {workflowStatus.handoff_count} specialist handoffs
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-midnight-forest/70">Enhanced intelligence active</span>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-white/5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center spacing-ios-lg max-w-md">
              <div className="animate-ios-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-blue-600/20 rounded-ios-2xl mx-auto mb-6 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-600" />
                </div>
                <h4 className="text-ios-title-3 text-midnight-forest mb-3">
                  Welcome to AI Supervisor
                </h4>
                <p className="text-ios-subheadline text-midnight-forest/70 mb-4">
                  Your advanced climate career supervisor with enhanced intelligence and multi-specialist coordination.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Enhanced Intelligence
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Multi-Agent Workflow
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Quality Assurance
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "flex gap-3 p-4 rounded-ios-xl backdrop-blur-ios",
                  message.role === 'user' 
                    ? "bg-spring-green/10 ml-8" 
                    : "bg-white/10 mr-8"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-ios-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user'
                    ? "bg-spring-green text-white"
                    : "bg-gradient-to-br from-purple-500 to-blue-600 text-white"
                )}>
                  {message.role === 'user' ? (
                    <span className="text-xs font-semibold">U</span>
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-ios-caption-1 font-medium text-midnight-forest">
                      {message.role === 'user' ? 'You' : (message.specialist || 'AI Supervisor')}
                    </span>
                    {message.workflow_state && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {message.workflow_state}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-ios-body text-midnight-forest whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {/* Enhanced metadata display */}
                  {message.tools_used && message.tools_used.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.tools_used.map((tool, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {message.next_actions && message.next_actions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-midnight-forest/70 mb-1">Next Actions:</p>
                      <ul className="text-xs text-midnight-forest/70 space-y-1">
                        {message.next_actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-spring-green">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.quality_metrics && (
                    <div className="mt-2 text-xs text-midnight-forest/70">
                      Quality Score: {Math.round(message.quality_metrics.overall_quality * 100)}%
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 bg-white/10 rounded-ios-xl backdrop-blur-ios mr-8"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-ios-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-ios-caption-1 text-midnight-forest/70 ml-2">
                    Supervisor is analyzing...
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-ios">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI supervisor for advanced climate career guidance..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-ios-xl text-midnight-forest placeholder-midnight-forest/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-ios"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-ios-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-ios-subtle transition-all duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-ios-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 