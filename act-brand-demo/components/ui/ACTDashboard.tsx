"use client";

/**
 * ACT Dashboard Component - Alliance for Climate Transition
 * Modern 2025 analytics dashboard with iOS-inspired design
 * Location: components/ui/ACTDashboard.tsx
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Type definitions
interface DashboardStat {
  label: string;
  value: string | number;
  change?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  color?: string;
}

interface DashboardWidget {
  id: string;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  content: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
}

interface ACTDashboardProps {
  title?: string;
  description?: string;
  stats?: DashboardStat[];
  widgets?: DashboardWidget[];
  actions?: ReactNode;
  filters?: ReactNode;
  layout?: 'grid' | 'masonry' | 'columns';
  className?: string;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
  statVariant?: 'default' | 'glass' | 'frosted' | 'minimal';
  animated?: boolean;
  compact?: boolean;
  dark?: boolean;
}

export function ACTDashboard({
  title,
  description,
  stats = [],
  widgets = [],
  actions,
  filters,
  layout = 'grid',
  className,
  variant = 'default',
  statVariant = 'default',
  animated = true,
  compact = false,
  dark = false,
}: ACTDashboardProps) {
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Wrapper components with or without animation
  const DashboardContainer = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';
  
  const motionProps = animated ? {
    initial: "hidden",
    animate: "visible",
    variants: containerVariants
  } : {};
  
  const itemProps = animated ? {
    variants: itemVariants
  } : {};
  
  // Determine layout class based on chosen layout
  const layoutClass = {
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    masonry: "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6",
    columns: "flex flex-col md:flex-row gap-6",
  }[layout];
  
  // Widget size to grid column span mapping
  const widgetSizeClass = {
    sm: "col-span-1",
    md: "col-span-1 md:col-span-1 lg:col-span-1",
    lg: "col-span-1 md:col-span-2 lg:col-span-2",
    xl: "col-span-1 md:col-span-2 lg:col-span-3",
    full: "col-span-1 md:col-span-2 lg:col-span-4",
  };
  
  return (
    <DashboardContainer className={cn("w-full", className)} {...motionProps}>
      {/* Dashboard header */}
      {(title || description || actions || filters) && (
        <Item className="mb-8" {...itemProps}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Title and description */}
            <div>
              {title && (
                <h2 className={cn(
                  "text-2xl font-sf-pro-rounded font-bold tracking-tight",
                  textColorClass
                )}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={cn(
                  "mt-1 text-sm font-sf-pro",
                  secondaryTextColorClass
                )}>
                  {description}
                </p>
              )}
            </div>
            
            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
          
          {/* Filters */}
          {filters && (
            <div className="mb-6">
              {filters}
            </div>
          )}
        </Item>
      )}
      
      {/* Stats row */}
      {stats.length > 0 && (
        <Item className="mb-8" {...itemProps}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <DashboardStat 
                key={index} 
                stat={stat} 
                variant={statVariant} 
                dark={dark} 
                compact={compact}
                delay={index * 0.1}
                animated={animated}
              />
            ))}
          </div>
        </Item>
      )}
      
      {/* Widgets grid/layout */}
      <div className={layoutClass}>
        {widgets.map((widget, index) => (
          <React.Fragment key={widget.id}>
            {layout === 'grid' ? (
              <Item 
                className={cn(widgetSizeClass[widget.size || 'md'])} 
                {...itemProps} 
                transition={animated ? { delay: 0.2 + (index * 0.1) } : undefined}
              >
                <DashboardWidget 
                  widget={widget} 
                  variant={widget.variant || variant} 
                  dark={dark} 
                  compact={compact}
                  animated={animated}
                />
              </Item>
            ) : layout === 'masonry' ? (
              <Item 
                className="mb-6 break-inside-avoid" 
                {...itemProps}
                transition={animated ? { delay: 0.2 + (index * 0.1) } : undefined}
              >
                <DashboardWidget 
                  widget={widget} 
                  variant={widget.variant || variant} 
                  dark={dark} 
                  compact={compact}
                  animated={animated}
                />
              </Item>
            ) : (
              <Item 
                className={cn(
                  "flex-1", 
                  widget.size === 'sm' ? 'md:w-1/4' : 
                  widget.size === 'lg' ? 'md:w-1/2' : 
                  widget.size === 'xl' ? 'md:w-3/4' : 
                  widget.size === 'full' ? 'md:w-full' : 
                  'md:w-1/3'
                )} 
                {...itemProps}
                transition={animated ? { delay: 0.2 + (index * 0.1) } : undefined}
              >
                <DashboardWidget 
                  widget={widget} 
                  variant={widget.variant || variant} 
                  dark={dark} 
                  compact={compact}
                  animated={animated}
                />
              </Item>
            )}
          </React.Fragment>
        ))}
      </div>
    </DashboardContainer>
  );
}

// Stat card component
function DashboardStat({ 
  stat, 
  variant = 'default',
  dark = false,
  compact = false,
  delay = 0,
  animated = true
}: { 
  stat: DashboardStat, 
  variant?: string,
  dark?: boolean,
  compact?: boolean,
  delay?: number,
  animated?: boolean
}) {
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-normal',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal',
    minimal: 'bg-transparent border border-sand-gray/20',
  };
  
  // Enhanced text color logic for better contrast - FORCE BLACK TEXT
  const textColorClass = 'text-black !text-black';
  
  // Enhanced secondary text color for better contrast - FORCE DARK GRAY TEXT
  const secondaryTextColorClass = 'text-gray-600 !text-gray-600';
  
  // Enhanced change text color for better contrast - FORCE DARK TEXT
  const changeTextColorClass = 'text-gray-700 !text-gray-700';
  
  // Trend styles with better contrast - FORCE VISIBLE COLORS
  const trendStyles = {
    up: 'text-green-600 !text-green-600',
    down: 'text-red-600 !text-red-600',
    neutral: 'text-yellow-600 !text-yellow-600',
  };
  
  // Icon color based on stat.color or default to theme color
  const iconColorClass = stat.color ? `text-${stat.color}` : 'text-spring-green';
  
  // Animation variants
  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        delay 
      } 
    }
  };
  
  const Wrapper = animated ? motion.div : 'div';
  const motionProps = animated ? {
    variants: statVariants
  } : {};
  
  return (
    <Wrapper 
      className={cn(
        "rounded-ios-xl overflow-hidden",
        variantStyles[variant as keyof typeof variantStyles],
        compact ? "p-3" : "p-4"
      )}
      {...motionProps}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-sf-pro-rounded font-medium",
            secondaryTextColorClass
          )}>
            {stat.label}
          </p>
          <p className={cn(
            "text-2xl font-sf-pro font-bold mt-1",
            textColorClass
          )}>
            {stat.value}
          </p>
          
          {stat.change && (
            <div className="flex items-center mt-1">
              {stat.trend === 'up' && (
                <svg className="w-3 h-3 mr-1 text-spring-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              )}
              {stat.trend === 'down' && (
                <svg className="w-3 h-3 mr-1 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
              <span className={cn(
                "text-xs font-sf-pro font-medium",
                stat.trend ? trendStyles[stat.trend] : changeTextColorClass
              )}>
                {stat.change}
              </span>
            </div>
          )}
        </div>
        
        {stat.icon && (
          <div className={cn(
            "p-2 rounded-full",
            "bg-sand-gray/20 dark:bg-white/10",
            iconColorClass
          )}>
            {stat.icon}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

// Widget component
function DashboardWidget({ 
  widget, 
  variant = 'default',
  dark = false,
  compact = false,
  animated = true
}: { 
  widget: DashboardWidget, 
  variant?: string,
  dark?: boolean,
  compact?: boolean,
  animated?: boolean
}) {
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-normal',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal',
    minimal: 'bg-transparent border border-sand-gray/20',
  };
  
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  return (
    <div 
      className={cn(
        "rounded-ios-xl overflow-hidden h-full flex flex-col",
        variantStyles[variant as keyof typeof variantStyles]
      )}
    >
      {/* Widget header */}
      <div className={cn(
        "flex items-center justify-between",
        compact ? "px-3 py-2" : "px-4 py-3",
        "border-b border-sand-gray/10 dark:border-white/10"
      )}>
        <div className="flex items-center gap-2">
          {widget.icon && (
            <div className={cn(
              "p-1 rounded-full",
              "bg-sand-gray/20 dark:bg-white/10",
              textColorClass
            )}>
              {widget.icon}
            </div>
          )}
          <h3 className={cn(
            "font-sf-pro-rounded font-medium",
            compact ? "text-sm" : "text-base",
            textColorClass
          )}>
            {widget.title}
          </h3>
        </div>
        
        {widget.loading && (
          <div className="flex space-x-1">
            <div className="h-1.5 w-1.5 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1.5 w-1.5 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1.5 w-1.5 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
      
      {/* Widget content */}
      <div className={cn(
        "flex-1",
        compact ? "p-3" : "p-4"
      )}>
        {widget.content}
      </div>
      
      {/* Widget footer */}
      {widget.footer && (
        <div className={cn(
          "border-t border-sand-gray/10 dark:border-white/10",
          compact ? "px-3 py-2" : "px-4 py-3",
          secondaryTextColorClass
        )}>
          {widget.footer}
        </div>
      )}
    </div>
  );
} 