"use client";

/**
 * ACT Brand Demo Component - Alliance for Climate Transition
 * Demonstrates the implementation of ACT brand guidelines
 * Location: components/ui/ACTBrandDemo.tsx
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTButton } from './ACTButton';
import { ACTCard } from './ACTCard';
import { ACTAvatar } from './ACTAvatar';
import { ACTBanner } from './ACTBanner';
import { ACTHeader } from './ACTHeader';
import { ACTFooter } from './ACTFooter';
import { ACTToast, useACTToast } from './ACTToast';
import { 
  Leaf, 
  Zap, 
  Building2, 
  RefreshCw, 
  ArrowRight,
  Users,
  Target,
  Briefcase,
  MessageSquare,
  Github,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

export function ACTBrandDemo() {
  const [activeTab, setActiveTab] = useState('components');
  const { addToast } = useACTToast();

  // Sample data for demonstrations
  const navItems = [
    { label: 'About', href: '/about' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com', icon: <Github className="w-5 h-5" /> },
    { label: 'Twitter', href: 'https://twitter.com', icon: <Twitter className="w-5 h-5" /> },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: <Linkedin className="w-5 h-5" /> },
    { label: 'Instagram', href: 'https://instagram.com', icon: <Instagram className="w-5 h-5" /> },
  ];

  const footerColumns = [
    {
      title: 'Solutions',
      links: [
        { label: 'Climate Analytics', href: '/climate-analytics' },
        { label: 'Carbon Tracking', href: '/carbon-tracking' },
        { label: 'Sustainability Reports', href: '/reports' },
        { label: 'Green Finance', href: '/finance' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/api' },
        { label: 'Best Practices', href: '/best-practices' },
        { label: 'Case Studies', href: '/cases' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'News', href: '/news' },
        { label: 'Contact', href: '/contact' },
      ]
    },
  ];

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Your climate data has been successfully processed!',
      error: 'Failed to connect to climate monitoring service.',
      warning: 'Carbon emissions threshold approaching limit.',
      info: 'New sustainability report is available for download.',
    };

    addToast({
      type,
      message: messages[type],
      title: type.charAt(0).toUpperCase() + type.slice(1),
      duration: 4000,
    });
  };

  const handleBannerDemo = (type: 'success' | 'warning') => {
    // Implementation of handleBannerDemo function
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-seafoam-blue/20 via-white to-sand-gray/30">
      {/* Header */}
      <ACTHeader
        logo={
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-spring-green" />
            <span className="font-helvetica font-bold text-xl text-midnight-forest">ACT</span>
          </div>
        }
        navItems={navItems}
        actions={
          <ACTButton variant="primary" size="sm">
            Get Started
          </ACTButton>
        }
        variant="frosted"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.section 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-display font-medium text-midnight-forest mb-6">
            ACT Brand System
          </h1>
          <p className="text-xl text-midnight-forest/70 max-w-3xl mx-auto mb-8 font-sf-pro">
            A comprehensive design system for the Alliance for Climate Transition, 
            featuring modern iOS-inspired components built for sustainability and impact.
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-ios rounded-full p-1 border border-sand-gray/20">
              {['components', 'layout', 'colors'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-6 py-2 rounded-full font-sf-pro font-medium transition-all duration-200',
                    activeTab === tab
                      ? 'bg-spring-green text-midnight-forest shadow-ios-subtle'
                      : 'text-midnight-forest/70 hover:text-midnight-forest'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Content based on active tab */}
        {activeTab === 'components' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-16"
          >
            {/* Buttons Section */}
            <section>
              <h2 className="text-2xl font-sf-pro-rounded font-semibold text-midnight-forest mb-8">
                Buttons
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ACTCard variant="glass" className="p-6">
                  <h3 className="font-sf-pro-rounded font-medium mb-4">Primary Actions</h3>
                  <div className="space-y-3">
                    <ACTButton variant="primary" size="lg" className="w-full">
                      <Zap className="w-5 h-5 mr-2" />
                      Start Analysis
                    </ACTButton>
                    <ACTButton variant="secondary" size="md" className="w-full">
                      View Reports
                    </ACTButton>
                    <ACTButton variant="outline" size="sm" className="w-full">
                      Learn More
                    </ACTButton>
                  </div>
                </ACTCard>

                <ACTCard variant="glass" className="p-6">
                  <h3 className="font-sf-pro-rounded font-medium mb-4">Action States</h3>
                  <div className="space-y-3">
                    <ACTButton variant="primary" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Processing
                    </ACTButton>
                    <ACTButton variant="secondary" className="w-full">
                      Needs Attention
                    </ACTButton>
                    <ACTButton variant="outline" className="w-full">
                      Critical Action
                    </ACTButton>
                  </div>
                </ACTCard>

                <ACTCard variant="glass" className="p-6">
                  <h3 className="font-sf-pro-rounded font-medium mb-4">Specialized</h3>
                  <div className="space-y-3">
                    <ACTButton variant="ghost" className="w-full">
                      <Building2 className="w-4 h-4 mr-2" />
                      Enterprise
                    </ACTButton>
                    <ACTButton variant="ghost" className="w-full">
                      Documentation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </ACTButton>
                    <ACTButton variant="accent" className="w-full">
                      Premium Feature
                    </ACTButton>
                  </div>
                </ACTCard>
              </div>
            </section>

            {/* Cards Section */}
            <section>
              <h2 className="text-2xl font-sf-pro-rounded font-semibold text-midnight-forest mb-8">
                Cards & Layouts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ACTCard variant="default" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-spring-green/20 rounded-full">
                      <Users className="w-5 h-5 text-spring-green" />
                    </div>
                    <div>
                      <h3 className="font-sf-pro-rounded font-medium">Team Collaboration</h3>
                      <p className="text-sm text-midnight-forest/70">Connect with experts</p>
                    </div>
                  </div>
                  <p className="text-sm text-midnight-forest/80 mb-4">
                    Work together on climate solutions with our global network of sustainability professionals.
                  </p>
                  <ACTButton variant="outline" size="sm" className="w-full">
                    Join Network
                  </ACTButton>
                </ACTCard>

                <ACTCard variant="glass" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-spring-green/20 rounded-full">
                      <Target className="w-5 h-5 text-spring-green" />
                    </div>
                    <div>
                      <h3 className="font-sf-pro-rounded font-medium">Impact Tracking</h3>
                      <p className="text-sm text-midnight-forest/70">Measure your progress</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Carbon Reduction</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-sand-gray/30 rounded-full h-2">
                      <div className="bg-spring-green h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <ACTButton variant="primary" size="sm" className="w-full">
                    View Details
                  </ACTButton>
                </ACTCard>

                <ACTCard variant="frosted" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-spring-green/20 rounded-full">
                      <Briefcase className="w-5 h-5 text-spring-green" />
                    </div>
                    <div>
                      <h3 className="font-sf-pro-rounded font-medium">Green Jobs</h3>
                      <p className="text-sm text-midnight-forest/70">Find opportunities</p>
                    </div>
                  </div>
                  <p className="text-sm text-midnight-forest/80 mb-4">
                    Discover career opportunities in the growing clean energy and sustainability sector.
                  </p>
                  <ACTButton variant="secondary" size="sm" className="w-full">
                    Browse Jobs
                  </ACTButton>
                </ACTCard>
              </div>
            </section>

            {/* Interactive Elements */}
            <section>
              <h2 className="text-2xl font-sf-pro-rounded font-semibold text-midnight-forest mb-8">
                Interactive Elements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ACTCard variant="glass" className="p-6">
                  <h3 className="font-sf-pro-rounded font-medium mb-4">Avatars & Profiles</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <ACTAvatar 
                      name="Sarah Johnson" 
                      size="lg" 
                      status="online"
                      monogram 
                    />
                    <div>
                      <h4 className="font-sf-pro-rounded font-medium">Sarah Johnson</h4>
                      <p className="text-sm text-midnight-forest/70">Climate Data Scientist</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ACTAvatar name="Alex Chen" size="md" status="away" monogram />
                    <ACTAvatar name="Maria Garcia" size="md" status="online" monogram />
                    <ACTAvatar name="David Kim" size="md" status="busy" monogram />
                  </div>
                </ACTCard>

                <ACTCard variant="glass" className="p-6">
                  <h3 className="font-sf-pro-rounded font-medium mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <ACTButton 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleToastDemo('success')}
                      className="w-full"
                    >
                      Show Success Toast
                    </ACTButton>
                    <ACTButton 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleToastDemo('error')}
                      className="w-full"
                    >
                      Show Error Toast
                    </ACTButton>
                    <ACTButton 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToastDemo('warning')}
                      className="w-full"
                    >
                      Show Warning Toast
                    </ACTButton>
                    <ACTButton 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToastDemo('info')}
                      className="w-full"
                    >
                      Info Toast
                    </ACTButton>
                  </div>
                </ACTCard>
              </div>
            </section>

            {/* Banner Demo */}
            <section>
              <h2 className="text-2xl font-sf-pro-rounded font-semibold text-midnight-forest mb-8">
                Banners & Alerts
              </h2>
              <div className="space-y-4">
                <ACTBanner
                  variant="success"
                  title="System Status"
                  message="All climate monitoring systems are operational and collecting data."
                  dismissible={false}
                />
                <ACTBanner
                  variant="warning"
                  message="Carbon emissions data for Q3 2024 requires validation before publishing."
                  actionText="Review Data"
                  onActionClick={() => console.log('Review clicked')}
                />
                <ACTBanner
                  variant="info"
                  title="New Feature"
                  message="Enhanced climate analytics dashboard is now available with real-time insights."
                  appearance="glass"
                />
                <ACTButton 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleBannerDemo('success')}
                  className="w-full"
                >
                  Success Banner
                </ACTButton>
                <ACTButton 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBannerDemo('warning')}
                  className="w-full"
                >
                  Warning Banner
                </ACTButton>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'layout' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-sf-pro-rounded font-semibold text-midnight-forest mb-4">
                Layout Components
              </h2>
              <p className="text-midnight-forest/70 max-w-2xl mx-auto">
                Comprehensive header and footer components with various styling options.
              </p>
            </div>
            
            <ACTCard variant="glass" className="p-6">
              <h3 className="font-sf-pro-rounded font-medium mb-4">Header & Navigation</h3>
              <p className="text-sm text-midnight-forest/70 mb-4">
                The header component you see at the top of this page demonstrates responsive navigation,
                glass morphism effects, and smooth animations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-sand-gray/20 rounded-lg">
                  <h4 className="font-sf-pro-rounded font-medium text-sm mb-2">Features</h4>
                  <ul className="text-sm text-midnight-forest/70 space-y-1">
                    <li>• Responsive mobile menu</li>
                    <li>• Glass morphism effects</li>
                    <li>• Smooth scroll detection</li>
                    <li>• Customizable variants</li>
                  </ul>
                </div>
                <div className="p-4 bg-sand-gray/20 rounded-lg">
                  <h4 className="font-sf-pro-rounded font-medium text-sm mb-2">Variants</h4>
                  <ul className="text-sm text-midnight-forest/70 space-y-1">
                    <li>• Default</li>
                    <li>• Transparent</li>
                    <li>• Glass & Frosted</li>
                    <li>• Minimal & Elevated</li>
                  </ul>
                </div>
              </div>
            </ACTCard>
          </motion.div>
        )}

        {activeTab === 'colors' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-sf-pro-rounded font-semibold text-midnight-forest mb-4">
                Color Palette
              </h2>
              <p className="text-midnight-forest/70 max-w-2xl mx-auto">
                Our color system is inspired by nature and designed for accessibility and impact.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Colors */}
              <ACTCard variant="glass" className="p-6">
                <h3 className="font-sf-pro-rounded font-medium mb-4">Primary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-midnight-forest rounded-full border-2 border-white shadow-sm"></div>
                    <div>
                      <p className="font-sf-pro font-medium text-sm">Midnight Forest</p>
                      <p className="text-xs text-midnight-forest/70">#001818</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-spring-green rounded-full border-2 border-white shadow-sm"></div>
                    <div>
                      <p className="font-sf-pro font-medium text-sm">Spring Green</p>
                      <p className="text-xs text-midnight-forest/70">#B2DE26</p>
                    </div>
                  </div>
                </div>
              </ACTCard>

              {/* Secondary Colors */}
              <ACTCard variant="glass" className="p-6">
                <h3 className="font-sf-pro-rounded font-medium mb-4">Secondary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-moss-green rounded-full border-2 border-white shadow-sm"></div>
                    <div>
                      <p className="font-sf-pro font-medium text-sm">Moss Green</p>
                      <p className="text-xs text-midnight-forest/70">#394816</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-seafoam-blue rounded-full border-2 border-white shadow-sm"></div>
                    <div>
                      <p className="font-sf-pro font-medium text-sm">Seafoam Blue</p>
                      <p className="text-xs text-midnight-forest/70">#E0FFFF</p>
                    </div>
                  </div>
                </div>
              </ACTCard>

              {/* Neutral Colors */}
              <ACTCard variant="glass" className="p-6">
                <h3 className="font-sf-pro-rounded font-medium mb-4">Neutral</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sand-gray rounded-full border-2 border-white shadow-sm"></div>
                    <div>
                      <p className="font-sf-pro font-medium text-sm">Sand Gray</p>
                      <p className="text-xs text-midnight-forest/70">#EBE9E1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-sand-gray shadow-sm"></div>
                    <div>
                      <p className="font-sf-pro font-medium text-sm">Pure White</p>
                      <p className="text-xs text-midnight-forest/70">#FFFFFF</p>
                    </div>
                  </div>
                </div>
              </ACTCard>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <ACTFooter
        logo={
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-spring-green" />
            <span className="font-helvetica font-bold text-xl text-white">
              Alliance for Climate Transition
            </span>
          </div>
        }
        tagline="Building a sustainable future through technology, collaboration, and innovation."
        columns={footerColumns}
        socialLinks={socialLinks}
        variant="default"
      />
    </div>
  );
} 