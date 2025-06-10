'use client';

import { useState, useRef } from 'react';

/**
 * Enhanced Knowledge Search Component - Climate Economy Ecosystem
 * 
 * Provides comprehensive search interface for the complete climate economy ecosystem:
 * - Knowledge Resources (PDF content, partner programs)
 * - Job Listings (actual job postings)  
 * - Education Programs (training, certification, degree programs)
 * 
 * Uses both semantic search (embeddings) and text search for intelligent content discovery.
 * Updated June 2025 with real partner data and categorized results.
 * 
 * Location: /components/knowledge-search.tsx
 */

interface SearchResult {
  id: string;
  result_type: 'knowledge' | 'job' | 'education';
  title: string;
  description: string;
  similarity?: number;
  relevance_score?: number;
  
  // Knowledge resource fields
  content?: string;
  domain?: string;
  categories?: string[];
  sourceUrl?: string;
  
  // Job listing fields
  location?: string;
  employment_type?: string;
  experience_level?: string;
  salary_range?: string;
  skills_required?: string[];
  application_url?: string;
  application_email?: string;
  
  // Education program fields
  program_name?: string;
  program_type?: string;
  duration?: string;
  format?: string;
  cost?: string;
  prerequisites?: string;
  certification_offered?: string;
  application_deadline?: string;
  start_date?: string;
  
  // Common fields
  climate_focus?: string[];
  partner?: {
    id?: string;
    name?: string;
    type?: string;
    website?: string;
  };
  metadata?: {
    content_type?: string;
    search_type?: string;
  };
}

interface SearchFilters {
  search_type?: 'all' | 'knowledge' | 'jobs' | 'education';
  domain?: string;
  partner_type?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  program_type?: string;
  format?: string;
  cost?: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  search_type: string;
  results: SearchResult[];
  count: number;
  breakdown: {
    knowledge: number;
    jobs: number;
    education: number;
  };
  error?: string;
}

export default function KnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [breakdown, setBreakdown] = useState({ knowledge: 0, jobs: 0, education: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({ search_type: 'all' });
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Updated filter options based on real 2025 partner data and database structure
  const filterOptions = {
    searchTypes: [
      { value: 'all', label: '🔍 All Results', icon: '🌟' },
      { value: 'knowledge', label: '📚 Knowledge Base', icon: '📚' },
      { value: 'jobs', label: '💼 Job Listings', icon: '💼' },
      { value: 'education', label: '🎓 Training Programs', icon: '🎓' }
    ],
    domains: [
      { value: 'solar', label: '☀️ Solar Energy' },
      { value: 'renewable_energy', label: '🔋 Renewable Energy' },
      { value: 'clean_energy', label: '⚡ Clean Energy' },
      { value: 'energy_efficiency', label: '🏠 Energy Efficiency' },
      { value: 'workforce_development', label: '👥 Workforce Development' },
      { value: 'hvac', label: '🌡️ HVAC Systems' },
      { value: 'policy', label: '📋 Policy & Research' }
    ],
    partnerTypes: [
      { value: 'employer', label: '🏢 Employers' },
      { value: 'education', label: '🎓 Educational Institutions' },
      { value: 'government', label: '🏛️ Government Agencies' },
      { value: 'community', label: '🤝 Community Organizations' },
      { value: 'nonprofit', label: '🌍 Nonprofits' }
    ],
    employmentTypes: [
      { value: 'full_time', label: '⏰ Full Time' },
      { value: 'part_time', label: '🕐 Part Time' },
      { value: 'contract', label: '📝 Contract' },
      { value: 'internship', label: '🎓 Internship' },
      { value: 'apprenticeship', label: '⚒️ Apprenticeship' },
      { value: 'training', label: '🛠️ Training Program' }
    ],
    experienceLevels: [
      { value: 'entry_level', label: '🌱 Entry Level' },
      { value: 'mid_level', label: '📈 Mid Level' },
      { value: 'senior_level', label: '⭐ Senior Level' }
    ],
    programTypes: [
      { value: 'certificate', label: '📜 Certificate' },
      { value: 'degree', label: '🎓 Degree Program' },
      { value: 'workshop', label: '🛠️ Workshop' },
      { value: 'internship', label: '💼 Internship' },
      { value: 'fellowship', label: '🤝 Fellowship' },
      { value: 'pre_apprenticeship', label: '⚒️ Pre-Apprenticeship' }
    ],
    formats: [
      { value: 'in_person', label: '🏢 In Person' },
      { value: 'online', label: '💻 Online' },
      { value: 'hybrid', label: '🔄 Hybrid' }
    ],
    costs: [
      { value: 'free', label: '🆓 Free' },
      { value: 'paid', label: '💰 Paid' }
    ]
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchPayload = {
        query: query.trim(),
        ...filters,
        limit: 30
      };

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload),
      });

      const data: SearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results);
      setBreakdown(data.breakdown);

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
      setBreakdown({ knowledge: 0, jobs: 0, education: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      performSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setBreakdown({ knowledge: 0, jobs: 0, education: 0 });
    setError(null);
    setSelectedResult(null);
    setFilters({ search_type: 'all' });
    searchInputRef.current?.focus();
  };

  const getResultTypeIcon = (type: string) => {
    const icons = {
      'knowledge': '📚',
      'job': '💼',
      'education': '🎓'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getResultTypeBadge = (type: string) => {
    const badges = {
      'knowledge': { label: 'Knowledge', class: 'badge-info' },
      'job': { label: 'Job', class: 'badge-success' },
      'education': { label: 'Training', class: 'badge-warning' }
    };
    return badges[type as keyof typeof badges] || { label: 'Content', class: 'badge-neutral' };
  };

  const formatResultContent = (result: SearchResult) => {
    switch (result.result_type) {
      case 'job':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-sm">
              {result.location && (
                <span className="badge badge-outline">📍 {result.location}</span>
              )}
              {result.employment_type && (
                <span className="badge badge-outline">
                  ⏰ {result.employment_type.replace('_', ' ')}
                </span>
              )}
              {result.experience_level && (
                <span className="badge badge-outline">
                  📊 {result.experience_level.replace('_', ' ')}
                </span>
              )}
              {result.salary_range && (
                <span className="badge badge-outline">💰 {result.salary_range}</span>
              )}
            </div>
            {result.skills_required && result.skills_required.length > 0 && (
              <div className="text-sm">
                <strong>Skills:</strong> {result.skills_required.join(', ')}
              </div>
            )}
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-sm">
              {result.program_type && (
                <span className="badge badge-outline">📚 {result.program_type}</span>
              )}
              {result.duration && (
                <span className="badge badge-outline">⏱️ {result.duration}</span>
              )}
              {result.format && (
                <span className="badge badge-outline">
                  {result.format === 'online' ? '💻' : result.format === 'hybrid' ? '🔄' : '🏢'} {result.format}
                </span>
              )}
              {result.cost && (
                <span className="badge badge-outline">💰 {result.cost}</span>
              )}
            </div>
            {result.certification_offered && (
              <div className="text-sm">
                <strong>Certification:</strong> {result.certification_offered}
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="space-y-2">
            {result.domain && (
              <span className="badge badge-outline">🏷️ {result.domain}</span>
            )}
            {result.content && (
              <p className="text-sm text-base-content/70 line-clamp-2">
                {result.content.substring(0, 150)}...
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">
          🔍 Climate Economy Search
        </h1>
        <p className="text-lg text-base-content/70">
          Find jobs, training programs, and resources across our complete partner ecosystem
        </p>
        <div className="text-sm text-base-content/60">
          Updated June 2025 • AI-Powered Search • 8 Partner Organizations • 3 Content Types
        </div>
      </div>

      {/* Search Interface */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Search Input */}
          <div className="form-control">
            <div className="input-group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for solar jobs, HVAC training, clean energy programs..."
                className="input input-bordered flex-1 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="btn btn-primary"
                onClick={performSearch}
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  '🔍 Search'
                )}
              </button>
              {(query || results.length > 0) && (
                <button
                  className="btn btn-ghost"
                  onClick={clearSearch}
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Type Filter */}
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-medium">Search Type</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.searchTypes.map(option => (
                <button
                  key={option.value}
                  className={`btn btn-sm ${
                    filters.search_type === option.value ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setFilters({...filters, search_type: option.value as 'all' | 'knowledge' | 'jobs' | 'education'})}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="collapse collapse-arrow bg-base-200 mt-4">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-medium">
              🔧 Advanced Filters
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Domain Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Focus Area</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={filters.domain || ''}
                    onChange={(e) => setFilters({...filters, domain: e.target.value || undefined})}
                  >
                    <option value="">All Focus Areas</option>
                    {filterOptions.domains.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Partner Type Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Partner Type</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={filters.partner_type || ''}
                    onChange={(e) => setFilters({...filters, partner_type: e.target.value || undefined})}
                  >
                    <option value="">All Partner Types</option>
                    {filterOptions.partnerTypes.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter (for jobs) */}
                {(filters.search_type === 'all' || filters.search_type === 'jobs') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Location</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Boston, MA"
                      className="input input-bordered"
                      value={filters.location || ''}
                      onChange={(e) => setFilters({...filters, location: e.target.value || undefined})}
                    />
                  </div>
                )}

                {/* Employment Type Filter (for jobs) */}
                {(filters.search_type === 'all' || filters.search_type === 'jobs') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Employment Type</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={filters.employment_type || ''}
                      onChange={(e) => setFilters({...filters, employment_type: e.target.value || undefined})}
                    >
                      <option value="">All Employment Types</option>
                      {filterOptions.employmentTypes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Experience Level Filter (for jobs) */}
                {(filters.search_type === 'all' || filters.search_type === 'jobs') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Experience Level</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={filters.experience_level || ''}
                      onChange={(e) => setFilters({...filters, experience_level: e.target.value || undefined})}
                    >
                      <option value="">All Experience Levels</option>
                      {filterOptions.experienceLevels.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Program Type Filter (for education) */}
                {(filters.search_type === 'all' || filters.search_type === 'education') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Program Type</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={filters.program_type || ''}
                      onChange={(e) => setFilters({...filters, program_type: e.target.value || undefined})}
                    >
                      <option value="">All Program Types</option>
                      {filterOptions.programTypes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Format Filter (for education) */}
                {(filters.search_type === 'all' || filters.search_type === 'education') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Format</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={filters.format || ''}
                      onChange={(e) => setFilters({...filters, format: e.target.value || undefined})}
                    >
                      <option value="">All Formats</option>
                      {filterOptions.formats.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cost Filter (for education) */}
                {(filters.search_type === 'all' || filters.search_type === 'education') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Cost</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={filters.cost || ''}
                      onChange={(e) => setFilters({...filters, cost: e.target.value || undefined})}
                    >
                      <option value="">All Costs</option>
                      {filterOptions.costs.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Quick Search Suggestions */}
          <div className="mt-4">
            <div className="label">
              <span className="label-text font-medium">Popular Searches:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Solar Installation Training',
                'Clean Energy Internships', 
                'HVAC Certification',
                'Wind Technician Jobs',
                'Energy Efficiency Programs',
                'Veterans Clean Energy',
                'MassCEC Opportunities',
                'Franklin Cummings Programs',
                'TPS Energy Jobs',
                'Headlamp Career Guidance'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setQuery(suggestion);
                    setTimeout(performSearch, 100);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(results.length > 0 || loading) && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {loading ? 'Searching...' : `Found ${results.length} results`}
                </h2>
                {query && (
                  <span className="text-base-content/70">for "{query}"</span>
                )}
              </div>
              
              {!loading && results.length > 0 && (
                <div className="flex gap-2">
                  {breakdown.knowledge > 0 && (
                    <div className="badge badge-info gap-1">
                      📚 {breakdown.knowledge} Knowledge
                    </div>
                  )}
                  {breakdown.jobs > 0 && (
                    <div className="badge badge-success gap-1">
                      💼 {breakdown.jobs} Jobs
                    </div>
                  )}
                  {breakdown.education > 0 && (
                    <div className="badge badge-warning gap-1">
                      🎓 {breakdown.education} Training
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => {
            const badge = getResultTypeBadge(result.result_type);
            return (
              <div key={`${result.result_type}-${result.id}-${index}`} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Title and Type Badge */}
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getResultTypeIcon(result.result_type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{result.title}</h3>
                            <div className={`badge ${badge.class}`}>{badge.label}</div>
                          </div>
                          {result.partner?.name && (
                            <p className="text-sm text-base-content/70 mb-2">
                              by <strong>{result.partner.name}</strong>
                              {result.partner.type && (
                                <span className="ml-1">({result.partner.type})</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-base-content/80">{result.description}</p>

                      {/* Result-specific content */}
                      {formatResultContent(result)}

                      {/* Climate Focus Tags */}
                      {result.climate_focus && result.climate_focus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.climate_focus.map((focus, idx) => (
                            <span key={idx} className="badge badge-sm badge-primary badge-outline">
                              {focus.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {(result.application_url || result.partner?.website) && (
                        <a
                          href={result.application_url || result.partner?.website || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          {result.result_type === 'job' ? 'Apply' : 
                           result.result_type === 'education' ? 'Learn More' : 'View'}
                        </a>
                      )}
                      
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedResult(result)}
                      >
                        Details
                      </button>
                      
                      {/* Relevance Score */}
                      {(result.similarity || result.relevance_score) && (
                        <div className="text-xs text-base-content/60">
                          {Math.round((result.similarity || result.relevance_score || 0) * 100)}% match
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !error && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No Results Found</h3>
            <p className="text-base-content/70 mb-6">
              Try adjusting your search terms or filters, or browse our popular searches above.
            </p>
            <button 
              className="btn btn-primary"
              onClick={clearSearch}
            >
              Clear Search & Start Over
            </button>
          </div>
        </div>
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">
                {getResultTypeIcon(selectedResult.result_type)} {selectedResult.title}
              </h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelectedResult(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p>{selectedResult.description}</p>
              
              {selectedResult.content && (
                <div>
                  <h4 className="font-semibold">Content:</h4>
                  <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                    {selectedResult.content}
                  </p>
                </div>
              )}
              
              {formatResultContent(selectedResult)}
              
              {selectedResult.partner && (
                <div>
                  <h4 className="font-semibold">Partner Organization:</h4>
                  <p>{selectedResult.partner.name} ({selectedResult.partner.type})</p>
                  {selectedResult.partner.website && (
                    <a 
                      href={selectedResult.partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-action">
              {(selectedResult.application_url || selectedResult.partner?.website) && (
                <a
                  href={selectedResult.application_url || selectedResult.partner?.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {selectedResult.result_type === 'job' ? 'Apply Now' : 
                   selectedResult.result_type === 'education' ? 'Learn More' : 'View Resource'}
                </a>
              )}
              <button 
                className="btn btn-ghost"
                onClick={() => setSelectedResult(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 