"use client";

/**
 * Enhanced Showcase - Alliance for Climate Transition
 * Comprehensive demonstration of all enhanced visual components
 * Location: components/examples/EnhancedShowcase.tsx
 */

import React from 'react';
import { 
  Leaf, 
  Zap, 
  Droplets, 
  TreePine, 
  Wind, 
  Sun, 
  Globe,
  Users,
  BarChart3,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
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
} from '../ui';

export function EnhancedShowcase() {
  // Sample data for demonstrations
  const sampleMetrics = [
    {
      label: 'Carbon Reduced',
      value: '2.4M tons',
      change: 15,
      icon: <Leaf className="w-6 h-6" />,
      color: 'green' as const
    },
    {
      label: 'Renewable Energy',
      value: '89%',
      change: 8,
      icon: <Zap className="w-6 h-6" />,
      color: 'yellow' as const
    },
    {
      label: 'Water Conserved',
      value: '1.2B liters',
      change: 23,
      icon: <Droplets className="w-6 h-6" />,
      color: 'blue' as const
    },
    {
      label: 'Trees Planted',
      value: '450K',
      change: 31,
      icon: <TreePine className="w-6 h-6" />,
      color: 'green' as const
    }
  ];

  const sampleProjects = [
    {
      id: '1',
      title: 'Solar Grid Integration',
      category: 'Renewable Energy',
      description: 'Large-scale solar panel integration with smart grid technology for optimal energy distribution.',
      technologies: ['Solar', 'IoT', 'Smart Grid', 'AI Analytics'],
      team: [
        { name: 'Sarah Chen', avatar: '' },
        { name: 'Marcus Johnson', avatar: '' },
        { name: 'Elena Rodriguez', avatar: '' }
      ],
      progress: 75,
      status: 'active' as const,
      featured: true
    },
    {
      id: '2',
      title: 'Ocean Cleanup Initiative',
      category: 'Environmental',
      description: 'Advanced ocean plastic collection and recycling program using autonomous vessels.',
      technologies: ['Marine Tech', 'Robotics', 'Recycling', 'Data Science'],
      team: [
        { name: 'David Park', avatar: '' },
        { name: 'Lisa Wang', avatar: '' }
      ],
      progress: 60,
      status: 'active' as const,
      featured: true
    },
    {
      id: '3',
      title: 'Urban Forest Network',
      category: 'Reforestation',
      description: 'Smart urban forestry program with IoT monitoring and community engagement.',
      technologies: ['IoT Sensors', 'Mobile App', 'GIS', 'Community Platform'],
      team: [
        { name: 'Alex Thompson', avatar: '' },
        { name: 'Maria Santos', avatar: '' },
        { name: 'James Liu', avatar: '' }
      ],
      progress: 90,
      status: 'completed' as const
    }
  ];

  const sampleFeatures = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Impact Tracking',
      description: 'Real-time monitoring of environmental impact across all projects worldwide.',
      color: 'green' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'AI-powered insights and predictive modeling for climate action optimization.',
      color: 'blue' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Engagement',
      description: 'Tools for building and managing climate-focused communities and initiatives.',
      color: 'purple' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Impact Amplification',
      description: 'Strategies and tools to maximize the effectiveness of climate actions.',
      color: 'yellow' as const
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Innovation Hub',
      description: 'Platform for sharing and developing innovative climate solutions.',
      color: 'red' as const
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: 'Carbon Offsetting',
      description: 'Comprehensive carbon offset tracking and verification system.',
      color: 'green' as const
    }
  ];

  const sampleMediaItems = [
    {
      id: '1',
      type: 'image' as const,
      src: '',
      title: 'Solar Farm Installation',
      description: 'Latest installation of our 500MW solar farm project in Arizona.',
      author: { name: 'Climate Tech Team', avatar: '' },
      stats: { views: 15420, likes: 2341, shares: 456 }
    },
    {
      id: '2',
      type: 'video' as const,
      src: '',
      title: 'Ocean Cleanup Progress',
      description: 'Monthly update on our ocean plastic collection initiative.',
      author: { name: 'Marine Conservation', avatar: '' },
      stats: { views: 8734, likes: 1205, shares: 289 }
    },
    {
      id: '3',
      type: 'image' as const,
      src: '',
      title: 'Community Tree Planting',
      description: 'Local community participating in our urban forest expansion.',
      author: { name: 'Urban Forestry', avatar: '' },
      stats: { views: 12156, likes: 1876, shares: 342 }
    }
  ];

  const featuredHeroCard = (
    <ClimateHeroCard
      title="Climate Action at Scale"
      subtitle="Global Initiative"
      description="Join our worldwide effort to combat climate change through innovative technology, community engagement, and sustainable practices. Together, we're building a greener future."
      stats={[
        { label: 'Countries', value: '45+', icon: <Globe className="w-6 h-6" /> },
        { label: 'Partners', value: '200+', icon: <Users className="w-6 h-6" /> },
        { label: 'Impact Score', value: '9.2/10', icon: <TrendingUp className="w-6 h-6" /> }
      ]}
      action={{
        label: 'Join the Movement',
        onClick: () => console.log('Join action clicked')
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-20">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Enhanced Component Showcase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive demonstration of all enhanced visual components designed for maximum 
            viewing impact and climate-focused applications.
          </p>
        </div>

        {/* Image Placeholders Showcase */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Image Placeholders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ACTImagePlaceholder
              variant="climate"
              size="lg"
              aspectRatio="square"
              title="Climate Data"
              subtitle="Real-time monitoring"
              animated
            />
            <ACTImagePlaceholder
              variant="nature"
              size="lg"
              aspectRatio="square"
              title="Forest Coverage"
              subtitle="Satellite imagery"
              animated
            />
            <ACTImagePlaceholder
              variant="ocean"
              size="lg"
              aspectRatio="square"
              title="Ocean Health"
              subtitle="Marine ecosystems"
              animated
            />
            <ACTImagePlaceholder
              variant="solar"
              size="lg"
              aspectRatio="square"
              title="Solar Energy"
              subtitle="Generation metrics"
              animated
              loading
            />
          </div>
        </section>

        {/* Dashboard Overview */}
        <section>
          <DashboardOverview
            title="Climate Impact Dashboard"
            subtitle="Real-time monitoring of global climate initiatives and their measurable impact on environmental restoration."
            metrics={sampleMetrics}
            featuredCard={featuredHeroCard}
          />
        </section>

        {/* Media Gallery */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Media Gallery
          </h2>
          <MediaGallery items={sampleMediaItems} />
        </section>

        {/* Project Portfolio */}
        <section>
          <ProjectPortfolio projects={sampleProjects} />
        </section>

        {/* Feature Showcase */}
        <section>
          <FeatureShowcase
            title="Platform Features"
            subtitle="Comprehensive tools for climate action and environmental impact management"
            features={sampleFeatures}
          />
        </section>

        {/* Individual Card Variations */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Individual Card Variations
          </h2>
          
          {/* Climate Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ClimateImpactCard
              title="Carbon Footprint"
              description="Monthly reduction tracking"
              impact="24%"
              metric="decrease this month"
              icon={<Leaf className="w-6 h-6" />}
              trend="up"
              color="green"
            />
            <ClimateImpactCard
              title="Energy Efficiency"
              description="Smart grid optimization"
              impact="156 MWh"
              metric="saved this quarter"
              icon={<Zap className="w-6 h-6" />}
              trend="up"
              color="yellow"
            />
            <ClimateImpactCard
              title="Water Conservation"
              description="Smart irrigation systems"
              impact="2.3M L"
              metric="conserved annually"
              icon={<Droplets className="w-6 h-6" />}
              trend="up"
              color="blue"
            />
            <ClimateImpactCard
              title="Air Quality"
              description="Urban pollution monitoring"
              impact="89"
              metric="AQI improvement"
              icon={<Wind className="w-6 h-6" />}
              trend="up"
              color="purple"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">
            All components are built with iOS-inspired design principles, full accessibility support, 
            and climate-focused theming. Ready for production deployment.
          </p>
        </div>
      </div>
    </div>
  );
} 