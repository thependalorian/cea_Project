"use client";

/**
 * Spinner Component - Alliance for Climate Transition
 * Modern 2025 loading spinner with iOS-inspired design
 * Location: act-brand-demo/components/ui/Spinner.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "accent" | "minimal";
  speed?: "slow" | "normal" | "fast";
  thickness?: "thin" | "normal" | "thick";
  animated?: boolean;
}

export function Spinner({ 
  size = "md", 
  variant = "default",
  speed = "normal",
  thickness = "normal",
  animated = true,
  className, 
  ...props 
}: SpinnerProps) {
  // Size classes with iOS-inspired dimensions
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // Thickness classes
  const thicknessClasses = {
    thin: "border",
    normal: "border-2",
    thick: "border-3",
  };

  // Variant styles with ACT color palette
  const variantStyles = {
    default: "border-midnight-forest/20 border-t-midnight-forest",
    primary: "border-spring-green/20 border-t-spring-green",
    secondary: "border-moss-green/20 border-t-moss-green",
    accent: "border-seafoam-blue/20 border-t-seafoam-blue",
    minimal: "border-sand-gray/30 border-t-sand-gray",
  };

  // Animation speed
  const speedClasses = {
    slow: "animate-spin-slow",
    normal: "animate-spin",
    fast: "animate-spin-fast",
  };

  // Custom animation variants for framer-motion
  const spinVariants = {
    spinning: {
      rotate: 360,
      transition: {
        duration: speed === "slow" ? 2 : speed === "fast" ? 0.5 : 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  if (animated) {
    return (
      <motion.div
        className={cn(
          "inline-block rounded-full border-t-transparent",
          sizeClasses[size],
          thicknessClasses[thickness],
          variantStyles[variant],
          className
        )}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-full h-full rounded-full"
          animate={spinVariants.spinning}
        />
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "inline-block rounded-full border-t-transparent",
        sizeClasses[size],
        thicknessClasses[thickness],
        variantStyles[variant],
        speedClasses[speed],
        className
      )}
      {...props}
    />
  );
} 