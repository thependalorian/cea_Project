import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./act-brand-demo/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-midnight-forest',
    'text-spring-green',
    'border-spring-green',
    'font-sf-pro-rounded',
    'font-sf-pro',
    'bg-spring-green',
    'text-midnight-forest',
    'bg-moss-green',
    'bg-seafoam-blue',
    'text-white',
    'bg-spring-green/20',
    'border-spring-green/20',
    'border-spring-green/50',
    'text-spring-green/70',
    'text-white/70',
    'text-white/80',
    'bg-white/10',
    'bg-white/15',
    'bg-white/25',
    'backdrop-blur-ios',
    'backdrop-blur-ios-light',
    'rounded-ios-xl',
    'rounded-ios-lg',
    'rounded-ios-button',
    'shadow-ios-subtle',
    'shadow-ios-normal',
  ],
  theme: {
    extend: {
      fontFamily: {
        'helvetica': ['Helvetica', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'sans-serif'],
        'sf-pro-rounded': ['SF Pro Rounded', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sf-mono': ['SF Mono', 'monospace'],
      },
      borderWidth: {
        '0.5': '0.5px',
        '3': '3px',
        '5': '5px',
        '6': '6px',
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '14px',
        'ios-xl': '18px',
        'ios-2xl': '22px',
        'ios-button': '16px',
        'ios-full': '9999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // ACT Brand Colors
        'spring-green': '#B2DE26', 
        'moss-green': '#394816',
        'midnight-forest': '#001818',
        'seafoam-blue': '#E0FFFF',
        'sand-gray': '#EBE9E1',
        // iOS Colors
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-indigo': '#5856D6',
        'ios-orange': '#FF9500',
        'ios-pink': '#FF2D55',
        'ios-purple': '#AF52DE',
        'ios-red': '#FF3B30',
        'ios-teal': '#5AC8FA',
        'ios-yellow': '#FFCC00',
        'ios-gray': {
          50: '#F9F9FB',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#C7C7CC',
          500: '#AEAEB2',
          600: '#8E8E93',
          700: '#636366',
          800: '#48484A',
          900: '#3A3A3C',
        },
        // Keep existing colors for compatibility
        primary: "#B2DE26", // Map to spring-green
        secondary: "#394816", // Map to moss-green
        accent: "#E0FFFF", // Map to seafoam-blue
      },
      boxShadow: {
        'ios-inner': 'inset 0 0 1px 0 rgba(0, 0, 0, 0.15)',
        'ios-subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'ios-normal': '0 4px 14px rgba(0, 0, 0, 0.08)',
        'ios-prominent': '0 8px 20px rgba(0, 0, 0, 0.12)',
        'ios-elevated': '0 16px 32px rgba(0, 0, 0, 0.15)',
      },
      backdropBlur: {
        'ios': '20px',
        'ios-heavy': '30px',
        'ios-light': '10px',
      },
      backgroundOpacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
        '95': '0.95',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        "light": {
          "primary": "#B2DE26", // spring-green
          "primary-content": "#001818", // midnight-forest
          "secondary": "#394816", // moss-green
          "secondary-content": "#ffffff",
          "accent": "#E0FFFF", // seafoam-blue
          "accent-content": "#001818", // midnight-forest
          "neutral": "#001818", // midnight-forest
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#EBE9E1", // sand-gray
          "base-content": "#001818", // midnight-forest
          "info": "#3abff8",
          "info-content": "#ffffff",
          "success": "#36d399",
          "success-content": "#ffffff",
          "warning": "#fbbd23",
          "warning-content": "#ffffff",
          "error": "#f87272",
          "error-content": "#ffffff",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
