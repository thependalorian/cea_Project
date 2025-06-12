/**
 * ACT Badge Component - Climate Economy Assistant
 * iOS-style badge with ACT branding and variants
 * Location: components/ui/ACTBadge.tsx
 */

import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface ACTBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ACTBadge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  ...props 
}: ACTBadgeProps) {
  // Map ACT variants to standard badge variants
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-ios-green text-white hover:bg-ios-green/80';
      case 'warning':
        return 'bg-ios-orange text-white hover:bg-ios-orange/80';
      case 'error':
        return 'bg-ios-red text-white hover:bg-ios-red/80';
      case 'info':
        return 'bg-ios-blue text-white hover:bg-ios-blue/80';
      case 'neutral':
        return 'bg-sand-gray text-midnight-forest hover:bg-sand-gray/80';
      default:
        return '';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-ios-caption-2';
      case 'lg':
        return 'px-4 py-2 text-ios-subheadline';
      default:
        return 'px-3 py-1 text-ios-caption-1';
    }
  };

  // Convert ACT variants to standard badge variants
  const badgeVariant = variant === 'success' || variant === 'warning' || variant === 'error' || variant === 'info' || variant === 'neutral' 
    ? 'default' 
    : variant as any;

  return (
    <Badge
      variant={badgeVariant}
      className={cn(
        'font-helvetica rounded-ios-lg border-0',
        getVariantClass(),
        getSizeClass(),
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
} 