"use client";

/**
 * ACT Card Variations - Alliance for Climate Transition
 * Enhanced card variations with climate themes and advanced visual effects
 * Location: components/ui/ACTCardVariations.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Leaf, 
  Zap, 
  Droplets, 
  TreePine, 
  Wind, 
  Sun, 
  Globe,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ACTImagePlaceholder } from './ACTImagePlaceholder';
import { ACTAvatar } from './ACTAvatar';

// Climate Impact Card
interface ClimateImpactCardProps {
  title: string;
  description: string;
  impact: string;
  metric: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  className?: string;
}

export function ClimateImpactCard({
  title,
  description,
  impact,
  metric,
  icon,
  trend = 'up',
  color = 'green',
  className
}: ClimateImpactCardProps) {
  const colorStyles = {
    green: 'from-spring-green/10 to-emerald-500/10 border-spring-green/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    yellow: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    red: 'from-red-500/10 to-pink-500/10 border-red-500/20',
  };

  const iconColors = {
    green: 'text-spring-green',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-br border p-6',
        colorStyles[color],
        'hover:shadow-lg transition-all duration-300',
        className
      )}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-xl bg-white/20 backdrop-blur-sm', iconColors[color])}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trend === 'up' ? 'bg-green-100 text-green-700' : 
              trend === 'down' ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-700'
            )}>
              <TrendingUp className={cn(
                'w-3 h-3',
                trend === 'down' && 'rotate-180'
              )} />
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>

        {/* Metrics */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {impact}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {metric}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
}

// Climate Hero Card - Large showcase card
interface ClimateHeroCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageSrc?: string;
  stats: Array<{ label: string; value: string; icon: React.ReactNode }>;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function ClimateHeroCard({
  title,
  subtitle,
  description,
  imageSrc,
  stats,
  action,
  className
}: ClimateHeroCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-midnight-forest to-slate-900',
        'border border-spring-green/20 shadow-xl',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ACTImagePlaceholder
          variant="climate"
          src={imageSrc}
          aspectRatio="wide"
          className="w-full h-full opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-forest/90 to-midnight-forest/50" />
      </div>

      {/* Content */}
      <div className="relative p-8 lg:p-12">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-spring-green/20 text-spring-green rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {subtitle}
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {title}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-8">
            {description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-spring-green mb-2">
                  {stat.icon}
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action */}
          {action && (
            <motion.button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-spring-green text-midnight-forest font-medium rounded-full hover:bg-spring-green/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action.label}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Project Showcase Card
interface ProjectShowcaseCardProps {
  title: string;
  category: string;
  description: string;
  imageSrc?: string;
  technologies: string[];
  team: Array<{ name: string; avatar?: string }>;
  progress: number;
  status: 'planning' | 'active' | 'completed';
  className?: string;
}

export function ProjectShowcaseCard({
  title,
  category,
  description,
  imageSrc,
  technologies,
  team,
  progress,
  status,
  className
}: ProjectShowcaseCardProps) {
  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    active: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        'overflow-hidden shadow-sm hover:shadow-md transition-all duration-300',
        className
      )}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image */}
      <ACTImagePlaceholder
        variant="climate"
        src={imageSrc}
        aspectRatio="video"
        className="w-full"
        title={title}
        subtitle={category}
      />

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category}
            </p>
          </div>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium border',
            statusColors[status]
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-md">
              +{technologies.length - 3}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-spring-green h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Team */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member, index) => (
              <ACTAvatar
                key={index}
                src={member.avatar}
                name={member.name}
                size="sm"
                className="ring-2 ring-white dark:ring-gray-800"
                monogram={!member.avatar}
              />
            ))}
            {team.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{team.length - 3}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
}

// Feature Grid Card - Compact feature highlight
interface FeatureGridCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  className?: string;
}

export function FeatureGridCard({
  icon,
  title,
  description,
  color = 'green',
  className
}: FeatureGridCardProps) {
  const colorStyles = {
    green: 'hover:border-spring-green/30 hover:bg-spring-green/5',
    blue: 'hover:border-blue-500/30 hover:bg-blue-500/5',
    yellow: 'hover:border-yellow-500/30 hover:bg-yellow-500/5',
    purple: 'hover:border-purple-500/30 hover:bg-purple-500/5',
    red: 'hover:border-red-500/30 hover:bg-red-500/5',
  };

  const iconColors = {
    green: 'text-spring-green',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
  };

  return (
    <motion.div
      className={cn(
        'p-6 rounded-lg border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 transition-all duration-300',
        colorStyles[color],
        className
      )}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={cn('mb-4', iconColors[color])}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
} 