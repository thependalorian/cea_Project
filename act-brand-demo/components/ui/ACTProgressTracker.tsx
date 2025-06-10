/**
 * ACT Progress Tracker Component - Alliance for Climate Transition
 * Track climate goals, milestones, and sustainability progress
 * Location: act-brand-demo/components/ui/ACTProgressTracker.tsx
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTButton } from './ACTButton';
import { ACTBadge } from './ACTBadge';
import { ACTFrameElement } from './ACTFrameElement';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  Leaf,
  Zap,
  Building2,
  Droplets,
  Recycle,
  Globe,
  Award,
  ArrowRight,
  Plus,
  Edit,
  MoreHorizontal,
  Flag,
  BarChart3,
  Activity,
  Lightbulb,
  TreePine
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
  completedDate?: Date;
  category: 'energy' | 'carbon' | 'waste' | 'water' | 'transport' | 'governance';
}

interface ProgressGoal {
  id: string;
  title: string;
  description: string;
  category: 'carbon_reduction' | 'renewable_energy' | 'waste_reduction' | 'water_conservation' | 'biodiversity' | 'social_impact';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  startDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  milestones: Milestone[];
  responsible?: string;
  budget?: number;
  impact?: string;
}

interface ACTProgressTrackerProps {
  goals?: ProgressGoal[];
  variant?: 'dashboard' | 'detailed' | 'compact';
  showAddGoal?: boolean;
  showFilters?: boolean;
  className?: string;
  dark?: boolean;
  onGoalAdd?: (goal: Partial<ProgressGoal>) => void;
  onGoalUpdate?: (id: string, updates: Partial<ProgressGoal>) => void;
  onMilestoneToggle?: (goalId: string, milestoneId: string) => void;
}

const sampleGoals: ProgressGoal[] = [
  {
    id: 'carbon-neutral-2030',
    title: 'Carbon Neutral Operations',
    description: 'Achieve net-zero carbon emissions across all operations by 2030',
    category: 'carbon_reduction',
    target: 100,
    current: 67,
    unit: '%',
    deadline: new Date('2030-12-31'),
    startDate: new Date('2023-01-01'),
    priority: 'critical',
    status: 'on_track',
    responsible: 'Chief Sustainability Officer',
    budget: 2500000,
    impact: 'Eliminate 10,000 tons CO2e annually',
    milestones: [
      {
        id: 'm1',
        title: 'Energy Audit Complete',
        description: 'Comprehensive energy usage assessment',
        date: new Date('2024-03-01'),
        completed: true,
        completedDate: new Date('2024-02-28'),
        category: 'energy'
      },
      {
        id: 'm2',
        title: '50% Renewable Energy',
        description: 'Transition to 50% renewable energy sources',
        date: new Date('2024-06-01'),
        completed: true,
        completedDate: new Date('2024-05-15'),
        category: 'energy'
      },
      {
        id: 'm3',
        title: 'Carbon Offset Program',
        description: 'Launch verified carbon offset initiative',
        date: new Date('2024-09-01'),
        completed: false,
        category: 'carbon'
      },
      {
        id: 'm4',
        title: '100% Renewable Energy',
        description: 'Complete transition to renewable energy',
        date: new Date('2025-12-01'),
        completed: false,
        category: 'energy'
      }
    ]
  },
  {
    id: 'renewable-energy-2025',
    title: '100% Renewable Energy',
    description: 'Power all facilities with renewable energy sources',
    category: 'renewable_energy',
    target: 100,
    current: 78,
    unit: '%',
    deadline: new Date('2025-12-31'),
    startDate: new Date('2023-06-01'),
    priority: 'high',
    status: 'on_track',
    responsible: 'Facilities Manager',
    budget: 1200000,
    impact: 'Reduce carbon footprint by 40%',
    milestones: [
      {
        id: 'r1',
        title: 'Solar Panel Installation',
        description: 'Install 500kW solar panel system',
        date: new Date('2024-04-01'),
        completed: true,
        completedDate: new Date('2024-03-20'),
        category: 'energy'
      },
      {
        id: 'r2',
        title: 'Wind Energy Contract',
        description: 'Sign 10-year wind energy purchase agreement',
        date: new Date('2024-08-01'),
        completed: false,
        category: 'energy'
      }
    ]
  },
  {
    id: 'waste-zero-2026',
    title: 'Zero Waste to Landfill',
    description: 'Achieve zero waste to landfill through recycling and composting',
    category: 'waste_reduction',
    target: 0,
    current: 12,
    unit: '% to landfill',
    deadline: new Date('2026-06-30'),
    startDate: new Date('2024-01-01'),
    priority: 'medium',
    status: 'at_risk',
    responsible: 'Operations Manager',
    budget: 350000,
    impact: 'Divert 500 tons annually from landfills',
    milestones: [
      {
        id: 'w1',
        title: 'Recycling Program Expansion',
        description: 'Expand recycling to all materials',
        date: new Date('2024-06-01'),
        completed: false,
        category: 'waste'
      },
      {
        id: 'w2',
        title: 'Composting System',
        description: 'Implement organic waste composting',
        date: new Date('2024-10-01'),
        completed: false,
        category: 'waste'
      }
    ]
  }
];

export function ACTProgressTracker({
  goals = sampleGoals,
  variant = 'dashboard',
  showAddGoal = true,
  showFilters = true,
  className,
  dark = false,
  onGoalAdd,
  onGoalUpdate,
  onMilestoneToggle
}: ACTProgressTrackerProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredGoals = goals.filter(goal => {
    const categoryMatch = filterCategory === 'all' || goal.category === filterCategory;
    const statusMatch = filterStatus === 'all' || goal.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carbon_reduction': return <Globe className="w-4 h-4" />;
      case 'renewable_energy': return <Zap className="w-4 h-4" />;
      case 'waste_reduction': return <Recycle className="w-4 h-4" />;
      case 'water_conservation': return <Droplets className="w-4 h-4" />;
      case 'biodiversity': return <TreePine className="w-4 h-4" />;
      case 'social_impact': return <Building2 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'carbon_reduction': return 'bg-red-500/20 text-red-600 border-red-500/50';
      case 'renewable_energy': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50';
      case 'waste_reduction': return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'water_conservation': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'biodiversity': return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50';
      case 'social_impact': return 'bg-purple-500/20 text-purple-600 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600';
      case 'at_risk': return 'text-yellow-600';
      case 'behind': return 'text-red-600';
      case 'completed': return 'text-spring-green';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="w-4 h-4" />;
      case 'at_risk': return <AlertTriangle className="w-4 h-4" />;
      case 'behind': return <Clock className="w-4 h-4" />;
      case 'completed': return <Award className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProgress = (goal: ProgressGoal) => {
    if (goal.target === 0) {
      // For reduction goals (e.g., waste to landfill)
      return Math.max(0, ((goal.target - goal.current) / goal.target) * 100);
    }
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const calculateTimeProgress = (goal: ProgressGoal) => {
    const total = goal.deadline.getTime() - goal.startDate.getTime();
    const elapsed = Date.now() - goal.startDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const renderGoalCard = (goal: ProgressGoal) => {
    const progress = calculateProgress(goal);
    const timeProgress = calculateTimeProgress(goal);
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const totalMilestones = goal.milestones.length;

    return (
      <ACTFrameElement
        key={goal.id}
        variant="glass"
        className={cn(
          "cursor-pointer transition-all duration-300 hover:scale-105",
          selectedGoal === goal.id && "ring-2 ring-spring-green"
        )}
        onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                getCategoryColor(goal.category)
              )}>
                {getCategoryIcon(goal.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-semibold text-lg mb-1",
                  dark ? "text-white" : "text-gray-900"
                )}>
                  {goal.title}
                </h3>
                <p className={cn(
                  "text-sm line-clamp-2",
                  dark ? "text-white/70" : "text-gray-600"
                )}>
                  {goal.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ACTBadge
                variant="outline"
                size="sm"
                className={cn("capitalize", getPriorityColor(goal.priority))}
              >
                {goal.priority}
              </ACTBadge>
              <div className={cn(
                "flex items-center gap-1",
                getStatusColor(goal.status)
              )}>
                {getStatusIcon(goal.status)}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  dark ? "text-white/80" : "text-gray-700"
                )}>
                  Progress
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  dark ? "text-white" : "text-gray-900"
                )}>
                  {goal.current}{goal.unit} / {goal.target}{goal.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <motion.div
                  className={cn(
                    "h-3 rounded-full",
                    goal.status === 'completed' ? "bg-spring-green" :
                    goal.status === 'on_track' ? "bg-green-500" :
                    goal.status === 'at_risk' ? "bg-yellow-500" : "bg-red-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0{goal.unit}</span>
                <span>{progress.toFixed(1)}% complete</span>
                <span>{goal.target}{goal.unit}</span>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  dark ? "text-white/80" : "text-gray-700"
                )}>
                  Milestones
                </span>
                <span className={cn(
                  "text-sm",
                  dark ? "text-white/60" : "text-gray-500"
                )}>
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <div className="flex gap-1">
                {goal.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      "flex-1 h-2 rounded-full",
                      milestone.completed
                        ? "bg-spring-green"
                        : "bg-gray-200 dark:bg-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  dark ? "text-white/80" : "text-gray-700"
                )}>
                  Timeline
                </span>
                <span className={cn(
                  "text-sm",
                  dark ? "text-white/60" : "text-gray-500"
                )}>
                  Due {formatDate(goal.deadline)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${timeProgress}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {goal.responsible && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {goal.responsible}
                  </span>
                )}
                {goal.budget && (
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {formatCurrency(goal.budget)}
                  </span>
                )}
              </div>
              <ACTButton variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </ACTButton>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {selectedGoal === goal.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 dark:border-slate-600 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Impact */}
                {goal.impact && (
                  <div>
                    <h4 className={cn(
                      "font-medium mb-2",
                      dark ? "text-white" : "text-gray-900"
                    )}>
                      Expected Impact
                    </h4>
                    <p className={cn(
                      "text-sm",
                      dark ? "text-white/70" : "text-gray-600"
                    )}>
                      {goal.impact}
                    </p>
                  </div>
                )}

                {/* Milestones Detail */}
                <div>
                  <h4 className={cn(
                    "font-medium mb-3",
                    dark ? "text-white" : "text-gray-900"
                  )}>
                    Milestone Timeline
                  </h4>
                  <div className="space-y-3">
                    {goal.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border",
                          milestone.completed
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-600"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          milestone.completed
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-slate-600"
                        )}>
                          {milestone.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "font-medium text-sm",
                              dark ? "text-white" : "text-gray-900"
                            )}>
                              {milestone.title}
                            </span>
                            <ACTBadge variant="outline" size="sm" className="capitalize">
                              {milestone.category}
                            </ACTBadge>
                          </div>
                          
                          {milestone.description && (
                            <p className={cn(
                              "text-xs mb-1",
                              dark ? "text-white/60" : "text-gray-500"
                            )}>
                              {milestone.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {milestone.completed && milestone.completedDate
                                ? `Completed ${formatDate(milestone.completedDate)}`
                                : `Due ${formatDate(milestone.date)}`
                              }
                            </span>
                          </div>
                        </div>
                        
                        {!milestone.completed && (
                          <ACTButton
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMilestoneToggle?.(goal.id, milestone.id);
                            }}
                          >
                            Mark Complete
                          </ACTButton>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ACTFrameElement>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn(
            "text-2xl font-bold",
            dark ? "text-white" : "text-gray-900"
          )}>
            Climate Progress Tracker
          </h2>
          <p className={cn(
            "text-sm mt-1",
            dark ? "text-white/70" : "text-gray-600"
          )}>
            Monitor sustainability goals and milestones across your organization
          </p>
        </div>
        
        {showAddGoal && (
          <ACTButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Goal
          </ACTButton>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={cn(
              "px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-spring-green",
              dark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-gray-300"
            )}
          >
            <option value="all">All Categories</option>
            <option value="carbon_reduction">Carbon Reduction</option>
            <option value="renewable_energy">Renewable Energy</option>
            <option value="waste_reduction">Waste Reduction</option>
            <option value="water_conservation">Water Conservation</option>
            <option value="biodiversity">Biodiversity</option>
            <option value="social_impact">Social Impact</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={cn(
              "px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-spring-green",
              dark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-gray-300"
            )}
          >
            <option value="all">All Status</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="behind">Behind</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      {/* Progress Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Goals',
            value: goals.length,
            icon: <Target className="w-5 h-5" />,
            color: 'text-blue-600'
          },
          {
            label: 'On Track',
            value: goals.filter(g => g.status === 'on_track').length,
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'text-green-600'
          },
          {
            label: 'At Risk',
            value: goals.filter(g => g.status === 'at_risk').length,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-yellow-600'
          },
          {
            label: 'Completed',
            value: goals.filter(g => g.status === 'completed').length,
            icon: <Award className="w-5 h-5" />,
            color: 'text-spring-green'
          }
        ].map((stat, index) => (
          <ACTFrameElement key={index} variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-gray-100 dark:bg-slate-700", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <div className={cn(
                  "text-2xl font-bold",
                  dark ? "text-white" : "text-gray-900"
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  "text-sm",
                  dark ? "text-white/60" : "text-gray-500"
                )}>
                  {stat.label}
                </div>
              </div>
            </div>
          </ACTFrameElement>
        ))}
      </div>

      {/* Goals Grid */}
      <div className={cn(
        "grid gap-6",
        variant === 'compact'
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 lg:grid-cols-2"
      )}>
        {filteredGoals.map(renderGoalCard)}
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <ACTFrameElement variant="glass" className="p-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className={cn(
            "text-lg font-semibold mb-2",
            dark ? "text-white" : "text-gray-900"
          )}>
            No goals found
          </h3>
          <p className={cn(
            "text-sm mb-4",
            dark ? "text-white/60" : "text-gray-500"
          )}>
            {filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters to see more goals.'
              : 'Start tracking your climate progress by adding your first goal.'
            }
          </p>
          {showAddGoal && (
            <ACTButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Goal
            </ACTButton>
          )}
        </ACTFrameElement>
      )}
    </div>
  );
} 