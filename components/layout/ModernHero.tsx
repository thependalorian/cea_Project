"use client";

/**
 * Modern Hero Component - Climate Economy Assistant
 * ACT Brand Guidelines compliant with modern iOS-inspired enhancements
 * Location: components/layout/ModernHero.tsx
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { ACTButton, ACTFrameElement, ImagePlaceholder } from "@/components/ui";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernHeroProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: "right" | "left";
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  variant?: "default" | "gradient" | "light" | "dark";
  fullHeight?: boolean;
  backgroundPattern?: boolean;
  highlightedStats?: Array<{
    value: string;
    label: string;
  }>;
  className?: string;
}

export function ModernHero({
  title = "Connecting to the Clean Energy Economy",
  subtitle = "Find your place in the climate economy with AI-powered career guidance, skills matching, and personalized pathways.",
  imageSrc = "/images/climate-economy-illustration.svg",
  imageAlt = "Climate Economy Illustration",
  imagePosition = "right",
  primaryCTA = {
    text: "Get Started",
    href: "/auth/sign-up",
  },
  secondaryCTA = {
    text: "Learn More",
    href: "/about",
  },
  variant = "default",
  fullHeight = true,
  backgroundPattern = true,
  highlightedStats,
  className,
}: ModernHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ACT Brand variant styling
  const variantStyles = {
    default: "bg-gradient-to-br from-sand-gray/10 to-spring-green/5 text-midnight-forest",
    gradient: "bg-gradient-to-br from-midnight-forest to-moss-green text-white",
    light: "bg-white text-midnight-forest",
    dark: "bg-midnight-forest text-white",
  };

  // Text color classes based on variant (ACT brand colors)
  const textColor = variant === "gradient" || variant === "dark" ? "text-white" : "text-midnight-forest";
  const subtitleColor = variant === "gradient" || variant === "dark" ? "text-white/80" : "text-midnight-forest/70";
  
  // Layout variations based on image position
  const contentOrder = imagePosition === "right" ? "order-1" : "order-2";
  const imageOrder = imagePosition === "right" ? "order-2" : "order-1";

  return (
    <section 
      className={cn(
        variantStyles[variant],
        fullHeight ? "min-h-[90vh]" : "py-12",
        "relative overflow-hidden",
        className
      )}
    >
      {/* ACT Brand Background Pattern */}
      {backgroundPattern && (
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="act-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#act-grid)" />
          </svg>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 flex items-center h-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Content Section */}
          <motion.div 
            className={cn("flex flex-col", contentOrder)}
            initial={{ opacity: 0, x: imagePosition === "right" ? -20 : 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            {/* ACT Brand Frame Element for Title */}
            <ACTFrameElement variant="brackets" size="lg" className="mb-8">
              {typeof title === "string" ? (
                <h1 className={cn("text-act-display font-helvetica font-medium leading-tight mb-6", textColor)}>
                  {title}
                </h1>
              ) : (
                <div className={cn("text-act-display font-helvetica font-medium leading-tight mb-6", textColor)}>
                  {title}
                </div>
              )}
            </ACTFrameElement>

            {/* Subtitle with ACT brand typography */}
            <p className={cn("text-act-body-large font-inter mb-8 max-w-xl", subtitleColor)}>
              {subtitle}
            </p>

            {/* Call-to-action buttons with ACT styling */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <ACTButton 
                variant="primary" 
                size="lg"
                href={primaryCTA.href}
                icon={<ArrowRight className="ml-2 h-5 w-5" />}
                className="btn-act-primary"
              >
                {primaryCTA.text}
              </ACTButton>
              
              <ACTButton 
                variant={variant === "dark" || variant === "gradient" ? "glass" : "outline"} 
                size="lg"
                href={secondaryCTA.href}
                className={variant === "dark" || variant === "gradient" ? "" : "btn-act-outline"}
              >
                {secondaryCTA.text}
              </ACTButton>
            </div>

            {/* Stats section with ACT brand colors */}
            {highlightedStats && highlightedStats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                {highlightedStats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={cn("text-act-title font-helvetica font-bold mb-1", 
                      variant === "dark" || variant === "gradient" ? "text-spring-green" : "text-spring-green"
                    )}>
                      {stat.value}
                    </div>
                    <div className={cn("text-act-small font-inter", subtitleColor)}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Image Section with ACT Frame Enhancement */}
          <motion.div 
            className={cn("flex justify-center items-center", imageOrder)}
            initial={{ opacity: 0, x: imagePosition === "right" ? 20 : -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          >
            <div className="relative w-full max-w-lg aspect-square">
              {/* Optional ACT frame around image */}
              <div className="absolute inset-0 border-2 border-spring-green/20 rounded-ios-2xl -rotate-1 scale-105 opacity-50"></div>
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-contain relative z-10"
                  priority
                />
              ) : (
                <ImagePlaceholder variant="climate" />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ACT Brand Bottom Visual Accent */}
      {variant !== "light" && (
        <div className="absolute bottom-0 left-0 w-full">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="w-full h-8 md:h-12"
          >
            <path 
              d="M0,0 C150,90 350,0 500,30 C650,60 700,0 900,40 C1050,70 1150,20 1200,0 V120 H0 Z" 
              className={variant === "dark" || variant === "gradient" ? "fill-spring-green/5" : "fill-midnight-forest/5"}
            />
          </svg>
        </div>
      )}
    </section>
  );
} 