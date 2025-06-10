"use client";

/**
 * CEA Header Component - Climate Economy Assistant
 * Modern 2025 header implementation with iOS-inspired design
 * Location: components/ui/ACTHeader.tsx
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isExternal?: boolean;
}

interface ACTHeaderProps {
  logo?: React.ReactNode | string;
  logoAlt?: string;
  logoHref?: string;
  navItems?: NavItem[];
  actions?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'glass' | 'frosted' | 'minimal' | 'elevated';
  position?: 'fixed' | 'sticky' | 'static';
  className?: string;
  animated?: boolean;
  compact?: boolean;
  dark?: boolean;
}

export function ACTHeader({
  logo,
  logoAlt = "Logo",
  logoHref = "/",
  navItems = [],
  actions,
  variant = 'default',
  position = 'sticky',
  className,
  animated = true,
  compact = false,
  dark = false,
}: ACTHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for transparent and glass variants
  useEffect(() => {
    if (variant === 'transparent' || variant === 'glass' || variant === 'frosted') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [variant]);
  
  // Base styles for all headers
  const baseStyles = "w-full z-50 transition-all duration-300";
  
  // Position styles
  const positionStyles = {
    fixed: 'fixed top-0 left-0',
    sticky: 'sticky top-0',
    static: 'relative',
  };
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border-b border-sand-gray/20 shadow-ios-subtle',
    transparent: scrolled 
      ? 'bg-white/95 backdrop-blur-ios-light border-b border-white/20 shadow-ios-subtle' 
      : 'bg-transparent',
    glass: scrolled 
      ? 'bg-white/15 backdrop-blur-ios border-b border-white/25 shadow-ios-subtle' 
      : 'bg-transparent',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border-b border-white/15 dark:border-white/10 shadow-ios-subtle',
    minimal: 'bg-transparent',
    elevated: 'bg-white shadow-ios-normal',
  };
  
  // Padding based on compactness
  const paddingStyles = compact 
    ? 'px-4 py-2' 
    : 'px-6 py-4';
  
  // Text color based on dark mode and variant
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Combined header styles
  const headerStyles = cn(
    baseStyles,
    positionStyles[position],
    variantStyles[variant],
    paddingStyles,
    className
  );
  
  // Hamburger button animations
  const topBarVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 }
  };
  
  const centerBarVariants = {
    closed: { opacity: 1 },
    open: { opacity: 0 }
  };
  
  const bottomBarVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 }
  };
  
  // Mobile menu animation
  const menuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.3,
        when: "afterChildren" 
      } 
    },
    open: { 
      opacity: 1,
      height: 'auto',
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      } 
    }
  };
  
  const menuItemVariants = {
    closed: { opacity: 0, y: -8 },
    open: { opacity: 1, y: 0 }
  };
  
  // Logo component
  const logoComponent = typeof logo === 'string' 
    ? (
        <Image 
          src={logo} 
          alt={logoAlt} 
          width={compact ? 100 : 120} 
          height={compact ? 30 : 40} 
          className="object-contain" 
        />
      ) 
    : logo;
  
  return (
    <header className={headerStyles}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={logoHref} className="flex-shrink-0">
            {animated ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {logoComponent}
              </motion.div>
            ) : (
              logoComponent
            )}
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <React.Fragment key={item.href}>
                {animated ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <NavLink 
                      item={item} 
                      className={`font-sf-pro text-sm ${textColorClass} hover:text-spring-green transition-colors`} 
                    />
                  </motion.div>
                ) : (
                  <NavLink 
                    item={item} 
                    className={`font-sf-pro text-sm ${textColorClass} hover:text-spring-green transition-colors`} 
                  />
                )}
              </React.Fragment>
            ))}
          </nav>
          
          {/* Actions (buttons, etc.) */}
          <div className="hidden md:flex items-center gap-4">
            {animated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {actions}
              </motion.div>
            ) : (
              actions
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-ios-light"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <motion.span 
              className={`block w-5 h-0.5 mb-1 ${dark ? 'bg-white' : 'bg-midnight-forest'}`}
              variants={topBarVariants}
              animate={isOpen ? "open" : "closed"}
            />
            <motion.span 
              className={`block w-5 h-0.5 mb-1 ${dark ? 'bg-white' : 'bg-midnight-forest'}`}
              variants={centerBarVariants}
              animate={isOpen ? "open" : "closed"}
            />
            <motion.span 
              className={`block w-5 h-0.5 ${dark ? 'bg-white' : 'bg-midnight-forest'}`}
              variants={bottomBarVariants}
              animate={isOpen ? "open" : "closed"}
            />
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={`md:hidden ${variant === 'frosted' || variant === 'glass' ? 'bg-white/10 backdrop-blur-ios' : 'bg-white'} mt-4 rounded-ios-lg overflow-hidden shadow-ios-normal`}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="p-4">
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <motion.div key={item.href} variants={menuItemVariants}>
                      <NavLink 
                        item={item} 
                        className={`block font-sf-pro py-2 ${textColorClass} hover:text-spring-green flex items-center`}
                        onClick={() => setIsOpen(false)} 
                      />
                    </motion.div>
                  ))}
                </nav>
                
                {actions && (
                  <motion.div 
                    className="mt-6 pt-4 border-t border-sand-gray/10"
                    variants={menuItemVariants}
                  >
                    {actions}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// Helper NavLink component
function NavLink({ 
  item, 
  className, 
  onClick 
}: { 
  item: NavItem, 
  className?: string,
  onClick?: () => void
}) {
  if (item.isExternal) {
    return (
      <a 
        href={item.href} 
        className={className}
        target="_blank" 
        rel="noopener noreferrer"
        onClick={onClick}
      >
        <span className="flex items-center gap-2">
          {item.icon && <span>{item.icon}</span>}
          {item.label}
        </span>
      </a>
    );
  }
  
  return (
    <Link 
      href={item.href} 
      className={className}
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        {item.icon && <span>{item.icon}</span>}
        {item.label}
      </span>
    </Link>
  );
} 