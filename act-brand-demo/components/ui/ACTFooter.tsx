"use client";

/**
 * CEA Footer Component - Climate Economy Assistant
 * Modern 2025 footer implementation with iOS-inspired design
 * Location: components/ui/ACTFooter.tsx
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface ACTFooterProps {
  logo?: React.ReactNode;
  tagline?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  bottomText?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'centered' | 'glass' | 'frosted';
  className?: string;
  animated?: boolean;
  dark?: boolean;
}

export function ACTFooter({
  logo,
  tagline,
  columns = [],
  socialLinks = [],
  bottomText,
  variant = 'default',
  className,
  animated = true,
  dark = false,
}: ACTFooterProps) {
  // Base styles
  const baseStyles = "w-full py-12 md:py-16";
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border-t border-sand-gray/20',
    minimal: 'bg-transparent border-t border-sand-gray/20',
    centered: 'bg-white border-t border-sand-gray/20 text-center',
    glass: 'bg-white/15 backdrop-blur-ios border-t border-white/25',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border-t border-white/15 dark:border-white/10',
  };
  
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  // Combined footer styles
  const footerStyles = cn(
    baseStyles,
    variantStyles[variant],
    className
  );
  
  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const Wrapper = animated ? motion.footer : 'footer';
  const Container = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';
  
  const motionProps = animated ? {
    initial: "hidden",
    animate: "visible",
    variants: containerAnimation
  } : {};
  
  const itemProps = animated ? {
    variants: itemAnimation
  } : {};
  
  return (
    <Wrapper className={footerStyles} {...motionProps}>
      <Container className="container mx-auto px-6" {...(animated ? {} : {})}>
        <div className={cn(
          "grid gap-8",
          variant === 'centered' 
            ? "grid-cols-1" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
          {/* Logo and tagline column */}
          <Item className={cn(
            variant === 'centered' ? "flex flex-col items-center" : "",
            "col-span-1"
          )} {...itemProps}>
            {logo && (
              <div className="mb-4">{logo}</div>
            )}
            {tagline && (
              <p className={cn(
                "text-sm font-sf-pro",
                secondaryTextColorClass,
                "mb-6"
              )}>
                {tagline}
              </p>
            )}
            
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className={cn(
                "flex gap-4",
                variant === 'centered' ? "justify-center" : ""
              )}>
                {socialLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href}
                    aria-label={link.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      "bg-white/10 hover:bg-spring-green/20",
                      textColorClass
                    )}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </Item>
          
          {/* Columns */}
          {variant !== 'minimal' && columns.map((column, index) => (
            <Item 
              key={column.title} 
              className={cn(
                variant === 'centered' ? "flex flex-col items-center" : "",
                "col-span-1"
              )}
              {...itemProps}
              transition={animated ? { delay: 0.1 + (index * 0.1) } : undefined}
            >
              <h3 className={cn(
                "text-sm font-sf-pro-rounded font-semibold uppercase tracking-wider mb-4",
                textColorClass
              )}>
                {column.title}
              </h3>
              <ul className={cn(
                "space-y-2",
                variant === 'centered' ? "text-center" : ""
              )}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.isExternal ? (
                      <a 
                        href={link.href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={cn(
                          "text-sm font-sf-pro hover:text-spring-green transition-colors",
                          secondaryTextColorClass
                        )}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        href={link.href} 
                        className={cn(
                          "text-sm font-sf-pro hover:text-spring-green transition-colors",
                          secondaryTextColorClass
                        )}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Item>
          ))}
        </div>
        
        {/* Bottom text / copyright */}
        {bottomText && (
          <Item 
            className={cn(
              "mt-12 pt-6 border-t border-sand-gray/10 text-sm",
              secondaryTextColorClass,
              variant === 'centered' ? "text-center" : ""
            )}
            {...itemProps}
            transition={animated ? { delay: 0.3 } : undefined}
          >
            {bottomText}
          </Item>
        )}
      </Container>
    </Wrapper>
  );
} 