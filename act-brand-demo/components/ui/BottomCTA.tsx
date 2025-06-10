/**
 * Bottom CTA Component - Alliance for Climate Transition
 * Consistent bottom call-to-action section for all pages
 * Location: act-brand-demo/components/ui/BottomCTA.tsx
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTButton } from './ACTButton';
import { ACTFrameElement } from './ACTFrameElement';

interface BottomCTAProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  variant?: 'default' | 'gradient' | 'minimal' | 'dark' | 'glass' | 'frosted';
  backgroundImage?: string;
  className?: string;
  animated?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
}

export function BottomCTA({
  title = "Ready to Transform Your Climate Impact?",
  subtitle = "Join the Alliance for Climate Transition and build the sustainable future.",
  primaryCTA = {
    text: "Get Started",
    href: "/get-started",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    )
  },
  secondaryCTA = {
    text: "Learn More",
    href: "/about"
  },
  variant = 'default',
  backgroundImage,
  className,
  animated = true,
  compact = false,
  fullWidth = false
}: BottomCTAProps) {
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-gradient-to-br from-spring-green/10 via-seafoam-blue/5 to-moss-green/10 border border-spring-green/20 shadow-ios-subtle',
    gradient: 'bg-gradient-to-br from-midnight-forest via-moss-green to-spring-green/20 text-white shadow-ios-normal',
    minimal: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    dark: 'bg-midnight-forest text-white shadow-ios-normal',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 text-white shadow-ios-normal',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal'
  };

  // Text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'gradient':
      case 'dark':
      case 'glass':
        return 'text-white';
      case 'frosted':
        return 'text-midnight-forest dark:text-white';
      default:
        return 'text-midnight-forest';
    }
  };

  // Subtitle color based on variant
  const getSubtitleColor = () => {
    switch (variant) {
      case 'gradient':
      case 'dark':
      case 'glass':
        return 'text-white/80';
      case 'frosted':
        return 'text-midnight-forest/70 dark:text-white/70';
      default:
        return 'text-midnight-forest/70';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  const Container = animated ? motion.section : 'section';
  const Content = animated ? motion.div : 'div';
  const Title = animated ? motion.h2 : 'h2';
  const Subtitle = animated ? motion.p : 'p';
  const ButtonContainer = animated ? motion.div : 'div';

  const animationProps = animated ? {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.3 },
    variants: containerVariants
  } : {};

  return (
    <Container 
      className={cn(
        compact ? "py-8" : "py-16",
        fullWidth ? "w-full" : "container mx-auto px-4",
        className
      )}
      {...animationProps}
    >
      <div className={fullWidth ? "px-4" : ""}>
        <ACTFrameElement
          variant="full"
          size={compact ? "lg" : "xl"}
          className={cn(
            "relative overflow-hidden text-center",
            variantStyles[variant]
          )}
        >
          {/* Background image overlay */}
          {backgroundImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 24, 24, 0.7), rgba(57, 72, 22, 0.7)), url(${backgroundImage})`
              }}
            />
          )}
          
          {/* Content */}
          <Content className="relative z-10">
            <Title 
              className={cn(
                "font-sf-pro-rounded font-bold tracking-tight mb-4",
                compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl lg:text-5xl",
                getTextColor()
              )}
              {...(animated ? { variants: itemVariants } : {})}
            >
              {title}
            </Title>
            
            <Subtitle 
              className={cn(
                "font-sf-pro max-w-3xl mx-auto mb-8",
                compact ? "text-base md:text-lg" : "text-lg md:text-xl",
                getSubtitleColor()
              )}
              {...(animated ? { variants: itemVariants } : {})}
            >
              {subtitle}
            </Subtitle>
            
            <ButtonContainer 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              {...(animated ? { variants: buttonVariants } : {})}
            >
              {/* Primary CTA */}
              <ACTButton
                variant="primary"
                size={compact ? "md" : "lg"}
                href={primaryCTA.href}
                className="font-sf-pro-rounded font-medium"
                iconPosition="right"
                icon={primaryCTA.icon}
              >
                {primaryCTA.text}
              </ACTButton>
              
              {/* Secondary CTA */}
              {secondaryCTA && (
                <ACTButton
                  variant={
                    variant === 'gradient' || variant === 'dark' || variant === 'glass' 
                      ? 'glass' 
                      : 'outline'
                  }
                  size={compact ? "md" : "lg"}
                  href={secondaryCTA.href}
                  className="font-sf-pro-rounded font-medium"
                  iconPosition="right"
                  icon={secondaryCTA.icon}
                >
                  {secondaryCTA.text}
                </ACTButton>
              )}
            </ButtonContainer>
          </Content>
        </ACTFrameElement>
      </div>
    </Container>
  );
} 