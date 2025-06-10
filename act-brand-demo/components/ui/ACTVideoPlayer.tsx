"use client";

/**
 * ACT Video Player Component - Alliance for Climate Transition
 * Modern 2025 video player implementation with iOS-inspired design
 * Location: components/ui/ACTVideoPlayer.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ACTVideoPlayerProps {
  src?: string;
  youtubeId?: string;
  vimeoId?: string;
  title?: string;
  poster?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9' | 'auto';
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
  className?: string;
  containerClassName?: string;
  showPlayOverlay?: boolean;
  animated?: boolean;
  dark?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  lazyLoad?: boolean;
  startTime?: number; // in seconds
}

export function ACTVideoPlayer({
  src,
  youtubeId,
  vimeoId,
  title = 'Video',
  poster,
  aspectRatio = '16:9',
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  variant = 'default',
  className,
  containerClassName,
  showPlayOverlay = true,
  animated = true,
  dark = false,
  onPlay,
  onPause,
  onEnd,
  lazyLoad = true,
  startTime = 0,
}: ACTVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoaded, setIsLoaded] = useState(!lazyLoad);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Determine video source type
  const isYouTube = !!youtubeId;
  const isVimeo = !!vimeoId;
  const isEmbedded = isYouTube || isVimeo;
  const isLocal = !!src && !isEmbedded;
  
  // Handle play/pause
  const togglePlay = () => {
    if (!isEmbedded && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      }
    }
    
    // For embedded videos, just toggle the loaded state
    if (isEmbedded && !isLoaded) {
      setIsLoaded(true);
      setIsPlaying(true);
      onPlay?.();
    }
  };
  
  // Handle video end
  const handleEnd = () => {
    setIsPlaying(false);
    onEnd?.();
  };
  
  // Video container styles
  const aspectRatioStyles = {
    '16:9': 'aspect-video', // 16:9
    '4:3': 'aspect-[4/3]',  // 4:3
    '1:1': 'aspect-square',  // 1:1
    '21:9': 'aspect-[21/9]', // 21:9 (Ultrawide)
    'auto': '',              // Native aspect ratio
  };
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border border-sand-gray/20 shadow-ios-subtle rounded-ios-xl overflow-hidden',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-normal rounded-ios-xl overflow-hidden',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal rounded-ios-xl overflow-hidden',
    minimal: 'overflow-hidden rounded-ios-xl',
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  // Generate YouTube embed URL
  const getYouTubeUrl = () => {
    let url = `https://www.youtube.com/embed/${youtubeId}?`;
    const params = [];
    
    if (autoPlay) params.push('autoplay=1');
    if (muted) params.push('mute=1');
    if (loop) params.push('loop=1');
    if (!controls) params.push('controls=0');
    if (startTime > 0) params.push(`start=${startTime}`);
    
    return url + params.join('&');
  };
  
  // Generate Vimeo embed URL
  const getVimeoUrl = () => {
    let url = `https://player.vimeo.com/video/${vimeoId}?`;
    const params = [];
    
    if (autoPlay) params.push('autoplay=1');
    if (muted) params.push('muted=1');
    if (loop) params.push('loop=1');
    if (!controls) params.push('controls=0');
    if (startTime > 0) params.push(`#t=${startTime}s`);
    
    return url + params.join('&');
  };
  
  // Container component with or without animation
  const Container = animated ? motion.div : 'div';
  const containerProps = animated ? {
    initial: "hidden",
    animate: "visible",
    variants: containerVariants
  } : {};
  
  return (
    <Container 
      className={cn(
        'w-full',
        aspectRatio !== 'auto' ? aspectRatioStyles[aspectRatio] : '',
        containerClassName
      )}
      {...containerProps}
    >
      <div className={cn(
        'relative w-full h-full overflow-hidden',
        variantStyles[variant],
        className
      )}>
        {/* Local video player */}
        {isLocal && (
          <>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              controls={controls && isPlaying}
              muted={muted}
              loop={loop}
              playsInline
              className="w-full h-full object-cover"
              onEnded={handleEnd}
              preload={lazyLoad ? 'none' : 'auto'}
            />
            
            {/* Play overlay for local videos */}
            {showPlayOverlay && !isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-midnight-forest/30 backdrop-blur-ios-light cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-ios flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="white" 
                    className="w-8 h-8 md:w-10 md:h-10"
                    style={{ marginLeft: '3px' }} // Slight offset for visual centering
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-white font-sf-pro font-medium text-lg">{title}</h3>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* YouTube embed */}
        {isYouTube && (
          <>
            {isLoaded ? (
              <iframe
                src={getYouTubeUrl()}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                onClick={togglePlay}
                style={poster ? {
                  backgroundImage: `url(${poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {
                  backgroundColor: dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-ios-red/90 flex items-center justify-center shadow-ios-normal">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="white" 
                    className="w-8 h-8 md:w-10 md:h-10"
                    style={{ marginLeft: '3px' }} // Slight offset for visual centering
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-white font-sf-pro font-medium text-lg">{title}</h3>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Vimeo embed */}
        {isVimeo && (
          <>
            {isLoaded ? (
              <iframe
                src={getVimeoUrl()}
                title={title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                onClick={togglePlay}
                style={poster ? {
                  backgroundImage: `url(${poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {
                  backgroundColor: dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-ios-blue/90 flex items-center justify-center shadow-ios-normal">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="white" 
                    className="w-8 h-8 md:w-10 md:h-10"
                    style={{ marginLeft: '3px' }} // Slight offset for visual centering
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-white font-sf-pro font-medium text-lg">{title}</h3>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
} 