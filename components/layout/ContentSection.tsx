"use client";

/**
 * Content Section Component - Climate Economy Assistant
 * Versatile and reusable content section with various layout options
 * Location: components/layout/ContentSection.tsx
 */

import { ReactNode } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ACTFrameElement, ACTButton, ImagePlaceholder } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title?: string | ReactNode;
  subtitle?: string;
  content?: string | ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right" | "center" | "background";
  variant?: "default" | "alt" | "feature" | "highlight" | "dark";
  cta?: {
    text: string;
    href: string;
    variant?: "primary" | "outline" | "ghost" | "glass";
  };
  secondaryCta?: {
    text: string;
    href: string;
    variant?: "primary" | "outline" | "ghost" | "glass";
  };
  children?: ReactNode;
  className?: string;
  id?: string;
  features?: Array<{
    icon?: ReactNode;
    title: string;
    description: string;
  }>;
}

export function ContentSection({
  title,
  subtitle,
  content,
  imageSrc,
  imageAlt = "Section image",
  imagePosition = "right",
  variant = "default",
  cta,
  secondaryCta,
  children,
  className,
  id,
  features
}: ContentSectionProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Variant styles
  const variantStyles = {
    default: "bg-white",
    alt: "bg-sand-gray/5",
    feature: "bg-spring-green/5",
    highlight: "bg-gradient-to-br from-spring-green/10 via-moss-green/5 to-seafoam-blue/10",
    dark: "bg-midnight-forest text-white"
  };

  // Text color based on variant
  const textColor = variant === "dark" ? "text-white" : "text-midnight-forest";
  const subtitleColor = variant === "dark" ? "text-white/80" : "text-midnight-forest/70";

  // Image position layout
  const contentOrder = 
    imagePosition === "right" ? "order-1" : 
    imagePosition === "left" ? "order-2" : 
    "order-1 col-span-full";
  
  const imageOrder = 
    imagePosition === "right" ? "order-2" : 
    imagePosition === "left" ? "order-1" : 
    "order-2 col-span-full";

  const imageContainerClasses = cn(
    "relative overflow-hidden rounded-xl shadow-lg", 
    imagePosition === "center" ? "aspect-video w-full max-w-4xl mx-auto mb-12" : "aspect-square w-full"
  );

  return (
    <section 
      ref={sectionRef}
      id={id}
      className={cn(
        "py-16 md:py-24", 
        variantStyles[variant],
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* Section with image as background (full width) */}
        {imagePosition === "background" ? (
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background image */}
            {imageSrc ? (
              <div className="absolute inset-0 z-0">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover brightness-50"
                />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 brightness-50">
                <ImagePlaceholder variant="feature" />
              </div>
            )}
            
            {/* Content over background */}
            <div className="relative z-10 py-20 px-6 md:px-12 text-white">
              <div className="max-w-2xl mx-auto text-center">
                {title && (
                  <ACTFrameElement variant="brackets" size="md" className="mb-8">
                    {typeof title === "string" ? (
                      <h2 className="text-3xl md:text-4xl font-helvetica font-medium mb-6">
                        {title}
                      </h2>
                    ) : (
                      title
                    )}
                  </ACTFrameElement>
                )}
                
                {subtitle && (
                  <p className="text-xl md:text-2xl text-white/80 mb-8">
                    {subtitle}
                  </p>
                )}
                
                {typeof content === "string" ? (
                  <p className="text-lg text-white/70 mb-8">
                    {content}
                  </p>
                ) : (
                  content
                )}
                
                {/* Call to action */}
                {(cta || secondaryCta) && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    {cta && (
                      <ACTButton
                        variant="primary"
                        size="lg"
                        href={cta.href}
                      >
                        {cta.text}
                      </ACTButton>
                    )}
                    
                    {secondaryCta && (
                      <ACTButton
                        variant="glass"
                        size="lg"
                        href={secondaryCta.href}
                      >
                        {secondaryCta.text}
                      </ACTButton>
                    )}
                  </div>
                )}
                
                {children}
              </div>
            </div>
          </div>
        ) : (
          // Standard content and image layout
          <>
            {/* Section header (if center image, or no image) */}
            {(imagePosition === "center" || !imageSrc) && (title || subtitle) && (
              <div className="text-center mb-12">
                {title && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {typeof title === "string" ? (
                      <h2 className={cn("text-3xl md:text-4xl font-helvetica font-medium mb-4", textColor)}>
                        {title}
                      </h2>
                    ) : (
                      title
                    )}
                  </motion.div>
                )}
                
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={cn("text-xl max-w-3xl mx-auto", subtitleColor)}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            )}
            
            {/* Center image layout */}
            {imagePosition === "center" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={imageContainerClasses}
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder variant="education" />
                )}
              </motion.div>
            )}
            
            {/* Content and side image layout */}
            {imagePosition !== "center" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Content column */}
                <motion.div
                  className={contentOrder}
                  initial={{ opacity: 0, x: imagePosition === "right" ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {/* Only show title/subtitle here if image is on side */}
                  {(imagePosition === "left" || imagePosition === "right") && (
                    <>
                      {title && (
                        <div className="mb-6">
                          {typeof title === "string" ? (
                            <h2 className={cn("text-3xl md:text-4xl font-helvetica font-medium", textColor)}>
                              {title}
                            </h2>
                          ) : (
                            title
                          )}
                        </div>
                      )}
                      
                      {subtitle && (
                        <p className={cn("text-xl mb-6", subtitleColor)}>
                          {subtitle}
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Main content */}
                  {typeof content === "string" ? (
                    <div className={cn("prose max-w-none", variant === "dark" ? "prose-invert" : "")}>
                      <p>{content}</p>
                    </div>
                  ) : (
                    content
                  )}
                  
                  {/* Feature list */}
                  {features && features.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 gap-6">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className="flex gap-4"
                        >
                          {feature.icon && (
                            <div className={cn(
                              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                              variant === "dark" ? "bg-spring-green/20" : "bg-spring-green/10"
                            )}>
                              {feature.icon}
                            </div>
                          )}
                          <div>
                            <h3 className={cn("text-lg font-medium mb-2", textColor)}>
                              {feature.title}
                            </h3>
                            <p className={cn("text-base", subtitleColor)}>
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* Call to action */}
                  {(cta || secondaryCta) && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      {cta && (
                        <ACTButton
                          variant={cta.variant || "primary"}
                          size="lg"
                          href={cta.href}
                        >
                          {cta.text}
                        </ACTButton>
                      )}
                      
                      {secondaryCta && (
                        <ACTButton
                          variant={secondaryCta.variant || (variant === "dark" ? "glass" : "outline")}
                          size="lg"
                          href={secondaryCta.href}
                        >
                          {secondaryCta.text}
                        </ACTButton>
                      )}
                    </div>
                  )}
                  
                  {children}
                </motion.div>
                
                {/* Image column */}
                {imageSrc && (
                  <motion.div
                    className={cn("flex justify-center", imageOrder)}
                    initial={{ opacity: 0, x: imagePosition === "right" ? 20 : -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className={imageContainerClasses}>
                      <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                )}
                
                {/* Placeholder when no image is provided */}
                {!imageSrc && (imagePosition === "left" || imagePosition === "right") && (
                  <motion.div
                    className={cn("flex justify-center", imageOrder)}
                    initial={{ opacity: 0, x: imagePosition === "right" ? 20 : -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className={imageContainerClasses}>
                      <ImagePlaceholder variant="career" />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
} 