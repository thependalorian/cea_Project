/**
 * ACT Brand Demo Component - Alliance for Climate Transition
 * Demonstrates the implementation of ACT brand guidelines
 */

'use client';

import React, { useState } from 'react';
import { ACTButton } from '../ui/ACTButton';
import { ACTFrameElement } from '../ui/ACTFrameElement';
import { 
  Leaf, 
  Zap, 
  Building2, 
  RefreshCw, 
  ArrowRight 
} from 'lucide-react';

export function ACTBrandDemo() {
  const [activeTab, setActiveTab] = useState('typography');

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-display font-medium text-midnight-forest mb-4">
          ACT Brand Guidelines
        </h1>
        <p className="text-body-large text-midnight-forest/70 max-w-3xl mx-auto">
          Implementation of Alliance for Climate Transition brand system
        </p>
      </div>
      
      {/* Tab navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['typography', 'colors', 'buttons', 'frames'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-inter font-medium transition-all ${
              activeTab === tab
                ? 'bg-spring-green text-midnight-forest'
                : 'bg-midnight-forest/5 text-midnight-forest/70 hover:bg-midnight-forest/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Typography */}
      {activeTab === 'typography' && (
        <div className="bg-base-100 p-8 rounded-lg shadow-lg">
          <h2 className="text-title font-medium text-midnight-forest mb-6">Typography System</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-2">Headings (Helvetica)</h3>
              <div className="space-y-4 border-l-4 border-spring-green pl-4">
                <div>
                  <h1 className="text-hero font-helvetica font-medium">Hero Text (64px)</h1>
                  <p className="text-sm text-midnight-forest/50">Font: Helvetica, Weight: Medium, Tracking: -0.025em</p>
                </div>
                <div>
                  <h1 className="text-display font-helvetica font-medium">Display Text (48px)</h1>
                  <p className="text-sm text-midnight-forest/50">Font: Helvetica, Weight: Medium, Tracking: -0.02em</p>
                </div>
                <div>
                  <h2 className="text-title font-helvetica font-medium">Title Text (28px)</h2>
                  <p className="text-sm text-midnight-forest/50">Font: Helvetica, Weight: Medium, Tracking: -0.02em</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-2">Body Text (Inter)</h3>
              <div className="space-y-4 border-l-4 border-moss-green pl-4">
                <div>
                  <p className="text-body-large font-inter">Body Large Text (24px)</p>
                  <p className="text-sm text-midnight-forest/50">Font: Inter, Weight: Regular, Tracking: -0.02em</p>
                </div>
                <div>
                  <p className="text-body font-inter">Body Text (16px) - The Alliance for Climate Transition (ACT) is dedicated to leading the just, equitable and rapid transition to a clean energy future and diverse climate economy.</p>
                  <p className="text-sm text-midnight-forest/50">Font: Inter, Weight: Regular, Tracking: 0</p>
                </div>
                <div>
                  <p className="text-small font-inter">Small Text (14px) - Supporting text and supplementary information.</p>
                  <p className="text-sm text-midnight-forest/50">Font: Inter, Weight: Regular, Tracking: 0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Colors */}
      {activeTab === 'colors' && (
        <div className="bg-base-100 p-8 rounded-lg shadow-lg">
          <h2 className="text-title font-medium text-midnight-forest mb-6">Color System</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-4">Primary Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-midnight-forest text-white rounded-lg">
                  <div className="font-medium mb-1">Midnight Forest</div>
                  <div className="text-sm opacity-80">#001818</div>
                </div>
                <div className="p-6 bg-spring-green text-midnight-forest rounded-lg">
                  <div className="font-medium mb-1">Spring Green</div>
                  <div className="text-sm opacity-80">#B2DE26</div>
                </div>
                <div className="p-6 bg-white border border-base-300 text-midnight-forest rounded-lg">
                  <div className="font-medium mb-1">White</div>
                  <div className="text-sm opacity-80">#FFFFFF</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-4">Secondary Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-moss-green text-white rounded-lg">
                  <div className="font-medium mb-1">Moss Green</div>
                  <div className="text-sm opacity-80">#394816</div>
                </div>
                <div className="p-6 bg-seafoam-blue text-midnight-forest rounded-lg">
                  <div className="font-medium mb-1">Seafoam Blue</div>
                  <div className="text-sm opacity-80">#E0FFFF</div>
                </div>
                <div className="p-6 bg-sand-gray text-midnight-forest rounded-lg">
                  <div className="font-medium mb-1">Sand Gray</div>
                  <div className="text-sm opacity-80">#EBE9E1</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-4">Gradients</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 act-gradient-primary text-white rounded-lg h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-medium mb-1">Primary Gradient</div>
                    <div className="text-sm opacity-80">Spring Green to Moss Green</div>
                  </div>
                </div>
                <div className="p-6 act-gradient-secondary text-midnight-forest rounded-lg h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-medium mb-1">Secondary Gradient</div>
                    <div className="text-sm opacity-80">Seafoam Blue to Sand Gray</div>
                  </div>
                </div>
                <div className="p-6 act-gradient-accent text-white rounded-lg h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-medium mb-1">Accent Gradient</div>
                    <div className="text-sm opacity-80">Moss Green to Spring Green</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Buttons */}
      {activeTab === 'buttons' && (
        <div className="bg-base-100 p-8 rounded-lg shadow-lg">
          <h2 className="text-title font-medium text-midnight-forest mb-6">Button System</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <ACTButton variant="primary">Primary Button</ACTButton>
                <ACTButton variant="secondary">Secondary Button</ACTButton>
                <ACTButton variant="accent">Accent Button</ACTButton>
                <ACTButton variant="outline">Outline Button</ACTButton>
                <ACTButton variant="ghost">Ghost Button</ACTButton>
              </div>
            </div>
            
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-4">Button Sizes</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <ACTButton variant="primary" size="sm">Small Button</ACTButton>
                <ACTButton variant="primary" size="md">Medium Button</ACTButton>
                <ACTButton variant="primary" size="lg">Large Button</ACTButton>
              </div>
            </div>
            
            <div>
              <h3 className="text-body font-medium text-midnight-forest mb-4">Button with Icons</h3>
              <div className="flex flex-wrap gap-4">
                <ACTButton variant="primary" className="gap-2">
                  <Leaf className="w-4 h-4" />
                  <span>Button with Icon</span>
                </ACTButton>
                <ACTButton variant="secondary" className="gap-2">
                  <span>Button with Icon</span>
                  <ArrowRight className="w-4 h-4" />
                </ACTButton>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Frames */}
      {activeTab === 'frames' && (
        <div className="bg-base-100 p-8 rounded-lg shadow-lg">
          <h2 className="text-title font-medium text-midnight-forest mb-6">Frame Elements</h2>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-body font-medium text-midnight-forest mb-4">Full Frame</h3>
                <ACTFrameElement variant="full" size="lg">
                  <div className="text-center">
                    <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit mb-4">
                      <Zap className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-title font-medium text-midnight-forest mb-2">Innovation & Technology</h3>
                    <p className="text-body text-midnight-forest/70 mb-4">
                      Connect with companies driving clean energy innovation and scalable climate solutions
                    </p>
                    <ACTButton variant="outline" size="sm">Explore Innovation</ACTButton>
                  </div>
                </ACTFrameElement>
              </div>
              
              <div>
                <h3 className="text-body font-medium text-midnight-forest mb-4">Open Frame</h3>
                <ACTFrameElement variant="open" size="lg">
                  <div className="text-center">
                    <div className="p-4 bg-secondary/10 rounded-full mx-auto w-fit mb-4">
                      <Building2 className="h-10 w-10 text-secondary" />
                    </div>
                    <h3 className="text-title font-medium text-midnight-forest mb-2">Workforce Development</h3>
                    <p className="text-body text-midnight-forest/70 mb-4">
                      Build a diverse, inclusive workforce for the clean energy future
                    </p>
                    <ACTButton variant="outline" size="sm">Explore Workforce</ACTButton>
                  </div>
                </ACTFrameElement>
              </div>
              
              <div>
                <h3 className="text-body font-medium text-midnight-forest mb-4">Brackets Frame</h3>
                <ACTFrameElement variant="brackets" size="lg" className="act-brackets">
                  <div className="text-center">
                    <div className="p-4 bg-accent/10 rounded-full mx-auto w-fit mb-4">
                      <RefreshCw className="h-10 w-10 text-accent" />
                    </div>
                    <h3 className="text-title font-medium text-midnight-forest mb-2">Skills Translation</h3>
                    <p className="text-body text-midnight-forest/70 mb-4">
                      Discover how your existing skills translate to climate economy opportunities
                    </p>
                    <ACTButton variant="accent" size="sm">Translate Skills</ACTButton>
                  </div>
                  
                  {/* Manual brackets for demonstration */}
                  <div className="corner-tl"></div>
                  <div className="corner-tr"></div>
                  <div className="corner-bl"></div>
                  <div className="corner-br"></div>
                </ACTFrameElement>
              </div>
              
              <div>
                <h3 className="text-body font-medium text-midnight-forest mb-4">Blur Effect</h3>
                <div className="act-blur-effect h-64 rounded-lg overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2496&q=80" 
                    alt="Landscape" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="act-blur-effect--content p-6 flex flex-col items-center justify-center h-full">
                    <h3 className="text-title font-medium text-white mb-2">Blur Effect Overlay</h3>
                    <p className="text-body text-white/80 mb-4 text-center max-w-md">
                      Used for image overlays following ACT brand guidelines
                    </p>
                    <ACTButton variant="primary" size="sm">Learn More</ACTButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 