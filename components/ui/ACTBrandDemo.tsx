'use client';

import React from 'react';

interface ACTBrandDemoProps {
  children?: React.ReactNode;
  className?: string;
}

export const ACTBrandDemo: React.FC<ACTBrandDemoProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={"act-brand-demo " + className}>
      {children || <div>Brand Demo Placeholder</div>}
    </div>
  );
};

export default ACTBrandDemo;
