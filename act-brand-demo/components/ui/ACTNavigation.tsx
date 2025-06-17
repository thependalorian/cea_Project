"use client";

/**
 * ACT Navigation Component - Alliance for Climate Transition
 * Professional navigation with dropdowns and climate-focused menu structure
 * Location: act-brand-demo/components/ui/ACTNavigation.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTButton } from './ACTButton';
import { ACTBadge } from './ACTBadge';
import { ACTAvatar } from './ACTAvatar';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Search, 
  Leaf, 
  Building2, 
  Users, 
  BookOpen,
  Briefcase,
  Settings,
  Bell,
  MessageCircle,
  Globe,
  TrendingUp,
  Zap,
  Shield,
  Heart,
  Star,
  Award,
  Calendar,
  FileText,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  LogOut,
  User,
  CreditCard,
  HelpCircle
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
  description?: string;
  featured?: boolean;
  external?: boolean;
}

interface ACTNavigationProps {
  variant?: 'horizontal' | 'vertical' | 'mobile';
  showLogo?: boolean;
  showSearch?: boolean;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  className?: string;
  dark?: boolean;
  items?: NavigationItem[];
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    initials?: string;
  };
  onNavigate?: (href: string) => void;
  onSearch?: (query: string) => void;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    label: 'Solutions',
    icon: <Leaf className="w-4 h-4" />,
    children: [
      {
        label: 'Climate Analytics',
        href: '/solutions/analytics',
        icon: <BarChart3 className="w-4 h-4" />,
        description: 'Data-driven climate insights and reporting',
        featured: true
      },
      {
        label: 'Carbon Management',
        href: '/solutions/carbon',
        icon: <Globe className="w-4 h-4" />,
        description: 'Track and reduce your carbon footprint'
      },
      {
        label: 'Renewable Energy',
        href: '/solutions/energy',
        icon: <Zap className="w-4 h-4" />,
        description: 'Clean energy transition planning'
      },
      {
        label: 'Sustainability Reporting',
        href: '/solutions/reporting',
        icon: <FileText className="w-4 h-4" />,
        description: 'Comprehensive ESG reporting tools'
      }
    ]
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: <Briefcase className="w-4 h-4" />,
    badge: 'New'
  },
  {
    label: 'Learn',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      {
        label: 'Knowledge Base',
        href: '/learn/knowledge',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Comprehensive climate education resources'
      },
      {
        label: 'Training Programs',
        href: '/learn/training',
        icon: <Award className="w-4 h-4" />,
        description: 'Professional climate certifications'
      },
      {
        label: 'Webinars',
        href: '/learn/webinars',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Live learning sessions with experts'
      },
      {
        label: 'Research',
        href: '/learn/research',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Latest climate science and policy research'
      }
    ]
  },
  {
    label: 'Network',
    icon: <Users className="w-4 h-4" />,
    children: [
      {
        label: 'Find Professionals',
        href: '/network/professionals',
        icon: <Users className="w-4 h-4" />,
        description: 'Connect with climate experts worldwide'
      },
      {
        label: 'Organizations',
        href: '/network/organizations',
        icon: <Building2 className="w-4 h-4" />,
        description: 'Discover leading climate organizations'
      },
      {
        label: 'Events',
        href: '/network/events',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Climate conferences and networking events'
      },
      {
        label: 'Communities',
        href: '/network/communities',
        icon: <Heart className="w-4 h-4" />,
        description: 'Join climate action communities'
      }
    ]
  },
  {
    label: 'About',
    href: '/about',
    icon: <Building2 className="w-4 h-4" />
  }
];

const userMenuItems: NavigationItem[] = [
  {
    label: 'Profile',
    href: '/profile',
    icon: <User className="w-4 h-4" />
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-4 h-4" />
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: <CreditCard className="w-4 h-4" />
  },
  {
    label: 'Help & Support',
    href: '/help',
    icon: <HelpCircle className="w-4 h-4" />
  },
  {
    label: 'Sign Out',
    href: '/logout',
    icon: <LogOut className="w-4 h-4" />
  }
];

export function ACTNavigation({
  variant = 'horizontal',
  showLogo = true,
  showSearch = true,
  showUserMenu = true,
  showNotifications = true,
  className,
  dark = false,
  items = defaultNavigationItems,
  userProfile = {
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@climatetech.org',
    role: 'Climate Data Scientist',
    initials: 'SC'
  },
  onNavigate,
  onSearch
}: ACTNavigationProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideDropdown = Object.values(dropdownRefs.current).some(ref =>
        ref && ref.contains(event.target as Node)
      );
      
      if (!isClickInsideDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: NavigationItem) => {
    if (item.href) {
      onNavigate?.(item.href);
      setActiveDropdown(null);
      setMobileMenuOpen(false);
    }
  };

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  const toggleDropdown = (itemLabel: string) => {
    setActiveDropdown(activeDropdown === itemLabel ? null : itemLabel);
  };

  const renderDropdownContent = (items: NavigationItem[]) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        "absolute top-full left-0 mt-2 min-w-64 rounded-lg shadow-ios-normal border z-50",
        dark ? "bg-slate-800 border-slate-600" : "bg-white border-gray-200"
      )}
    >
      <div className="p-2">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => handleItemClick(item)}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              dark ? "hover:bg-slate-700" : "hover:bg-gray-50",
              item.featured && "bg-spring-green/5 border border-spring-green/20"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg mt-0.5",
              item.featured 
                ? "bg-spring-green/20 text-spring-green" 
                : dark ? "bg-slate-700 text-white/70" : "bg-gray-100 text-gray-600"
            )}>
              {item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium text-sm",
                  dark ? "text-white" : "text-gray-900"
                )}>
                  {item.label}
                </span>
                {item.badge && (
                  <ACTBadge variant="outline" size="sm" className="bg-spring-green/20 text-spring-green border-spring-green/50">
                    {item.badge}
                  </ACTBadge>
                )}
                {item.external && (
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                )}
              </div>
              {item.description && (
                <p className={cn(
                  "text-xs mt-1 line-clamp-2",
                  dark ? "text-white/60" : "text-gray-500"
                )}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (variant === 'vertical') {
    return (
      <nav className={cn(
        "w-64 h-full flex flex-col border-r",
        dark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200",
        className
      )}>
        {/* Logo */}
        {showLogo && (
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-spring-green rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className={cn(
                "font-sf-pro-rounded font-semibold text-lg",
                dark ? "text-white" : "text-midnight-forest"
              )}>
                ACT
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="Search..."
                className={cn(
                  "w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-spring-green",
                  dark ? "bg-slate-800 border-slate-600 text-white" : "bg-gray-50 border-gray-300"
                )}
              />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2">
          {items.map((item, index) => (
            <div key={index}>
              <div
                onClick={() => item.children ? toggleDropdown(item.label) : handleItemClick(item)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  dark ? "hover:bg-slate-800 text-white" : "hover:bg-gray-50 text-gray-700"
                )}
              >
                <div className="text-gray-400">
                  {item.icon}
                </div>
                <span className="flex-1 font-sf-pro">{item.label}</span>
                {item.badge && (
                  <ACTBadge variant="outline" size="sm" className="bg-spring-green/20 text-spring-green border-spring-green/50">
                    {item.badge}
                  </ACTBadge>
                )}
                {item.children && (
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    activeDropdown === item.label && "rotate-180"
                  )} />
                )}
              </div>
              
              {/* Submenu */}
              <AnimatePresence>
                {item.children && activeDropdown === item.label && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-6 mt-2 space-y-1 overflow-hidden"
                  >
                    {item.children.map((child, childIndex) => (
                      <div
                        key={childIndex}
                        onClick={() => handleItemClick(child)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                          dark ? "hover:bg-slate-800 text-white/80" : "hover:bg-gray-50 text-gray-600"
                        )}
                      >
                        <div className="text-gray-400">
                          {child.icon}
                        </div>
                        <span className="font-sf-pro">{child.label}</span>
                        {child.badge && (
                          <ACTBadge variant="outline" size="sm" className="ml-auto">
                            {child.badge}
                          </ACTBadge>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* User Profile */}
        {showUserMenu && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div
              onClick={() => toggleDropdown('user-menu')}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                dark ? "hover:bg-slate-800" : "hover:bg-gray-50"
              )}
            >
              <ACTAvatar
                size="sm"
                src={userProfile.avatar}
                initials={userProfile.initials}
                className="bg-spring-green text-white"
              />
              <div className="flex-1 min-w-0">
                <div className={cn("font-medium text-sm truncate", dark ? "text-white" : "text-gray-900")}>
                  {userProfile.name}
                </div>
                <div className={cn("text-xs truncate", dark ? "text-white/60" : "text-gray-500")}>
                  {userProfile.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            
            {/* User Dropdown */}
            <AnimatePresence>
              {activeDropdown === 'user-menu' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-1 overflow-hidden"
                >
                  {userMenuItems.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                        dark ? "hover:bg-slate-800 text-white/80" : "hover:bg-gray-50 text-gray-600"
                      )}
                    >
                      <div className="text-gray-400">
                        {item.icon}
                      </div>
                      <span className="font-sf-pro">{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className={cn(
      "flex items-center justify-between px-6 py-4 border-b",
      dark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200",
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        {showLogo && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-spring-green rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              "font-sf-pro-rounded font-semibold text-lg",
              dark ? "text-white" : "text-midnight-forest"
            )}>
              ACT
            </span>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative"
              ref={el => {
                dropdownRefs.current[item.label] = el;
              }}
            >
              <div
                onClick={() => item.children ? toggleDropdown(item.label) : handleItemClick(item)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  dark ? "hover:bg-slate-800 text-white" : "hover:bg-gray-50 text-gray-700"
                )}
              >
                <span className="font-sf-pro font-medium">{item.label}</span>
                {item.badge && (
                  <ACTBadge variant="outline" size="sm" className="bg-spring-green/20 text-spring-green border-spring-green/50">
                    {item.badge}
                  </ACTBadge>
                )}
                {item.children && (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {item.children && activeDropdown === item.label && renderDropdownContent(item.children)}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        {showSearch && (
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search climate jobs, resources..."
              className={cn(
                "w-64 pl-10 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-spring-green",
                dark ? "bg-slate-800 border-slate-600 text-white" : "bg-gray-50 border-gray-300"
              )}
            />
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <div className="relative">
            <ACTButton variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </ACTButton>
          </div>
        )}

        {/* User Menu */}
        {showUserMenu && (
          <div className="relative" ref={el => {
            dropdownRefs.current['user-menu'] = el;
          }}>
            <div
              onClick={() => toggleDropdown('user-menu')}
              className="flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <ACTAvatar
                size="sm"
                src={userProfile.avatar}
                initials={userProfile.initials}
                className="bg-spring-green text-white"
              />
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            <AnimatePresence>
              {activeDropdown === 'user-menu' && renderDropdownContent(userMenuItems)}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <ACTButton
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </ACTButton>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "absolute top-full left-0 right-0 border-b lg:hidden",
              dark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
            )}
          >
            <div className="p-4 space-y-2">
              {items.map((item, index) => (
                <div key={index}>
                  <div
                    onClick={() => item.children ? toggleDropdown(`mobile-${item.label}`) : handleItemClick(item)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                      dark ? "hover:bg-slate-800 text-white" : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-sf-pro">{item.label}</span>
                      {item.badge && (
                        <ACTBadge variant="outline" size="sm">
                          {item.badge}
                        </ACTBadge>
                      )}
                    </div>
                    {item.children && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        activeDropdown === `mobile-${item.label}` && "rotate-180"
                      )} />
                    )}
                  </div>
                  
                  {/* Mobile Submenu */}
                  <AnimatePresence>
                    {item.children && activeDropdown === `mobile-${item.label}` && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-6 mt-2 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child, childIndex) => (
                          <div
                            key={childIndex}
                            onClick={() => handleItemClick(child)}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                              dark ? "hover:bg-slate-800 text-white/80" : "hover:bg-gray-50 text-gray-600"
                            )}
                          >
                            {child.icon}
                            <span className="font-sf-pro">{child.label}</span>
                            {child.badge && (
                              <ACTBadge variant="outline" size="sm" className="ml-auto">
                                {child.badge}
                              </ACTBadge>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 