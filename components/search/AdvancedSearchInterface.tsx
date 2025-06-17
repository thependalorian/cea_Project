/**
 * Advanced Search Interface - Climate Economy Assistant
 * Comprehensive search with filters, real-time results, and mobile optimization
 * Location: components/search/AdvancedSearchInterface.tsx
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Zap, MapPin, Clock, Star } from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/use-advanced-search';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingSpinner, LoadingSearch, EmptyState } from '@/components/ui/LoadingStates';

interface AdvancedSearchInterfaceProps {
  placeholder?: string;
  initialQuery?: string;
  showFilters?: boolean;
  contentTypes?: string[];
  onResultClick?: (result: any) => void;
  className?: string;
}

export function AdvancedSearchInterface({
  placeholder = "Search jobs, resources, partners...",
  initialQuery = '',
  showFilters = true,
  contentTypes = ['job', 'resource', 'partner', 'program'],
  onResultClick,
  className = ''
}: AdvancedSearchInterfaceProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    error,
    hasResults,
    hasMore,
    totalCount,
    facets,
    suggestions,
    loadMore,
    getSuggestions
  } = useAdvancedSearch({
    autoSearch: true,
    includeFacets: true,
    limit: 12
  });

  const { screenSize, responsiveClasses } = useMobileOptimization();

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    if (value.length > 2) {
      getSuggestions(value);
    }
  }, [setQuery, getSuggestions]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey: string, value: any) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(newFilters);
    setFilters(newFilters);
  }, [selectedFilters, setFilters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({});
    setFilters({});
  }, [setFilters]);

  // Render search result
  const renderSearchResult = useCallback((result: any, index: number) => {
    const getResultIcon = () => {
      switch (result.type) {
        case 'job': return '💼';
        case 'resource': return '📚';
        case 'partner': return '🏢';
        case 'program': return '🎓';
        default: return '📄';
      }
    };

    const getResultBadge = () => {
      switch (result.type) {
        case 'job': return 'badge-primary';
        case 'resource': return 'badge-info';
        case 'partner': return 'badge-success';
        case 'program': return 'badge-warning';
        default: return 'badge-neutral';
      }
    };

    return (
      <div
        key={result.id}
        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onResultClick?.(result)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getResultIcon()}</span>
            <div className={`badge ${getResultBadge()} badge-sm`}>
              {result.type}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Star className="w-3 h-3" />
            <span>{result.relevance_score.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {result.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {result.description}
        </p>

        {/* Highlights */}
        {result.highlights.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Matches:</div>
            <div className="text-xs text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: result.highlights[0] }} />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {result.metadata.organization_name && (
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {result.metadata.organization_name}
            </span>
          )}
          {result.metadata.location && (
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {result.metadata.location}
            </span>
          )}
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(result.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }, [onResultClick]);

  // Render filter panel
  const renderFilterPanel = () => (
    <div className={`bg-white border rounded-lg p-4 ${screenSize.isMobile ? 'mb-4' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearFilters}
            className="btn btn-ghost btn-xs"
          >
            Clear All
          </button>
          {screenSize.isMobile && (
            <button
              onClick={() => setShowFilterPanel(false)}
              className="btn btn-ghost btn-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedFilters.content_types?.includes(type) || false}
                  onChange={(e) => {
                    const current = selectedFilters.content_types || [];
                    const updated = e.target.checked
                      ? [...current, type]
                      : current.filter((t: string) => t !== type);
                    handleFilterChange('content_types', updated);
                  }}
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Climate Sectors Filter */}
        {facets.climate_focus && facets.climate_focus.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Climate Focus</label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {facets.climate_focus.slice(0, 8).map(({ value, count }) => (
                <label key={value} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedFilters.climate_sectors?.includes(value) || false}
                      onChange={(e) => {
                        const current = selectedFilters.climate_sectors || [];
                        const updated = e.target.checked
                          ? [...current, value]
                          : current.filter((v: string) => v !== value);
                        handleFilterChange('climate_sectors', updated);
                      }}
                    />
                    <span className="text-sm">{value}</span>
                  </div>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Employment Type Filter (for jobs) */}
        {facets.employment_type && facets.employment_type.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Employment Type</label>
            <div className="space-y-1">
              {facets.employment_type.map(({ value, count }) => (
                <label key={value} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="employment_type"
                      className="radio radio-sm"
                      checked={selectedFilters.employment_types?.includes(value) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('employment_types', [value]);
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{value.replace('_', ' ')}</span>
                  </div>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary level="component">
      <div className={`${responsiveClasses.container} ${className}`}>
        {/* Search Header */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input input-bordered w-full pl-10 pr-4"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`btn btn-outline ${showFilterPanel ? 'btn-active' : ''}`}
            >
              <Filter className="w-4 h-4" />
              {!screenSize.isMobile && <span className="ml-2">Filters</span>}
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && query.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Suggestions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="btn btn-ghost btn-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`${screenSize.isDesktop ? 'grid grid-cols-4 gap-6' : ''}`}>
          {/* Filter Panel */}
          {showFilters && (showFilterPanel || screenSize.isDesktop) && (
            <div className={screenSize.isDesktop ? 'col-span-1' : ''}>
              {renderFilterPanel()}
            </div>
          )}

          {/* Results */}
          <div className={screenSize.isDesktop && showFilters ? 'col-span-3' : ''}>
            {/* Results Header */}
            {hasResults && (
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {totalCount.toLocaleString()} results
                  {query && <span> for "{query}"</span>}
                </div>
                {loading && <LoadingSpinner size="sm" />}
              </div>
            )}

            {/* Loading State */}
            {loading && !hasResults && <LoadingSearch />}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">Search Error</div>
                <div className="text-sm text-gray-600">{error.message}</div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !hasResults && query && (
              <EmptyState
                title="No results found"
                description={`No results found for "${query}". Try adjusting your search terms or filters.`}
              />
            )}

            {/* Results Grid */}
            {hasResults && (
              <div className={`${responsiveClasses.spacing}`}>
                <div className={`grid ${responsiveClasses.grid} gap-4`}>
                  {results?.results.map((result, index) => renderSearchResult(result, index))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="btn btn-outline"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 