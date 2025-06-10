/**
 * PartnerJobsFilters Component - Climate Economy Assistant
 * Provides filtering options for partner job listings
 * Location: components/partners/PartnerJobsFilters.tsx
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SearchParams {
  search?: string;
  status?: string;
  employment_type?: string;
  page?: string;
}

interface PartnerJobsFiltersProps {
  searchParams: SearchParams;
}

export default function PartnerJobsFilters({ searchParams }: PartnerJobsFiltersProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.search || "");

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filtering
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(window.location.pathname);
  };

  const hasActiveFilters = searchParams.search || searchParams.status || searchParams.employment_type;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Status Filter */}
        <Select
          value={searchParams.status || "all"}
          onValueChange={(value) => updateFilters("status", value)}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>

        {/* Employment Type Filter */}
        <Select
          value={searchParams.employment_type || "all"}
          onValueChange={(value) => updateFilters("employment_type", value)}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Actions */}
        <div className="flex gap-2">
          <Button type="submit" onClick={handleSearch} size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchParams.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
              Search: "{searchParams.search}"
              <button
                onClick={() => updateFilters("search", null)}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchParams.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
              Status: {searchParams.status}
              <button
                onClick={() => updateFilters("status", null)}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchParams.employment_type && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
              Type: {searchParams.employment_type}
              <button
                onClick={() => updateFilters("employment_type", null)}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 