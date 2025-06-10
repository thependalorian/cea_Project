"use client";

/**
 * ACT Speech Wave Component - Alliance for Climate Transition
 * Modern 2025 Siri-like speech wave implementation with iOS-inspired design
 * Location: components/ui/ACTSpeechWave.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ACTSpeechWaveProps {
  isActive?: boolean;
  variant?: 'siri' | 'bars' | 'circle' | 'dots' | 'waveform';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  activeColor?: string;
  backgroundColor?: string;
  className?: string;
  containerClassName?: string;
  liveAudio?: boolean;
  sensitivity?: number; // 1-10, higher = more sensitive
  showPulse?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  waveCount?: number;
  dark?: boolean;
}

export function ACTSpeechWave({
  isActive = false,
  variant = 'siri',
  size = 'md',
  color = 'rgba(255, 255, 255, 0.7)',
  activeColor = '#2CF586', // Spring green
  backgroundColor,
  className,
  containerClassName,
  liveAudio = false,
  sensitivity = 5,
  showPulse = true,
  animationSpeed = 'normal',
  waveCount = 20,
  dark = false,
}: ACTSpeechWaveProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Calculate animation speed in ms
  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case 'slow': return 1.2;
      case 'fast': return 0.4;
      default: return 0.8;
    }
  };
  
  // Size mapping for components
  const sizeMap = {
    sm: {
      container: 'w-16 h-16',
      siriHeight: 12,
      barsSize: 'h-10 gap-1',
      barWidth: 'w-1',
      circleSize: 'w-12 h-12',
      dotSize: 'w-1.5 h-1.5',
      waveformHeight: 'h-8',
    },
    md: {
      container: 'w-24 h-24',
      siriHeight: 16,
      barsSize: 'h-16 gap-1.5',
      barWidth: 'w-1.5',
      circleSize: 'w-16 h-16',
      dotSize: 'w-2 h-2',
      waveformHeight: 'h-12',
    },
    lg: {
      container: 'w-32 h-32',
      siriHeight: 20,
      barsSize: 'h-20 gap-2',
      barWidth: 'w-2',
      circleSize: 'w-24 h-24',
      dotSize: 'w-3 h-3',
      waveformHeight: 'h-16',
    },
  };
  
  // Set up audio analyzer for live audio
  useEffect(() => {
    if (liveAudio) {
      const setupMicrophone = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          
          const audioContext = audioContextRef.current;
          
          // Create analyzer
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = 32;
          
          // Create buffer
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
          
          // Connect microphone to analyzer
          micStreamRef.current = audioContext.createMediaStreamSource(stream);
          micStreamRef.current.connect(analyserRef.current);
          
          setIsListening(true);
          updateAudioLevel();
        } catch (error) {
          console.error("Error accessing microphone:", error);
          setIsListening(false);
        }
      };
      
      setupMicrophone();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (micStreamRef.current) {
          micStreamRef.current.disconnect();
        }
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        
        setIsListening(false);
      };
    }
  }, [liveAudio]);
  
  // Update audio level from analyzer
  const updateAudioLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume
    const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
    
    // Normalize to 0-1 range and apply sensitivity
    const normalizedLevel = Math.min(1, average / (256 / (sensitivity * 2)));
    setAudioLevel(normalizedLevel);
    
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  };
  
  // Get active state (either from prop or from live audio)
  const isActiveState = liveAudio ? isListening && audioLevel > 0.05 : isActive;
  
  // Generate bars for the Siri wave effect
  const renderSiriWave = () => {
    const bars = [];
    const centerIndex = Math.floor(waveCount / 2);
    const duration = getAnimationDuration();
    
    for (let i = 0; i < waveCount; i++) {
      // Calculate distance from center (0-1)
      const distanceFromCenter = Math.abs(i - centerIndex) / centerIndex;
      const delayMultiplier = isActiveState ? 0.05 : 0.03;
      
      // Scale heights based on position and activity
      let heightScale;
      if (isActiveState) {
        // When active, bars in the center are taller
        heightScale = liveAudio
          ? 0.2 + audioLevel * (1 - distanceFromCenter * 0.8)
          : 0.2 + (1 - distanceFromCenter * 0.8);
      } else {
        // When inactive, all bars are similar height with slight variation
        heightScale = 0.15 + (Math.sin(i * 0.5) * 0.05);
      }
      
      // Calculate max height based on size
      const maxHeight = sizeMap[size].siriHeight;
      const height = maxHeight * heightScale;
      
      bars.push(
        <motion.span
          key={i}
          className={cn("rounded-full w-0.5 mx-px")}
          initial={{ height: 4 }}
          animate={{ 
            height: height,
            backgroundColor: isActiveState ? activeColor : color
          }}
          transition={{
            height: {
              duration: duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * delayMultiplier,
              ease: "easeInOut"
            },
            backgroundColor: {
              duration: 0.2
            }
          }}
          style={{ 
            backgroundColor: isActiveState ? activeColor : color
          }}
        />
      );
    }
    
    return (
      <div className="flex items-center justify-center">
        {bars}
      </div>
    );
  };
  
  // Render equalizer bars
  const renderBars = () => {
    const bars = [];
    const duration = getAnimationDuration();
    
    for (let i = 0; i < 5; i++) {
      const delay = i * 0.1;
      
      let heightScale;
      if (isActiveState) {
        // When active, bars have varied heights
        heightScale = liveAudio
          ? 0.3 + audioLevel * (0.7 - (Math.abs(i - 2) * 0.1))
          : 0.3 + (0.7 - (Math.abs(i - 2) * 0.1));
      } else {
        // When inactive, all bars are short
        heightScale = 0.2;
      }
      
      bars.push(
        <motion.span
          key={i}
          className={cn(
            "rounded-ios-lg",
            sizeMap[size].barWidth
          )}
          style={{ 
            backgroundColor: isActiveState ? activeColor : color 
          }}
          animate={{ 
            height: `${heightScale * 100}%`,
          }}
          transition={{
            height: {
              duration: duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay,
              ease: "easeInOut"
            }
          }}
        />
      );
    }
    
    return (
      <div className={cn(
        "flex items-end justify-center",
        sizeMap[size].barsSize
      )}>
        {bars}
      </div>
    );
  };
  
  // Render pulsing circle
  const renderCircle = () => {
    const pulseSize = isActiveState
      ? liveAudio ? 1 + audioLevel * 0.3 : 1.3
      : 1;
    
    const duration = getAnimationDuration() * 1.5;
    
    return (
      <div className={cn(
        "relative flex items-center justify-center",
        sizeMap[size].circleSize
      )}>
        {/* Background circle */}
        <div 
          className="absolute rounded-full opacity-30"
          style={{ 
            backgroundColor: isActiveState ? activeColor : color,
            width: '100%',
            height: '100%'
          }}
        />
        
        {/* Animated circle */}
        <motion.div
          className="absolute rounded-full"
          style={{ 
            backgroundColor: isActiveState ? activeColor : color,
            width: '60%',
            height: '60%'
          }}
          animate={{ 
            scale: pulseSize,
            opacity: isActiveState ? 0.8 : 0.4
          }}
          transition={{
            scale: {
              duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            },
            opacity: {
              duration: 0.3
            }
          }}
        />
        
        {/* Pulse effect */}
        {isActiveState && showPulse && (
          <AnimatePresence>
            <motion.div
              className="absolute rounded-full"
              style={{ 
                backgroundColor: activeColor,
                width: '60%',
                height: '60%'
              }}
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: duration * 1.2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>
        )}
        
        {/* Center dot */}
        <div 
          className="rounded-full z-10"
          style={{ 
            backgroundColor: isActiveState ? activeColor : color,
            width: '30%',
            height: '30%',
            opacity: 0.9
          }}
        />
      </div>
    );
  };
  
  // Render animated dots
  const renderDots = () => {
    const dots = [];
    const duration = getAnimationDuration();
    
    for (let i = 0; i < 3; i++) {
      dots.push(
        <motion.div
          key={i}
          className={cn(
            "rounded-full mx-1",
            sizeMap[size].dotSize
          )}
          style={{ backgroundColor: isActiveState ? activeColor : color }}
          animate={{ 
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: duration,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      );
    }
    
    return (
      <div className="flex items-center justify-center">
        {dots}
      </div>
    );
  };
  
  // Render audio waveform
  const renderWaveform = () => {
    const points = [];
    const width = 100; // SVG viewBox width
    const height = 30; // SVG viewBox height
    const duration = getAnimationDuration();
    
    // Generate smooth wave
    for (let i = 0; i <= width; i += 5) {
      points.push(
        <motion.circle
          key={i}
          cx={i}
          cy={height / 2}
          r={1.5}
          fill={isActiveState ? activeColor : color}
          animate={{
            cy: [
              height / 2 - (isActiveState ? (liveAudio ? audioLevel * 10 : 10) : 2) * Math.sin(i * 0.2),
              height / 2 + (isActiveState ? (liveAudio ? audioLevel * 10 : 10) : 2) * Math.sin(i * 0.2),
              height / 2 - (isActiveState ? (liveAudio ? audioLevel * 10 : 10) : 2) * Math.sin(i * 0.2)
            ]
          }}
          transition={{
            duration: duration * (1 + (i / width) * 0.5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.01
          }}
        />
      );
    }
    
    return (
      <div className={cn(
        "flex items-center justify-center",
        sizeMap[size].waveformHeight
      )}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {points}
        </svg>
      </div>
    );
  };
  
  // Render the appropriate variant
  const renderVariant = () => {
    switch (variant) {
      case 'siri':
        return renderSiriWave();
      case 'bars':
        return renderBars();
      case 'circle':
        return renderCircle();
      case 'dots':
        return renderDots();
      case 'waveform':
        return renderWaveform();
      default:
        return renderSiriWave();
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full",
        backgroundColor ? '' : dark ? 'bg-midnight-forest/30' : 'bg-white/10',
        sizeMap[size].container,
        containerClassName
      )}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className={cn(
        "flex items-center justify-center",
        className
      )}>
        {renderVariant()}
      </div>
    </div>
  );
} 