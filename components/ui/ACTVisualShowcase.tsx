"use client";

/**
 * ACT Visual Showcase - Alliance for Climate Transition
 * Comprehensive visual showcase components for maximum viewing impact
 * Location: components/ui/ACTVisualShowcase.tsx
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Heart, 
  Share, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Dot,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  Star,
  Zap,
  TreePine,
  Droplets,
  Wind
} from 'lucide-react';
import { ACTImagePlaceholder } from './ACTImagePlaceholder';
import { ACTAvatar } from './ACTAvatar';
import { ClimateHeroCard, ClimateImpactCard, ProjectShowcaseCard, FeatureGridCard } from './ACTCardVariations';

// Media Gallery Component
interface MediaGalleryProps {
  items: Array<{
    id: string;
    type: 'image' | 'video';
    src: string;
    alt?: string;
    title?: string;
    description?: string;
    author?: { name: string; avatar?: string };
    stats?: { likes: number; shares: number; views: number };
  }>;
  className?: string;
}

export function MediaGallery({ items, className }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentItem = items[currentIndex];

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className={cn('relative bg-black rounded-2xl overflow-hidden', className)}>
      {/* Main Display */}
      <div className="relative aspect-video">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <ACTImagePlaceholder
              src={currentItem.src}
              alt={currentItem.alt}
              variant="climate"
              className="w-full h-full"
            />
            
            {/* Play button for videos */}
            {currentItem.type === 'video' && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white ml-1" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </div>
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button
          onClick={prevItem}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={nextItem}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
            <Share className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Information Panel */}
      <div className="p-6 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentItem.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {currentItem.description}
            </p>
          </div>
          {currentItem.stats && (
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{currentItem.stats.views} views</span>
              <span>{currentItem.stats.likes} likes</span>
            </div>
          )}
        </div>

        {/* Author */}
        {currentItem.author && (
          <div className="flex items-center gap-3 mb-4">
            <ACTAvatar
              src={currentItem.author.avatar}
              name={currentItem.author.name}
              size="sm"
              monogram={!currentItem.author.avatar}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentItem.author.name}
            </span>
          </div>
        )}

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors',
                index === currentIndex ? 'border-spring-green' : 'border-transparent'
              )}
            >
              <ACTImagePlaceholder
                src={item.src}
                variant="default"
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview - Big data showcase
interface DashboardOverviewProps {
  title: string;
  subtitle: string;
  metrics: Array<{
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  }>;
  featuredCard?: React.ReactNode;
  className?: string;
}

export function DashboardOverview({
  title,
  subtitle,
  metrics,
  featuredCard,
  className
}: DashboardOverviewProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <ClimateImpactCard
            key={index}
            title={metric.label}
            description=""
            impact={metric.value}
            metric={metric.change > 0 ? `+${metric.change}%` : `${metric.change}%`}
            icon={metric.icon}
            trend={metric.change > 0 ? 'up' : metric.change < 0 ? 'down' : 'stable'}
            color={metric.color}
          />
        ))}
      </div>

      {/* Featured Content */}
      {featuredCard && (
        <div className="mt-12">
          {featuredCard}
        </div>
      )}
    </div>
  );
}

// Project Portfolio - Large showcase grid
interface ProjectPortfolioProps {
  projects: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    image?: string;
    technologies: string[];
    team: Array<{ name: string; avatar?: string }>;
    progress: number;
    status: 'planning' | 'active' | 'completed';
    featured?: boolean;
  }>;
  className?: string;
}

export function ProjectPortfolio({ projects, className }: ProjectPortfolioProps) {
  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);

  return (
    <div className={cn('space-y-12', className)}>
      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProjects.map((project) => (
              <ProjectShowcaseCard
                key={project.id}
                title={project.title}
                category={project.category}
                description={project.description}
                imageSrc={project.image}
                technologies={project.technologies}
                team={project.team}
                progress={project.progress}
                status={project.status}
                className="lg:col-span-1"
              />
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          All Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {regularProjects.map((project) => (
            <ProjectShowcaseCard
              key={project.id}
              title={project.title}
              category={project.category}
              description={project.description}
              imageSrc={project.image}
              technologies={project.technologies}
              team={project.team}
              progress={project.progress}
              status={project.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Feature Showcase Grid
interface FeatureShowcaseProps {
  title: string;
  subtitle: string;
  features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  }>;
  className?: string;
}

export function FeatureShowcase({ title, subtitle, features, className }: FeatureShowcaseProps) {
  return (
    <div className={cn('space-y-12', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureGridCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
          />
        ))}
      </div>
    </div>
  );
} 