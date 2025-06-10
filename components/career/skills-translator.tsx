"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config/constants";

interface SkillTranslation {
  original_skill: string;
  climate_equivalent: string;
  transferability_score: number;
  explanation: string;
  examples: string[];
}

export function SkillsTranslator() {
  const [skill, setSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [translation, setTranslation] = useState<SkillTranslation | null>(null);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.V1_SKILLS_TRANSLATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill: skill.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to translate skill");
      }

      const data = await response.json();
      setTranslation(data);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleTranslate} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a skill to translate..."
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          <span className="sr-only">Translate</span>
        </Button>
      </form>

      {translation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {translation.original_skill}
              <ArrowRight className="h-4 w-4" />
              {translation.climate_equivalent}
            </CardTitle>
            <CardDescription>
              Transferability Score: {Math.round(translation.transferability_score * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How it translates:</h4>
              <p className="text-sm text-muted-foreground">{translation.explanation}</p>
            </div>

            {translation.examples.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Examples in climate jobs:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {translation.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!translation && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Enter a skill to see how it translates to climate jobs.</p>
        </div>
      )}
    </div>
  );
} 