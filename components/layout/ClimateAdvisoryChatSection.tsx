/**
 * Climate Advisory Chat Section Component
 * Showcases the Climate Economy Assistant chat interface on the home page
 * Location: components/layout/ClimateAdvisoryChatSection.tsx
 */

import { ClimateAdvisoryChat } from '../ClimateAdvisoryChat';

export function ClimateAdvisoryChatSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Experience Our <span className="text-spring-green">AI Climate Assistant</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get real-time climate intelligence and personalized guidance for your sustainability journey. 
            Our advanced AI assistant provides expert insights on climate transition strategies, 
            carbon footprint analysis, and renewable energy solutions.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="max-w-5xl mx-auto">
          <ClimateAdvisoryChat 
            className="shadow-2xl" 
          />
        </div>

        {/* Features Below Chat */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Intelligence</h3>
            <p className="text-gray-600">
              Access up-to-date climate data, market trends, and sustainability metrics to make informed decisions.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Guidance</h3>
            <p className="text-gray-600">
              Get personalized recommendations for climate transition strategies and sustainability best practices.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Pathways</h3>
            <p className="text-gray-600">
              Discover opportunities in the clean energy sector and get guidance on career transitions.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-spring-green to-moss-green rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 opacity-90">
              Create your free account and unlock the full power of our Climate Economy Assistant
            </p>
            <a 
              href="/auth/sign-up" 
              className="btn btn-lg bg-white text-spring-green hover:bg-gray-100 border-none font-semibold px-8"
            >
              Start Your Climate Journey
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 