"use client";

/**
 * ACT Image Placeholder Component - Alliance for Climate Transition
 * Modern 2025 image placeholder with climate-themed visuals and loading states
 * Location: components/ui/ACTImagePlaceholder.tsx
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Camera, Leaf, Globe, Mountain, Trees, Waves, Sun } from 'lucide-react';
import Image from 'next/image';

type PlaceholderVariant = 'default' | 'climate' | 'nature' | 'ocean' | 'forest' | 'mountain' | 'solar';
type PlaceholderSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero';
type AspectRatio = 'square' | 'video' | 'portrait' | 'landscape' | 'wide';

interface ACTImagePlaceholderProps {
  variant?: PlaceholderVariant;
  size?: PlaceholderSize;
  aspectRatio?: AspectRatio;
  src?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  overlayText?: string;
}

export function ACTImagePlaceholder({
  variant = 'default',
  size = 'md',
  aspectRatio = 'landscape',
  src,
  alt,
  title,
  subtitle,
  loading = false,
  showIcon = true,
  animated = true,
  clickable = false,
  onClick,
  className,
  overlayText,
}: ACTImagePlaceholderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Size mappings
  const sizeStyles = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
    hero: 'w-full h-96',
  };

  // Aspect ratio mappings
  const aspectRatioStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[21/9]',
  };

  // Variant styles with climate-themed gradients
  const variantStyles = {
    default: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
    climate: 'bg-gradient-to-br from-spring-green/20 to-seafoam-blue/20',
    nature: 'bg-gradient-to-br from-green-200 to-emerald-300',
    ocean: 'bg-gradient-to-br from-blue-200 to-cyan-300',
    forest: 'bg-gradient-to-br from-green-300 to-emerald-400',
    mountain: 'bg-gradient-to-br from-gray-300 to-slate-400',
    solar: 'bg-gradient-to-br from-yellow-200 to-orange-300',
  };

  // Icon mappings for climate themes
  const getVariantIcon = () => {
    const iconMap = {
      default: <ImageIcon className="w-8 h-8" />,
      climate: <Globe className="w-8 h-8" />,
      nature: <Leaf className="w-8 h-8" />,
      ocean: <Waves className="w-8 h-8" />,
      forest: <Trees className="w-8 h-8" />,
      mountain: <Mountain className="w-8 h-8" />,
      solar: <Sun className="w-8 h-8" />,
    };
    return iconMap[variant];
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.02 },
  };

  const iconVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    loading: { rotate: 360 },
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 },
  };

  const motionProps = animated ? {
    initial: "initial",
    animate: "animate",
    whileHover: clickable ? "hover" : undefined,
    variants: containerVariants,
    transition: { duration: 0.3 }
  } : {};

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700',
        size === 'hero' ? 'w-full' : sizeStyles[size],
        size !== 'hero' && aspectRatioStyles[aspectRatio],
        variantStyles[variant],
        clickable && 'cursor-pointer',
        'group',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent" />
      </div>

      {/* Image */}
      {src && !imageError && (
        <Image
          src={src}
          alt={alt || 'Image'}
          fill
          className={cn(
            'object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {/* Placeholder Content */}
      {(!src || !imageLoaded || imageError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {/* Icon */}
          {showIcon && (
            <motion.div
              className={cn(
                'text-gray-500 dark:text-gray-400 mb-2',
                loading && 'text-spring-green'
              )}
              variants={iconVariants}
              animate={loading ? "loading" : "animate"}
              transition={loading ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.5, delay: 0.2 }}
            >
              {loading ? <Camera className="w-8 h-8" /> : getVariantIcon()}
            </motion.div>
          )}

          {/* Title */}
          {title && (
            <motion.h3
              className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {title}
            </motion.h3>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              className="text-xs text-gray-500 dark:text-gray-400 text-center"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              className="mt-3 flex space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-spring-green rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Overlay */}
      {(overlayText || clickable) && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          variants={overlayVariants}
          initial="initial"
          whileHover="hover"
        >
          {overlayText && (
            <span className="text-white font-medium text-center px-4">
              {overlayText}
            </span>
          )}
        </motion.div>
      )}

      {/* Climate badge for themed variants */}
      {variant !== 'default' && (
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </div>
        </div>
      )}
    </motion.div>
  );
} 