/**
 * Resources Table Component - Climate Economy Assistant
 * Admin table for managing knowledge resources
 * Location: components/admin/ResourcesTable.tsx
 */

'use client'

import { useState } from 'react';
import { FileText, Eye, Edit, CheckCircle, Clock, ExternalLink, Globe, BookOpen, Download, AlertCircle } from 'lucide-react';
import { ACTButton } from '@/components/ui';

interface KnowledgeResource {
  id: string;
  title: string;
  content: string;
  description: string;
  content_type: string;
  content_difficulty: string;
  is_published: boolean;
  categories: string[];
  climate_sectors: string[];
  skill_categories: string[];
  tags: string[];
  target_audience: string[];
  topics: string[];
  domain: string;
  source_url: string;
  file_path: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  partner_profiles?: {
    organization_name: string;
    verified: boolean;
  };
}

interface ResourcesTableProps {
  resources: KnowledgeResource[];
}

export function ResourcesTable({ resources }: ResourcesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadErrors, setDownloadErrors] = useState<Map<string, string>>(new Map());
  const itemsPerPage = 10;

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.partner_profiles?.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || resource.content_type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && resource.is_published) ||
                         (filterStatus === 'draft' && !resource.is_published);
    
    const matchesDifficulty = filterDifficulty === 'all' || resource.content_difficulty === filterDifficulty;
    
    return matchesSearch && matchesType && matchesStatus && matchesDifficulty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage);

  const handleDownload = async (resource: KnowledgeResource, format: string = 'json') => {
    const resourceId = resource.id;
    setDownloadingIds(prev => new Set(prev).add(resourceId));
    setDownloadErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(resourceId);
      return newErrors;
    });

    try {
      // If resource has external URL, handle differently
      if (resource.source_url && !resource.file_path) {
        window.open(resource.source_url, '_blank');
        return;
      }

      const downloadUrl = `/api/admin/download-resource?id=${resourceId}&type=knowledge&format=${format}`;
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Check if response is JSON (external link case)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.type === 'external_link') {
          window.open(data.url, '_blank');
          return;
        }
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.set(resourceId, error instanceof Error ? error.message : 'Download failed');
        return newErrors;
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(resourceId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (resource: KnowledgeResource) => {
    return resource.is_published ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-500" />
    );
  };

  const getContentTypeBadge = (type: string) => {
    const colors = {
      'article': 'bg-blue-100 text-blue-800',
      'guide': 'bg-green-100 text-green-800',
      'tutorial': 'bg-purple-100 text-purple-800',
      'documentation': 'bg-gray-100 text-gray-800',
      'video': 'bg-red-100 text-red-800',
      'podcast': 'bg-yellow-100 text-yellow-800',
      'webinar': 'bg-indigo-100 text-indigo-800',
      'tool': 'bg-pink-100 text-pink-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || colors['article']}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Article'}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800',
      'expert': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[difficulty as keyof typeof colors] || colors['intermediate']}`}>
        {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1) || 'Intermediate'}
      </span>
    );
  };

  const getDownloadOptions = (resource: KnowledgeResource) => {
    const options = ['json', 'txt'];
    
    // Add PDF option for articles and guides
    if (['article', 'guide', 'tutorial', 'documentation'].includes(resource.content_type)) {
      options.push('pdf');
    }
    
    return options;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search resources by title, description, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="article">Article</option>
            <option value="guide">Guide</option>
            <option value="tutorial">Tutorial</option>
            <option value="documentation">Documentation</option>
            <option value="video">Video</option>
            <option value="podcast">Podcast</option>
            <option value="webinar">Webinar</option>
            <option value="tool">Tool</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <FileText className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg p-1.5 mr-3 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {resource.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {resource.description || 'No description available'}
                      </div>
                      {resource.partner_profiles && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span>{resource.partner_profiles.organization_name}</span>
                          {resource.partner_profiles.verified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      )}
                      {resource.source_url && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <a href={resource.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            External Source
                          </a>
                        </div>
                      )}
                      {/* Download Error Display */}
                      {downloadErrors.has(resource.id) && (
                        <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {downloadErrors.get(resource.id)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    {getContentTypeBadge(resource.content_type)}
                    {getDifficultyBadge(resource.content_difficulty)}
                    {resource.domain && (
                      <div className="text-xs text-gray-500">
                        {resource.domain}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {resource.categories?.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Categories:</strong> {resource.categories.slice(0, 2).join(', ')}
                        {resource.categories.length > 2 && ` +${resource.categories.length - 2} more`}
                      </div>
                    )}
                    {resource.climate_sectors?.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Sectors:</strong> {resource.climate_sectors.slice(0, 2).join(', ')}
                        {resource.climate_sectors.length > 2 && ` +${resource.climate_sectors.length - 2} more`}
                      </div>
                    )}
                    {resource.tags?.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Tags:</strong> {resource.tags.slice(0, 3).join(', ')}
                        {resource.tags.length > 3 && ` +${resource.tags.length - 3} more`}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(resource)}
                    <span className="text-sm text-gray-600">
                      {resource.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(resource.created_at).toLocaleDateString()}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <ACTButton variant="outline" size="sm" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </ACTButton>
                    <ACTButton variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </ACTButton>
                    
                    {/* Download Button with Format Selection */}
                    <div className="relative group">
                      <ACTButton 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleDownload(resource, 'json')}
                        disabled={downloadingIds.has(resource.id)}
                      >
                        <Download className={`h-3 w-3 ${downloadingIds.has(resource.id) ? 'animate-spin' : ''}`} />
                        {downloadingIds.has(resource.id) ? 'Downloading...' : 'Download'}
                      </ACTButton>
                      
                      {/* Format Options Dropdown */}
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="p-2 space-y-1 min-w-[120px]">
                          <div className="text-xs font-medium text-gray-500 px-2 py-1">Download as:</div>
                          {getDownloadOptions(resource).map((format) => (
                            <button
                              key={format}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(resource, format);
                              }}
                              className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded capitalize"
                              disabled={downloadingIds.has(resource.id)}
                            >
                              {format.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterDifficulty !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No knowledge resources have been created yet.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResources.length)} of {filteredResources.length} resources
            </div>
            
            <div className="flex items-center gap-2">
              <ACTButton
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </ACTButton>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <ACTButton
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </ACTButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 