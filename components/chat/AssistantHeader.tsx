/**
 * Assistant Header Component
 * Header with status indicator and controls for the assistant interface
 * Location: components/chat/AssistantHeader.tsx
 */

"use client";

import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Bot, 
  Zap, 
  Clock, 
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IOSContainer } from '@/components/layout/IOSLayout';

interface AssistantHeaderProps {
  status: 'ready' | 'processing' | 'streaming';
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onSettings?: () => void;
  onHelp?: () => void;
}

export const AssistantHeader = ({
  status,
  onToggleSidebar,
  isSidebarOpen,
  onSettings,
  onHelp
}: AssistantHeaderProps) => {

  // Status configurations
  const statusConfig = {
    ready: {
      icon: Bot,
      text: 'Ready to assist',
      color: 'spring-green',
      pulse: false
    },
    processing: {
      icon: Clock,
      text: 'Processing your request...',
      color: 'ios-orange',
      pulse: true
    },
    streaming: {
      icon: Zap,
      text: 'AI responding...',
      color: 'seafoam-blue',
      pulse: true
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    static: {
      scale: 1,
      opacity: 1
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 border-b border-midnight-forest/10 bg-white/95 backdrop-blur-ios"
    >
      <IOSContainer variant="glass" padding="lg">
        <div className="flex items-center justify-between">
          {/* Left Side - Sidebar Toggle & Status */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-midnight-forest/60 hover:text-midnight-forest hover:bg-midnight-forest/5 rounded-ios-lg transition-colors"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <motion.div
                variants={pulseVariants}
                animate={currentStatus.pulse ? "pulse" : "static"}
                className={cn(
                  "p-2 rounded-ios-lg flex items-center justify-center",
                  currentStatus.color === 'spring-green' && "bg-spring-green/10 text-spring-green",
                  currentStatus.color === 'ios-orange' && "bg-ios-orange/10 text-ios-orange",
                  currentStatus.color === 'seafoam-blue' && "bg-seafoam-blue/10 text-seafoam-blue"
                )}
              >
                <StatusIcon className="h-5 w-5" />
              </motion.div>

              <div className="flex flex-col">
                <h1 className="text-ios-title-3 text-midnight-forest font-semibold">
                  Climate Economy Assistant
                </h1>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={currentStatus.pulse ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                    transition={currentStatus.pulse ? { duration: 1.5, repeat: Infinity } : {}}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      currentStatus.color === 'spring-green' && "bg-spring-green",
                      currentStatus.color === 'ios-orange' && "bg-ios-orange",
                      currentStatus.color === 'seafoam-blue' && "bg-seafoam-blue"
                    )}
                  />
                  <span className="text-ios-caption-1 text-midnight-forest/60">
                    {currentStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {/* AI Features Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 rounded-ios-lg border border-spring-green/20">
              <Sparkles className="h-3 w-3 text-spring-green" />
              <span className="text-ios-caption-1 font-medium text-midnight-forest">
                AI-Powered
              </span>
            </div>

            {/* Help Button */}
            {onHelp && (
              <button
                onClick={onHelp}
                className="p-2 text-midnight-forest/60 hover:text-midnight-forest hover:bg-midnight-forest/5 rounded-ios-lg transition-colors"
                title="Help & Information"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            )}

            {/* Settings Button */}
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2 text-midnight-forest/60 hover:text-midnight-forest hover:bg-midnight-forest/5 rounded-ios-lg transition-colors"
                title="Assistant Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Status Bar for Streaming */}
        {status === 'streaming' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-midnight-forest/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-1 bg-midnight-forest/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-spring-green to-seafoam-blue"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
              <span className="text-ios-caption-2 text-midnight-forest/50">
                Generating response...
              </span>
            </div>
          </motion.div>
        )}

        {/* Processing Dots for Processing State */}
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-midnight-forest/10"
          >
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-ios-orange rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </IOSContainer>
    </motion.header>
  );
}; 