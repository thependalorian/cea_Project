"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ResumeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  hasResume: boolean;
}

const ResumeToggle: React.FC<ResumeToggleProps> = ({ enabled, onToggle, hasResume }) => {
  return (
    <div className="flex items-center space-x-2 bg-muted/40 p-2 rounded-lg">
      <Switch
        id="resume-mode"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={!hasResume}
        className="data-[state=checked]:bg-green-500"
      />
      <Label 
        htmlFor="resume-mode" 
        className={`text-sm ${!hasResume ? 'text-muted-foreground' : ''}`}
      >
        Chat with Resume
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px]">
            {hasResume 
              ? "When enabled, the assistant will specifically use your resume data to answer questions about your career, skills, and experience."
              : "Please upload a resume first to enable this feature."}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ResumeToggle; 