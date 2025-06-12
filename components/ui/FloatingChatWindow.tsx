/**
 * Floating Chat Window Component
 * A fixed-position chat interface that appears as an overlay
 * Location: components/ui/FloatingChatWindow.tsx
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  avatar?: string;
}

interface FloatingChatWindowProps {
  className?: string;
  defaultOpen?: boolean;
  botName?: string;
  botAvatar?: string;
}

export function FloatingChatWindow({
  className,
  defaultOpen = false,
  botName = "Pendo",
  botAvatar = "/images/avatars/avatar.png"
}: FloatingChatWindowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I\'m Pendo, your Climate Economy Supervisor. I\'m here to help you navigate your climate career journey. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple bot response logic (replace with actual AI integration)
  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('career') || input.includes('job')) {
      return "I'd be happy to help you explore climate career opportunities! I can connect you with our specialized agents or help you get started with career matching. What specific area interests you most?";
    } else if (input.includes('skill') || input.includes('experience')) {
      return "Great question about skills! Our Skills Translation tool can help you see how your existing experience applies to climate careers. Would you like me to guide you through that process?";
    } else if (input.includes('hello') || input.includes('hi')) {
      return "Hello! Welcome to the Climate Economy Assistant. I'm here to help you find your path in Massachusetts' growing clean energy sector. What brings you here today?";
    } else {
      return "That's an interesting question! I can help you with climate career guidance, skills translation, and connecting with the right opportunities. Could you tell me more about what you're looking for?";
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button - Simplified */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl flex items-center justify-center transition-all duration-300"
          style={{ backgroundColor: '#B2DE26' }}
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window - Simplified */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
            isMinimized ? "h-16" : "h-[500px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                  <Image
                    src={botAvatar}
                    alt={`${botName} avatar`}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-green-500 text-white text-lg font-bold flex items-center justify-center"
                    style={{ display: 'none', backgroundColor: '#B2DE26' }}
                  >
                    P
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {botName}
                </h3>
                <p className="text-xs text-green-600">
                  Climate Economy Supervisor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area - Only show when not minimized */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[340px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* Bot Avatar */}
                    {message.sender === 'bot' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center" 
                             style={{ backgroundColor: '#B2DE26' }}>
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={cn(
                      "max-w-[75%] flex flex-col",
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    )}>
                      <div className={cn(
                        "p-3 rounded-xl text-sm",
                        message.sender === 'user'
                          ? 'bg-green-500 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      )}
                      style={message.sender === 'user' ? { backgroundColor: '#B2DE26', color: '#001818' } : {}}
                      >
                        {message.content}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-1">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    {/* User Avatar */}
                    {message.sender === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                           style={{ backgroundColor: '#B2DE26' }}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="max-w-[75%]">
                      <div className="p-3 rounded-xl rounded-tl-sm bg-gray-100">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', backgroundColor: '#B2DE26' }}></div>
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms', backgroundColor: '#B2DE26' }}></div>
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', backgroundColor: '#B2DE26' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 resize-none rounded-xl p-3 max-h-20 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all duration-200"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-3 rounded-full flex-shrink-0 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    style={{ backgroundColor: '#B2DE26' }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
} 