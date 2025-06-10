"use client";

/**
 * ACT Hero Component - Alliance for Climate Transition
 * Modern 2025 hero section implementation with iOS-inspired design elements
 * Location: components/ui/ACTHero.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ACTHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  backgroundImage?: string;
  cta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'split' | 'overlay' | 'minimal' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  contentClassName?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}

export function ACTHero({
  title,
  subtitle,
  description,
  image,
  imageAlt = 'Hero image',
  backgroundImage,
  cta,
  secondaryCta,
  align = 'left',
  variant = 'default',
  size = 'lg',
  className,
  contentClassName,
  imageClassName,
  children,
}: ACTHeroProps) {
  // Base styles
  const baseStyles = "relative overflow-hidden";
  
  // Size styles
  const sizeStyles = {
    sm: 'min-h-[300px]',
    md: 'min-h-[400px]',
    lg: 'min-h-[500px]',
    full: 'min-h-screen',
  };
  
  // Alignment styles
  const alignStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  
  // Content container styles based on variant
  const contentContainerStyles = {
    default: 'relative z-10 w-full max-w-5xl mx-auto px-6 py-16 lg:px-8 lg:py-24',
    split: 'relative z-10 w-full lg:w-1/2 px-6 py-16 lg:px-8 lg:py-24',
    overlay: 'relative z-10 w-full max-w-5xl mx-auto px-6 py-16 lg:px-8 lg:py-24 bg-white/10 backdrop-blur-ios rounded-ios-xl border border-white/20 shadow-ios-subtle',
    minimal: 'relative z-10 w-full max-w-3xl mx-auto px-6 py-12 lg:py-16',
    glass: 'relative z-10 w-full max-w-5xl mx-auto p-8 lg:p-12 bg-white/15 backdrop-blur-ios-heavy rounded-ios-xl border border-white/25 shadow-ios-normal',
  };

  // Set up animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <section 
      className={cn(
        baseStyles,
        sizeStyles[size],
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Background blur overlay for certain variants */}
      {(variant === 'overlay' || variant === 'glass' || backgroundImage) && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-midnight-forest/20 backdrop-blur-ios-light"></div>
      )}
      
      {/* Split layout */}
      <div className={cn(
        "flex flex-col lg:flex-row h-full",
        variant === 'split' ? 'justify-between' : 'justify-center'
      )}>
        {/* Content section */}
        <motion.div 
          className={cn(
            contentContainerStyles[variant],
            "flex flex-col justify-center",
            alignStyles[align],
            contentClassName
          )}
          initial="hidden"
          animate="visible"
          variants={containerAnimation}
        >
          {subtitle && (
            <motion.div 
              className="text-sm font-sf-pro-rounded uppercase tracking-wider text-spring-green mb-3"
              variants={itemAnimation}
            >
              {subtitle}
            </motion.div>
          )}
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-sf-pro font-bold tracking-tight text-midnight-forest dark:text-white mb-6"
            variants={itemAnimation}
          >
            {title}
          </motion.h1>
          
          {description && (
            <motion.div 
              className="text-lg md:text-xl font-sf-pro text-midnight-forest/80 dark:text-white/80 mb-8 max-w-2xl"
              variants={itemAnimation}
            >
              {description}
            </motion.div>
          )}
          
          {(cta || secondaryCta) && (
            <motion.div 
              className={cn(
                "flex flex-wrap gap-4 mt-2", 
                align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
              )}
              variants={itemAnimation}
            >
              {cta}
              {secondaryCta}
            </motion.div>
          )}
          
          {children && (
            <motion.div 
              className="mt-8"
              variants={itemAnimation}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
        
        {/* Image section for split variant */}
        {variant === 'split' && image && (
          <motion.div 
            className={cn(
              "relative lg:w-1/2 h-64 lg:h-auto overflow-hidden",
              imageClassName
            )}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-midnight-forest/10"></div>
          </motion.div>
        )}
        
        {/* Background image for default variant */}
        {variant === 'default' && image && !backgroundImage && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-midnight-forest/30 backdrop-blur-ios-light"></div>
          </div>
        )}
      </div>
    </section>
  );
} 