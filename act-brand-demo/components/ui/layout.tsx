/**
 * Brand Demo Layout
 * Custom layout for the ACT Brand System demonstration page
 * Location: app/brand-demo/layout.tsx
 */

import React from 'react';

// Metadata for this section
export const metadata = {
  title: 'ACT Brand System Demo | Alliance for Climate Transition',
  description: 'Modern 2025 implementation of the ACT brand components and guidelines',
};

export default function BrandDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="brand-demo-layout">
      {/* You could add a header or other elements specific to brand demo pages here */}
      {children}
      {/* You could add a footer or other elements specific to brand demo pages here */}
    </div>
  );
} 