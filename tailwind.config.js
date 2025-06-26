/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ACT Brand Colors - Exact hex values with proper hierarchy
        'midnight-forest': {
          DEFAULT: '#001818',
          90: 'rgba(0, 24, 24, 0.9)',
          80: 'rgba(0, 24, 24, 0.8)',
          70: 'rgba(0, 24, 24, 0.7)',
          60: 'rgba(0, 24, 24, 0.6)',
          50: 'rgba(0, 24, 24, 0.5)',
          40: 'rgba(0, 24, 24, 0.4)',
          30: 'rgba(0, 24, 24, 0.3)',
          20: 'rgba(0, 24, 24, 0.2)',
          10: 'rgba(0, 24, 24, 0.1)',
          5: 'rgba(0, 24, 24, 0.05)',
        },
        'spring-green': {
          DEFAULT: '#B2DE26',
          90: 'rgba(178, 222, 38, 0.9)',
          80: 'rgba(178, 222, 38, 0.8)',
          70: 'rgba(178, 222, 38, 0.7)',
          60: 'rgba(178, 222, 38, 0.6)',
          50: 'rgba(178, 222, 38, 0.5)',
          40: 'rgba(178, 222, 38, 0.4)',
          30: 'rgba(178, 222, 38, 0.3)',
          20: 'rgba(178, 222, 38, 0.2)',
          10: 'rgba(178, 222, 38, 0.1)',
        },
        'moss-green': {
          DEFAULT: '#394816',
          90: 'rgba(57, 72, 22, 0.9)',
          80: 'rgba(57, 72, 22, 0.8)',
          70: 'rgba(57, 72, 22, 0.7)',
          60: 'rgba(57, 72, 22, 0.6)',
          50: 'rgba(57, 72, 22, 0.5)',
          40: 'rgba(57, 72, 22, 0.4)',
          30: 'rgba(57, 72, 22, 0.3)',
          20: 'rgba(57, 72, 22, 0.2)',
          10: 'rgba(57, 72, 22, 0.1)',
        },
        'sand-gray': {
          DEFAULT: '#EBE9E1',
          90: 'rgba(235, 233, 225, 0.9)',
          80: 'rgba(235, 233, 225, 0.8)',
          70: 'rgba(235, 233, 225, 0.7)',
          60: 'rgba(235, 233, 225, 0.6)',
          50: 'rgba(235, 233, 225, 0.5)',
          40: 'rgba(235, 233, 225, 0.4)',
          30: 'rgba(235, 233, 225, 0.3)',
          20: 'rgba(235, 233, 225, 0.2)',
          10: 'rgba(235, 233, 225, 0.1)',
        },
        'seafoam-blue': {
          DEFAULT: '#E0FFFF',
          90: 'rgba(224, 255, 255, 0.9)',
          80: 'rgba(224, 255, 255, 0.8)',
          70: 'rgba(224, 255, 255, 0.7)',
          60: 'rgba(224, 255, 255, 0.6)',
          50: 'rgba(224, 255, 255, 0.5)',
          40: 'rgba(224, 255, 255, 0.4)',
          30: 'rgba(224, 255, 255, 0.3)',
          20: 'rgba(224, 255, 255, 0.2)',
          10: 'rgba(224, 255, 255, 0.1)',
        },
        // Tertiary calculated tints
        'mint': '#D4E8B8', // Spring Green 30%
        'sage': '#6B7D42', // Moss Green 60%
        'silver': '#4D5454', // Midnight Forest 30%
      },
      fontFamily: {
        // ACT Brand Typography - Exact implementation
        'title': ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'body': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // ACT Brand Typography with exact tracking and leading
        'hero-desktop': ['48px', { lineHeight: '57.6px', letterSpacing: '-0.02em' }], // 48px with 1.2 line-height
        'hero-mobile': ['32px', { lineHeight: '38.4px', letterSpacing: '-0.02em' }], // 32px with 1.2 line-height
        'h1': ['36px', { lineHeight: '43.2px', letterSpacing: '-0.02em' }], // 36px with 1.2 line-height
        'h2': ['28px', { lineHeight: '33.6px', letterSpacing: '-0.02em' }], // 28px with 1.2 line-height
        'h3': ['24px', { lineHeight: '28.8px', letterSpacing: '-0.02em' }], // 24px with 1.2 line-height
        'h4': ['20px', { lineHeight: '24px', letterSpacing: '0em' }], // 20px with Inter
        'body-large': ['18px', { lineHeight: '25.2px', letterSpacing: '0em' }], // 18px with 1.4 line-height
        'body': ['16px', { lineHeight: '24px', letterSpacing: '0em' }], // 16px with 1.5 line-height
        'body-small': ['14px', { lineHeight: '19.6px', letterSpacing: '0em' }], // 14px with 1.4 line-height
        'caption': ['12px', { lineHeight: '14.4px', letterSpacing: '0em' }], // 12px with 1.2 line-height
        'nav': ['16px', { lineHeight: '22.4px', letterSpacing: '-0.02em' }], // Navigation specific
        'cta': ['18px', { lineHeight: '21.6px', letterSpacing: '0em' }], // CTA specific
      },
      fontWeight: {
        // Exact font weights for brand compliance
        'title-thin': '100',
        'title-light': '300',
        'title-regular': '400',
        'title-medium': '500',
        'body-regular': '400',
        'body-medium': '500',
        'body-semibold': '600',
        'body-bold': '700',
      },
      spacing: {
        // ACT Brand Spacing System - Base unit system
        'act-unit': '24px', // Base unit from logo "A" letterform
        'act-0.5': '12px', // 0.5x base unit
        'act-1': '24px',   // 1x base unit
        'act-1.5': '36px', // 1.5x base unit
        'act-2': '48px',   // 2x base unit
        'act-3': '72px',   // 3x base unit
        'act-4': '96px',   // 4x base unit
        'act-6': '144px',  // 6x base unit
        'act-8': '192px',  // 8x base unit
        
        // Specific component spacing
        'nav-height': '96px', // 4x base units for navigation
        'hero-min': '80vh',
        'hero-max': '100vh',
        'content-max': '1200px', // Maximum content width
        'line-max': '70ch', // Maximum line length for readability
      },
      maxWidth: {
        'content': '1200px', // ACT content maximum width
        'readable': '70ch',  // Optimal reading width
        'frame': '66.666667%', // Frame constraint - 2/3 page width
      },
      screens: {
        // 2025 Modern Responsive Breakpoints - Mobile-first approach
        // Following latest device usage patterns and 2025 standards
        'xs': '360px',    // Small mobile (360px+) - iPhone SE, small Android
        'sm': '480px',    // Large mobile (480px+) - Most modern phones
        'md': '768px',    // Tablet portrait (768px+) - iPad, Android tablets
        'lg': '1024px',   // Desktop/Tablet landscape (1024px+) - Small laptops, large tablets
        'xl': '1366px',   // Large desktop (1366px+) - Most common desktop resolution
        '2xl': '1920px',  // Ultra-wide (1920px+) - Large monitors
        
        // Max-width breakpoints for precise targeting
        'max-xs': {'max': '359px'},   // Only extra small
        'max-sm': {'max': '479px'},   // Only small mobile and below
        'max-md': {'max': '767px'},   // Only mobile devices
        'max-lg': {'max': '1023px'},  // Only tablet and below
        'max-xl': {'max': '1365px'},  // Only desktop and below
        
        // Specific device targeting
        'mobile': {'min': '320px', 'max': '767px'},    // All mobile devices
        'tablet': {'min': '768px', 'max': '1023px'},   // All tablets
        'desktop': {'min': '1024px'},                   // All desktop devices
        
        // Container query-like breakpoints
        'container-sm': '384px',  // 24rem in container queries
        'container-md': '448px',  // 28rem in container queries
        'container-lg': '512px',  // 32rem in container queries
        'container-xl': '576px',  // 36rem in container queries
      },
      borderRadius: {
        'act-sm': '12px',  // 0.5x base unit
        'act': '24px',     // 1x base unit
        'act-lg': '36px',  // 1.5x base unit
      },
      boxShadow: {
        'act-card': '0 4px 12px rgba(0, 24, 24, 0.05)', // Card shadow
        'act-card-hover': '0 8px 24px rgba(0, 24, 24, 0.08)', // Card hover shadow
        'act-nav': '0 2px 8px rgba(0, 24, 24, 0.1)', // Navigation shadow
        'act-focus': '0 0 0 2px #B2DE26', // Focus outline
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-hover': 'scaleHover 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(178, 222, 38, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(178, 222, 38, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-seafoam': 'linear-gradient(135deg, #E0FFFF 0%, #FFFFFF 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(0, 24, 24, 0.8) 0%, rgba(0, 24, 24, 0.4) 100%)',
      },
      backdropBlur: {
        'act': '8px', // Standard blur for overlays
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  daisyui: {
    themes: [
      {
        "act-climate": {
          // Primary brand colors
          "primary": "#B2DE26",        // Spring Green
          "primary-focus": "#9BC922",   // Spring Green darker
          "primary-content": "#001818", // Midnight Forest
          
          // Secondary brand colors
          "secondary": "#394816",       // Moss Green
          "secondary-focus": "#2D3612", // Moss Green darker
          "secondary-content": "#FFFFFF", // White
          
          // Accent colors
          "accent": "#E0FFFF",          // Seafoam Blue
          "accent-focus": "#CCF2F2",    // Seafoam Blue darker
          "accent-content": "#001818",  // Midnight Forest
          
          // Neutral colors
          "neutral": "#001818",         // Midnight Forest (replaces black)
          "neutral-focus": "#001414",   // Midnight Forest darker
          "neutral-content": "#FFFFFF", // White
          
          // Base colors
          "base-100": "#FFFFFF",        // White
          "base-200": "#EBE9E1",        // Sand Gray
          "base-300": "#D6D4CC",        // Sand Gray darker
          "base-content": "#001818",    // Midnight Forest
          
          // Status colors
          "info": "#E0FFFF",    // Seafoam Blue
          "success": "#B2DE26", // Spring Green
          "warning": "#394816", // Moss Green
          "error": "#6B4423",   // Warm brown for errors
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root",
  },
} 