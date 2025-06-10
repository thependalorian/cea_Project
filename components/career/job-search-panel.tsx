"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config/constants";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_range?: string;
  posted_date: string;
  application_url: string;
}

export function JobSearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.V1_JOBS_SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: {
            location: "Massachusetts",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || data.data || []);
    } catch (error) {
      console.error("Job search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search climate jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                    Apply
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.location}</span>
                  {job.salary_range && (
                    <>
                      <span>•</span>
                      <span>{job.salary_range}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Posted {new Date(job.posted_date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm line-clamp-2">{job.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No jobs found. Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
} 