/**
 * Quick Actions Component
 * Interactive action buttons for common assistant interactions
 * Location: components/chat/QuickActions.tsx
 */

"use client";

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IOSContainer, IOSGrid } from '@/components/layout/IOSLayout';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  prompt: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionSelect: (prompt: string) => void;
  className?: string;
  layout?: 'row' | 'grid';
  size?: 'sm' | 'md' | 'lg';
}

export const QuickActions = ({ 
  actions, 
  onActionSelect, 
  className,
  layout = 'grid',
  size = 'md'
}: QuickActionsProps) => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const actionVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  // Get color classes for each action
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      'spring-green': {
        bg: 'bg-spring-green/10',
        text: 'text-spring-green',
        border: 'border-spring-green/20',
        hover: 'hover:bg-spring-green/15'
      },
      'moss-green': {
        bg: 'bg-moss-green/10',
        text: 'text-moss-green',
        border: 'border-moss-green/20',
        hover: 'hover:bg-moss-green/15'
      },
      'seafoam-blue': {
        bg: 'bg-seafoam-blue/10',
        text: 'text-seafoam-blue',
        border: 'border-seafoam-blue/20',
        hover: 'hover:bg-seafoam-blue/15'
      },
      'ios-blue': {
        bg: 'bg-ios-blue/10',
        text: 'text-ios-blue',
        border: 'border-ios-blue/20',
        hover: 'hover:bg-ios-blue/15'
      },
      'midnight-forest': {
        bg: 'bg-midnight-forest/10',
        text: 'text-midnight-forest',
        border: 'border-midnight-forest/20',
        hover: 'hover:bg-midnight-forest/15'
      },
      'ios-orange': {
        bg: 'bg-ios-orange/10',
        text: 'text-ios-orange',
        border: 'border-ios-orange/20',
        hover: 'hover:bg-ios-orange/15'
      }
    };

    return colorMap[color] || colorMap['spring-green'];
  };

  // Row layout (compact, horizontal scroll)
  if (layout === 'row') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("w-full flex items-center gap-2 overflow-x-auto", className)}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colors = getColorClasses(action.color);
          return (
            <motion.button
              key={index}
              variants={actionVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onActionSelect(action.prompt)}
              className={cn(
                "flex flex-col items-center justify-center cursor-pointer border group transition-all duration-200",
                colors.bg,
                colors.border,
                colors.hover,
                "hover:shadow-ios-normal",
                size === 'sm' ? 'w-28 h-28 p-2 rounded-lg' : 'w-36 h-36 p-4 rounded-xl'
              )}
              style={{ minWidth: size === 'sm' ? 96 : 144 }}
            >
              <div className={cn(
                "flex items-center justify-center rounded-full mb-2",
                size === 'sm' ? 'w-8 h-8' : 'w-12 h-12',
                colors.bg,
                colors.text
              )}>
                <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} />
              </div>
              <span className={cn(
                "font-semibold text-center",
                size === 'sm' ? 'text-xs' : 'text-base',
                'text-midnight-forest'
              )}>{action.label}</span>
              <span className={cn(
                "text-center mt-1",
                size === 'sm' ? 'text-[10px]' : 'text-xs',
                'text-midnight-forest/60'
              )}>{action.description}</span>
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  // Default grid layout
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("w-full", className)}
    >
      <div className="text-center mb-6">
        <h3 className="text-ios-title-3 text-midnight-forest mb-2">
          Quick Actions
        </h3>
        <p className="text-ios-body text-midnight-forest/60">
          Get started with these common climate career questions
        </p>
      </div>
      <IOSGrid columns={3} gap="lg" responsive>
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colors = getColorClasses(action.color);
          return (
            <motion.div
              key={index}
              variants={actionVariants}
              whileHover="hover"
              whileTap="tap"
              className={cn(
                "cursor-pointer transition-all duration-200 border group rounded-ios-lg",
                colors.bg,
                colors.border,
                colors.hover,
                "hover:shadow-ios-normal"
              )}
              onClick={() => onActionSelect(action.prompt)}
            >
              <IOSContainer
                variant="glass"
                padding="lg"
                className="border-none"
              >
                <div className="text-center">
                  {/* Icon Container */}
                  <div className={cn(
                    "inline-flex items-center justify-center w-12 h-12 rounded-ios-xl mb-4 transition-all duration-200 group-hover:scale-110",
                    colors.bg,
                    colors.text
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {/* Action Label */}
                  <h4 className="text-ios-headline text-midnight-forest font-semibold mb-2">
                    {action.label}
                  </h4>
                  {/* Action Description */}
                  <p className="text-ios-caption-1 text-midnight-forest/60 leading-relaxed">
                    {action.description}
                  </p>
                  {/* Hover Indicator */}
                  <motion.div
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-ios-md text-ios-caption-2 font-medium",
                      colors.text,
                      colors.bg
                    )}>
                      <span>Ask this question</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </IOSContainer>
            </motion.div>
          );
        })}
      </IOSGrid>
      {/* Additional Help Text */}
      <motion.div
        variants={actionVariants}
        className="text-center mt-8"
      >
        <IOSContainer variant="frosted" padding="md" className="inline-block">
          <p className="text-ios-caption-1 text-midnight-forest/50">
            💡 You can also type your own questions or upload documents for personalized advice
          </p>
        </IOSContainer>
      </motion.div>
    </motion.div>
  );
}; 