"use client";

/**
 * ACT Social Icons Component - Alliance for Climate Transition
 * Modern 2025 social media icons implementation with iOS-inspired design
 * Location: components/ui/ACTSocialIcons.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SocialIconProps {
  network: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'discord' | 'tiktok' | 'whatsapp' | 'telegram' | 'pinterest' | 'medium' | 'reddit';
  href: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'solid' | 'glass' | 'minimal';
  color?: 'brand' | 'monochrome' | 'custom';
  customColor?: string;
  hoverEffect?: 'scale' | 'rotate' | 'bounce' | 'pulse' | 'none';
  className?: string;
  onClick?: () => void;
}

interface ACTSocialIconsProps {
  icons: SocialIconProps[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  gap?: 'sm' | 'md' | 'lg';
  alignment?: 'start' | 'center' | 'end';
  variant?: 'default' | 'outlined' | 'solid' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'monochrome' | 'custom';
  customColor?: string;
  hoverEffect?: 'scale' | 'rotate' | 'bounce' | 'pulse' | 'none';
  showLabels?: boolean;
  className?: string;
  iconClassName?: string;
  animated?: boolean;
  staggered?: boolean;
  dark?: boolean;
}

export function ACTSocialIcons({
  icons,
  layout = 'horizontal',
  gap = 'md',
  alignment = 'center',
  variant = 'default',
  size = 'md',
  color = 'brand',
  customColor,
  hoverEffect = 'scale',
  showLabels = false,
  className,
  iconClassName,
  animated = true,
  staggered = true,
  dark = false,
}: ACTSocialIconsProps) {
  // Layout styles
  const layoutStyles = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
    grid: 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5',
  };
  
  // Gap styles
  const gapStyles = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };
  
  // Alignment styles
  const alignmentStyles = {
    start: layout === 'horizontal' ? 'justify-start' : layout === 'vertical' ? 'items-start' : '',
    center: layout === 'horizontal' ? 'justify-center' : layout === 'vertical' ? 'items-center' : '',
    end: layout === 'horizontal' ? 'justify-end' : layout === 'vertical' ? 'items-end' : '',
  };
  
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggered ? 0.1 : 0
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  // Component with or without animation
  const Container = animated ? motion.div : 'div';
  const containerProps = animated ? {
    initial: "hidden",
    animate: "visible",
    variants: containerVariants
  } : {};
  
  return (
    <Container 
      className={cn(
        layoutStyles[layout],
        gapStyles[gap],
        alignmentStyles[alignment],
        className
      )}
      {...containerProps}
    >
      {icons.map((icon, index) => (
        <SocialIcon
          key={`${icon.network}-${index}`}
          {...icon}
          variant={icon.variant || variant}
          size={icon.size || size}
          color={icon.color || color}
          customColor={icon.customColor || customColor}
          hoverEffect={icon.hoverEffect || hoverEffect}
          showLabel={showLabels}
          className={iconClassName}
          animated={animated}
          variants={animated ? itemVariants : undefined}
          dark={dark}
        />
      ))}
    </Container>
  );
}

// Individual social icon component
function SocialIcon({
  network,
  href,
  label,
  size = 'md',
  variant = 'default',
  color = 'brand',
  customColor,
  hoverEffect = 'scale',
  showLabel = false,
  className,
  onClick,
  animated = true,
  variants,
  dark = false,
}: SocialIconProps & {
  showLabel?: boolean;
  animated?: boolean;
  variants?: any;
  dark?: boolean;
}) {
  // Icon size styles
  const sizeStyles = {
    sm: { icon: 'w-4 h-4', container: 'w-8 h-8 text-xs' },
    md: { icon: 'w-5 h-5', container: 'w-10 h-10 text-sm' },
    lg: { icon: 'w-6 h-6', container: 'w-12 h-12 text-base' },
  };
  
  // Variant styles
  const variantStyles = {
    default: dark 
      ? 'bg-white/10 hover:bg-white/20 text-white' 
      : 'bg-sand-gray/10 hover:bg-sand-gray/20 text-midnight-forest',
    outlined: dark
      ? 'bg-transparent border-2 border-white/30 hover:border-white/60 text-white'
      : 'bg-transparent border-2 border-midnight-forest/30 hover:border-midnight-forest/60 text-midnight-forest',
    solid: 'bg-spring-green hover:bg-spring-green/90 text-midnight-forest',
    glass: 'bg-white/15 backdrop-blur-ios hover:bg-white/25 text-white',
    minimal: dark
      ? 'bg-transparent hover:bg-white/10 text-white'
      : 'bg-transparent hover:bg-sand-gray/10 text-midnight-forest',
  };
  
  // Hover effects
  const hoverEffects = {
    scale: 'hover:scale-110',
    rotate: 'hover:rotate-6',
    bounce: 'hover:animate-bounce',
    pulse: 'hover:animate-pulse',
    none: '',
  };
  
  // Brand colors
  const brandColors: Record<string, string> = {
    twitter: 'text-[#1DA1F2] hover:bg-[#1DA1F2]/10',
    facebook: 'text-[#1877F2] hover:bg-[#1877F2]/10',
    instagram: 'text-[#E4405F] hover:bg-[#E4405F]/10',
    linkedin: 'text-[#0A66C2] hover:bg-[#0A66C2]/10',
    youtube: 'text-[#FF0000] hover:bg-[#FF0000]/10',
    github: 'text-[#181717] dark:text-white hover:bg-[#181717]/10 dark:hover:bg-white/10',
    discord: 'text-[#5865F2] hover:bg-[#5865F2]/10',
    tiktok: 'text-[#000000] dark:text-white hover:bg-[#000000]/10 dark:hover:bg-white/10',
    whatsapp: 'text-[#25D366] hover:bg-[#25D366]/10',
    telegram: 'text-[#26A5E4] hover:bg-[#26A5E4]/10',
    pinterest: 'text-[#BD081C] hover:bg-[#BD081C]/10',
    medium: 'text-[#000000] dark:text-white hover:bg-[#000000]/10 dark:hover:bg-white/10',
    reddit: 'text-[#FF4500] hover:bg-[#FF4500]/10',
  };
  
  // Get the icon based on network
  const getIcon = () => {
    switch (network) {
      case 'twitter':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'github':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        );
      case 'discord':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        );
      case 'telegram':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        );
      case 'pinterest':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
          </svg>
        );
      case 'reddit':
        return (
          <svg className={sizeStyles[size].icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Determine color styling
  const getColorStyle = () => {
    if (color === 'brand' && variant === 'minimal') {
      return brandColors[network] || '';
    }
    
    if (color === 'custom' && customColor) {
      return `text-[${customColor}] hover:bg-[${customColor}]/10`;
    }
    
    return '';
  };
  
  // Component with or without animation
  const IconWrapper = animated ? motion.a : 'a';
  const iconProps = animated ? {
    variants,
    whileHover: hoverEffect === 'scale' ? { scale: 1.1 } : undefined,
    whileTap: { scale: 0.95 }
  } : {};
  
  return (
    <IconWrapper
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        sizeStyles[size].container,
        variantStyles[variant],
        hoverEffect !== 'scale' ? hoverEffects[hoverEffect] : '',
        color === 'brand' && variant === 'minimal' ? getColorStyle() : '',
        className
      )}
      aria-label={label || network}
      {...iconProps}
    >
      {getIcon()}
      {showLabel && label && (
        <span className="ml-2 font-sf-pro">{label}</span>
      )}
    </IconWrapper>
  );
} 