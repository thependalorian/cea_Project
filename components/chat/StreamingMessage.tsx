/**
 * Streaming Message Component
 * Displays individual chat messages with streaming animation and modern design
 * Location: components/chat/StreamingMessage.tsx
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bot, 
  ExternalLink, 
  Clock, 
  FileText, 
  Copy, 
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IOSContainer } from '@/components/layout/IOSLayout';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  sources?: Array<{ title: string; url?: string; type?: string }>;
  attachments?: Array<{ name: string; type: string; size: string }>;
  sessionId?: string;
  error?: boolean;
}

interface StreamingMessageProps {
  message: ChatMessage;
  isStreaming: boolean;
}

export const StreamingMessage = ({ message, isStreaming }: StreamingMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [typedContent, setTypedContent] = useState('');

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.error;

  // Streaming text effect
  useEffect(() => {
    if (isStreaming && message.role === 'assistant') {
      const content = message.content;
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex < content.length) {
          setTypedContent(content.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 10); // Typing speed

      return () => clearInterval(typeInterval);
    } else {
      setTypedContent(message.content);
    }
  }, [message.content, isStreaming, message.role]);

  // Copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get avatar icon
  const getAvatarIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    if (isSystem || isError) return <AlertCircle className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  // Get avatar colors
  const getAvatarColors = () => {
    if (isUser) return "bg-spring-green text-white";
    if (isError) return "bg-ios-red text-white";
    if (isSystem) return "bg-ios-orange text-white";
    return "bg-seafoam-blue text-white";
  };

  // Get message container styles
  const getMessageStyles = () => {
    if (isUser) return "ml-12 bg-spring-green/10 border-spring-green/20";
    if (isError) return "mr-12 bg-ios-red/10 border-ios-red/20";
    if (isSystem) return "mx-12 bg-ios-orange/10 border-ios-orange/20";
    return "mr-12 bg-white/80 border-midnight-forest/10";
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-ios-lg flex items-center justify-center shadow-ios-subtle",
        getAvatarColors()
      )}>
        {getAvatarIcon()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <IOSContainer 
          variant="glass" 
          padding="lg" 
          className={cn(
            "border transition-all duration-200",
            getMessageStyles()
          )}
        >
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-ios-caption-1 font-medium text-midnight-forest">
                {isUser ? 'You' : isSystem ? 'System' : 'Climate Assistant'}
              </span>
              <div className="flex items-center gap-1 text-midnight-forest/50">
                <Clock className="h-3 w-3" />
                <span className="text-ios-caption-2">{formatTime(message.timestamp)}</span>
              </div>
            </div>
            
            {/* Copy Button */}
            {message.content && !isStreaming && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 p-1 text-midnight-forest/50 hover:text-midnight-forest transition-all duration-200"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-spring-green" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-midnight-forest/5 rounded-ios-md px-2 py-1"
                >
                  <FileText className="h-3 w-3 text-midnight-forest/60" />
                  <span className="text-ios-caption-2 text-midnight-forest/70">
                    {attachment.name} ({attachment.size})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Message Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-ios-body text-midnight-forest leading-relaxed mb-0 whitespace-pre-wrap">
              {typedContent}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block w-2 h-4 bg-spring-green rounded-sm ml-1"
                />
              )}
            </p>
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-midnight-forest/10">
              <div className="text-ios-caption-1 font-medium text-midnight-forest/70 mb-2">
                Sources:
              </div>
              <div className="space-y-1">
                {message.sources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-spring-green rounded-full flex-shrink-0" />
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ios-caption-1 text-spring-green hover:text-spring-green/80 flex items-center gap-1 transition-colors"
                      >
                        {source.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-ios-caption-1 text-midnight-forest/70">
                        {source.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="mt-3 pt-3 border-t border-midnight-forest/10">
              <div className="flex items-center gap-2 text-ios-caption-2 text-midnight-forest/50">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-spring-green border-t-transparent rounded-full"
                />
                <span>Climate Assistant is thinking...</span>
              </div>
            </div>
          )}
        </IOSContainer>
      </div>
    </motion.div>
  );
}; 