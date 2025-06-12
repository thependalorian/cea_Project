"use client";

/**
 * Climate Chat Component - Climate Economy Assistant
 * Advanced 7-agent AI chat interface for job seekers and career guidance
 * Location: components/chat/ClimateChat.tsx
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  User, 
  Shield, 
  Globe, 
  Leaf, 
  FileText, 
  Heart, 
  Briefcase, 
  PenTool,
  Upload,
  Maximize2,
  Minimize2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClimateChatProps {
  variant?: 'sidebar' | 'modal' | 'fullscreen' | 'embedded';
  defaultOpen?: boolean;
  userContext?: {
    userType: 'job_seeker' | 'partner' | 'admin';
    profile?: any;
    preferences?: any;
  };
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  specialist?: string;
  timestamp: Date;
}

export function ClimateChat({ 
  variant = 'sidebar', 
  defaultOpen = false,
  userContext 
}: ClimateChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVisible, setIsVisible] = useState(defaultOpen);
  const [activeAgent, setActiveAgent] = useState('pendo');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [conversationId] = useState(`conv_${Date.now()}`);
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Client-side timestamp rendering to fix hydration issues
  const [isClient, setIsClient] = useState(false);
  
  // Supabase client for authentication
  const supabase = createClient();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        type: 'assistant',
        content: `🌱 Welcome to the Climate Economy Assistant! I'm Pendo, your AI supervisor coordinating our 7-agent team.

Our specialists are ready to help:
• 🎯 **Marcus** - Veterans & Military Transition
• 🌍 **Liv** - International Professionals  
• 🌿 **Miguel** - Environmental Justice
• 📋 **Jasmine** - Massachusetts Resources
• ❤️ **Alex** - Emotional Support & Guidance
• 💼 **Lauren** - Climate Career Specialist
• ✍️ **Mai** - Resume & Application Expert

How can our team help you navigate your climate economy career today?`,
        specialist: 'Pendo',
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAgentStatus('thinking');

    try {
      // Get auth token from Supabase session instead of localStorage
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('🔐 Session error:', sessionError);
      }

      // Check if user is authenticated
      if (!session?.access_token) {
        throw new Error('Authentication required. Please log in to continue.');
      }

      // Prepare headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'User-Agent': 'ClimateEconomyAssistant/1.0',
        'X-Requested-With': 'XMLHttpRequest',
      };

      console.log('🔄 Sending message to backend:', {
        url: `${backendUrl}/api/chat`,
        headers: Object.keys(headers),
        hasAuth: !!session?.access_token,
        messageLength: inputMessage.length,
        userEmail: session?.user?.email || 'anonymous'
      });

      // Call your FastAPI backend directly with correct ChatRequest format
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: inputMessage, // FastAPI expects 'message' field
          conversation_id: conversationId,
          context: {
            access_token: session.access_token, // Include access token in context
            user_type: userContext?.userType || 'job_seeker',
            user_id: session?.user?.id,
            user_email: session?.user?.email,
            profile: userContext?.profile,
            preferences: userContext?.preferences,
            timestamp: new Date().toISOString(),
            session_id: conversationId
          },
          stream: false
        })
      });

      console.log('📡 Backend response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`Authentication failed. Please log in again. Status: ${response.status}`);
        } else if (response.status === 403) {
          throw new Error(`Access denied. Please ensure you're logged in as a job seeker. Status: ${response.status}`);
        } else if (response.status === 404) {
          throw new Error(`Backend endpoint not found. Status: ${response.status}. Ensure FastAPI server is running on ${backendUrl}`);
        } else if (response.status >= 500) {
          throw new Error(`Backend server error. Status: ${response.status}. Check FastAPI logs for details.`);
        } else {
          throw new Error(`Backend error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Backend data received:', {
        hasContent: !!data.content,
        specialist: data.specialist,
        responseLength: data.content?.length || 0
      });

      const assistantMessage: Message = {
        type: 'assistant',
        content: data.content || data.response || 'I apologize, but I had trouble processing your request.',
        specialist: data.specialist || 'Pendo',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setActiveAgent(data.specialist?.toLowerCase() || 'pendo');
      setAgentStatus('idle');

    } catch (error) {
      console.error('❌ Chat error:', error);
      
      let errorContent = `I'm having trouble connecting to our backend system. `;
      
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        errorContent += `

🔐 **Authentication Issue:**
- You may need to log in as a job seeker
- Session may have expired
- Check if auth token is present in your browser

🛠️ **Debug Info:**
- Backend URL: ${backendUrl}
- Auth Token Present: ${!!(await supabase.auth.getSession()).data.session?.access_token}
- User Context: ${userContext?.userType || 'none'}

**For Developers:**
JWT token authentication is now properly configured. Check FastAPI logs for detailed error information.`;
      } else if (error instanceof Error && error.message.includes('fetch')) {
        errorContent += `

🌐 **Connection Issue:**
- Backend server may not be running
- Check if FastAPI is running on ${backendUrl}
- Verify network connectivity

**For Developers:**
Start the FastAPI backend with: \`uvicorn main:app --reload --port 8000\``;
      } else {
        errorContent += `

❌ **Unexpected Error:**
${error instanceof Error ? error.message : 'Unknown error occurred'}

**For Developers:**
Check browser console and FastAPI logs for more details.`;
      }

      const errorMessage: Message = {
        type: 'assistant',
        content: errorContent,
        specialist: 'System',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setAgentStatus('idle');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle resume upload
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const uploadMessage: Message = {
        type: 'user',
        content: `📄 Uploaded resume: ${file.name}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, uploadMessage]);
      
      // Simulate AI response for resume upload
      setTimeout(() => {
        const responseMessage: Message = {
          type: 'assistant',
          content: `✅ I've received your resume "${file.name}". Let me analyze it for climate economy opportunities...

🔍 **Resume Analysis:**
- Extracting skills and experience
- Matching with climate job opportunities
- Identifying skill gaps and training recommendations
- Preparing personalized career guidance

This may take a moment. I'll provide detailed feedback shortly!`,
          specialist: 'Mai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
    }
  };

  const getAgentIcon = (agent: string) => {
    const icons: Record<string, any> = {
      pendo: Shield,
      marcus: User,
      liv: Globe,
      miguel: Leaf,
      jasmine: FileText,
      alex: Heart,
      lauren: Briefcase,
      mai: PenTool
    };
    const Icon = icons[agent] || MessageCircle;
    return <Icon className="w-6 h-6" />;
  };

  // Format timestamp only on client side to prevent hydration issues
  const formatTimestamp = (timestamp: Date) => {
    if (!isClient) return '';
    return timestamp.toLocaleTimeString();
  };

  // Determine container styles based on variant and maximized state
  const getContainerStyles = () => {
    if (variant === 'embedded') {
      return isMaximized ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        height: '100vh',
        width: '100vw',
        background: 'white'
      } : {
        height: '100%',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column' as const
      };
    }
    return {};
  };

  const getChatWrapperStyles = () => {
    if (variant === 'embedded') {
      return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        background: 'white',
        border: isMaximized ? 'none' : '1px solid #e5e7eb',
        borderRadius: isMaximized ? '0' : '12px',
        boxShadow: isMaximized ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      };
    }
    return {};
  };

  return (
    <div className={`climate-chat-container ${variant}`} style={getContainerStyles()}>
      <AnimatePresence>
        {(isVisible || variant === 'embedded') && (
          <motion.div
            initial={variant === 'embedded' ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={variant === 'embedded' ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: variant === 'embedded' ? 0 : 0.3, 
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            className={`chat-wrapper ${variant === 'embedded' ? 'h-full flex flex-col' : ''}`}
            style={getChatWrapperStyles()}
          >
            {/* Enhanced Agent Status Bar */}
            <div className="agent-status-bar" style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div className="active-agent" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getAgentIcon(activeAgent)}
                <div>
                  <span className="agent-name" style={{ fontWeight: '600', fontSize: '16px' }}>
                    {activeAgent === 'pendo' ? 'Pendo (Supervisor)' : 
                     activeAgent.charAt(0).toUpperCase() + activeAgent.slice(1)}
                  </span>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Climate Economy Assistant
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="system-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`status-dot ${agentStatus}`} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: agentStatus === 'idle' ? '#10b981' : agentStatus === 'thinking' ? '#f59e0b' : '#3b82f6'
                  }}></div>
                  <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{agentStatus}</span>
                </div>
                {variant === 'embedded' && (
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isMaximized ? 'Minimize' : 'Maximize'}
                  >
                    {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Messages Area */}
            <div 
              className={`messages-area ${variant === 'embedded' ? 'flex-1 overflow-y-auto' : ''}`}
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '24px',
                maxHeight: variant === 'embedded' ? 'calc(100% - 140px)' : 'auto',
                background: '#ffffff'
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.type === 'user' ? 'message-user' : 'message-assistant'}`}
                  style={{ 
                    marginBottom: '24px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div className="message-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: message.type === 'user' ? '#3b82f6' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      getAgentIcon(message.specialist?.toLowerCase() || 'pendo')
                    )}
                  </div>
                  <div className="message-content" style={{ flex: 1, minWidth: 0 }}>
                    {message.type === 'assistant' && message.specialist && (
                      <div className="message-specialist" style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {message.specialist} • AI Specialist
                      </div>
                    )}
                    <div className="message-text" style={{ 
                      fontSize: '15px',
                      lineHeight: '1.6',
                      color: '#374151',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {message.content}
                    </div>
                    <div className="message-time" style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginTop: '8px'
                    }}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {agentStatus === 'thinking' && (
                <div className="message message-assistant" style={{ 
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <div className="message-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {getAgentIcon(activeAgent)}
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator" style={{
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                      padding: '12px 0'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#9ca3af',
                        animation: 'pulse 1.4s ease-in-out infinite'
                      }}></span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#9ca3af',
                        animation: 'pulse 1.4s ease-in-out 0.2s infinite'
                      }}></span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#9ca3af',
                        animation: 'pulse 1.4s ease-in-out 0.4s infinite'
                      }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area */}
            <div className="input-area" style={{ 
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}>
              <div className="input-wrapper" style={{ 
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Upload resume, ask for recommendations, or get career guidance..."
                    className="chat-input"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      maxHeight: '120px',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      lineHeight: '1.5'
                    }}
                    disabled={agentStatus === 'thinking'}
                    rows={1}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}>
                    <Upload className="w-5 h-5" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || agentStatus === 'thinking'}
                    className="send-button"
                    style={{
                      padding: '12px',
                      background: inputMessage.trim() && agentStatus !== 'thinking' ? '#10b981' : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: inputMessage.trim() && agentStatus !== 'thinking' ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {variant === 'embedded' && (
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '12px',
                  textAlign: 'center'
                }}>
                  💡 Try: "Help me transition to clean energy" • "Analyze my background" • "Find green jobs in MA"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Toggle Button with Agent Indicator - Only for sidebar variant */}
      {variant === 'sidebar' && (
        <motion.button
          onClick={() => setIsVisible(!isVisible)}
          className="chat-toggle-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#10b981',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 40
          }}
        >
          {getAgentIcon(activeAgent)}
          {agentStatus === 'thinking' && (
            <motion.div
              className="status-indicator thinking"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#f59e0b'
              }}
            />
          )}
          <div className="agent-counter" style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#3b82f6',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>7</div>
        </motion.button>
      )}
    </div>
  );
} 