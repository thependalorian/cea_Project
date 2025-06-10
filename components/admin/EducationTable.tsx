/**
 * Education Table Component - Climate Economy Assistant
 * Admin table for managing education programs
 * Location: components/admin/EducationTable.tsx
 */

'use client'

import { useState } from 'react';
import { GraduationCap, Eye, Edit, CheckCircle, Clock, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { ACTButton } from '@/components/ui';

interface EducationProgram {
  id: string;
  program_name: string;
  description: string;
  program_type: string;
  format: string;
  duration: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  cost: string;
  certification_offered: string;
  prerequisites: string;
  application_url: string;
  climate_focus: string[];
  skills_taught: string[];
  contact_info: any;
  created_at: string;
  updated_at: string;
  partner_profiles?: {
    organization_name: string;
    verified: boolean;
  };
}

interface EducationTableProps {
  programs: EducationProgram[];
}

export function EducationTable({ programs }: EducationTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter programs based on search and filters
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.partner_profiles?.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || program.program_type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && program.is_active) ||
                         (filterStatus === 'inactive' && !program.is_active) ||
                         (filterStatus === 'upcoming' && program.start_date && new Date(program.start_date) > new Date()) ||
                         (filterStatus === 'ongoing' && program.start_date && program.end_date && 
                          new Date(program.start_date) <= new Date() && new Date(program.end_date) >= new Date());
    
    const matchesFormat = filterFormat === 'all' || program.format === filterFormat;
    
    return matchesSearch && matchesType && matchesStatus && matchesFormat;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (program: EducationProgram) => {
    if (!program.is_active) {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
    
    if (program.start_date && new Date(program.start_date) > new Date()) {
      return <Calendar className="h-4 w-4 text-blue-500" />;
    }
    
    if (program.start_date && program.end_date && 
        new Date(program.start_date) <= new Date() && new Date(program.end_date) >= new Date()) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (program: EducationProgram) => {
    if (!program.is_active) return 'Inactive';
    
    if (program.start_date && new Date(program.start_date) > new Date()) {
      return 'Upcoming';
    }
    
    if (program.start_date && program.end_date && 
        new Date(program.start_date) <= new Date() && new Date(program.end_date) >= new Date()) {
      return 'Ongoing';
    }
    
    return 'Completed';
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'course': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-green-100 text-green-800',
      'training': 'bg-purple-100 text-purple-800',
      'certification': 'bg-yellow-100 text-yellow-800',
      'bootcamp': 'bg-red-100 text-red-800',
      'webinar': 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || colors['course']}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Course'}
      </span>
    );
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      'online': 'bg-blue-100 text-blue-800',
      'in-person': 'bg-green-100 text-green-800',
      'hybrid': 'bg-purple-100 text-purple-800',
      'self-paced': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[format as keyof typeof colors] || colors['online']}`}>
        {format?.charAt(0).toUpperCase() + format?.slice(1) || 'Online'}
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
              placeholder="Search programs by name, description, or organization..."
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
            <option value="course">Course</option>
            <option value="workshop">Workshop</option>
            <option value="training">Training</option>
            <option value="certification">Certification</option>
            <option value="bootcamp">Bootcamp</option>
            <option value="webinar">Webinar</option>
          </select>

          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Formats</option>
            <option value="online">Online</option>
            <option value="in-person">In-Person</option>
            <option value="hybrid">Hybrid</option>
            <option value="self-paced">Self-Paced</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPrograms.map((program) => (
              <tr key={program.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <GraduationCap className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg p-1.5 mr-3 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {program.program_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {program.description || 'No description available'}
                      </div>
                      {program.partner_profiles && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span>{program.partner_profiles.organization_name}</span>
                          {program.partner_profiles.verified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    {getTypeBadge(program.program_type)}
                    {getFormatBadge(program.format)}
                    {program.duration && (
                      <div className="text-xs text-gray-500">
                        Duration: {program.duration}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {program.start_date ? new Date(program.start_date).toLocaleDateString() : 'TBD'}
                  </div>
                  {program.end_date && (
                    <div className="text-xs text-gray-500">
                      to {new Date(program.end_date).toLocaleDateString()}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {program.cost && (
                      <div className="text-xs text-gray-600">
                        <strong>Cost:</strong> {program.cost}
                      </div>
                    )}
                    {program.certification_offered && (
                      <div className="text-xs text-gray-600">
                        <strong>Certification:</strong> {program.certification_offered}
                      </div>
                    )}
                    {program.climate_focus?.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Focus:</strong> {program.climate_focus.slice(0, 2).join(', ')}
                        {program.climate_focus.length > 2 && ` +${program.climate_focus.length - 2} more`}
                      </div>
                    )}
                    {program.application_url && (
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <a href={program.application_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Apply
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(program)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(program)}
                    </span>
                  </div>
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
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterFormat !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No education programs have been created yet.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPrograms.length)} of {filteredPrograms.length} programs
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