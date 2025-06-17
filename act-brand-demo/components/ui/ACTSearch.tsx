"use client";

/**
 * ACT Search Component - Alliance for Climate Transition
 * Advanced search with filtering for climate jobs, resources, and professionals
 * Location: act-brand-demo/components/ui/ACTSearch.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTButton } from './ACTButton';
import { ACTBadge } from './ACTBadge';
import { ACTFrameElement } from './ACTFrameElement';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Briefcase, 
  Users, 
  BookOpen,
  Calendar,
  DollarSign,
  Leaf,
  Building2,
  Clock,
  Star,
  ChevronDown,
  TrendingUp
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'job' | 'resource' | 'professional' | 'organization';
  title: string;
  description: string;
  location?: string;
  organization?: string;
  tags: string[];
  rating?: number;
  salary?: string;
  employmentType?: string;
  experience?: string;
  climateFocus: string[];
  publishedDate?: Date;
  featured?: boolean;
}

interface SearchFilters {
  type: string[];
  location: string[];
  climateFocus: string[];
  experience: string[];
  employmentType: string[];
  salaryRange: [number, number];
  dateRange: string;
  rating: number;
}

interface ACTSearchProps {
  placeholder?: string;
  variant?: 'default' | 'compact' | 'advanced';
  className?: string;
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultSelect?: (result: SearchResult) => void;
  showFilters?: boolean;
  showResults?: boolean;
  autoComplete?: boolean;
  dark?: boolean;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'job',
    title: 'Senior Climate Data Scientist',
    description: 'Lead climate modeling and data analysis for renewable energy projects.',
    location: 'San Francisco, CA',
    organization: 'ClimateWorks Foundation',
    tags: ['Data Science', 'Climate Modeling', 'Python', 'Machine Learning'],
    rating: 4.8,
    salary: '$120k - $180k',
    employmentType: 'Full-time',
    experience: 'Senior',
    climateFocus: ['renewable_energy', 'data_analytics'],
    publishedDate: new Date('2024-01-15'),
    featured: true
  },
  {
    id: '2',
    type: 'resource',
    title: 'Carbon Accounting Fundamentals',
    description: 'Comprehensive guide to carbon footprint measurement and reporting.',
    organization: 'Climate Education Institute',
    tags: ['Carbon Accounting', 'Sustainability', 'Education'],
    rating: 4.6,
    climateFocus: ['carbon_management', 'education'],
    publishedDate: new Date('2024-01-10')
  },
  {
    id: '3',
    type: 'professional',
    title: 'Dr. Sarah Chen - Climate Policy Expert',
    description: 'PhD in Environmental Policy with 15+ years in climate legislation.',
    location: 'Washington, DC',
    organization: 'Stanford Energy Institute',
    tags: ['Policy', 'Legislation', 'Government Relations'],
    rating: 4.9,
    climateFocus: ['policy', 'government'],
    featured: true
  },
  {
    id: '4',
    type: 'organization',
    title: 'Tesla Sustainability Division',
    description: 'Leading electric vehicle and clean energy company.',
    location: 'Austin, TX',
    tags: ['Electric Vehicles', 'Clean Energy', 'Innovation'],
    rating: 4.7,
    climateFocus: ['clean_energy', 'transportation'],
    featured: true
  }
];

const climateAreas = [
  'renewable_energy', 'carbon_management', 'sustainability', 
  'clean_energy', 'policy', 'finance', 'technology', 'education'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Washington, DC', 'Austin, TX',
  'Boston, MA', 'Seattle, WA', 'Denver, CO', 'Remote'
];

export function ACTSearch({
  placeholder = "Search climate jobs, resources, and professionals...",
  variant = 'default',
  className,
  onSearch,
  onResultSelect,
  showFilters = true,
  showResults = true,
  autoComplete = true,
  dark = false
}: ACTSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    location: [],
    climateFocus: [],
    experience: [],
    employmentType: [],
    salaryRange: [0, 300000],
    dateRange: 'all',
    rating: 0
  });

  // Search logic
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResultsPanel(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock results based on query and filters
    const filteredResults = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filters.type.length === 0 || filters.type.includes(result.type);
      const matchesLocation = filters.location.length === 0 || 
                             (result.location && filters.location.some(loc => result.location?.includes(loc)));
      const matchesClimate = filters.climateFocus.length === 0 ||
                            filters.climateFocus.some(focus => result.climateFocus.includes(focus));
      
      return matchesQuery && matchesType && matchesLocation && matchesClimate;
    });

    setResults(filteredResults);
    setShowResultsPanel(true);
    setIsSearching(false);
    
    onSearch?.(searchQuery, filters);
  };

  // Handle search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query && autoComplete) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filters]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResultsPanel(false);
        setShowFilterPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const addFilter = (filterType: keyof SearchFilters, value: string) => {
    const currentValues = filters[filterType] as string[];
    if (!currentValues.includes(value)) {
      handleFilterChange(filterType, [...currentValues, value]);
    }
  };

  const removeFilter = (filterType: keyof SearchFilters, value: string) => {
    const currentValues = filters[filterType] as string[];
    handleFilterChange(filterType, currentValues.filter(v => v !== value));
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'resource': return <BookOpen className="w-4 h-4" />;
      case 'professional': return <Users className="w-4 h-4" />;
      case 'organization': return <Building2 className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-spring-green/20 text-spring-green border-spring-green/50';
      case 'resource': return 'bg-seafoam-blue/20 text-seafoam-blue border-seafoam-blue/50';
      case 'professional': return 'bg-moss-green/20 text-moss-green border-moss-green/50';
      case 'organization': return 'bg-purple-500/20 text-purple-400 border-purple-400/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50';
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className={cn(
        "relative flex items-center",
        variant === 'compact' ? "h-10" : "h-12 md:h-14",
        dark ? "bg-slate-800 border-slate-600" : "bg-white border-gray-200",
        "border rounded-full shadow-ios-subtle"
      )}>
        <div className="absolute left-4 flex items-center gap-2">
          <Search className={cn(
            "w-4 h-4",
            dark ? "text-white/60" : "text-gray-400"
          )} />
          {isSearching && (
            <div className="w-3 h-3 border-2 border-spring-green border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResultsPanel(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-20 py-3 bg-transparent font-sf-pro",
            variant === 'compact' ? "text-sm" : "text-base",
            dark ? "text-white placeholder-white/60" : "text-midnight-forest placeholder-gray-500",
            "focus:outline-none focus:ring-0"
          )}
        />

        {showFilters && (
          <ACTButton
            variant="ghost"
            size="sm"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "absolute right-2 rounded-full",
              showFilterPanel && "bg-spring-green/20 text-spring-green"
            )}
            icon={<Filter className="w-4 h-4" />}
          >
            Filter
          </ACTButton>
        )}
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {(filters.type.length > 0 || filters.location.length > 0 || filters.climateFocus.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {[...filters.type, ...filters.location, ...filters.climateFocus].map((filter, index) => (
              <ACTBadge
                key={`${filter}-${index}`}
                variant="outline"
                size="sm"
                className="bg-spring-green/10 text-spring-green border-spring-green/30"
              >
                {filter}
                <button
                  onClick={() => {
                    if (filters.type.includes(filter)) removeFilter('type', filter);
                    if (filters.location.includes(filter)) removeFilter('location', filter);
                    if (filters.climateFocus.includes(filter)) removeFilter('climateFocus', filter);
                  }}
                  className="ml-1 hover:bg-spring-green/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </ACTBadge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 z-50",
              dark ? "bg-slate-800 border-slate-600" : "bg-white border-gray-200",
              "border rounded-lg shadow-ios-normal"
            )}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-sf-pro-rounded font-semibold",
                  dark ? "text-white" : "text-midnight-forest"
                )}>
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className={cn(
                    "p-1 rounded-full hover:bg-gray-100",
                    dark && "hover:bg-slate-700"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Content Type */}
                <div>
                  <label className={cn(
                    "block font-sf-pro font-medium mb-2",
                    dark ? "text-white" : "text-midnight-forest"
                  )}>
                    Content Type
                  </label>
                  <div className="space-y-2">
                    {['job', 'resource', 'professional', 'organization'].map(type => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFilter('type', type);
                            } else {
                              removeFilter('type', type);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-spring-green focus:ring-spring-green"
                        />
                        <span className={cn(
                          "text-sm font-sf-pro capitalize",
                          dark ? "text-white/80" : "text-gray-700"
                        )}>
                          {type}s
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Climate Focus */}
                <div>
                  <label className={cn(
                    "block font-sf-pro font-medium mb-2",
                    dark ? "text-white" : "text-midnight-forest"
                  )}>
                    Climate Focus
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {climateAreas.map(area => (
                      <label key={area} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.climateFocus.includes(area)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFilter('climateFocus', area);
                            } else {
                              removeFilter('climateFocus', area);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-spring-green focus:ring-spring-green"
                        />
                        <span className={cn(
                          "text-sm font-sf-pro",
                          dark ? "text-white/80" : "text-gray-700"
                        )}>
                          {area.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className={cn(
                    "block font-sf-pro font-medium mb-2",
                    dark ? "text-white" : "text-midnight-forest"
                  )}>
                    Location
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {locations.map(location => (
                      <label key={location} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.location.includes(location)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFilter('location', location);
                            } else {
                              removeFilter('location', location);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-spring-green focus:ring-spring-green"
                        />
                        <span className={cn(
                          "text-sm font-sf-pro",
                          dark ? "text-white/80" : "text-gray-700"
                        )}>
                          {location}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-600">
                <button
                  onClick={() => setFilters({
                    type: [],
                    location: [],
                    climateFocus: [],
                    experience: [],
                    employmentType: [],
                    salaryRange: [0, 300000],
                    dateRange: 'all',
                    rating: 0
                  })}
                  className={cn(
                    "text-sm font-sf-pro",
                    dark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Clear All
                </button>
                <ACTButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    performSearch(query);
                    setShowFilterPanel(false);
                  }}
                >
                  Apply Filters
                </ACTButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Panel */}
      <AnimatePresence>
        {showResults && showResultsPanel && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 z-40",
              dark ? "bg-slate-800 border-slate-600" : "bg-white border-gray-200",
              "border rounded-lg shadow-ios-normal max-h-96 overflow-y-auto"
            )}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "text-sm font-sf-pro",
                  dark ? "text-white/70" : "text-gray-600"
                )}>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
              <div className="space-y-3">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      dark ? "border-slate-600 hover:bg-slate-700" : "border-gray-200 hover:bg-gray-50"
                    )}
                    onClick={() => {
                      onResultSelect?.(result);
                      setShowResultsPanel(false);
                      setQuery('');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        getTypeColor(result.type)
                      )}>
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            "font-sf-pro font-medium truncate",
                            dark ? "text-white" : "text-midnight-forest"
                          )}>
                            {result.title}
                          </h4>
                          {result.featured && (
                            <ACTBadge variant="outline" size="sm" className="bg-amber-500/20 text-amber-600 border-amber-500/50">
                              Featured
                            </ACTBadge>
                          )}
                        </div>
                        
                        <p className={cn(
                          "text-sm font-sf-pro mb-2 line-clamp-2",
                          dark ? "text-white/70" : "text-gray-600"
                        )}>
                          {result.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          {result.organization && (
                            <span className={cn(
                              "flex items-center gap-1",
                              dark ? "text-white/60" : "text-gray-500"
                            )}>
                              <Building2 className="w-3 h-3" />
                              {result.organization}
                            </span>
                          )}
                          
                          {result.location && (
                            <span className={cn(
                              "flex items-center gap-1",
                              dark ? "text-white/60" : "text-gray-500"
                            )}>
                              <MapPin className="w-3 h-3" />
                              {result.location}
                            </span>
                          )}
                          
                          {result.rating && (
                            <span className={cn(
                              "flex items-center gap-1",
                              dark ? "text-white/60" : "text-gray-500"
                            )}>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {result.rating}
                            </span>
                          )}
                          
                          {result.salary && (
                            <span className={cn(
                              "flex items-center gap-1 text-spring-green",
                              dark ? "text-spring-green" : "text-spring-green"
                            )}>
                              <DollarSign className="w-3 h-3" />
                              {result.salary}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className={cn(
                                "px-2 py-0.5 text-xs rounded-full",
                                dark ? "bg-slate-700 text-white/70" : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                          {result.tags.length > 3 && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              dark ? "bg-slate-700 text-white/70" : "bg-gray-100 text-gray-600"
                            )}>
                              +{result.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {results.length > 5 && (
                <div className="mt-4 text-center">
                  <ACTButton variant="ghost" size="sm">
                    View All Results
                  </ACTButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 