/**
 * Partners Table Component - Climate Economy Assistant
 * Admin table for managing partner organizations
 * Location: components/admin/PartnersTable.tsx
 */

'use client'

import { useState } from 'react';
import { Building2, Eye, Edit, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ACTButton } from '@/components/ui';

interface Partner {
  id: string;
  organization_name: string;
  email: string;
  partnership_level: string;
  verified: boolean;
  headquarters_location: string;
  climate_focus: string[];
  created_at: string;
  employee_count: number;
  website: string;
  description: string;
}

interface PartnersTableProps {
  partners: Partner[];
}

export function PartnersTable({ partners }: PartnersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter partners based on search and status
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'verified' && partner.verified) ||
                         (filterStatus === 'pending' && !partner.verified);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-500" />
    );
  };

  const getPartnershipBadge = (level: string) => {
    const colors = {
      standard: 'bg-gray-100 text-gray-800',
      premium: 'bg-yellow-100 text-yellow-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[level as keyof typeof colors] || colors.standard}`}>
        {level?.charAt(0).toUpperCase() + level?.slice(1) || 'Standard'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search partners by name or email..."
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
            <option value="all">All Partners</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partnership Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPartners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg p-1.5 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {partner.organization_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {partner.email}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(partner.verified)}
                    <span className="text-sm text-gray-600">
                      {partner.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPartnershipBadge(partner.partnership_level)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {partner.headquarters_location || 'Not specified'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(partner.created_at).toLocaleDateString()}
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
      {filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No partner organizations have been registered yet.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPartners.length)} of {filteredPartners.length} partners
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