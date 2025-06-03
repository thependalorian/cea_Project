'use client';

import { useState, useRef } from 'react';

/**
 * Enhanced Chat Component - Climate Economy Assistant
 * 
 * Provides structured chat interface with:
 * - Source citations and references
 * - Actionable items with direct links
 * - Contextual follow-up questions
 * - Intelligent suggestions
 * - Plain text responses (no markdown)
 * 
 * Location: /components/enhanced-chat.tsx
 */

interface SourceReference {
  title: string;
  url?: string;
  partner_name: string;
  content_type: string;
  relevance_score?: number;
}

interface ActionableItem {
  action: string;
  title: string;
  url?: string;
  description: string;
  partner_name?: string;
}

interface FollowUpQuestion {
  question: string;
  category: string;
  context: string;
}

interface EnhancedChatResponse {
  content: string;
  role: string;
  sources: SourceReference[];
  actionable_items: ActionableItem[];
  follow_up_questions: FollowUpQuestion[];
  context_summary?: string;
  suggestions: string[];
}

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  response?: EnhancedChatResponse;
  timestamp: Date;
}

export default function EnhancedChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input,
          role: 'user',
          context: 'climate_career'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: EnhancedChatResponse = await response.json();
      
      const assistantMessage: ChatMessage = {
        content: data.content,
        role: 'assistant',
        response: data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        content: "I'm sorry, I encountered an error. Please try again or ask about specific climate economy topics.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const getActionIcon = (action: string) => {
    const icons = {
      'apply': '📝',
      'learn_more': '📚',
      'contact': '📞',
      'explore': '🔍'
    };
    return icons[action as keyof typeof icons] || '🔗';
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      'job': '💼',
      'education': '🎓',
      'knowledge': '📚',
      'partner_info': '🏢'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          🌍 Climate Career Assistant
        </h1>
        <p className="text-base-content/70">
          Get personalized guidance with sources, actions, and next steps
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
            <p className="text-base-content/70 mb-4">
              Ask about climate jobs, training programs, or career advice
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['MassCEC internships', 'solar technician jobs', 'clean energy training', 'climate career paths'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="btn btn-outline btn-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
            </div>
            
            <div className="chat-bubble max-w-none">
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Enhanced response components */}
              {message.response && (
                <div className="mt-4 space-y-4">
                  
                  {/* Context Summary */}
                  {message.response.context_summary && (
                    <div className="alert alert-info">
                      <span className="text-sm">{message.response.context_summary}</span>
                    </div>
                  )}

                  {/* Sources */}
                  {message.response.sources.length > 0 && (
                    <div className="bg-base-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        📚 Sources & References
                      </h4>
                      <div className="space-y-2">
                        {message.response.sources.map((source, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span>{getContentTypeIcon(source.content_type)}</span>
                            <div className="flex-1">
                              <div className="font-medium">{source.title}</div>
                              <div className="text-base-content/70">
                                by {source.partner_name}
                                {source.relevance_score && (
                                  <span className="ml-2 badge badge-xs">
                                    {Math.round(source.relevance_score * 100)}% match
                                  </span>
                                )}
                              </div>
                              {source.url && (
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="link link-primary text-xs"
                                >
                                  View source →
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actionable Items */}
                  {message.response.actionable_items.length > 0 && (
                    <div className="bg-success/10 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        ⚡ Take Action
                      </h4>
                      <div className="space-y-2">
                        {message.response.actionable_items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-lg">{getActionIcon(item.action)}</span>
                            <div className="flex-1">
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-base-content/70">{item.description}</div>
                            </div>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary"
                              >
                                {item.action === 'apply' ? 'Apply' : 'Learn More'}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {message.response.follow_up_questions.length > 0 && (
                    <div className="bg-warning/10 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        🤔 Explore Further
                      </h4>
                      <div className="space-y-2">
                        {message.response.follow_up_questions.map((question, idx) => (
                          <button
                            key={idx}
                            className="btn btn-outline btn-sm w-full text-left justify-start"
                            onClick={() => handleFollowUpClick(question.question)}
                          >
                            <span className="truncate">{question.question}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.response.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium">Try asking about:</span>
                      {message.response.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="btn btn-xs btn-ghost"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="chat-footer opacity-50 text-xs">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                🤖
              </div>
            </div>
            <div className="chat-bubble">
              <div className="flex items-center gap-2">
                <span className="loading loading-dots loading-sm"></span>
                Searching climate economy resources...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="form-control">
        <div className="input-group">
          <input
            type="text"
            placeholder="Ask about climate jobs, training, or career advice..."
            className="input input-bordered flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              '💬 Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 