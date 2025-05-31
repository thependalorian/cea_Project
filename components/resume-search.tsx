"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface ResumeSearchResult {
  resume_id: string;
  content: string;
  similarity: number;
}

interface ResumeSearchProps {
  userId: string;
}

export function ResumeSearch({ userId }: ResumeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResumeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search-resume-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          user_id: userId,
          match_threshold: 0.65,
          match_count: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search resume");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your resume..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((result, index) => (
            <Card key={index}>
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Result {index + 1}</span>
                  <span className="text-xs text-gray-500">
                    Relevance: {(result.similarity * 100).toFixed(1)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-sm whitespace-pre-wrap">{result.content}</p>
              </CardContent>
            </Card>
          ))
        ) : !isLoading && query && !error ? (
          <div className="p-4 text-center text-gray-500">
            No results found. Try a different search term.
          </div>
        ) : null}
      </div>
    </div>
  );
} 