/**
 * AI Assistant Chat Bubble Component
 * Modern 2025 component inspired by Jarvis (Iron Man) and Samantha (Her) with ACT brand guidelines
 * Location: components/chat/AIAssistantChatBubble.tsx
 */

"use client";

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AIAssistantChatBubbleProps {
  message: string;
  isProcessing?: boolean;
  isTyping?: boolean;
  timestamp?: Date;
  sources?: { title: string; url?: string }[];
  avatar?: string;
  className?: string;
  isSender?: boolean;
  actionItems?: { text: string; action: () => void }[];
  contextAwareness?: string;
}

export const AIAssistantChatBubble = ({
  message,
  isProcessing = false,
  isTyping = false,
  timestamp,
  sources,
  avatar = "/ai-assistant-avatar.png",
  className,
  isSender = false,
  actionItems = [],
  contextAwareness
}: AIAssistantChatBubbleProps) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Animate text typing effect for assistant messages
  useEffect(() => {
    if (!isTyping || isSender) {
      setDisplayedMessage(message);
      return;
    }
    
    let index = 0;
    const timer = setInterval(() => {
      if (index <= message.length) {
        setDisplayedMessage(message.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 15); // Adjust speed as needed
    
    return () => clearInterval(timer);
  }, [message, isTyping, isSender]);
  
  // Format timestamp
  const formattedTime = timestamp ? new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(timestamp) : '';
  
  const fullTimestamp = timestamp ? new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(timestamp) : '';
  
  // Holographic processing effect
  const processingVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [0.98, 1, 0.98],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 mb-4",
        isSender ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      {!isSender && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-ios-full overflow-hidden bg-seafoam-blue border-2 border-spring-green flex items-center justify-center">
            {avatar ? (
              <Image src={avatar} alt="AI Assistant" width={40} height={40} />
            ) : (
              <span className="text-lg">🤖</span>
            )}
          </div>
          {isProcessing && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-ios-blue rounded-full animate-pulse" />
          )}
        </motion.div>
      )}
      
      {/* Message Bubble */}
      <motion.div
        ref={bubbleRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={isProcessing ? "animate" : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative max-w-[80%] px-4 py-3 rounded-ios-lg shadow-ios-subtle",
          isSender ? 
            "bg-spring-green text-midnight-forest" : 
            "bg-white/90 backdrop-blur-ios text-midnight-forest border border-white/25"
        )}
        variants={isProcessing ? processingVariants : undefined}
      >
        {/* Glass Effect Highlight - only for AI messages */}
        {!isSender && (
          <div className="absolute inset-0 rounded-ios-lg bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        )}
        
        {/* Text Content */}
        <div className="relative z-10">
          <p className="whitespace-pre-wrap font-sf-pro text-sm leading-relaxed">
            {displayedMessage}
            {isTyping && !isSender && displayedMessage !== message && (
              <span className="inline-flex items-center">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse delay-75">.</span>
                <span className="animate-pulse delay-150">.</span>
              </span>
            )}
          </p>
          
          {/* Context Awareness */}
          {contextAwareness && !isSender && (
            <div className="mt-2 text-xs text-midnight-forest/70 italic border-l-2 border-spring-green pl-2">
              {contextAwareness}
            </div>
          )}
          
          {/* Action Items */}
          {actionItems && actionItems.length > 0 && !isSender && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actionItems.map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.action}
                  className="text-xs px-3 py-1.5 rounded-ios-full bg-spring-green/20 text-midnight-forest hover:bg-spring-green/30 transition-colors font-medium"
                >
                  {item.text}
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Sources */}
          {sources && sources.length > 0 && !isSender && (
            <div className="mt-2 pt-2 border-t border-midnight-forest/10">
              <p className="text-xs font-medium text-midnight-forest/70 mb-1">Sources:</p>
              <ul className="space-y-1">
                {sources.map((source, index) => (
                  <li key={index} className="text-xs">
                    {source.url ? (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-moss-green hover:underline inline-flex items-center"
                      >
                        {source.title}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span>{source.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Timestamp */}
          <div 
            className={cn(
              "text-[10px] text-midnight-forest/50 mt-1",
              isSender ? "text-right" : "text-left"
            )}
            onClick={() => setShowFullTimestamp(!showFullTimestamp)}
          >
            {showFullTimestamp ? fullTimestamp : formattedTime}
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 