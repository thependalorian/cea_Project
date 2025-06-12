"use client";

/**
 * Modern Navbar Component - Climate Economy Assistant
 * Responsive navigation with modern design and improved user experience
 * Location: components/layout/ModernNavbar.tsx
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ACTButton } from "@/components/ui";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface ModernNavbarProps {
  variant?: "default" | "transparent" | "dark";
  className?: string;
}

export function ModernNavbar({ 
  variant = "default", 
  className 
}: ModernNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Navigation items
  const navItems: NavItem[] = [
    { 
      label: "Climate Careers", 
      href: "/careers",
      children: [
        { label: "Career Paths", href: "/careers/paths" },
        { label: "Skills Assessment", href: "/careers/skills" },
        { label: "Job Listings", href: "/careers/jobs" },
        { label: "Training Programs", href: "/careers/training" },
      ]
    },
    { 
      label: "Resources", 
      href: "/resources",
      children: [
        { label: "Knowledge Base", href: "/resources/knowledge-base" },
        { label: "Case Studies", href: "/resources/case-studies" },
        { label: "Research", href: "/resources/research" },
      ]
    },
    { label: "AI Assistant", href: "/assistant" },
    { label: "About", href: "/about" },
  ];

  // Detect scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [activeDropdown]);

  // Toggle dropdown menu
  const toggleDropdown = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // Determine navbar styles based on variant and scroll state
  const navbarStyles = {
    default: "bg-white border-b border-sand-gray/10 text-midnight-forest",
    transparent: isScrolled 
      ? "bg-white/90 backdrop-blur-md border-b border-sand-gray/10 text-midnight-forest shadow-sm" 
      : "bg-transparent text-white",
    dark: "bg-midnight-forest border-b border-spring-green/20 text-white"
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        navbarStyles[variant],
        className
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with ACT Brand Enhancement */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 border-3 border-spring-green rounded-ios-lg flex items-center justify-center bg-spring-green/10 shadow-ios-subtle">
              <span className="text-spring-green font-helvetica font-bold text-lg">CEA</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-act-title font-helvetica font-medium leading-tight block">
                Climate Economy
              </span>
              <span className="text-act-small font-helvetica leading-tight block text-spring-green">
                Assistant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <div>
                    <button
                      onClick={(e) => toggleDropdown(item.label, e)}
                      className={cn(
                        "flex items-center gap-1 px-1 py-2 font-helvetica text-sm font-medium",
                        pathname.startsWith(item.href) 
                          ? "text-spring-green" 
                          : variant === "transparent" && !isScrolled 
                            ? "text-white hover:text-white/80" 
                            : "hover:text-spring-green"
                      )}
                    >
                      {item.label}
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform", 
                          activeDropdown === item.label ? "rotate-180" : ""
                        )} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 py-2 bg-white rounded-lg shadow-lg border border-sand-gray/10 min-w-[200px]"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block px-4 py-2 text-sm font-helvetica hover:bg-spring-green/5",
                                pathname === child.href ? "text-spring-green" : "text-midnight-forest"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "px-1 py-2 font-helvetica text-sm font-medium",
                      pathname === item.href 
                        ? "text-spring-green" 
                        : variant === "transparent" && !isScrolled 
                          ? "text-white hover:text-white/80" 
                          : "hover:text-spring-green"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              aria-label="Search" 
              className={cn(
                "p-2 rounded-full hover:bg-sand-gray/10 transition-colors",
                variant === "transparent" && !isScrolled ? "text-white" : ""
              )}
            >
              <Search className="h-5 w-5" />
            </button>
            
            <ACTButton
              variant="outline"
              size="md"
              href="/auth/login"
              className="font-helvetica"
            >
              Sign In
            </ACTButton>
            
            <ACTButton
              variant="primary"
              size="md"
              href="/auth/sign-up"
              className="font-helvetica"
            >
              Get Started
            </ACTButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              aria-label="Search" 
              className={cn(
                "p-2 rounded-full hover:bg-sand-gray/10 transition-colors",
                variant === "transparent" && !isScrolled ? "text-white" : ""
              )}
            >
              <Search className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2 rounded-full hover:bg-sand-gray/10 transition-colors",
                variant === "transparent" && !isScrolled ? "text-white" : ""
              )}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-sand-gray/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.label} className="py-1">
                    {item.children ? (
                      <div>
                        <button
                          onClick={(e) => toggleDropdown(item.label, e)}
                          className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-sand-gray/5 text-midnight-forest"
                        >
                          <span className="font-helvetica text-base font-medium">{item.label}</span>
                          <ChevronDown 
                            className={cn(
                              "h-5 w-5 transition-transform", 
                              activeDropdown === item.label ? "rotate-180" : ""
                            )} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-4 mt-1 border-l-2 border-spring-green/30 ml-3"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "block py-2 px-3 rounded-lg text-base font-helvetica",
                                    pathname === child.href 
                                      ? "text-spring-green" 
                                      : "text-midnight-forest/80 hover:text-midnight-forest hover:bg-sand-gray/5"
                                  )}
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "block py-2 px-3 rounded-lg text-base font-helvetica",
                          pathname === item.href 
                            ? "text-spring-green" 
                            : "text-midnight-forest hover:bg-sand-gray/5"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <ACTButton
                  variant="outline"
                  size="md"
                  href="/auth/login"
                  className="w-full font-helvetica"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </ACTButton>
                
                <ACTButton
                  variant="primary"
                  size="md"
                  href="/auth/sign-up"
                  className="w-full font-helvetica"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </ACTButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 