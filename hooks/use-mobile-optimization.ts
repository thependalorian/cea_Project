/**
 * Mobile Optimization Hook - Climate Economy Assistant
 * Responsive design and mobile-specific optimizations
 * Location: hooks/use-mobile-optimization.ts
 */

import { useState, useEffect, useCallback } from 'react';

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

export function useMobileOptimization() {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape'
  });

  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  // Update screen size
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setScreenSize({
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width > height ? 'landscape' : 'portrait'
    });
  }, []);

  // Touch gesture detection
  const useTouchGesture = useCallback((
    onSwipe?: (gesture: TouchGesture) => void,
    threshold = 50
  ) => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      
      const deltaX = endX - touchStart.x;
      const deltaY = endY - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < threshold) return;

      let direction: TouchGesture['direction'] = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: TouchGesture = {
        startX: touchStart.x,
        startY: touchStart.y,
        endX,
        endY,
        direction,
        distance
      };

      onSwipe?.(gesture);
      setTouchStart(null);
    }, [touchStart, onSwipe, threshold]);

    return { handleTouchStart, handleTouchEnd };
  }, []);

  // Viewport utilities
  const getOptimalImageSize = useCallback((baseWidth: number) => {
    const { width, isMobile, isTablet } = screenSize;
    const pixelRatio = window.devicePixelRatio || 1;
    
    let optimalWidth = baseWidth;
    if (isMobile) optimalWidth = Math.min(baseWidth, width * 0.9);
    else if (isTablet) optimalWidth = Math.min(baseWidth, width * 0.7);
    
    return Math.round(optimalWidth * pixelRatio);
  }, [screenSize]);

  const getOptimalColumns = useCallback((maxCols = 4) => {
    const { isMobile, isTablet } = screenSize;
    if (isMobile) return 1;
    if (isTablet) return Math.min(2, maxCols);
    return maxCols;
  }, [screenSize]);

  // Performance optimizations
  const shouldReduceAnimations = useCallback(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  const shouldLazyLoad = useCallback(() => {
    return screenSize.isMobile || connectionType === 'slow-2g' || connectionType === '2g';
  }, [screenSize.isMobile, connectionType]);

  // Initialize
  useEffect(() => {
    updateScreenSize();
    
    // Network status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    // Connection type (if supported)
    const updateConnectionType = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    // Event listeners
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    updateOnlineStatus();
    updateConnectionType();

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateScreenSize]);

  return {
    screenSize,
    isOnline,
    connectionType,
    useTouchGesture,
    getOptimalImageSize,
    getOptimalColumns,
    shouldReduceAnimations,
    shouldLazyLoad,
    
    // Utility classes
    responsiveClasses: {
      container: screenSize.isMobile ? 'px-4' : screenSize.isTablet ? 'px-6' : 'px-8',
      grid: screenSize.isMobile ? 'grid-cols-1' : screenSize.isTablet ? 'grid-cols-2' : 'grid-cols-3',
      text: screenSize.isMobile ? 'text-sm' : 'text-base',
      spacing: screenSize.isMobile ? 'space-y-4' : 'space-y-6'
    }
  };
} 