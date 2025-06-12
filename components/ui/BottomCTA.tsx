/**
 * Bottom CTA Component - Alliance for Climate Transition
 * Consistent bottom call-to-action section for all pages
 * Location: components/ui/BottomCTA.tsx
 */

'use client';

import { ACTButton, ACTFrameElement } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface BottomCTAProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  variant?: 'default' | 'gradient' | 'minimal' | 'dark';
  backgroundImage?: string;
  className?: string;
}

export function BottomCTA({
  title = "Ready to Start Your Climate Career?",
  subtitle = "Join thousands of professionals building the clean energy economy.",
  primaryCTA = {
    text: "Get Started Free",
    href: "/auth/sign-up",
    icon: <ArrowRight className="h-5 w-5" />
  },
  secondaryCTA = {
    text: "Learn More",
    href: "/about"
  },
  variant = 'default',
  backgroundImage,
  className
}: BottomCTAProps) {
  
  // Variant styles
  const variantStyles = {
    default: "bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 border border-spring-green/20",
    gradient: "bg-gradient-to-r from-midnight-forest to-moss-green text-white",
    minimal: "bg-white border border-sand-gray/20",
    dark: "bg-midnight-forest text-white"
  };

  const textColorClass = variant === 'gradient' || variant === 'dark' 
    ? 'text-white' 
    : 'text-midnight-forest';

  const subtitleColorClass = variant === 'gradient' || variant === 'dark' 
    ? 'text-white/80' 
    : 'text-midnight-forest/70';

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <ACTFrameElement
          variant="full"
          size="xl"
          className={cn(
            "relative overflow-hidden",
            variantStyles[variant]
          )}
        >
          <div 
            className="absolute inset-0"
            style={backgroundImage ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : undefined}
          />
          <div className="relative z-10">
            <h2 className={cn(
              "text-act-display font-helvetica font-medium mb-4",
              textColorClass
            )}>
              {title}
            </h2>
            
            <p className={cn(
              "text-act-body-large font-inter mb-8 max-w-2xl mx-auto",
              subtitleColorClass
            )}>
              {subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ACTButton
                variant="primary"
                size="lg"
                href={primaryCTA.href}
                className="font-helvetica font-medium"
              >
                {primaryCTA.text}
                {primaryCTA.icon && <span className="ml-2">{primaryCTA.icon}</span>}
              </ACTButton>
              
              {secondaryCTA && (
                <ACTButton
                  variant={variant === 'gradient' || variant === 'dark' ? 'glass' : 'outline'}
                  size="lg"
                  href={secondaryCTA.href}
                  className="font-helvetica font-medium"
                >
                  {secondaryCTA.text}
                  {secondaryCTA.icon && <span className="ml-2">{secondaryCTA.icon}</span>}
                </ACTButton>
              )}
            </div>
          </div>
        </ACTFrameElement>
      </div>
    </section>
  );
} 