/**
 * Jobs Table Component - Climate Economy Assistant
 * Admin table for managing job listings
 * Location: components/admin/JobsTable.tsx
 */

'use client'

import { useState } from 'react';
import { Briefcase, Eye, Edit, CheckCircle, Clock, XCircle, MapPin, Calendar } from 'lucide-react';
import { ACTButton } from '@/components/ui';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary_range: string;
  employment_type: string;
  experience_level: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  climate_focus: string[];
  partner_profiles: {
    organization_name: string;
    verified: boolean;
    partnership_level: string;
  };
}

interface JobsTableProps {
  jobs: Job[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.partner_profiles.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && job.is_active) ||
                         (filterStatus === 'inactive' && !job.is_active) ||
                         (filterStatus === 'expired' && job.expires_at && new Date(job.expires_at) < new Date());
    
    const matchesType = filterType === 'all' || job.employment_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (job: Job) => {
    if (!job.is_active) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (job.expires_at && new Date(job.expires_at) < new Date()) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (job: Job) => {
    if (!job.is_active) return 'Inactive';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  const getEmploymentTypeBadge = (type: string) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-yellow-100 text-yellow-800',
      'remote': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || colors['remote']}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Not specified'}
      </span>
    );
  };

  const getExperienceBadge = (level: string) => {
    const colors = {
      'entry': 'bg-green-100 text-green-800',
      'mid': 'bg-blue-100 text-blue-800',
      'senior': 'bg-purple-100 text-purple-800',
      'executive': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[level as keyof typeof colors] || colors['entry']}`}>
        {level?.charAt(0).toUpperCase() + level?.slice(1) || 'Not specified'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <Briefcase className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg p-1.5 mr-3 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {job.salary_range || 'Salary not specified'}
                      </div>
                      <div className="mt-2">
                        {getExperienceBadge(job.experience_level)}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {job.partner_profiles.organization_name}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {job.partner_profiles.verified && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {job.partner_profiles.partnership_level}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(job)}
                    </span>
                  </div>
                  {job.expires_at && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expires {new Date(job.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {getEmploymentTypeBadge(job.employment_type)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(job.created_at).toLocaleDateString()}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No job listings have been posted yet.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
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