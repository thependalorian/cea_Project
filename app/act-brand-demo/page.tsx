/**
 * ACT Brand Demo - Complete Component Showcase
 * Comprehensive demonstration of ALL Alliance for Climate Transition components
 * Features live database integration, iOS design tokens, and production-ready UI
 * Location: act-brand-demo/page.tsx
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Github, 
  Users, 
  MessageCircle, 
  Video, 
  TrendingUp, 
  Calendar, 
  Play, 
  Pause, 
  Volume2,
  Clock,
  Building2,
  Briefcase,
  BookOpen,
  Mail,
  CheckCircle,
  Info,
  AlertTriangle,
  Globe,
  Star,
  AlertCircle,
  Check,
  Upload,
  FileText,
  Download,
  Mic,
  MicOff,
  Heart,
  Share,
  Bell,
  Settings,
  User,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Leaf,
  TreePine,
  Lightbulb,
  Droplets,
  Sun,
  Moon
} from 'lucide-react';

// Import ALL components to showcase complete brilliance
import {
  ACTButton,
  ACTCard,
  BottomCTA,
  ACTAvatar,
  ACTBanner,
  ACTForm,
  ACTToast,
  ACTFrameElement,
  Spinner,
  ACTSpeechWave,
  ACTVideoPlayer,
  ACTSocialIcons,
  AIInsightsDashboard,
  ClimateMetricsDashboard,
  ACTChatWindow,
  ACTFileUpload,
  ACTDashboard,
  ACTFooter,
  ACTHeader,
  ACTHero,
  ACTBadge,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  FeedbackWidget,
  ErrorBoundary,
  Badge,
  useToast,
  Toaster,
  // Add the new sophisticated components
  ACTSearch,
  ACTDataVisualization,
  ACTNavigation,
  ACTProgressTracker
} from '@/act-brand-demo/components/ui';

// Import NEW Enhanced Visual Components from the correct location
import {
  ACTImagePlaceholder,
  ClimateImpactCard,
  ClimateHeroCard,
  ProjectShowcaseCard,
  FeatureGridCard,
  MediaGallery,
  DashboardOverview,
  ProjectPortfolio,
  FeatureShowcase
} from '@/components/ui';

// Import DatabaseConnectionTest component
import { DatabaseConnectionTest } from '@/act-brand-demo/components/DatabaseConnectionTest';

// Demo data
const formFields = [
  {
    id: 'name',
    label: 'Full Name',
    type: 'text' as const,
    placeholder: 'Enter your full name',
    required: true,
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email' as const,
    placeholder: 'Enter your email',
    required: true,
    icon: <Mail className="w-4 h-4" />
  },
  {
    id: 'role',
    label: 'Role',
    type: 'select' as const,
    placeholder: 'Select your role',
    options: [
      { value: 'developer', label: 'Developer' },
      { value: 'designer', label: 'Designer' },
      { value: 'manager', label: 'Manager' },
      { value: 'analyst', label: 'Analyst' }
    ]
  },
  {
    id: 'message',
    label: 'Message',
    type: 'textarea' as const,
    placeholder: 'Tell us about yourself...',
    required: true
  }
];

const socialIcons = [
  { network: 'github' as const, href: 'https://github.com', label: 'GitHub' },
  { network: 'linkedin' as const, href: 'https://linkedin.com', label: 'LinkedIn' },
  { network: 'twitter' as const, href: 'https://twitter.com', label: 'Twitter' },
  { network: 'youtube' as const, href: 'https://youtube.com', label: 'YouTube' }
];

const chatMessages = [
  {
    id: 'initial-bot-message-1',
    content: 'Welcome to the ACT Platform! How can I assist you today?',
    sender: 'bot' as const,
    timestamp: new Date(Date.now() - 900000)
  },
  {
    id: 'initial-user-message-2',
    content: 'I would like to learn more about climate transition strategies.',
    sender: 'user' as const,
    timestamp: new Date(Date.now() - 840000)
  },
  {
    id: 'initial-bot-message-3',
    content: 'Great! I can help you explore various climate transition pathways, renewable energy solutions, and carbon reduction strategies. What specific area interests you most?',
    sender: 'bot' as const,
    timestamp: new Date(Date.now() - 780000)
  },
  {
    id: 'user-message-4',
    content: 'I\'m particularly interested in carbon footprint analysis for manufacturing companies. What metrics should we track?',
    sender: 'user' as const,
    timestamp: new Date(Date.now() - 720000)
  },
  {
    id: 'bot-message-5',
    content: 'Excellent question! For manufacturing carbon footprint analysis, key metrics include: Scope 1 emissions (direct), Scope 2 (purchased energy), Scope 3 (supply chain), energy intensity per unit, waste-to-landfill ratios, and water usage efficiency. Would you like detailed tracking methodologies for any of these?',
    sender: 'bot' as const,
    timestamp: new Date(Date.now() - 660000)
  }
];

export default function ACTBrandDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [messages, setMessages] = useState(chatMessages);
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState('default');
  const [switchState, setSwitchState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const { toast } = useToast();

  // Debug logging
  useEffect(() => {
    console.log('🚀 ACT Brand Demo loaded');
    console.log('📦 Components available:', {
      ACTButton: !!ACTButton,
      ACTCard: !!ACTCard,
      ACTFrameElement: !!ACTFrameElement,
      ACTBanner: !!ACTBanner,
      ACTChatWindow: !!ACTChatWindow,
      ACTSocialIcons: !!ACTSocialIcons,
      ACTAvatar: !!ACTAvatar,
      ACTFileUpload: !!ACTFileUpload,
      ACTDashboard: !!ACTDashboard,
      ACTSpeechWave: !!ACTSpeechWave,
      ACTToast: !!ACTToast,
      ACTVideoPlayer: !!ACTVideoPlayer,
      AIInsightsDashboard: !!AIInsightsDashboard,
      ClimateMetricsDashboard: !!ClimateMetricsDashboard,
      ACTFooter: !!ACTFooter,
      ACTHeader: !!ACTHeader,
      ACTHero: !!ACTHero,
      DatabaseConnectionTest: !!DatabaseConnectionTest
    });
    
    // Test custom colors
    console.log('🎨 Testing custom colors...');
    const testElement = document.createElement('div');
    testElement.className = 'bg-midnight-forest text-spring-green font-sf-pro-rounded';
    document.body.appendChild(testElement);
    const computedStyles = window.getComputedStyle(testElement);
    console.log('🎨 Custom color test:', {
      backgroundColor: computedStyles.backgroundColor,
      color: computedStyles.color,
      fontFamily: computedStyles.fontFamily
    });
    document.body.removeChild(testElement);
  }, []);

  // Component wrapper for debugging
  const ComponentWrapper = ({ name, children }: { name: string; children: React.ReactNode }) => {
    try {
      return (
        <ErrorBoundary fallback={
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            <h4 className="font-bold">Component Error: {name}</h4>
            <p>This component failed to render properly.</p>
          </div>
        }>
          {children}
        </ErrorBoundary>
      );
    } catch (error) {
      console.error(`❌ Error rendering ${name}:`, error);
      return (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
          <h4 className="font-bold">Component Error: {name}</h4>
          <p>This component failed to render: {String(error)}</p>
        </div>
      );
    }
  };

  const handleSendMessage = (message: string, attachments?: File[]) => {
    const newMessage = {
      id: `user-message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    toast({
      title: "Form Submitted Successfully",
      description: "Your climate professional registration has been received.",
      variant: "success"
    });
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    toast({
      title: "Files Uploaded",
      description: `Successfully uploaded ${uploadedFiles.length} file(s).`,
      variant: "success"
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Audio recording has been stopped." : "Audio recording has started.",
      variant: "info"
    });
  };

  const tabs = [
    { id: 'overview', label: 'Foundation' },
    { id: 'enhanced', label: 'Enhanced Visuals' },
    { id: 'variations', label: 'Component Variations' },
    { id: 'interactive', label: 'Interactive' },
    { id: 'chat', label: 'Chat & Communication' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'dashboards', label: 'Analytics' },
    { id: 'forms', label: 'Forms & Input' },
    { id: 'media', label: 'Media & Social' },
    { id: 'layout', label: 'Layout & Structure' },
    { id: 'feedback', label: 'Feedback & Alerts' },
    { id: 'database', label: 'Live Data' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-midnight-forest text-white' 
        : 'bg-gradient-to-br from-white to-sand-gray/10 text-midnight-forest'
    }`}>
      <Toaster />
      
      {/* DEBUG: Enhanced Test Elements */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        <div className="bg-spring-green text-midnight-forest px-4 py-2 rounded-lg font-bold">
          DEBUG: PAGE LOADED ✓
        </div>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Basic Red (Should be visible)
        </div>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Basic Blue (Should be visible)
        </div>
        <div className="bg-midnight-forest border-2 border-spring-green text-spring-green px-4 py-2 rounded-lg">
          Custom ACT Colors Test
        </div>
        <div className="bg-white text-black px-4 py-2 rounded-lg">
          White Background Test
        </div>
      </div>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-ios border-b transition-colors duration-300 ${
        isDarkTheme 
          ? 'bg-midnight-forest/95 border-white/10' 
          : 'bg-white/95 border-midnight-forest/10'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-spring-green rounded-full flex items-center justify-center">
                <span className="text-midnight-forest font-sf-pro-rounded font-bold text-xs sm:text-sm">A</span>
              </div>
              <div>
                <h1 className={`text-sm sm:text-base lg:text-lg font-sf-pro-rounded font-bold ${
                  isDarkTheme ? 'text-white' : 'text-midnight-forest'
                }`}>ACT Component Library</h1>
                <p className={`text-xs font-sf-pro hidden sm:block ${
                  isDarkTheme ? 'text-white/70' : 'text-midnight-forest/70'
                }`}>Complete UI System Showcase</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="bg-spring-green/20 text-spring-green border-spring-green/50 text-xs px-2 py-1 sm:px-3">
                <span className="hidden sm:inline">Production Ready</span>
                <span className="sm:hidden">Ready</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full text-xs sm:text-sm px-2 sm:px-3 transition-colors duration-300 ${
                  isDarkTheme 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-midnight-forest/20 text-midnight-forest hover:bg-midnight-forest/10'
                }`}
                onClick={() => setIsDarkTheme(!isDarkTheme)}
              >
                {isDarkTheme ? (
                  <>
                    <Sun className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full text-xs sm:text-sm px-2 sm:px-3 transition-colors duration-300 ${
                  isDarkTheme 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-midnight-forest/20 text-midnight-forest hover:bg-midnight-forest/10'
                }`}
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">View Source</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-300 ${
        isDarkTheme ? 'bg-midnight-forest' : 'bg-gradient-to-br from-white to-sand-gray/5'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sf-pro-rounded font-bold mb-4 sm:mb-6 leading-tight ${
              isDarkTheme ? 'text-white' : 'text-midnight-forest'
            }`}>
              Alliance for Climate Transition
              <span className="block text-spring-green mt-1 sm:mt-2">Component Library</span>
            </h1>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-sf-pro max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2 ${
              isDarkTheme ? 'text-white/80' : 'text-midnight-forest/80'
            }`}>
              A comprehensive, production-ready UI component system built with Next.js 14, 
              TypeScript, and iOS-inspired design principles. Every component optimized 
              for professional climate economy applications with enterprise-grade standards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
              <Button
                size="lg"
                className="bg-spring-green hover:bg-spring-green/90 text-midnight-forest font-sf-pro-rounded rounded-full px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base"
                onClick={() => document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Components
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`rounded-full px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base transition-colors duration-300 ${
                  isDarkTheme 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-midnight-forest/20 text-midnight-forest hover:bg-midnight-forest/10'
                }`}
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-14 sm:top-16 z-40 bg-midnight-forest/95 backdrop-blur-ios border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-sf-pro-rounded font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-spring-green text-midnight-forest'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section id="components" className="py-12 bg-midnight-forest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Foundation Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sf-pro-rounded font-bold mb-3 sm:mb-4 lg:mb-6">Foundation Components</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Core building blocks with professional, emoji-free design standards. Clean typography, sophisticated iconography, and enterprise-ready climate-focused functionality.
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* ACT Buttons */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-sf-pro-rounded font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Button System</h3>
                    <p className="text-sm sm:text-base lg:text-lg text-white/70 font-sf-pro">
                      Professional button components with clean typography, climate-focused styling, and iOS-inspired interactions.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Primary Actions</h4>
                      <div className="flex flex-col gap-3">
                        <ACTButton variant="primary" size="lg" icon={<Leaf className="w-5 h-5" />}>
                          Climate Action
                        </ACTButton>
                        <ACTButton variant="primary" size="md" icon={<TreePine className="w-4 h-4" />}>
                          Sustainability
                        </ACTButton>
                        <ACTButton variant="primary" size="sm" icon={<Lightbulb className="w-4 h-4" />}>
                          Green Innovation
                        </ACTButton>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Secondary Actions</h4>
                      <div className="flex flex-col gap-3">
                        <ACTButton variant="secondary" size="lg">
                          Carbon Tracking
                        </ACTButton>
                        <ACTButton variant="outline" size="md">
                          Data Analysis
                        </ACTButton>
                        <ACTButton variant="ghost" size="sm">
                          Learn More
                        </ACTButton>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Loading States</h4>
                      <div className="flex flex-col gap-3">
                        <ACTButton variant="primary" size="md" loading>
                          Processing...
                        </ACTButton>
                        <ACTButton variant="outline" size="md" disabled>
                          Disabled
                        </ACTButton>
                        <ACTButton variant="accent" size="md" icon={<AlertTriangle className="w-4 h-4" />}>
                          Critical Alert
                        </ACTButton>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* ACT Avatars & Badges */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <ACTFrameElement variant="glass" className="p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-sf-pro-rounded font-bold mb-2 text-white">ACT Avatar System</h3>
                      <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                        Professional avatar components for user representation and climate professional profiles.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center space-y-2">
                        <ACTAvatar
                          size="lg"
                          initials="DR"
                          className="mx-auto bg-blue-500 text-white"
                        />
                        <p className="text-xs text-white/60">Dr. Emily Chen</p>
                      </div>
                      <div className="text-center space-y-2">
                        <ACTAvatar
                          size="md"
                          initials="MJ"
                          className="mx-auto bg-purple-500 text-white"
                        />
                        <p className="text-xs text-white/60">Mark Johnson</p>
                      </div>
                      <div className="text-center space-y-2">
                        <ACTAvatar
                          size="sm"
                          initials="SP"
                          className="mx-auto bg-spring-green text-midnight-forest"
                        />
                        <p className="text-xs text-white/60">Sarah Parker</p>
                      </div>
                      <div className="text-center space-y-2">
                        <ACTAvatar
                          size="xs"
                          initials="TW"
                          className="mx-auto bg-moss-green text-white"
                        />
                        <p className="text-xs text-white/60">Team Lead</p>
                      </div>
                    </div>
                  </ACTFrameElement>

                  <ACTFrameElement variant="glass" className="p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-sf-pro-rounded font-bold mb-2 text-white">ACT Badge System</h3>
                      <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                        Status badges and labels for climate certifications, professional achievements, and system status indicators.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <ACTBadge variant="success" size="sm">Carbon Neutral</ACTBadge>
                        <ACTBadge variant="info" size="md">Climate Ready</ACTBadge>
                        <ACTBadge variant="warning" size="lg">Action Required</ACTBadge>
                        <ACTBadge variant="neutral">Verified Partner</ACTBadge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ACTBadge variant="default" className="bg-spring-green text-midnight-forest">
                          Sustainability Leader
                        </ACTBadge>
                        <ACTBadge variant="outline" className="border-spring-green text-spring-green">
                          Green Innovation
                        </ACTBadge>
                        <ACTBadge variant="error" size="sm">High Emissions</ACTBadge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ACTBadge variant="neutral" className="bg-seafoam-blue/20 text-seafoam-blue border-seafoam-blue/50">
                          Verified Partner
                        </ACTBadge>
                        <ACTBadge variant="outline" className="border-moss-green text-moss-green">
                          Renewable Energy
                        </ACTBadge>
                      </div>
                    </div>
                  </ACTFrameElement>
                </div>

                {/* ACT Cards */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-sf-pro-rounded font-bold mb-3 sm:mb-4 lg:mb-6 text-white">ACT Professional Card System</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-5xl mx-auto leading-relaxed">
                      Sophisticated card components designed for climate economy applications with professional layouts and clean typography.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                    <ACTCard
                      title="Climate Action Initiative"
                      description="Comprehensive climate action programs with measurable impact tracking and professional sustainability metrics."
                      variant="glass"
                      className="bg-midnight-forest/40 border border-spring-green/20"
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="success" size="sm">Active</ACTBadge>
                          <Button variant="ghost" size="sm" className="text-spring-green hover:bg-spring-green/10">
                            Learn More <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      }
                    />
                    
                    <ACTCard
                      title="Sustainability Analytics"
                      description="Advanced data analytics for environmental impact assessment and carbon footprint optimization strategies."
                      variant="frosted"
                      className="bg-midnight-forest/40 border border-seafoam-blue/20"
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="info" size="sm">Dashboard</ACTBadge>
                          <Button variant="ghost" size="sm" className="text-seafoam-blue hover:bg-seafoam-blue/10">
                            View Data <BarChart3 className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      }
                    />
                    
                    <ACTCard
                      title="Green Innovation Hub"
                      description="Technology innovation platform connecting climate professionals with cutting-edge environmental solutions."
                      variant="gradient"
                      className="bg-midnight-forest/40 border border-moss-green/20"
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="warning" size="sm">New</ACTBadge>
                          <Button variant="ghost" size="sm" className="text-moss-green hover:bg-moss-green/10">
                            Explore <Lightbulb className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      }
                    />
                  </div>
                </ACTFrameElement>

                {/* Frame Elements Showcase */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-8">
                    <h3 className="text-2xl sm:text-3xl font-sf-pro-rounded font-bold mb-3 text-white">ACT Frame Elements</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Versatile container components with various visual styles and sizes for different use cases.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ACTFrameElement variant="full" className="p-4 bg-spring-green/20 border-spring-green/30">
                      <h4 className="font-semibold mb-2">Solid Frame</h4>
                      <p className="text-sm text-white/70">Solid background with subtle transparency</p>
                    </ACTFrameElement>
                    <ACTFrameElement variant="open" className="p-4 border-moss-green">
                      <h4 className="font-semibold mb-2">Outline Frame</h4>
                      <p className="text-sm text-white/70">Clean outline style for content separation</p>
                    </ACTFrameElement>
                    <ACTFrameElement variant="brackets" className="p-4 hover:bg-white/5">
                      <h4 className="font-semibold mb-2">Ghost Frame</h4>
                      <p className="text-sm text-white/70">Minimal styling with hover effects</p>
                    </ACTFrameElement>
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Enhanced Visuals Tab */}
          {activeTab === 'enhanced' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Enhanced Visual Components</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Explore our new enhanced visual components for a more engaging user experience.
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* Climate Impact Card */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Climate Impact Card</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional climate impact display with metrics, trends, and visual indicators.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ClimateImpactCard
                      title="Carbon Reduction"
                      description="Total carbon emissions reduced across all operations and initiatives"
                      impact="2.4M tons"
                      metric="+15% vs last year"
                      icon={<Leaf className="w-6 h-6" />}
                      trend="up"
                      color="green"
                    />
                    <ClimateImpactCard
                      title="Renewable Energy"
                      description="Percentage of energy sourced from renewable resources"
                      impact="78%"
                      metric="+12% increase"
                      icon={<Zap className="w-6 h-6" />}
                      trend="up"
                      color="blue"
                    />
                    <ClimateImpactCard
                      title="Water Conservation"
                      description="Water usage reduction through efficiency programs"
                      impact="1.2M liters"
                      metric="+8% improvement"
                      icon={<Droplets className="w-6 h-6" />}
                      trend="up"
                      color="purple"
                    />
                  </div>
                </ACTFrameElement>

                {/* Climate Hero Card */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Climate Hero Card</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Large-scale hero card for showcasing major climate initiatives and achievements.
                    </p>
                  </div>
                  <div className="max-w-6xl mx-auto">
                    <ClimateHeroCard
                      title="Global Climate Action Initiative"
                      subtitle="Leading the transition to a sustainable future"
                      description="Join our comprehensive climate action program designed to accelerate the transition to renewable energy, reduce carbon emissions, and build resilient communities worldwide."
                      imageSrc="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=600&fit=crop"
                      stats={[
                        { label: "Countries", value: "127", icon: <Globe className="w-8 h-8" /> },
                        { label: "Projects", value: "2,400+", icon: <TreePine className="w-8 h-8" /> },
                        { label: "CO₂ Reduced", value: "15.7M tons", icon: <Leaf className="w-8 h-8" /> }
                      ]}
                      action={{
                        label: "Join Initiative",
                        onClick: () => toast({
                          title: "Welcome to the Initiative!",
                          description: "Thank you for joining our global climate action program.",
                          variant: "success"
                        })
                      }}
                    />
                  </div>
                </ACTFrameElement>

                {/* Project Showcase Card */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Project Showcase Cards</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional project cards with progress tracking, team info, and status indicators.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ProjectShowcaseCard
                      title="Solar Energy Deployment"
                      category="Renewable Energy"
                      description="Large-scale solar panel installation across rural communities to provide clean, sustainable energy access."
                      imageSrc="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop"
                      technologies={["Solar Panels", "Battery Storage", "Smart Grid", "IoT Monitoring"]}
                      team={[
                        { name: "Dr. Sarah Chen", avatar: "https://i.pravatar.cc/100?img=1" },
                        { name: "Mark Rodriguez", avatar: "https://i.pravatar.cc/100?img=2" },
                        { name: "Lisa Park", avatar: "https://i.pravatar.cc/100?img=3" }
                      ]}
                      progress={87}
                      status="active"
                    />
                    <ProjectShowcaseCard
                      title="Ocean Cleanup Initiative"
                      category="Environmental Restoration"
                      description="Advanced technology deployment for removing plastic waste from ocean ecosystems and marine protection."
                      imageSrc="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
                      technologies={["Ocean Tech", "AI Tracking", "Robotics", "Marine Biology"]}
                      team={[
                        { name: "Dr. Ocean Blue", avatar: "https://i.pravatar.cc/100?img=4" },
                        { name: "Marine Expert", avatar: "https://i.pravatar.cc/100?img=5" }
                      ]}
                      progress={65}
                      status="active"
                    />
                    <ProjectShowcaseCard
                      title="Carbon Capture Research"
                      category="Climate Technology"
                      description="Breakthrough research in direct air capture technology for large-scale carbon dioxide removal from the atmosphere."
                      imageSrc="https://images.unsplash.com/photo-1497436072909-f5e4be06cb0b?w=400&h=300&fit=crop"
                      technologies={["Carbon Capture", "Chemical Engineering", "AI Optimization", "Data Analytics"]}
                      team={[
                        { name: "Dr. Carbon Tech", avatar: "https://i.pravatar.cc/100?img=6" },
                        { name: "Research Lead", avatar: "https://i.pravatar.cc/100?img=7" },
                        { name: "Tech Specialist", avatar: "https://i.pravatar.cc/100?img=8" },
                        { name: "Data Scientist", avatar: "https://i.pravatar.cc/100?img=9" }
                      ]}
                      progress={42}
                      status="planning"
                    />
                  </div>
                </ACTFrameElement>

                {/* Feature Grid Card */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Feature Grid Cards</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Clean feature cards highlighting platform capabilities and climate solutions.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <FeatureGridCard
                      icon={<BarChart3 className="w-8 h-8" />}
                      title="Real-time Analytics"
                      description="Monitor climate data and environmental metrics with live dashboard updates and comprehensive reporting tools."
                      color="green"
                    />
                    <FeatureGridCard
                      icon={<Globe className="w-8 h-8" />}
                      title="Global Network"
                      description="Connect with climate professionals worldwide through our comprehensive networking and collaboration platform."
                      color="blue"
                    />
                    <FeatureGridCard
                      icon={<Lightbulb className="w-8 h-8" />}
                      title="AI Insights"
                      description="Leverage artificial intelligence for predictive climate modeling and automated sustainability recommendations."
                      color="purple"
                    />
                    <FeatureGridCard
                      icon={<TreePine className="w-8 h-8" />}
                      title="Carbon Tracking"
                      description="Comprehensive carbon footprint monitoring with detailed emission tracking and reduction goal management."
                      color="green"
                    />
                    <FeatureGridCard
                      icon={<Users className="w-8 h-8" />}
                      title="Team Collaboration"
                      description="Advanced project management tools for climate teams with real-time communication and progress tracking."
                      color="blue"
                    />
                    <FeatureGridCard
                      icon={<PieChart className="w-8 h-8" />}
                      title="Impact Reporting"
                      description="Generate professional sustainability reports with visual data representation and compliance tracking."
                      color="yellow"
                    />
                  </div>
                </ACTFrameElement>

                {/* Media Gallery */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Media Gallery</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Interactive media gallery with climate content, video player, and engagement features.
                    </p>
                  </div>
                  <div className="max-w-5xl mx-auto">
                    <MediaGallery
                      items={[
                        {
                          id: "1",
                          type: "image",
                          src: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=800&h=600&fit=crop",
                          alt: "Renewable Energy Farm",
                          title: "Solar Energy Revolution",
                          description: "Massive solar farm deployment in desert regions providing clean energy to millions of homes.",
                          author: { name: "Dr. Solar Expert", avatar: "https://i.pravatar.cc/100?img=10" },
                          stats: { likes: 2847, shares: 156, views: 45632 }
                        },
                        {
                          id: "2",
                          type: "video",
                          src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
                          alt: "Ocean Conservation Project",
                          title: "Ocean Cleanup Technology",
                          description: "Advanced robotic systems removing plastic waste from ocean ecosystems worldwide.",
                          author: { name: "Marine Researcher", avatar: "https://i.pravatar.cc/100?img=11" },
                          stats: { likes: 5234, shares: 892, views: 123456 }
                        },
                        {
                          id: "3",
                          type: "image",
                          src: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop",
                          alt: "Forest Conservation",
                          title: "Reforestation Initiative",
                          description: "Large-scale tree planting program restoring degraded forest ecosystems and biodiversity.",
                          author: { name: "Forest Guardian", avatar: "https://i.pravatar.cc/100?img=12" },
                          stats: { likes: 3421, shares: 267, views: 78432 }
                        }
                      ]}
                    />
                  </div>
                </ACTFrameElement>

                {/* Dashboard Overview */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Dashboard Overview</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Comprehensive climate dashboard with key metrics, trends, and interactive data visualization.
                    </p>
                  </div>
                  <div className="max-w-7xl mx-auto">
                    <DashboardOverview
                      title="Climate Action Dashboard"
                      subtitle="Real-time environmental metrics and sustainability tracking"
                      metrics={[
                        {
                          label: "Carbon Reduced",
                          value: "2.4M tons",
                          change: 15,
                          icon: <Leaf className="w-6 h-6" />,
                          color: "green"
                        },
                        {
                          label: "Renewable Energy",
                          value: "78%",
                          change: 12,
                          icon: <Zap className="w-6 h-6" />,
                          color: "blue"
                        },
                        {
                          label: "Projects Active",
                          value: "156",
                          change: 8,
                          icon: <Activity className="w-6 h-6" />,
                          color: "purple"
                        },
                        {
                          label: "Global Impact",
                          value: "89 countries",
                          change: 25,
                          icon: <Globe className="w-6 h-6" />,
                          color: "yellow"
                        }
                      ]}
                      featuredCard={
                        <ClimateHeroCard
                          title="Featured Initiative"
                          subtitle="Ocean Restoration Project"
                          description="Advanced technology deployment for marine ecosystem restoration and plastic waste removal from world's oceans."
                          stats={[
                            { label: "Oceans", value: "12", icon: <Droplets className="w-6 h-6" /> },
                            { label: "Waste Removed", value: "2.1M kg", icon: <TreePine className="w-6 h-6" /> },
                            { label: "Marine Life", value: "50K saved", icon: <Heart className="w-6 h-6" /> }
                          ]}
                          action={{
                            label: "Learn More",
                            onClick: () => toast({
                              title: "Ocean Project",
                              description: "Exploring comprehensive ocean restoration initiative details.",
                              variant: "info"
                            })
                          }}
                        />
                      }
                    />
                  </div>
                </ACTFrameElement>

                {/* Project Portfolio */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Project Portfolio</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Comprehensive project portfolio showcasing climate initiatives with detailed progress tracking.
                    </p>
                  </div>
                  <div className="max-w-7xl mx-auto">
                    <ProjectPortfolio
                      projects={[
                        {
                          id: "1",
                          title: "Solar Energy Network",
                          category: "Renewable Energy",
                          description: "Comprehensive solar panel deployment across rural communities providing clean energy access to 50,000+ homes.",
                          image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
                          technologies: ["Solar Panels", "Smart Grid", "IoT Monitoring", "Battery Storage", "AI Optimization"],
                          team: [
                            { name: "Dr. Sarah Chen", avatar: "https://i.pravatar.cc/100?img=1" },
                            { name: "Mark Rodriguez", avatar: "https://i.pravatar.cc/100?img=2" },
                            { name: "Lisa Park", avatar: "https://i.pravatar.cc/100?img=3" },
                            { name: "Tech Lead", avatar: "https://i.pravatar.cc/100?img=4" }
                          ],
                          progress: 87,
                          status: "active",
                          featured: true
                        },
                        {
                          id: "2",
                          title: "Ocean Cleanup Initiative",
                          category: "Environmental Restoration",
                          description: "Advanced robotic systems for removing plastic waste from ocean ecosystems and marine protection programs.",
                          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
                          technologies: ["Ocean Tech", "Robotics", "AI Tracking", "Marine Biology", "Data Analytics"],
                          team: [
                            { name: "Dr. Ocean Blue", avatar: "https://i.pravatar.cc/100?img=5" },
                            { name: "Marine Expert", avatar: "https://i.pravatar.cc/100?img=6" },
                            { name: "Robot Engineer", avatar: "https://i.pravatar.cc/100?img=7" }
                          ],
                          progress: 65,
                          status: "active",
                          featured: true
                        },
                        {
                          id: "3",
                          title: "Carbon Capture Research",
                          category: "Climate Technology",
                          description: "Breakthrough research in direct air capture technology for large-scale atmospheric carbon dioxide removal.",
                          image: "https://images.unsplash.com/photo-1497436072909-f5e4be06cb0b?w=600&h=400&fit=crop",
                          technologies: ["Carbon Capture", "Chemical Engineering", "AI Optimization"],
                          team: [
                            { name: "Dr. Carbon Tech", avatar: "https://i.pravatar.cc/100?img=8" },
                            { name: "Research Lead", avatar: "https://i.pravatar.cc/100?img=9" }
                          ],
                          progress: 42,
                          status: "planning"
                        },
                        {
                          id: "4",
                          title: "Smart City Climate",
                          category: "Urban Planning",
                          description: "Intelligent urban climate management systems with real-time environmental monitoring and automated responses.",
                          technologies: ["IoT Sensors", "Smart Infrastructure", "Climate AI"],
                          team: [
                            { name: "Urban Planner", avatar: "https://i.pravatar.cc/100?img=10" },
                            { name: "IoT Specialist", avatar: "https://i.pravatar.cc/100?img=11" }
                          ],
                          progress: 73,
                          status: "active"
                        },
                        {
                          id: "5",
                          title: "Reforestation Program",
                          category: "Ecosystem Restoration",
                          description: "Large-scale tree planting and forest ecosystem restoration program across degraded landscapes worldwide.",
                          technologies: ["Drone Planting", "Soil Analysis", "Biodiversity Monitoring"],
                          team: [
                            { name: "Forest Guardian", avatar: "https://i.pravatar.cc/100?img=12" }
                          ],
                          progress: 91,
                          status: "active"
                        },
                        {
                          id: "6",
                          title: "Green Energy Storage",
                          category: "Energy Technology",
                          description: "Advanced battery storage systems for renewable energy grid stabilization and efficient power distribution.",
                          technologies: ["Battery Tech", "Grid Management", "Energy AI"],
                          team: [
                            { name: "Energy Engineer", avatar: "https://i.pravatar.cc/100?img=13" },
                            { name: "Grid Specialist", avatar: "https://i.pravatar.cc/100?img=14" }
                          ],
                          progress: 58,
                          status: "planning"
                        }
                      ]}
                    />
                  </div>
                </ACTFrameElement>

                {/* Feature Showcase */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Feature Showcase</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Comprehensive feature showcase highlighting platform capabilities and climate solutions.
                    </p>
                  </div>
                  <div className="max-w-7xl mx-auto">
                    <FeatureShowcase
                      title="Climate Platform Features"
                      subtitle="Comprehensive tools for climate action and sustainability management"
                      features={[
                        {
                          icon: <BarChart3 className="w-8 h-8" />,
                          title: "Real-time Analytics",
                          description: "Monitor climate data and environmental metrics with live dashboard updates, comprehensive reporting tools, and predictive insights.",
                          color: "green"
                        },
                        {
                          icon: <Globe className="w-8 h-8" />,
                          title: "Global Network",
                          description: "Connect with climate professionals worldwide through our comprehensive networking and collaboration platform with real-time communication.",
                          color: "blue"
                        },
                        {
                          icon: <Lightbulb className="w-8 h-8" />,
                          title: "AI Insights",
                          description: "Leverage artificial intelligence for predictive climate modeling, automated sustainability recommendations, and intelligent data analysis.",
                          color: "purple"
                        },
                        {
                          icon: <TreePine className="w-8 h-8" />,
                          title: "Carbon Tracking",
                          description: "Comprehensive carbon footprint monitoring with detailed emission tracking, reduction goal management, and compliance reporting.",
                          color: "green"
                        },
                        {
                          icon: <Users className="w-8 h-8" />,
                          title: "Team Collaboration",
                          description: "Advanced project management tools for climate teams with real-time communication, progress tracking, and workflow automation.",
                          color: "blue"
                        },
                        {
                          icon: <PieChart className="w-8 h-8" />,
                          title: "Impact Reporting",
                          description: "Generate professional sustainability reports with visual data representation, compliance tracking, and stakeholder communications.",
                          color: "yellow"
                        }
                      ]}
                    />
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Component Variations Tab */}
          {activeTab === 'variations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Component Variations</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Explore enhanced variations of our core components with custom color palettes, iOS-inspired styling, and professional climate-focused designs.
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* ACT Frame Element Variations */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Frame Element Variations</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      iOS-inspired frame elements with glass effects, custom colors, and professional styling options for different content types.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Glass Variations */}
                    <ACTFrameElement variant="glass" className="p-6 bg-spring-green/10 border border-spring-green/30">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-spring-green/20 rounded-full flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-spring-green" />
                        </div>
                        <h4 className="font-bold text-white">Spring Green Glass</h4>
                        <p className="text-sm text-white/70">Sustainable energy tracking with glass morphism effect</p>
                      </div>
                    </ACTFrameElement>

                    <ACTFrameElement variant="frosted" className="p-6 bg-seafoam-blue/10 border border-seafoam-blue/30">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-seafoam-blue/20 rounded-full flex items-center justify-center">
                          <Droplets className="w-6 h-6 text-seafoam-blue" />
                        </div>
                        <h4 className="font-bold text-white">Seafoam Blue Frosted</h4>
                        <p className="text-sm text-white/70">Water conservation metrics with frosted backdrop</p>
                      </div>
                    </ACTFrameElement>

                    <ACTFrameElement variant="gradient" className="p-6">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-moss-green/20 rounded-full flex items-center justify-center">
                          <TreePine className="w-6 h-6 text-moss-green" />
                        </div>
                        <h4 className="font-bold text-midnight-forest">Moss Green Gradient</h4>
                        <p className="text-sm text-midnight-forest/70">Forest restoration with gradient styling</p>
                      </div>
                    </ACTFrameElement>

                    {/* Bracketed Variations */}
                    <ACTFrameElement variant="corner-brackets" className="p-6 bg-midnight-forest/40 border-spring-green">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-spring-green rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-midnight-forest" />
                        </div>
                        <h4 className="font-bold text-spring-green">Bracketed Frame</h4>
                        <p className="text-sm text-white/70">Energy monitoring with corner brackets</p>
                      </div>
                    </ACTFrameElement>

                    <ACTFrameElement variant="double" className="p-6">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-seafoam-blue/20 rounded-full flex items-center justify-center">
                          <Globe className="w-6 h-6 text-seafoam-blue" />
                        </div>
                        <h4 className="font-bold text-midnight-forest">Double Border</h4>
                        <p className="text-sm text-midnight-forest/70">Global climate data with double frame</p>
                      </div>
                    </ACTFrameElement>

                    <ACTFrameElement variant="open" className="p-6 border-moss-green bg-moss-green/5">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-moss-green/20 rounded-full flex items-center justify-center">
                          <Activity className="w-6 h-6 text-moss-green" />
                        </div>
                        <h4 className="font-bold text-white">Open Frame</h4>
                        <p className="text-sm text-white/70">Activity metrics with open styling</p>
                      </div>
                    </ACTFrameElement>
                  </div>
                </ACTFrameElement>

                {/* ACT Card Variations */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Card Variations</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional card components with custom color schemes, glass effects, and climate-focused content layouts.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Glass Card with Spring Green */}
                    <ACTCard
                      variant="glass"
                      title="Carbon Neutral Initiative"
                      description="Advanced carbon tracking and offset programs designed to achieve net-zero emissions across all organizational operations."
                      className="bg-spring-green/15 border-spring-green/25 backdrop-blur-lg"
                      icon={<Leaf className="w-6 h-6 text-spring-green" />}
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="success" size="sm" className="bg-spring-green/20 text-spring-green border-spring-green/50">
                            Active Program
                          </ACTBadge>
                          <Button variant="ghost" size="sm" className="text-spring-green hover:bg-spring-green/10">
                            Learn More
                          </Button>
                        </div>
                      }
                    />

                    {/* Frosted Card with Seafoam Blue */}
                    <ACTCard
                      variant="frosted"
                      title="Water Conservation Hub"
                      description="Comprehensive water management systems with real-time monitoring, efficiency optimization, and sustainable usage protocols."
                      className="bg-seafoam-blue/15 border-seafoam-blue/25"
                      icon={<Droplets className="w-6 h-6 text-seafoam-blue" />}
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="info" size="sm" className="bg-seafoam-blue/20 text-seafoam-blue border-seafoam-blue/50">
                            Monitoring
                          </ACTBadge>
                          <Button variant="ghost" size="sm" className="text-seafoam-blue hover:bg-seafoam-blue/10">
                            View Data
                          </Button>
                        </div>
                      }
                    />

                    {/* Gradient Card with Moss Green */}
                    <ACTCard
                      variant="gradient"
                      title="Forest Restoration"
                      description="Large-scale reforestation programs combining advanced drone technology with sustainable forestry practices."
                      icon={<TreePine className="w-6 h-6 text-moss-green" />}
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="success" size="sm" className="bg-moss-green/80 text-white">
                            In Progress
                          </ACTBadge>
                          <Button variant="ghost" size="sm" className="text-moss-green hover:bg-moss-green/10">
                            Explore
                          </Button>
                        </div>
                      }
                    />

                    {/* Outlined Card with Custom Colors */}
                    <ACTCard
                      variant="outlined"
                      title="Renewable Energy Grid"
                      description="Smart grid infrastructure connecting solar, wind, and hydroelectric sources for maximum efficiency and reliability."
                      className="border-spring-green bg-midnight-forest/20"
                      icon={<Zap className="w-6 h-6 text-spring-green" />}
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="outline" size="sm" className="border-spring-green text-spring-green">
                            Operational
                          </ACTBadge>
                          <Button variant="outline" size="sm" className="border-spring-green text-spring-green hover:bg-spring-green hover:text-midnight-forest">
                            Manage
                          </Button>
                        </div>
                      }
                    />

                    {/* Framed Card */}
                    <ACTCard
                      variant="framed"
                      title="Climate Analytics"
                      description="Advanced data analytics platform providing real-time insights into environmental trends and sustainability metrics."
                      className="border-l-seafoam-blue bg-slate-800/30"
                      icon={<BarChart3 className="w-6 h-6 text-seafoam-blue" />}
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="info" size="sm" className="bg-seafoam-blue/20 text-seafoam-blue">
                            Live Data
                          </ACTBadge>
                          <Button variant="ghost" size="sm" className="text-seafoam-blue hover:bg-seafoam-blue/10">
                            Dashboard
                          </Button>
                        </div>
                      }
                    />

                    {/* Bracketed Card */}
                    <ACTCard
                      variant="bracketed"
                      title="Green Technology"
                      description="Cutting-edge environmental technology solutions for carbon capture, renewable energy, and sustainable manufacturing."
                      className="bg-moss-green/10"
                      icon={<Lightbulb className="w-6 h-6 text-moss-green" />}
                      footer={
                        <div className="flex items-center justify-between">
                          <ACTBadge variant="outline" size="sm" className="border-moss-green text-moss-green">
                            Innovation
                          </ACTBadge>
                          <Button variant="ghost" size="sm" className="text-moss-green hover:bg-moss-green/10">
                            Discover
                          </Button>
                        </div>
                      }
                    />
                  </div>
                </ACTFrameElement>

                {/* ACT Form Variations */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Form Variations</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional form components with glass morphism, custom color schemes, and climate-focused input designs.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Glass Form with Spring Green */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-white mb-4">Climate Professional Registration</h4>
                      <ACTForm
                        variant="glass"
                        title="Join ACT Network"
                        description="Connect with climate professionals worldwide"
                        dark={true}
                        fields={[
                          {
                            id: 'name',
                            label: 'Full Name',
                            type: 'text',
                            placeholder: 'Dr. Emily Chen',
                            required: true,
                            icon: <User className="w-4 h-4" />
                          },
                          {
                            id: 'organization',
                            label: 'Organization',
                            type: 'text',
                            placeholder: 'Green Tech Solutions',
                            required: true,
                            icon: <Building2 className="w-4 h-4" />
                          },
                          {
                            id: 'expertise',
                            label: 'Climate Expertise',
                            type: 'select',
                            placeholder: 'Select your area of expertise',
                            options: [
                              { value: 'renewable-energy', label: 'Renewable Energy' },
                              { value: 'carbon-capture', label: 'Carbon Capture' },
                              { value: 'sustainability', label: 'Sustainability Consulting' },
                              { value: 'climate-data', label: 'Climate Data Analysis' }
                            ]
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Glass form submitted:', data);
                          toast({
                            title: "Registration Successful",
                            description: "Welcome to the ACT professional network!",
                            variant: "success"
                          });
                        }}
                        submitText="Join Network"
                        className="bg-spring-green/10 border-spring-green/25"
                      />
                    </div>

                    {/* Frosted Form with Seafoam Blue */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-white mb-4">Project Collaboration</h4>
                      <ACTForm
                        variant="frosted"
                        title="Start Climate Project"
                        description="Collaborate on environmental initiatives"
                        dark={true}
                        fields={[
                          {
                            id: 'project-name',
                            label: 'Project Name',
                            type: 'text',
                            placeholder: 'Ocean Cleanup Initiative',
                            required: true,
                            icon: <Briefcase className="w-4 h-4" />
                          },
                          {
                            id: 'project-type',
                            label: 'Project Type',
                            type: 'select',
                            placeholder: 'Select project category',
                            options: [
                              { value: 'conservation', label: 'Environmental Conservation' },
                              { value: 'renewable', label: 'Renewable Energy' },
                              { value: 'restoration', label: 'Ecosystem Restoration' },
                              { value: 'research', label: 'Climate Research' }
                            ]
                          },
                          {
                            id: 'description',
                            label: 'Project Description',
                            type: 'textarea',
                            placeholder: 'Describe your climate project goals and methodology...',
                            required: true
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Frosted form submitted:', data);
                          toast({
                            title: "Project Created",
                            description: "Your climate project has been initiated successfully!",
                            variant: "success"
                          });
                        }}
                        submitText="Launch Project"
                        className="bg-seafoam-blue/10 border-seafoam-blue/25"
                      />
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Minimal Form Variations */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Minimal Form Variations</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Clean, minimal form designs for quick data entry and streamlined user experiences.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-slate-800/30 rounded-lg p-6 border border-moss-green/30">
                      <ACTForm
                        variant="minimal"
                        title="Contact Climate Experts"
                        dark={true}
                        compact={true}
                        fields={[
                          {
                            id: 'contact-email',
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'expert@climateaction.org',
                            required: true,
                            icon: <Mail className="w-4 h-4" />
                          },
                          {
                            id: 'subject',
                            label: 'Subject',
                            type: 'text',
                            placeholder: 'Climate Collaboration Inquiry',
                            required: true
                          },
                          {
                            id: 'message',
                            label: 'Message',
                            type: 'textarea',
                            placeholder: 'I would like to discuss potential collaboration opportunities...',
                            required: true
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Contact form submitted:', data);
                          toast({
                            title: "Message Sent",
                            description: "Your inquiry has been sent to our climate experts.",
                            variant: "success"
                          });
                        }}
                        submitText="Send Message"
                      />
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="bg-slate-800/30 rounded-lg p-6 border border-spring-green/30">
                      <ACTForm
                        variant="minimal"
                        title="Climate Updates Newsletter"
                        description="Stay informed about climate action and sustainability news"
                        dark={true}
                        compact={true}
                        fields={[
                          {
                            id: 'newsletter-email',
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'your@email.com',
                            required: true,
                            icon: <Mail className="w-4 h-4" />
                          },
                          {
                            id: 'interests',
                            label: 'Interests',
                            type: 'select',
                            placeholder: 'Select your interests',
                            options: [
                              { value: 'policy', label: 'Climate Policy' },
                              { value: 'technology', label: 'Green Technology' },
                              { value: 'research', label: 'Climate Research' },
                              { value: 'business', label: 'Sustainable Business' }
                            ]
                          },
                          {
                            id: 'frequency',
                            label: 'Update Frequency',
                            type: 'radio',
                            options: [
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'monthly', label: 'Monthly' }
                            ]
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Newsletter form submitted:', data);
                          toast({
                            title: "Subscription Confirmed",
                            description: "You'll receive climate updates based on your preferences.",
                            variant: "success"
                          });
                        }}
                        submitText="Subscribe"
                      />
                    </div>
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Interactive Tab */}
          {activeTab === 'interactive' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Interactive Elements</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Dynamic components with professional animations and user interaction patterns
                </p>
              </div>

              {/* ACT Search - Standalone Section */}
              <section className="w-full">
                <ACTFrameElement variant="glass" size="xl" className="p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Advanced Search System</h3>
                    <p className="text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-4xl mx-auto leading-relaxed">
                      Intelligent search with filtering for climate jobs, resources, professionals, and organizations. 
                      Built with advanced autocomplete, real-time results, and comprehensive filtering capabilities.
                    </p>
                  </div>
                  <div className="max-w-6xl mx-auto space-y-12">
                    <div className="space-y-8">
                      <ACTSearch
                        placeholder="Search climate jobs, resources, professionals..."
                        variant="advanced"
                        showFilters={true}
                        showResults={true}
                        autoComplete={true}
                        dark={true}
                        className="w-full"
                        onSearch={(query, filters) => {
                          console.log('Search query:', query, 'Filters:', filters);
                          toast({
                            title: "Search Executed",
                            description: `Searching for "${query}" with filters applied`,
                            variant: "info"
                          });
                        }}
                        onResultSelect={(result) => {
                          console.log('Selected result:', result);
                          toast({
                            title: "Result Selected",
                            description: `Selected: ${result.title}`,
                            variant: "success"
                          });
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-white mb-4">Compact Search</h4>
                        <ACTSearch
                          variant="compact"
                          placeholder="Quick search..."
                          showFilters={false}
                          showResults={false}
                          dark={true}
                        />
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-white mb-4">Default Search</h4>
                        <ACTSearch
                          variant="default"
                          placeholder="Search resources..."
                          showFilters={true}
                          showResults={true}
                          dark={true}
                        />
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>
              </section>

              {/* ACT Navigation - Standalone Section */}
              <section className="w-full">
                <ACTFrameElement variant="glass" size="xl" className="p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Professional Navigation</h3>
                    <p className="text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-4xl mx-auto leading-relaxed">
                      Climate-focused navigation with dropdowns, search, and professional user management. 
                      Features responsive design, accessibility support, and comprehensive user controls.
                    </p>
                  </div>
                  <div className="max-w-6xl mx-auto space-y-12">
                    <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                      <div className="p-6 border-b border-slate-700">
                        <h4 className="text-xl font-semibold text-white mb-2">Horizontal Navigation</h4>
                        <p className="text-white/60">Full-featured navigation bar with logo, search, user menu, and notifications</p>
                      </div>
                      <div className="p-8">
                        <ACTNavigation
                          variant="horizontal"
                          showLogo={true}
                          showSearch={true}
                          showUserMenu={true}
                          showNotifications={true}
                          dark={true}
                          onNavigate={(href) => {
                            console.log('Navigate to:', href);
                            toast({
                              title: "Navigation",
                              description: `Navigating to ${href}`,
                              variant: "info"
                            });
                          }}
                          onSearch={(query) => {
                            console.log('Search navigation:', query);
                            toast({
                              title: "Navigation Search",
                              description: `Searching for: ${query}`,
                              variant: "info"
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                      <div className="p-6 border-b border-slate-700">
                        <h4 className="text-xl font-semibold text-white mb-2">Vertical Sidebar Navigation</h4>
                        <p className="text-white/60">Collapsible sidebar with organized menu items and user profile section</p>
                      </div>
                      <div className="p-8 min-h-[500px] flex">
                        <ACTNavigation
                          variant="vertical"
                          showLogo={true}
                          showSearch={true}
                          showUserMenu={true}
                          dark={true}
                          className="w-80 bg-slate-900/50 rounded-lg"
                          onNavigate={(href) => {
                            console.log('Navigate to:', href);
                            toast({
                              title: "Sidebar Navigation",
                              description: `Navigating to ${href}`,
                              variant: "info"
                            });
                          }}
                        />
                        <div className="flex-1 p-8">
                          <div className="bg-slate-700/30 rounded-lg p-6 h-full flex items-center justify-center">
                            <p className="text-white/70 text-center">Main content area would be displayed here...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>
              </section>

              {/* System Banners - Standalone Section */}
              <section className="w-full">
                <ACTFrameElement variant="glass" size="xl" className="p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">System Banners</h3>
                    <p className="text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-4xl mx-auto leading-relaxed">
                      Professional notification banners with clean typography and climate-specific messaging. 
                      Features multiple variants, icons, and dismissible options for system communications.
                    </p>
                  </div>
                  <div className="max-w-4xl mx-auto space-y-8">
                    <ACTBanner
                      variant="success"
                      message="Global climate data synchronization completed successfully. All monitoring stations are now reporting real-time environmental metrics."
                      icon={<CheckCircle className="w-6 h-6" />}
                      dark={true}
                      className="text-base"
                    />
                    <ACTBanner
                      variant="info"
                      message="New carbon footprint analysis tools are now available for enterprise clients. Advanced reporting features include scope 1, 2, and 3 emissions tracking."
                      icon={<Info className="w-6 h-6" />}
                      dark={true}
                      className="text-base"
                    />
                    <ACTBanner
                      variant="warning"
                      message="Scheduled maintenance for climate data servers on Sunday, 2:00 AM - 4:00 AM UTC. Some features may be temporarily unavailable during this window."
                      icon={<AlertTriangle className="w-6 h-6" />}
                      dark={true}
                      className="text-base"
                    />
                    <ACTBanner
                      variant="error"
                      message="Critical alert: Temperature thresholds exceeded in monitoring region 7A. Immediate investigation required for environmental safety protocols."
                      icon={<AlertCircle className="w-6 h-6" />}
                      dark={true}
                      className="text-base"
                    />
                  </div>
                </ACTFrameElement>
              </section>

              {/* File Upload System - Standalone Section */}
              <section className="w-full">
                <ACTFrameElement variant="glass" size="xl" className="p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">File Upload System</h3>
                    <p className="text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-4xl mx-auto leading-relaxed">
                      Advanced file upload component for climate data, reports, and documentation. 
                      Supports drag-and-drop, multiple file types, progress tracking, and file validation.
                    </p>
                  </div>
                  <div className="max-w-3xl mx-auto space-y-8">
                    <ACTFileUpload
                      onChange={handleFileUpload}
                      accept="application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                      maxSize={10}
                      maxFiles={5}
                      variant="glass"
                      className="bg-slate-800/50 border-spring-green/30 min-h-[200px]"
                      dragInactiveText="Upload Climate Data Files - Drag and drop your climate reports, data files, or documentation here"
                    />
                    {files.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg p-6 border border-spring-green/20">
                        <h4 className="text-lg font-semibold mb-4 text-white">Uploaded Files:</h4>
                        <div className="space-y-3">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg">
                              <FileText className="w-5 h-5 text-spring-green" />
                              <div className="flex-1">
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-white/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <ACTBadge variant="success" size="sm">Uploaded</ACTBadge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ACTFrameElement>
              </section>

              {/* Interactive Dashboard - Standalone Section */}
              <section className="w-full">
                <ACTFrameElement variant="glass" size="xl" className="p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Interactive Dashboard</h3>
                    <p className="text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-4xl mx-auto leading-relaxed">
                      Real-time climate data dashboard with interactive controls and professional visualizations. 
                      Features live data updates, customizable widgets, and comprehensive analytics.
                    </p>
                  </div>
                  <div className="max-w-6xl mx-auto">
                    <div className="bg-slate-800/50 rounded-lg p-8 min-h-[600px]">
                      <ACTDashboard
                        title="Climate Action Dashboard"
                        description="Real-time monitoring of global climate initiatives and environmental metrics"
                        variant="glass"
                        dark={true}
                        animated={true}
                        stats={[
                          {
                            label: "Carbon Reduced",
                            value: "2.4M",
                            change: "+15%",
                            trend: "up",
                            icon: <Leaf className="w-5 h-5" />,
                            color: "spring-green"
                          },
                          {
                            label: "Active Projects",
                            value: "156",
                            change: "+8%",
                            trend: "up", 
                            icon: <Activity className="w-5 h-5" />,
                            color: "blue"
                          },
                          {
                            label: "Renewable Energy",
                            value: "78%",
                            change: "+12%",
                            trend: "up",
                            icon: <Zap className="w-5 h-5" />,
                            color: "yellow"
                          },
                          {
                            label: "Global Impact",
                            value: "89",
                            change: "+25%",
                            trend: "up",
                            icon: <Globe className="w-5 h-5" />,
                            color: "green"
                          }
                        ]}
                        widgets={[
                          {
                            id: "emissions",
                            title: "Carbon Emissions Tracking",
                            size: "lg",
                            content: (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/70">Current Month</span>
                                  <span className="text-spring-green font-bold">-15.3%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-3">
                                  <div className="bg-spring-green h-3 rounded-full" style={{ width: '68%' }}></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-white/50">Scope 1</div>
                                    <div className="text-white font-medium">2.1M tons</div>
                                  </div>
                                  <div>
                                    <div className="text-white/50">Scope 2</div>
                                    <div className="text-white font-medium">1.8M tons</div>
                                  </div>
                                </div>
                              </div>
                            ),
                            icon: <Leaf className="w-5 h-5" />
                          },
                          {
                            id: "energy",
                            title: "Renewable Energy Mix",
                            size: "md",
                            content: (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Solar</span>
                                  <span className="text-yellow-400">45%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Wind</span>
                                  <span className="text-blue-400">30%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Hydro</span>
                                  <span className="text-cyan-400">15%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Other</span>
                                  <span className="text-green-400">10%</span>
                                </div>
                              </div>
                            ),
                            icon: <Zap className="w-5 h-5" />
                          },
                          {
                            id: "projects",
                            title: "Active Climate Projects",
                            size: "md",
                            content: (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Solar Deployment</span>
                                  <span className="text-spring-green">87% Complete</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Ocean Cleanup</span>
                                  <span className="text-blue-400">65% Complete</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Forest Restoration</span>
                                  <span className="text-green-400">91% Complete</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Carbon Capture</span>
                                  <span className="text-yellow-400">42% Complete</span>
                                </div>
                              </div>
                            ),
                            icon: <TreePine className="w-5 h-5" />
                          },
                          {
                            id: "impact",
                            title: "Global Climate Impact",
                            size: "lg",
                            content: (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-spring-green">127</div>
                                  <div className="text-white/60">Countries</div>
                                </div>
                                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-400">2.4K+</div>
                                  <div className="text-white/60">Projects</div>
                                </div>
                                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-yellow-400">15.7M</div>
                                  <div className="text-white/60">Tons CO₂</div>
                                </div>
                                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-400">50K+</div>
                                  <div className="text-white/60">Professionals</div>
                                </div>
                              </div>
                            ),
                            icon: <Globe className="w-5 h-5" />
                          }
                        ]}
                        actions={
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                              <Filter className="w-4 h-4 mr-2" />
                              Filter
                            </Button>
                            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        }
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </ACTFrameElement>
              </section>

              {/* Loading States - Standalone Section */}
              <section className="w-full">
                <ACTFrameElement variant="glass" size="xl" className="p-8 md:p-12 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Loading & Progress Indicators</h3>
                    <p className="text-base md:text-lg lg:text-xl text-white/70 font-sf-pro max-w-4xl mx-auto leading-relaxed">
                      Professional loading states and progress indicators for data processing operations. 
                      Multiple variants and sizes for different use cases and applications.
                    </p>
                  </div>
                  <div className="max-w-4xl mx-auto space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                      <div className="text-center space-y-6 bg-slate-800/30 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-white">Default Spinner</h4>
                        <Spinner size="lg" variant="default" />
                        <p className="text-sm text-white/60">Standard loading indicator</p>
                      </div>
                      <div className="text-center space-y-6 bg-slate-800/30 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-white">Primary Spinner</h4>
                        <Spinner size="lg" variant="primary" />
                        <p className="text-sm text-white/60">Climate-themed primary</p>
                      </div>
                      <div className="text-center space-y-6 bg-slate-800/30 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-white">Secondary Spinner</h4>
                        <Spinner size="lg" variant="secondary" />
                        <p className="text-sm text-white/60">Subtle secondary variant</p>
                      </div>
                      <div className="text-center space-y-6 bg-slate-800/30 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-white">Accent Spinner</h4>
                        <Spinner size="lg" variant="accent" />
                        <p className="text-sm text-white/60">High-contrast accent</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-8">
                      <h4 className="text-xl font-semibold text-white mb-6">Data Processing Example</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Spinner size="sm" variant="primary" />
                          <span className="text-white text-lg">Processing climate data analysis...</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4">
                          <div className="bg-spring-green h-4 rounded-full transition-all duration-1000" style={{ width: '67%' }}></div>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>67% complete</span>
                          <span>Estimated time: 2 minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>
              </section>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Chat & Communication</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Advanced chat interfaces and professional communication features
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* Climate Advisory Chat */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Climate Advisory Chat</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Full-featured chat interface with AI climate assistance and real-time messaging.
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 sm:p-4 lg:p-6 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
                    <ACTChatWindow
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      placeholder="Ask about climate data, sustainability metrics..."
                      className="h-full"
                      variant="glass"
                      title="Climate Advisory AI"
                      subtitle="Real-time climate intelligence"
                      showTimestamps={true}
                      showAvatars={true}
                      allowAttachments={true}
                      dark={true}
                    />
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Advanced Components</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Sophisticated interactive elements with professional animations and advanced functionality
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* Video Player Component */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Climate Action Video Player</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional video player component with climate-focused content and modern controls.
                    </p>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <ACTVideoPlayer
                      youtubeId="dQw4w9WgXcQ"
                      title="Climate Action and Sustainable Development"
                      variant="glass"
                      aspectRatio="16:9"
                      dark={true}
                      animated={true}
                      autoPlay={false}
                    />
                  </div>
                </ACTFrameElement>

                {/* Speech Wave & Audio Components */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Audio Visualization</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Advanced speech wave visualization for climate presentations and audio analysis.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Recording Controls</h4>
                      <div className="flex items-center gap-4">
                        <ACTButton
                          variant={isRecording ? "accent" : "primary"}
                          size="lg"
                          icon={isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          onClick={toggleRecording}
                        >
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </ACTButton>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-sm text-white/70">
                            {isRecording ? "Recording..." : "Ready"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Speech Wave Visualization</h4>
                      <div className="bg-slate-800/50 rounded-lg p-4 min-h-[120px] flex items-center">
                        <ACTSpeechWave
                          isActive={isRecording}
                          variant="siri"
                          className="w-full"
                          activeColor="#2CF586"
                        />
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Toast Notification Demo */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Toast Notifications</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Professional toast notification system with various styles and climate-specific messaging.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <ACTButton
                      variant="primary"
                      size="md"
                      icon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => toast({
                        title: "Data Sync Complete",
                        description: "Climate data has been successfully synchronized.",
                        variant: "success"
                      })}
                    >
                      Success Toast
                    </ACTButton>
                    <ACTButton
                      variant="secondary"
                      size="md"
                      icon={<Info className="w-4 h-4" />}
                      onClick={() => toast({
                        title: "New Features Available",
                        description: "Enhanced carbon tracking tools are now live.",
                        variant: "info"
                      })}
                    >
                      Info Toast
                    </ACTButton>
                    <ACTButton
                      variant="accent"
                      size="md"
                      icon={<AlertTriangle className="w-4 h-4" />}
                      onClick={() => toast({
                        title: "Temperature Alert",
                        description: "Regional temperature above threshold detected.",
                        variant: "warning"
                      })}
                    >
                      Warning Toast
                    </ACTButton>
                    <ACTButton
                      variant="outline"
                      size="md"
                      icon={<AlertCircle className="w-4 h-4" />}
                      onClick={() => toast({
                        title: "Connection Error",
                        description: "Unable to connect to climate monitoring station.",
                        variant: "error"
                      })}
                    >
                      Error Toast
                    </ACTButton>
                  </div>
                </ACTFrameElement>

                {/* ACT Toast Component Showcase */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">ACT Toast Component</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Custom ACT toast components with climate-specific styling and enhanced functionality.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-semibold text-white mb-4">Climate Toast Examples</h4>
                      <div className="space-y-4 bg-slate-900/70 rounded-lg p-6">
                        <ACTToast
                          type="success"
                          title="Carbon Neutral Achieved"
                          message="Your organization has successfully achieved carbon neutral status for Q4 2024."
                          icon={<Leaf className="w-5 h-5" />}
                          showProgress={true}
                          className="relative position-static !bg-green-50 !border-green-200 !text-green-900"
                          autoClose={false}
                        />
                        <ACTToast
                          type="info"
                          title="Climate Data Update"
                          message="New environmental metrics available in your dashboard."
                          icon={<BarChart3 className="w-5 h-5" />}
                          action={
                            <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                              View Data
                            </button>
                          }
                          className="relative position-static !bg-blue-50 !border-blue-200 !text-blue-900"
                          autoClose={false}
                        />
                        <ACTToast
                          type="warning"
                          title="Maintenance Scheduled"
                          message="Climate monitoring systems will undergo maintenance on Sunday."
                          icon={<Settings className="w-5 h-5" />}
                          showProgress={true}
                          className="relative position-static !bg-yellow-50 !border-yellow-200 !text-yellow-900"
                          autoClose={false}
                        />
                        <ACTToast
                          type="error"
                          title="Sensor Alert"
                          message="Temperature sensor #47 offline. Immediate attention required."
                          icon={<AlertTriangle className="w-5 h-5" />}
                          action={
                            <button className="text-red-600 hover:text-red-500 text-sm font-medium">
                              Fix Now
                            </button>
                          }
                          className="relative position-static !bg-red-50 !border-red-200 !text-red-900"
                          autoClose={false}
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-semibold text-white mb-4">Interactive Toast Demo</h4>
                      <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                        <p className="text-sm text-white/70 mb-4">
                          Click buttons below to trigger different toast notifications:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <ACTButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Goal Achievement",
                                description: "Renewable energy target reached ahead of schedule!",
                                variant: "success"
                              });
                            }}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            Success Toast
                          </ACTButton>
                          <ACTButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Data Sync Complete",
                                description: "Climate metrics updated successfully.",
                                variant: "info"
                              });
                            }}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            Info Toast
                          </ACTButton>
                          <ACTButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Action Required",
                                description: "Review pending carbon credit applications.",
                                variant: "warning"
                              });
                            }}
                            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          >
                            Warning Toast
                          </ACTButton>
                          <ACTButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Connection Failed",
                                description: "Unable to connect to climate monitoring API.",
                                variant: "error"
                              });
                            }}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            Error Toast
                          </ACTButton>
                        </div>
                        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-medium text-white mb-2">Toast Features</h5>
                          <ul className="text-sm text-white/70 space-y-1">
                            <li>• Climate-specific styling and icons</li>
                            <li>• Auto-dismiss with progress indicators</li>
                            <li>• Custom action buttons</li>
                            <li>• Multiple notification types</li>
                            <li>• Accessibility support</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* ACT Progress Tracker Component */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Climate Progress Tracker</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Advanced goal tracking system for climate initiatives, sustainability milestones, and environmental progress monitoring.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 lg:p-8">
                    <ACTProgressTracker
                      variant="dashboard"
                      showAddGoal={true}
                      showFilters={true}
                      dark={true}
                      className="w-full"
                      onGoalAdd={(goal) => {
                        console.log('Adding goal:', goal);
                        toast({
                          title: "Goal Added",
                          description: `New goal "${goal.title}" has been created`,
                          variant: "success"
                        });
                      }}
                      onGoalUpdate={(id, updates) => {
                        console.log('Updating goal:', id, updates);
                        toast({
                          title: "Goal Updated",
                          description: "Goal progress has been updated",
                          variant: "info"
                        });
                      }}
                      onMilestoneToggle={(goalId, milestoneId) => {
                        console.log('Toggling milestone:', goalId, milestoneId);
                        toast({
                          title: "Milestone Completed",
                          description: "Congratulations on reaching this milestone!",
                          variant: "success"
                        });
                      }}
                    />
                  </div>
                </ACTFrameElement>

                {/* Progress Tracker - Detailed View */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Detailed View</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Monitor sustainability goals and milestones across your organization with comprehensive progress tracking and timeline management.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 lg:p-8">
                    <ACTProgressTracker
                      variant="detailed"
                      showAddGoal={true}
                      showFilters={true}
                      dark={true}
                      className="w-full"
                    />
                  </div>
                </ACTFrameElement>

                {/* Progress Tracker - Compact View */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Compact View</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Monitor sustainability goals and milestones across your organization with streamlined progress overview and quick status updates.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 lg:p-8">
                    <ACTProgressTracker
                      variant="compact"
                      showAddGoal={false}
                      showFilters={false}
                      dark={true}
                      className="w-full"
                    />
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Dashboards Tab */}
          {activeTab === 'dashboards' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Live Analytics Dashboards</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Real-time climate data visualization with live database integration
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* AI Climate Intelligence Dashboard - STANDALONE MAXIMIZED */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">AI Climate Intelligence Dashboard</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Advanced AI-powered climate analytics with predictive modeling, natural language insights, and comprehensive data visualization for professional climate intelligence.
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2 min-h-[700px] sm:min-h-[800px] lg:min-h-[900px]">
                    <AIInsightsDashboard
                      variant="cea-pulse"
                      theme="dark"
                      className="w-full h-full"
                    />
                  </div>
                </ACTFrameElement>

                {/* Live Climate Metrics Dashboard - STANDALONE MAXIMIZED */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Live Climate Metrics Dashboard</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Real-time climate metrics with comprehensive environmental data, emissions tracking, temperature monitoring, and renewable energy analytics.
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2 min-h-[700px] sm:min-h-[800px] lg:min-h-[900px]">
                    <ClimateMetricsDashboard
                      className="w-full h-full"
                      timeRange="year"
                      showFilters={true}
                      isLoading={false}
                      variant="dark"
                    />
                  </div>
                </ACTFrameElement>

                {/* Interactive Data Visualization - STANDALONE MAXIMIZED */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Interactive Data Visualization Dashboard</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional chart system with multiple visualization types, real-time data refresh, interactive controls, and comprehensive climate analytics.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 lg:p-8 min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
                    <ACTDataVisualization
                      variant="dashboard"
                      layout="grid"
                      showControls={true}
                      showFilters={true}
                      refreshInterval={30}
                      dark={true}
                      className="w-full h-full"
                    />
                  </div>
                </ACTFrameElement>

                {/* Compact Data Visualization - STANDALONE MAXIMIZED */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Compact Data Visualization Dashboard</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Streamlined visualization layout optimized for dashboard widgets, embedded analytics, and space-efficient data presentation with essential climate metrics.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 lg:p-8 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
                    <ACTDataVisualization
                      variant="compact"
                      layout="list"
                      showControls={false}
                      showFilters={false}
                      dark={true}
                      className="w-full h-full"
                    />
                  </div>
                </ACTFrameElement>

                {/* Advanced Analytics Visualization - STANDALONE MAXIMIZED */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Advanced Analytics Visualization Dashboard</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Comprehensive analytics interface with advanced controls, filtering capabilities, masonry layout for detailed data analysis and professional climate reporting.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 lg:p-8 min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
                    <ACTDataVisualization
                      variant="analytics"
                      layout="masonry"
                      showControls={true}
                      showFilters={true}
                      dark={true}
                      className="w-full h-full"
                    />
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Forms Tab */}
          {activeTab === 'forms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Forms & Input Systems</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Complete form systems with validation, interactive inputs, and climate data collection forms
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* Complete Form Systems */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Climate Professional Registration</h3>
                      <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                        Complete registration form for climate professionals joining the ACT network
                      </p>
                    </div>
                    <ACTForm
                      fields={formFields}
                      onSubmit={handleFormSubmit}
                      submitText="Join ACT Network"
                      variant="glass"
                      className="space-y-6"
                      dark={true}
                    />
                  </ACTFrameElement>

                  <ACTFrameElement variant="frosted" size="xl" className="p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Basic Input Components</h3>
                      <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                        Individual form input elements for building custom forms
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company" className="text-white">Organization Name</Label>
                        <Input 
                          id="company" 
                          placeholder="Green Tech Solutions Inc." 
                          className="bg-slate-800 border-spring-green/30 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-white">Message</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Tell us about your sustainability initiatives..." 
                          className="bg-slate-800 border-spring-green/30 text-white min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="select-demo" className="text-white">Climate Focus Area</Label>
                        <Select>
                          <SelectTrigger className="bg-slate-800 border-spring-green/30 text-white">
                            <SelectValue placeholder="Select focus area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="renewable">Renewable Energy</SelectItem>
                            <SelectItem value="carbon">Carbon Reduction</SelectItem>
                            <SelectItem value="sustainability">Sustainability</SelectItem>
                            <SelectItem value="climate-data">Climate Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" className="border-spring-green/30" />
                        <Label htmlFor="terms" className="text-white text-sm">
                          I agree to the climate action terms and conditions
                        </Label>
                      </div>
                    </div>
                  </ACTFrameElement>
                </div>

                {/* ACT Form Variations - MOVED FROM COMPONENT VARIATIONS TAB */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Form Variations</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional form components with glass morphism, custom color schemes, and climate-focused input designs.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Glass Form with Spring Green */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-white mb-4">Climate Professional Registration</h4>
                      <ACTForm
                        variant="glass"
                        title="Join ACT Network"
                        description="Connect with climate professionals worldwide"
                        dark={true}
                        fields={[
                          {
                            id: 'name',
                            label: 'Full Name',
                            type: 'text',
                            placeholder: 'Dr. Emily Chen',
                            required: true,
                            icon: <User className="w-4 h-4" />
                          },
                          {
                            id: 'organization',
                            label: 'Organization',
                            type: 'text',
                            placeholder: 'Green Tech Solutions',
                            required: true,
                            icon: <Building2 className="w-4 h-4" />
                          },
                          {
                            id: 'expertise',
                            label: 'Climate Expertise',
                            type: 'select',
                            placeholder: 'Select your area of expertise',
                            options: [
                              { value: 'renewable-energy', label: 'Renewable Energy' },
                              { value: 'carbon-capture', label: 'Carbon Capture' },
                              { value: 'sustainability', label: 'Sustainability Consulting' },
                              { value: 'climate-data', label: 'Climate Data Analysis' }
                            ]
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Glass form submitted:', data);
                          toast({
                            title: "Registration Successful",
                            description: "Welcome to the ACT professional network!",
                            variant: "success"
                          });
                        }}
                        submitText="Join Network"
                        className="bg-spring-green/10 border-spring-green/25"
                      />
                    </div>

                    {/* Frosted Form with Seafoam Blue */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-white mb-4">Project Collaboration</h4>
                      <ACTForm
                        variant="frosted"
                        title="Start Climate Project"
                        description="Collaborate on environmental initiatives"
                        dark={true}
                        fields={[
                          {
                            id: 'project-name',
                            label: 'Project Name',
                            type: 'text',
                            placeholder: 'Ocean Cleanup Initiative',
                            required: true,
                            icon: <Briefcase className="w-4 h-4" />
                          },
                          {
                            id: 'project-type',
                            label: 'Project Type',
                            type: 'select',
                            placeholder: 'Select project category',
                            options: [
                              { value: 'conservation', label: 'Environmental Conservation' },
                              { value: 'renewable', label: 'Renewable Energy' },
                              { value: 'restoration', label: 'Ecosystem Restoration' },
                              { value: 'research', label: 'Climate Research' }
                            ]
                          },
                          {
                            id: 'description',
                            label: 'Project Description',
                            type: 'textarea',
                            placeholder: 'Describe your climate project goals and methodology...',
                            required: true
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Frosted form submitted:', data);
                          toast({
                            title: "Project Created",
                            description: "Your climate project has been initiated successfully!",
                            variant: "success"
                          });
                        }}
                        submitText="Launch Project"
                        className="bg-seafoam-blue/10 border-seafoam-blue/25"
                      />
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Minimal Form Variations */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Minimal Form Variations</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Clean, minimal form designs for quick data entry and streamlined user experiences.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-slate-800/30 rounded-lg p-6 border border-moss-green/30">
                      <ACTForm
                        variant="minimal"
                        title="Contact Climate Experts"
                        dark={true}
                        compact={true}
                        fields={[
                          {
                            id: 'contact-email',
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'expert@climateaction.org',
                            required: true,
                            icon: <Mail className="w-4 h-4" />
                          },
                          {
                            id: 'subject',
                            label: 'Subject',
                            type: 'text',
                            placeholder: 'Climate Collaboration Inquiry',
                            required: true
                          },
                          {
                            id: 'message',
                            label: 'Message',
                            type: 'textarea',
                            placeholder: 'I would like to discuss potential collaboration opportunities...',
                            required: true
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Contact form submitted:', data);
                          toast({
                            title: "Message Sent",
                            description: "Your inquiry has been sent to our climate experts.",
                            variant: "success"
                          });
                        }}
                        submitText="Send Message"
                      />
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="bg-slate-800/30 rounded-lg p-6 border border-spring-green/30">
                      <ACTForm
                        variant="minimal"
                        title="Climate Updates Newsletter"
                        description="Stay informed about climate action and sustainability news"
                        dark={true}
                        compact={true}
                        fields={[
                          {
                            id: 'newsletter-email',
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'your@email.com',
                            required: true,
                            icon: <Mail className="w-4 h-4" />
                          },
                          {
                            id: 'interests',
                            label: 'Interests',
                            type: 'select',
                            placeholder: 'Select your interests',
                            options: [
                              { value: 'policy', label: 'Climate Policy' },
                              { value: 'technology', label: 'Green Technology' },
                              { value: 'research', label: 'Climate Research' },
                              { value: 'business', label: 'Sustainable Business' }
                            ]
                          },
                          {
                            id: 'frequency',
                            label: 'Update Frequency',
                            type: 'radio',
                            options: [
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'monthly', label: 'Monthly' }
                            ]
                          }
                        ]}
                        onSubmit={(data) => {
                          console.log('Newsletter form submitted:', data);
                          toast({
                            title: "Subscription Confirmed",
                            description: "You'll receive climate updates based on your preferences.",
                            variant: "success"
                          });
                        }}
                        submitText="Subscribe"
                      />
                    </div>
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Media & Social Components</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Social media integration, video content, and community engagement tools for climate professionals
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* Social Media Integration */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Social Media Integration</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Professional social media components for climate organizations and sustainability campaigns.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <h4 className="font-bold mb-4">Social Sharing - Solid Style</h4>
                        <ACTSocialIcons
                          icons={socialIcons}
                          variant="solid"
                          size="lg"
                          className="justify-center gap-4"
                        />
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <h4 className="font-bold mb-4">Social Sharing - Outline Style</h4>
                        <ACTSocialIcons
                          icons={socialIcons}
                          variant="outlined"
                          size="md"
                          className="justify-center gap-3"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <h4 className="font-bold mb-4">Social Sharing - Minimal Style</h4>
                        <ACTSocialIcons
                          icons={socialIcons}
                          variant="minimal"
                          size="sm"
                          className="justify-center gap-2"
                        />
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <h4 className="font-bold mb-4">Custom Social Actions</h4>
                        <div className="flex items-center justify-center gap-4">
                          <ACTButton variant="ghost" size="sm" icon={<Heart className="w-4 h-4" />}>
                            Like
                          </ACTButton>
                          <ACTButton variant="ghost" size="sm" icon={<Share className="w-4 h-4" />}>
                            Share
                          </ACTButton>
                          <ACTButton variant="ghost" size="sm" icon={<MessageCircle className="w-4 h-4" />}>
                            Comment
                          </ACTButton>
                          <ACTButton variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                            Download
                          </ACTButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Video Content Showcase */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Video Content Platform</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Professional video content integration for climate education and organizational communications.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white">Featured Climate Content</h4>
                      <ACTVideoPlayer
                        youtubeId="3doxdq2kd8k"
                        title="Sustainable Energy Solutions"
                        variant="default"
                        aspectRatio="16:9"
                        dark={true}
                        className="rounded-lg overflow-hidden"
                      />
                      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-white">Climate Education Series</h5>
                          <ACTBadge variant="outline" size="sm" className="bg-green-50/10 text-green-400 border-green-400/30">
                            New
                          </ACTBadge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                          <div>
                            <span className="block font-medium text-white/90">Duration</span>
                            <span>12:34</span>
                          </div>
                          <div>
                            <span className="block font-medium text-white/90">Category</span>
                            <span>Renewable Energy</span>
                          </div>
                          <div>
                            <span className="block font-medium text-white/90">Views</span>
                            <span>2,847</span>
                          </div>
                          <div>
                            <span className="block font-medium text-white/90">Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span>4.8</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white">Video Controls & Actions</h4>
                      <div className="bg-slate-800/50 rounded-lg p-6 space-y-6">
                        <div className="space-y-4">
                          <h5 className="font-medium text-white/90">Player Controls</h5>
                          <div className="flex items-center gap-4">
                            <ACTButton variant="primary" size="sm" icon={<Play className="w-4 h-4" />}>
                              Play
                            </ACTButton>
                            <ACTButton variant="outline" size="sm" icon={<Pause className="w-4 h-4" />}>
                              Pause
                            </ACTButton>
                            <ACTButton variant="ghost" size="sm" icon={<Volume2 className="w-4 h-4" />}>
                              Audio
                            </ACTButton>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h5 className="font-medium text-white/90">Progress Tracking</h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-white/70">
                              <span>Progress</span>
                              <span>4:32 / 12:34</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <motion.div 
                                className="bg-spring-green h-2 rounded-full" 
                                initial={{ width: '0%' }}
                                animate={{ width: '36%' }}
                                transition={{ duration: 2, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h5 className="font-medium text-white/90">Engagement</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <ACTButton variant="ghost" size="sm" className="justify-start">
                              <Heart className="w-4 h-4 mr-2" />
                              Like (127)
                            </ACTButton>
                            <ACTButton variant="ghost" size="sm" className="justify-start">
                              <Share className="w-4 h-4 mr-2" />
                              Share
                            </ACTButton>
                            <ACTButton variant="ghost" size="sm" className="justify-start">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </ACTButton>
                            <ACTButton variant="ghost" size="sm" className="justify-start">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Comment
                            </ACTButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Content Cards */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Media Content Cards</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Curated content cards featuring climate resources, research, and educational materials.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Climate Research Report 2024",
                        description: "Comprehensive analysis of global climate trends and sustainable technology adoption.",
                        type: "PDF Report",
                        size: "2.4 MB",
                        downloads: "1,247",
                        icon: <FileText className="w-6 h-6" />
                      },
                      {
                        title: "Renewable Energy Webinar",
                        description: "Live session on solar and wind energy implementation strategies for enterprises.",
                        type: "Video",
                        duration: "45 min",
                        views: "3,892",
                        icon: <Video className="w-6 h-6" />
                      },
                      {
                        title: "Carbon Footprint Calculator",
                        description: "Interactive tool for calculating organizational carbon emissions and reduction goals.",
                        type: "Interactive Tool",
                        users: "892",
                        rating: "4.9",
                        icon: <Activity className="w-6 h-6" />
                      }
                    ].map((content, index) => (
                      <ACTCard
                        key={index}
                        title={content.title}
                        description={content.description}
                        variant="glass"
                        className="bg-slate-800/30 border-spring-green/20"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-spring-green/20 rounded-lg text-spring-green">
                            {content.icon}
                          </div>
                          <ACTBadge variant="outline" size="sm" className="border-spring-green/50 text-spring-green">
                            {content.type}
                          </ACTBadge>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-xs text-white/60">
                            {content.size && <span>{content.size}</span>}
                            {content.duration && <span>{content.duration}</span>}
                            {content.downloads && <span>{content.downloads} downloads</span>}
                            {content.views && <span>{content.views} views</span>}
                            {content.users && <span>{content.users} users</span>}
                            {content.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{content.rating}</span>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-spring-green hover:bg-spring-green/10">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </ACTCard>
                    ))}
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Layout & Structure</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Complete page structure components including headers, hero sections, and footers
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* ACT Header Component */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Header System</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Professional header component with navigation, branding, and user controls.
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 sm:p-4 lg:p-6">
                    <ACTHeader 
                      variant="default"
                      className="bg-slate-800 border border-spring-green/20"
                    />
                  </div>
                </ACTFrameElement>

                {/* ACT Hero Component */}
                <ACTFrameElement variant="frosted" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Hero Section</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Compelling hero section component with call-to-action buttons and professional messaging.
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 sm:p-4 lg:p-6">
                    <ACTHero 
                      title="Transform Climate Action Through Technology"
                      subtitle="Join the Alliance for Climate Transition and connect with professionals driving sustainable change."
                      cta={
                        <ACTButton variant="primary" size="lg">
                          Join ACT Network
                        </ACTButton>
                      }
                      secondaryCta={
                        <ACTButton variant="outline" size="lg">
                          Explore Resources
                        </ACTButton>
                      }
                      variant="glass"
                      className="min-h-[400px] sm:min-h-[500px]"
                    />
                  </div>
                </ACTFrameElement>

                {/* ACT Footer Component */}
                <ACTFrameElement variant="glass" size="xl" className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">ACT Footer System</h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/70 font-sf-pro max-w-4xl">
                      Comprehensive footer component with navigation links, contact information, and climate-focused content organization.
                    </p>
                  </div>
                  <div className="space-y-8">
                    <div className="bg-slate-800 rounded-lg p-3 sm:p-4 lg:p-6">
                      <h4 className="font-semibold text-white mb-4">Comprehensive Footer</h4>
                      <ACTFooter 
                        variant="default"
                        className="bg-slate-800 border border-spring-green/20"
                        tagline="© 2024 Alliance for Climate Transition. All rights reserved."
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-3">Climate Resources</h5>
                        <ul className="text-sm text-white/70 space-y-2">
                          <li>• Climate research and reports</li>
                          <li>• Sustainability best practices</li>
                          <li>• Educational content library</li>
                          <li>• Professional certifications</li>
                          <li>• Industry partnerships</li>
                        </ul>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-3">Professional Network</h5>
                        <ul className="text-sm text-white/70 space-y-2">
                          <li>• Connect with climate experts</li>
                          <li>• Join professional groups</li>
                          <li>• Attend virtual events</li>
                          <li>• Share knowledge and insights</li>
                          <li>• Career development resources</li>
                        </ul>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-3">Contact & Support</h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Mail className="w-4 h-4" />
                            <span>contact@climateact.org</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Globe className="w-4 h-4" />
                            <span>www.allianceforclimate.org</span>
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <ACTSocialIcons
                              icons={[
                                { network: 'linkedin' as const, href: '#', label: 'LinkedIn' },
                                { network: 'twitter' as const, href: '#', label: 'Twitter' },
                                { network: 'github' as const, href: '#', label: 'GitHub' }
                              ]}
                              variant="minimal"
                              size="sm"
                              className="gap-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 sm:space-y-12 lg:space-y-16"
            >
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Feedback & Alert Components</h2>
                <p className="text-white/70 font-sf-pro text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed px-2">
                  Comprehensive feedback systems, alert notifications, and interactive response components for climate applications
                </p>
              </div>

              <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                {/* Alert System */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Climate Alert System</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Professional alert components for climate monitoring, environmental warnings, and system notifications.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white mb-3">Environmental Alerts</h4>
                      <Alert className="bg-green-500/10 border-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertTitle className="text-green-300">Carbon Goals Achieved</AlertTitle>
                        <AlertDescription className="text-white/70">
                          Your organization has successfully met Q4 carbon reduction targets, achieving a 15% decrease in emissions.
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-blue-500/10 border-blue-500/20">
                        <Info className="h-4 w-4 text-blue-400" />
                        <AlertTitle className="text-blue-300">Climate Data Sync</AlertTitle>
                        <AlertDescription className="text-white/70">
                          Successfully synchronized climate data from 47 monitoring stations across the region.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white mb-3">System Warnings</h4>
                      <Alert className="bg-yellow-500/10 border-yellow-500/20">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <AlertTitle className="text-yellow-300">Temperature Threshold</AlertTitle>
                        <AlertDescription className="text-white/70">
                          Regional temperature 3.2°C above historical average detected in monitoring zone 7A.
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-red-500/10 border-red-500/20">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertTitle className="text-red-300">Critical System Alert</AlertTitle>
                        <AlertDescription className="text-white/70">
                          Climate monitoring station offline. Immediate attention required for data continuity.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Feedback Widget */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">User Feedback System</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Interactive feedback collection widget for user experience improvement and feature requests.
                    </p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-800/50 rounded-lg p-6">
                      <ErrorBoundary fallback={<div>Feedback widget failed to load</div>}>
                        <FeedbackWidget conversationId="demo-conversation" messageId="demo-message" />
                      </ErrorBoundary>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Notification Center */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Notification Center</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Centralized notification system for climate alerts, system updates, and user communications.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">Recent Notifications</h4>
                        <ACTButton variant="ghost" size="sm" icon={<Bell className="w-4 h-4" />}>
                          Mark All Read
                        </ACTButton>
                      </div>
                      <div className="space-y-3">
                        {[
                          {
                            type: "success",
                            title: "Data Processing Complete",
                            message: "Monthly carbon emissions report ready for review",
                            time: "2 min ago",
                            icon: <CheckCircle className="w-4 h-4" />
                          },
                          {
                            type: "info",
                            title: "System Update",
                            message: "New features available in climate dashboard",
                            time: "15 min ago",
                            icon: <Info className="w-4 h-4" />
                          },
                          {
                            type: "warning",
                            title: "Maintenance Alert",
                            message: "Scheduled maintenance window approaching",
                            time: "1 hour ago",
                            icon: <AlertTriangle className="w-4 h-4" />
                          }
                        ].map((notification, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-white/10 hover:bg-slate-800/50 transition-colors">
                            <div className={`p-1 rounded-full ${
                              notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
                              notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {notification.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm">{notification.title}</p>
                              <p className="text-xs text-white/60 mt-1">{notification.message}</p>
                              <p className="text-xs text-white/40 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Notification Settings</h4>
                      <div className="space-y-4 bg-slate-800/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Climate Alerts</p>
                            <p className="text-xs text-white/60">Receive alerts for environmental changes</p>
                          </div>
                          <Switch checked={switchState} onCheckedChange={setSwitchState} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">System Updates</p>
                            <p className="text-xs text-white/60">Get notified about system changes</p>
                          </div>
                          <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Data Reports</p>
                            <p className="text-xs text-white/60">Weekly data summary notifications</p>
                          </div>
                          <Switch checked={false} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Email Notifications</p>
                            <p className="text-xs text-white/60">Receive important updates via email</p>
                          </div>
                          <Checkbox 
                            checked={checkboxState} 
                            onCheckedChange={(checked) => setCheckboxState(checked === true)} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ACTFrameElement>

                {/* Status Indicators */}
                <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Status Indicators</h3>
                    <p className="text-sm sm:text-base text-white/70 font-sf-pro">
                      Visual status indicators for system health, data quality, and operational status.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                      {
                        title: "Climate Professionals",
                        value: "1,247",
                        change: "+12%",
                        icon: <Users className="w-6 h-6" />,
                        color: "spring-green"
                      },
                      {
                        title: "Active Projects",
                        value: "156",
                        change: "+8%", 
                        icon: <Briefcase className="w-6 h-6" />,
                        color: "moss-green"
                      },
                      {
                        title: "Knowledge Articles",
                        value: "892",
                        change: "+23%",
                        icon: <BookOpen className="w-6 h-6" />,
                        color: "blue-400"
                      },
                      {
                        title: "Partner Organizations",
                        value: "67",
                        change: "+15%",
                        icon: <Building2 className="w-6 h-6" />,
                        color: "spring-green"
                      }
                    ].map((stat, i) => (
                      <ACTFrameElement key={i} variant="glass" className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-full bg-spring-green/20`}>
                            <div className="text-spring-green">
                              {stat.icon}
                            </div>
                          </div>
                          <Badge variant="outline" className="border-spring-green/50 text-spring-green">
                            {stat.change}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-2xl font-bold mb-1">{stat.value}</p>
                          <p className="text-sm text-white/60">{stat.title}</p>
                        </div>
                      </ACTFrameElement>
                    ))}
                  </div>
                </ACTFrameElement>
              </div>
            </motion.div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Live Database Integration</h2>
                <p className="text-white/70 font-sf-pro text-lg max-w-3xl mx-auto">
                  Real-time data connections, live updates, and database health monitoring
                </p>
              </div>

              <div className="space-y-8">
                <ACTFrameElement variant="glass" className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Database Health Monitor</h3>
                  <ErrorBoundary fallback={<div>Database component failed to load</div>}>
                    <DatabaseConnectionTest />
                  </ErrorBoundary>
                </ACTFrameElement>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Climate Professionals",
                      value: "1,247",
                      change: "+12%",
                      icon: <Users className="w-6 h-6" />,
                      color: "spring-green"
                    },
                    {
                      title: "Active Projects",
                      value: "156",
                      change: "+8%", 
                      icon: <Briefcase className="w-6 h-6" />,
                      color: "moss-green"
                    },
                    {
                      title: "Knowledge Articles",
                      value: "892",
                      change: "+23%",
                      icon: <BookOpen className="w-6 h-6" />,
                      color: "blue-400"
                    },
                    {
                      title: "Partner Organizations",
                      value: "67",
                      change: "+15%",
                      icon: <Building2 className="w-6 h-6" />,
                      color: "spring-green"
                    }
                  ].map((stat, i) => (
                    <ACTFrameElement key={i} variant="glass" className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full bg-spring-green/20`}>
                          <div className="text-spring-green">
                            {stat.icon}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-spring-green/50 text-spring-green">
                          {stat.change}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-white/60">{stat.title}</p>
                      </div>
                    </ACTFrameElement>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ACTFrameElement variant="glass" size="xl" className="p-6 sm:p-8 md:p-12 lg:p-16">
            <BottomCTA
              variant="dark"
              title="Ready to Build with ACT Components?"
              subtitle="Start building climate-focused applications with our production-ready component library"
              primaryCTA={{
                text: "Get Started",
                href: "#"
              }}
              secondaryCTA={{
                text: "View Documentation", 
                href: "#"
              }}
            />
          </ACTFrameElement>
        </div>
      </section>
    </div>
  );
} 