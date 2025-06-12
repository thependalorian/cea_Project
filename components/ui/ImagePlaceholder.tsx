/**
 * Image Placeholder Component - Climate Economy Assistant
 * Temporary placeholder for images until actual assets are available
 * Location: components/ui/ImagePlaceholder.tsx
 */

import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  variant?: "default" | "climate" | "career" | "education" | "feature";
  className?: string;
}

export function ImagePlaceholder({ variant = "default", className }: ImagePlaceholderProps) {
  // Different placeholder gradient variants
  const gradientStyles = {
    default: "bg-gradient-to-br from-spring-green/20 via-moss-green/30 to-seafoam-blue/20",
    climate: "bg-gradient-to-br from-midnight-forest via-moss-green/50 to-spring-green/30",
    career: "bg-gradient-to-br from-spring-green/30 via-seafoam-blue/20 to-moss-green/10",
    education: "bg-gradient-to-r from-moss-green/20 to-spring-green/10",
    feature: "bg-gradient-to-br from-midnight-forest/80 via-moss-green/50 to-spring-green/20"
  };

  return (
    <div className={cn("w-full h-full relative overflow-hidden", gradientStyles[variant], className)}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="url(#smallGrid)" />
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Placeholder icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-spring-green rounded-lg flex items-center justify-center bg-spring-green/10 text-spring-green font-helvetica font-bold text-2xl">
          CEA
        </div>
      </div>
    </div>
  );
} 