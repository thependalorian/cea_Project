"use client";

/**
 * ACT Card Component - Alliance for Climate Transition
 * Modern 2025 card implementation with iOS-inspired glass effects
 * Location: components/ui/ACTCard.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type CardVariant = 
  | 'default' 
  | 'outlined' 
  | 'framed'
  | 'bracketed'
  | 'gradient'
  | 'glass'
  | 'frosted';

interface ACTCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  image?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: CardVariant;
  href?: string;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  compact?: boolean;
  hover?: boolean;
  alignCenter?: boolean;
  elevated?: boolean;
}

export function ACTCard({
  title,
  description,
  image,
  icon,
  footer,
  actions,
  variant = 'default',
  href,
  className,
  contentClassName,
  children,
  compact = false,
  hover = true,
  alignCenter = false,
  elevated = false,
}: ACTCardProps) {
  // Base styles for all cards
  const baseStyles = "relative transition-all duration-300 overflow-hidden";
  
  // Define variant styles with iOS-inspired design
  const variantStyles = {
    default: "bg-white border border-sand-gray/30 rounded-ios-lg shadow-ios-subtle",
    outlined: "bg-white border-3 border-spring-green rounded-ios-lg",
    framed: "bg-white rounded-ios-lg",
    bracketed: "bg-white p-0 rounded-ios-lg",
    gradient: "p-0.5 bg-gradient-to-br from-spring-green via-seafoam-blue to-moss-green rounded-ios-lg",
    glass: "bg-white/15 backdrop-blur-ios border border-white/25 rounded-ios-xl shadow-ios-subtle",
    frosted: "bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/25 dark:border-white/10 rounded-ios-xl shadow-ios-subtle"
  };
  
  // Hover effects
  const hoverStyles = hover ? "hover:shadow-ios-normal hover:-translate-y-1" : "";
  
  // Elevation styles
  const elevationStyles = elevated ? "shadow-ios-prominent" : "";
  
  // Padding based on compactness
  const paddingStyles = compact ? "p-4" : "p-6";
  
  // Text alignment
  const alignmentStyles = alignCenter ? "text-center" : "text-left";
  
  // Combined card styles
  const cardStyles = cn(
    baseStyles,
    variantStyles[variant],
    hoverStyles,
    elevationStyles,
    variant !== 'framed' && variant !== 'bracketed' && variant !== 'gradient' && paddingStyles,
    className
  );
  
  // Card content
  const cardContent = (
    <>
      {/* Bracket decorations if bracketed variant */}
      {variant === 'bracketed' && (
        <>
          <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-spring-green rounded-tl-sm"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-spring-green rounded-tr-sm"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-spring-green rounded-bl-sm"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-spring-green rounded-br-sm"></div>
        </>
      )}
      
      {/* Gradient variant inner content */}
      {variant === 'gradient' && (
        <div className="bg-white rounded-ios-lg h-full w-full">
          {renderCardContent()}
        </div>
      )}
      
      {/* Framed variant */}
      {variant === 'framed' && (
        <div className="border-l-4 border-spring-green pl-4 h-full">
          {renderCardContent()}
        </div>
      )}
      
      {/* All other variants */}
      {variant !== 'framed' && variant !== 'gradient' && (
        renderCardContent()
      )}
    </>
  );
  
  // Render the card content internal helper
  function renderCardContent() {
    return (
      <>
        {/* Image at the top if provided */}
        {image && (
          <div className={cn(
            "relative overflow-hidden", 
            variant !== 'framed' && variant !== 'glass' && variant !== 'frosted' && "-mt-6 -mx-6 mb-4",
            variant === 'glass' || variant === 'frosted' ? "rounded-ios-lg mb-4" : ""
          )}>
            {image}
          </div>
        )}
        
        <div className={cn(
          "flex flex-col", 
          variant === 'bracketed' ? "p-6" : "", 
          variant === 'gradient' ? "p-6" : "",
          alignmentStyles,
          contentClassName
        )}>
          {/* Icon and title row */}
          <div className={cn("flex", alignCenter ? "justify-center" : "justify-between", "items-center mb-3")}>
            {icon && (
              <div className={cn(
                "flex-shrink-0", 
                title ? "mr-3" : "",
                variant === 'glass' || variant === 'frosted' ? "p-2 bg-white/20 backdrop-blur-ios-light rounded-full" : ""
              )}>
                {icon}
              </div>
            )}
            
            {title && (
              <h3 className="text-title font-sf-pro font-medium text-midnight-forest dark:text-white">
                {title}
              </h3>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <div className="text-body font-sf-pro text-midnight-forest/70 dark:text-white/70 mb-4">
              {description}
            </div>
          )}
          
          {/* Additional content */}
          {children && (
            <div className="flex-grow mb-4">
              {children}
            </div>
          )}
          
          {/* Actions */}
          {actions && (
            <div className={cn("flex", alignCenter ? "justify-center" : "justify-end", "mt-auto mb-2")}>
              {actions}
            </div>
          )}
          
          {/* Footer */}
          {footer && (
            <div className={cn(
              "mt-auto", 
              alignCenter ? "" : "pt-4 border-t border-sand-gray/20",
              variant === 'glass' || variant === 'frosted' ? "border-white/15" : ""
            )}>
              {footer}
            </div>
          )}
        </div>
      </>
    );
  }
  
  // Use motion.div for animation
  const CardComponent = motion.div;
  
  // Animation properties
  const motionProps = {
    whileHover: hover ? { scale: 1.01 } : {},
    transition: { duration: 0.2 }
  };
  
  // Return the card
  if (href) {
    return (
      <Link href={href} className="block no-underline">
        <CardComponent className={cardStyles} {...motionProps}>
          {cardContent}
        </CardComponent>
      </Link>
    );
  }
  
  return (
    <CardComponent className={cardStyles} {...motionProps}>
      {cardContent}
    </CardComponent>
  );
} 