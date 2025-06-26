interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentId?: string
  type?: 'text' | 'action' | 'file'
  metadata?: Record<string, any>
  status?: 'pending' | 'complete' | 'error'
}

interface ConversationHistoryProps {
  messages: Message[]
  streamingMessage: Message | null
}

export function ConversationHistory({ messages, streamingMessage }: ConversationHistoryProps) {
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    const statusColor = message.status === 'error' ? 'text-error' : 
                       message.status === 'pending' ? 'text-warning' : 
                       'text-success'

    return (
      <div
        key={message.id}
        className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}
      >
        <div className="chat-header flex items-center gap-2">
          <span>{isUser ? 'You' : message.agentId || 'Assistant'}</span>
          <time className="text-xs opacity-50">
            {new Date(message.timestamp).toLocaleTimeString()}
          </time>
          {message.status && (
            <span className={`text-xs ${statusColor}`}>
              {message.status}
            </span>
          )}
        </div>
        
        <div className={`chat-bubble ${
          isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'
        }`}>
          {message.type === 'file' && message.metadata?.fileUrl && (
            <div className="mb-2">
              <a 
                href={message.metadata.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link link-accent"
              >
                📎 {message.metadata.fileName || 'Attached File'}
              </a>
            </div>
          )}
          {message.type === 'action' ? (
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span>{message.content}</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map(renderMessage)}
      {streamingMessage && renderMessage(streamingMessage)}
      {messages.length === 0 && !streamingMessage && (
        <div className="text-center text-base-content/60 py-8">
          No messages yet. Start a conversation!
        </div>
      )}
    </div>
  )
} 