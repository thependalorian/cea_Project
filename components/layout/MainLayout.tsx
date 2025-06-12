"use client";

/**
 * Main Layout Component - Climate Economy Assistant
 * Modern responsive layout with improved visual hierarchy and content organization
 * Location: components/layout/MainLayout.tsx
 */

import { useState, ReactNode } from "react";
import { Navigation } from "./navigation";
import { Footer } from "./footer";
import { BottomCTA } from "../ui/BottomCTA";
import { motion, AnimatePresence } from "framer-motion";

interface MainLayoutProps {
  children: ReactNode;
  showHero?: boolean;
  showBottomCTA?: boolean;
  bottomCTAProps?: {
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'gradient' | 'minimal' | 'dark';
    backgroundImage?: string;
  };
}

export function MainLayout({
  children,
  showHero = false,
  showBottomCTA = true,
  bottomCTAProps
}: MainLayoutProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Set isLoaded to true after component mounts
  useState(() => {
    setIsLoaded(true);
  });

  return (
    <div className="flex flex-col min-h-screen bg-sand-gray/5">
      {/* Navigation Bar */}
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-grow">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Bottom CTA Section */}
      {showBottomCTA && (
        <BottomCTA
          title={bottomCTAProps?.title}
          subtitle={bottomCTAProps?.subtitle}
          variant={bottomCTAProps?.variant || "default"}
          backgroundImage={bottomCTAProps?.backgroundImage}
        />
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 