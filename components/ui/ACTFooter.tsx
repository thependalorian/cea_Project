"use client";

/**
 * ACT Footer Component - Alliance for Climate Transition
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
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-gray-900 text-white border-t border-gray-700',
    minimal: 'bg-white border-t border-gray-200 text-gray-900',
    centered: 'bg-gray-50 text-gray-900 border-t border-gray-200',
    glass: 'bg-white/15 backdrop-blur-md border-t border-white/25 text-white',
    frosted: 'bg-white/75 dark:bg-gray-900/75 backdrop-blur-lg border-t border-white/15 dark:border-white/10 text-gray-900 dark:text-white',
  };

  // Text color based on variant and dark mode
  const textColorClass = dark || variant === 'default' || variant === 'glass' 
    ? 'text-white' 
    : 'text-gray-900';

  const secondaryTextColorClass = dark || variant === 'default' || variant === 'glass'
    ? 'text-white/70'
    : 'text-gray-600';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const Container = animated ? motion.footer : 'footer';
  const Item = animated ? motion.div : 'div';

  const motionProps = animated ? {
    initial: "hidden",
    animate: "visible",
    variants: containerVariants
  } : {};

  const itemProps = animated ? {
    variants: itemVariants
  } : {};

  return (
    <Container 
      className={cn(
        'w-full',
        variantStyles[variant],
        className
      )}
      {...motionProps}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        {(logo || tagline || columns.length > 0 || socialLinks.length > 0) && (
          <div className={cn(
            'py-12',
            variant === 'centered' ? 'text-center' : ''
          )}>
            {variant === 'centered' ? (
              // Centered layout
              <div className="space-y-8">
                {logo && (
                  <Item className="flex justify-center" {...itemProps}>
                    {logo}
                  </Item>
                )}
                
                {tagline && (
                  <Item {...itemProps}>
                    <p className={cn(
                      'text-lg font-medium max-w-2xl mx-auto',
                      secondaryTextColorClass
                    )}>
                      {tagline}
                    </p>
                  </Item>
                )}

                {socialLinks.length > 0 && (
                  <Item {...itemProps}>
                    <div className="flex justify-center gap-6">
                      {socialLinks.map((social, index) => (
                        <SocialLink key={index} social={social} textColor={textColorClass} />
                      ))}
                    </div>
                  </Item>
                )}

                {columns.length > 0 && (
                  <Item {...itemProps}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                      {columns.map((column, index) => (
                        <FooterColumn 
                          key={index} 
                          column={column} 
                          textColor={textColorClass}
                          secondaryTextColor={secondaryTextColorClass}
                        />
                      ))}
                    </div>
                  </Item>
                )}
              </div>
            ) : (
              // Default grid layout
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Logo and tagline */}
                {(logo || tagline) && (
                  <Item className="lg:col-span-4" {...itemProps}>
                    <div className="space-y-4">
                      {logo && logo}
                      {tagline && (
                        <p className={cn(
                          'text-base font-medium max-w-md',
                          secondaryTextColorClass
                        )}>
                          {tagline}
                        </p>
                      )}
                    </div>
                  </Item>
                )}

                {/* Footer columns */}
                {columns.length > 0 && (
                  <div className={cn(
                    'grid grid-cols-2 md:grid-cols-4 gap-8',
                    logo || tagline ? 'lg:col-span-6' : 'lg:col-span-10'
                  )}>
                    {columns.map((column, index) => (
                      <Item key={index} {...itemProps}>
                        <FooterColumn 
                          column={column} 
                          textColor={textColorClass}
                          secondaryTextColor={secondaryTextColorClass}
                        />
                      </Item>
                    ))}
                  </div>
                )}

                {/* Social links */}
                {socialLinks.length > 0 && (
                  <Item className={cn(
                    'flex flex-col justify-start',
                    logo || tagline ? 'lg:col-span-2' : 'lg:col-span-2'
                  )} {...itemProps}>
                    <div className="space-y-4">
                      <h4 className={cn('font-medium', textColorClass)}>
                        Follow Us
                      </h4>
                      <div className="flex gap-4">
                        {socialLinks.map((social, index) => (
                          <SocialLink key={index} social={social} textColor={textColorClass} />
                        ))}
                      </div>
                    </div>
                  </Item>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom section */}
        <div className={cn(
          'py-6 border-t',
          variant === 'glass' || variant === 'frosted' ? 'border-white/15' : 'border-gray-700 dark:border-white/10'
        )}>
          <div className={cn(
            'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
            variant === 'centered' ? 'text-center md:text-left' : ''
          )}>
            {bottomText ? (
              bottomText
            ) : (
              <p className={cn('text-sm font-medium', secondaryTextColorClass)}>
                © {new Date().getFullYear()} Alliance for Climate Transition. All rights reserved.
              </p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

// Footer column component
function FooterColumn({ 
  column, 
  textColor, 
  secondaryTextColor 
}: { 
  column: FooterColumn, 
  textColor: string,
  secondaryTextColor: string
}) {
  return (
    <div>
      <h4 className={cn('font-medium mb-4', textColor)}>
        {column.title}
      </h4>
      <ul className="space-y-2">
        {column.links.map((link, index) => (
          <li key={index}>
            <FooterLink link={link} textColor={secondaryTextColor} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Footer link component
function FooterLink({ 
  link, 
  textColor 
}: { 
  link: FooterLink, 
  textColor: string 
}) {
  const className = cn(
    'text-sm font-medium transition-colors duration-200 hover:text-spring-green',
    textColor
  );

  if (link.isExternal) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

// Social link component
function SocialLink({ 
  social, 
  textColor 
}: { 
  social: SocialLink, 
  textColor: string 
}) {
  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'p-2 rounded-full transition-all duration-200',
        'hover:bg-spring-green/10 hover:text-spring-green',
        'hover:scale-110 active:scale-95',
        textColor
      )}
      aria-label={social.label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {social.icon}
    </motion.a>
  );
} 