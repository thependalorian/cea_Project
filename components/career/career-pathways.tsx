"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, GraduationCap } from "lucide-react";

interface CareerPath {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  education_requirements: string[];
  salary_range: string;
  growth_potential: string;
  job_opportunities: {
    title: string;
    company: string;
    location: string;
    url: string;
  }[];
  training_programs: {
    name: string;
    provider: string;
    duration: string;
    url: string;
  }[];
}

export function CareerPathways() {
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paths, setPaths] = useState<CareerPath[]>([]);

  const loadCareerPaths = async () => {
    if (paths.length > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/career-paths", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load career paths");
      }

      const data = await response.json();
      setPaths(data.paths);
    } catch (error) {
      console.error("Failed to load career paths:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load paths on component mount
  useState(() => {
    loadCareerPaths();
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map((path) => (
          <Card
            key={path.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedPath?.id === path.id ? "border-primary" : ""
            }`}
            onClick={() => setSelectedPath(path)}
          >
            <CardHeader>
              <CardTitle>{path.title}</CardTitle>
              <CardDescription>{path.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}

        {paths.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p>No career paths available.</p>
          </div>
        )}
      </div>

      {selectedPath && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPath.title}</CardTitle>
            <CardDescription>{selectedPath.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Required Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPath.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Education & Training:</h4>
              <ul className="space-y-2">
                {selectedPath.education_requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Career Details:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Salary Range:</p>
                  <p className="font-medium">{selectedPath.salary_range}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Growth Potential:</p>
                  <p className="font-medium">{selectedPath.growth_potential}</p>
                </div>
              </div>
            </div>

            {selectedPath.job_opportunities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Current Opportunities:</h4>
                <div className="space-y-2">
                  {selectedPath.job_opportunities.map((job, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.company} • {job.location}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={job.url} target="_blank" rel="noopener noreferrer">
                              <Briefcase className="h-4 w-4 mr-2" />
                              Apply
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedPath.training_programs.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Training Programs:</h4>
                <div className="space-y-2">
                  {selectedPath.training_programs.map((program, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{program.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {program.provider} • {program.duration}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={program.url} target="_blank" rel="noopener noreferrer">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Learn More
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 