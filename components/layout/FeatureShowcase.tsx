"use client";

/**
 * Feature Showcase Component - Climate Economy Assistant
 * Visually appealing component for showcasing features with proper image placement
 * Location: components/layout/FeatureShowcase.tsx
 */

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ACTFrameElement, ACTButton, ImagePlaceholder } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import React from "react";

interface Feature {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  cta?: {
    text: string;
    href: string;
  };
}

interface FeatureShowcaseProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  variant?: "tabs" | "carousel" | "grid" | "list";
  backgroundColor?: "white" | "light" | "gradient" | "dark";
  className?: string;
}

export function FeatureShowcase({
  title = "Powerful Climate Economy Features",
  subtitle = "Explore how our AI-powered features help you navigate the clean energy transition",
  features,
  variant = "tabs",
  backgroundColor = "white",
  className,
}: FeatureShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState(features[0]?.id || "");
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  // Background styles based on variant
  const bgStyles = {
    white: "bg-white",
    light: "bg-sand-gray/5",
    gradient: "bg-gradient-to-br from-midnight-forest/5 to-spring-green/10",
    dark: "bg-midnight-forest text-white",
  };

  // Text colors based on background
  const titleColor = backgroundColor === "dark" ? "text-white" : "text-midnight-forest";
  const subtitleColor = backgroundColor === "dark" ? "text-white/80" : "text-midnight-forest/70";
  const tabActiveColor = backgroundColor === "dark" ? "bg-spring-green/20 text-white" : "bg-spring-green/10 text-midnight-forest";
  const tabInactiveColor = backgroundColor === "dark" ? "text-white/60 hover:text-white/90" : "text-midnight-forest/60 hover:text-midnight-forest/90";

  return (
    <section 
      ref={containerRef}
      className={cn("py-16 md:py-24", bgStyles[backgroundColor], className)}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className={cn("text-3xl md:text-4xl font-helvetica font-medium mb-4", titleColor)}>
              {title}
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn("text-xl max-w-3xl mx-auto", subtitleColor)}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Tabs Layout */}
        {variant === "tabs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="flex flex-col space-y-2">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={cn(
                      "text-left px-4 py-4 rounded-lg transition-all duration-200 border",
                      activeFeature === feature.id 
                        ? cn(tabActiveColor, "border-spring-green/30") 
                        : cn(tabInactiveColor, "border-transparent")
                    )}
                  >
                    <h3 className="text-lg font-medium font-helvetica flex items-center">
                      {activeFeature === feature.id && (
                        <ChevronRight className="w-5 h-5 mr-2 text-spring-green" />
                      )}
                      {feature.title}
                    </h3>
                    
                    {activeFeature === feature.id && (
                      <p className={cn("mt-2 text-sm", 
                        backgroundColor === "dark" ? "text-white/70" : "text-midnight-forest/70"
                      )}>
                        {feature.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Feature Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              {features.map((feature) => (
                <React.Fragment key={feature.id}>
                  {feature.id === activeFeature && (
                    <ACTFrameElement 
                      variant="bordered" 
                      size="lg"
                      className={cn(
                        "overflow-hidden shadow-lg",
                        backgroundColor === "dark" ? "border-spring-green/30" : "border-spring-green/20"
                      )}
                    >
                      <div className="relative aspect-video w-full">
                        {feature.imageSrc ? (
                          <Image
                            src={feature.imageSrc}
                            alt={feature.imageAlt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={activeFeature === feature.id}
                            className="object-cover"
                          />
                        ) : (
                          <ImagePlaceholder variant="feature" />
                        )}
                      </div>
                      
                      {feature.cta && (
                        <div className={cn(
                          "p-4 flex justify-end",
                          backgroundColor === "dark" ? "bg-midnight-forest/80" : "bg-white"
                        )}>
                          <ACTButton
                            variant="outline"
                            size="sm"
                            href={feature.cta.href}
                            className="text-spring-green"
                          >
                            {feature.cta.text}
                          </ACTButton>
                        </div>
                      )}
                    </ACTFrameElement>
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        )}

        {/* Grid Layout */}
        {variant === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <ACTFrameElement
                  variant="default"
                  size="md"
                  className={cn(
                    "h-full",
                    backgroundColor === "dark" ? "border-spring-green/30" : "border-spring-green/20"
                  )}
                >
                  <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
                    {feature.imageSrc ? (
                      <Image
                        src={feature.imageSrc}
                        alt={feature.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder variant="default" />
                    )}
                  </div>
                  
                  <h3 className={cn("text-xl font-medium mb-2", titleColor)}>
                    {feature.title}
                  </h3>
                  
                  <p className={cn("text-base mb-4", subtitleColor)}>
                    {feature.description}
                  </p>
                  
                  {feature.cta && (
                    <ACTButton
                      variant="outline"
                      size="sm"
                      href={feature.cta.href}
                      className="text-spring-green"
                    >
                      {feature.cta.text}
                    </ACTButton>
                  )}
                </ACTFrameElement>
              </motion.div>
            ))}
          </div>
        )}

        {/* List Layout */}
        {variant === "list" && (
          <div className="space-y-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-8 items-center",
                  index % 2 === 0 ? "" : "md:flex-row-reverse"
                )}
              >
                <div className={index % 2 === 0 ? "md:order-1" : "md:order-2"}>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                    {feature.imageSrc ? (
                      <Image
                        src={feature.imageSrc}
                        alt={feature.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder variant="career" />
                    )}
                  </div>
                </div>
                
                <div className={index % 2 === 0 ? "md:order-2" : "md:order-1"}>
                  <h3 className={cn("text-2xl font-medium mb-3", titleColor)}>
                    {feature.title}
                  </h3>
                  
                  <p className={cn("text-lg mb-4", subtitleColor)}>
                    {feature.description}
                  </p>
                  
                  {feature.cta && (
                    <ACTButton
                      variant={backgroundColor === "dark" ? "glass" : "outline"}
                      size="md"
                      href={feature.cta.href}
                    >
                      {feature.cta.text}
                    </ACTButton>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {variant === "carousel" && (
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 no-scrollbar">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="snap-center flex-shrink-0 w-full sm:w-[85%] md:w-[75%] lg:w-[60%]"
                >
                  <ACTFrameElement
                    variant="brackets"
                    size="lg"
                    className={cn(
                      "overflow-hidden h-full",
                      backgroundColor === "dark" ? "border-spring-green/30" : "border-spring-green/20"
                    )}
                  >
                    <div className="relative aspect-video w-full mb-6">
                      {feature.imageSrc ? (
                        <Image
                          src={feature.imageSrc}
                          alt={feature.imageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 85vw, (max-width: 1024px) 75vw, 60vw"
                          priority={index === 0}
                          className="object-cover"
                        />
                      ) : (
                        <ImagePlaceholder variant="feature" />
                      )}
                    </div>
                    
                    <div className="px-6 pb-6">
                      <h3 className={cn("text-2xl font-medium mb-3", titleColor)}>
                        {feature.title}
                      </h3>
                      
                      <p className={cn("text-lg mb-4", subtitleColor)}>
                        {feature.description}
                      </p>
                      
                      {feature.cta && (
                        <ACTButton
                          variant="primary"
                          size="md"
                          href={feature.cta.href}
                        >
                          {feature.cta.text}
                        </ACTButton>
                      )}
                    </div>
                  </ACTFrameElement>
                </motion.div>
              ))}
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    activeFeature === feature.id
                      ? "bg-spring-green" 
                      : backgroundColor === "dark" ? "bg-white/30" : "bg-midnight-forest/30"
                  )}
                  onClick={() => setActiveFeature(feature.id)}
                  aria-label={`View ${feature.title}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 