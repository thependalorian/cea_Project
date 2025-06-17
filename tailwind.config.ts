import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './act-brand-demo/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ACT Brand Primary Colors
        'midnight-forest': '#001818',
        'spring-green': '#B2DE26',
        'moss-green': '#394816',
        'seafoam-blue': '#E0FFFF',
        'sand-gray': '#EBE9E1',
        
        // Base system colors
        'base-100': '#ffffff',
        'base-200': '#f8f9fa',
        'base-300': '#dee2e6',
        
        // iOS-inspired colors for enhanced components
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-purple': '#AF52DE',
        'ios-pink': '#FF2D92',
        'ios-yellow': '#FFCC00',
        'ios-teal': '#5AC8FA',
        'ios-indigo': '#5856D6',
        'ios-gray': {
          50: '#F2F2F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          300: '#C7C7CC',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1C1C1E',
        },
      },
      fontFamily: {
        // Typography System
        'helvetica': ['Helvetica Neue', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        'sf-pro-rounded': ['SF Pro Rounded', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // ACT Typography Scale
        'hero': ['4rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'body-large': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'small': ['0.875rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        // iOS-inspired shadows
        'ios-subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'ios-normal': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'ios-prominent': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'ios-button': '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'ios': '10px',
        'ios-light': '5px',
        'ios-heavy': '20px',
      },
      borderRadius: {
        // iOS-inspired border radius
        'ios-sm': '6px',
        'ios-md': '8px',
        'ios-lg': '12px',
        'ios-xl': '16px',
        'ios-2xl': '20px',
        'ios-button': '10px',
        'ios-full': '9999px',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config 