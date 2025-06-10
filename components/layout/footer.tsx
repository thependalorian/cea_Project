/**
 * Footer Component - Alliance for Climate Transition
 * Site footer following ACT brand guidelines with Climate Economy Assistant integration
 * Location: components/layout/footer.tsx
 */

import Link from "next/link";
import { ACTFrameElement } from "@/components/ui";

export function Footer() {
  return (
    <footer className="bg-midnight-forest text-sand-gray">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* ACT Brand Section */}
          <div className="lg:col-span-2">
            <ACTFrameElement variant="open" size="sm" className="bg-midnight-forest border-spring-green/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 border-3 border-spring-green rounded-lg flex items-center justify-center bg-spring-green/10">
                  <span className="text-spring-green font-helvetica font-bold text-xl">CEA</span>
                </div>
                <div>
                  <h3 className="font-helvetica font-medium text-lg text-sand-gray leading-tight">
                    Climate Economy Assistant
                  </h3>
                  <p className="font-inter text-sm text-spring-green leading-tight">
                    The Alliance for Climate Transformation
                  </p>
                </div>
              </div>
            </ACTFrameElement>
            
            <p className="text-body font-inter text-sand-gray/80 mb-6 max-w-md">
              The Climate Economy Assistant (CEA) helps navigate the transition to a clean energy future and diverse climate economy across the Northeast.
            </p>
            
            <div className="text-sm font-inter text-sand-gray/70">
              <p className="mb-2">🌱 AI-Powered Climate Career Guidance</p>
              <p>🤝 Personalized Skills Translation & Matching</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-helvetica font-medium text-spring-green mb-6 text-title">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/careers" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Climate Careers
                </Link>
              </li>
              <li>
                <Link href="/education" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/skills-translation" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Skills Translation
                </Link>
              </li>
              <li>
                <Link href="/partners" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Partner Organizations
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* ACT Focus Areas */}
          <div>
            <h4 className="font-helvetica font-medium text-spring-green mb-6 text-title">
              Focus Areas
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/careers?focus=innovation" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Innovation & Technology
                </Link>
              </li>
              <li>
                <Link href="/careers?focus=policy" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Policy & Making
                </Link>
              </li>
              <li>
                <Link href="/careers?focus=workforce" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Workforce Development
                </Link>
              </li>
              <li>
                <Link href="/careers?focus=municipal" className="font-inter text-sand-gray/80 hover:text-spring-green transition-colors">
                  Municipal Leadership
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-spring-green/20 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-6">
              <Link href="/about" className="font-inter text-sm text-sand-gray/60 hover:text-spring-green transition-colors">
                About CEA
              </Link>
              <Link href="/contact" className="font-inter text-sm text-sand-gray/60 hover:text-spring-green transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="font-inter text-sm text-sand-gray/60 hover:text-spring-green transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="font-inter text-sm text-sand-gray/60 hover:text-spring-green transition-colors">
                Terms of Service
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex justify-start md:justify-end gap-4">
              <a 
                href="https://joinact.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sand-gray/60 hover:text-spring-green transition-colors"
                aria-label="Visit ACT Website"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </a>
              
              <a 
                href="https://linkedin.com/company/alliance-climate-transition" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sand-gray/60 hover:text-spring-green transition-colors"
                aria-label="Follow ACT on LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              <a 
                href="https://twitter.com/act_transition" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sand-gray/60 hover:text-spring-green transition-colors"
                aria-label="Follow ACT on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-spring-green/10">
          <p className="font-inter text-sm text-sand-gray/50">
            © 2024 Alliance for Climate Transition. All rights reserved.
          </p>
          <p className="font-inter text-xs text-sand-gray/40 mt-2">
            Powered by the Climate Economy Assistant (CEA) - AI technology for climate career navigation.
          </p>
        </div>
      </div>
    </footer>
  );
} 