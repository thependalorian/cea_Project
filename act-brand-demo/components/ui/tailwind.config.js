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
        // ACT Brand Colors
        'spring-green': '#B2DE26',
        'moss-green': '#394816',
        'midnight-forest': '#001818',
        'seafoam-blue': '#E0FFFF',
        'sand-gray': '#EBE9E1',
        
        // iOS-inspired colors
        'ios-red': '#FF3B30',
        'ios-green': '#34C759',
        'ios-blue': '#007AFF',
        'ios-yellow': '#FFCC00',
        'ios-orange': '#FF9500',
        'ios-purple': '#AF52DE',
        'ios-gray': '#8E8E93',
        
        'ios-red-900': '#800600',
        'ios-red-100': '#FFD1CF',
        'ios-green-900': '#0A5121',
        'ios-green-100': '#DCFFE5',
        'ios-blue-900': '#00396B',
        'ios-blue-100': '#BCDCFF',
        'ios-yellow-900': '#806600',
        'ios-yellow-100': '#FFF3B3',
        
        // Keep existing colors for compatibility
        primary: "#B2DE26", // Map to spring-green
        secondary: "#394816", // Map to moss-green
        accent: "#E0FFFF", // Map to seafoam-blue
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        'ios-sm': '4px',
        'ios-md': '8px',
        'ios-lg': '12px',
        'ios-xl': '16px',
        'ios-2xl': '22px',
        'ios-full': '9999px',
        'ios-button': '16px',
      },
      boxShadow: {
        'ios-subtle': '0 2px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'ios-normal': '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.10)',
        'ios-elevated': '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      fontFamily: {
        'sf-pro': ['SF Pro Text', 'system-ui', 'sans-serif'],
        'sf-pro-rounded': ['SF Pro Rounded', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'sf-mono': ['SF Mono', 'monospace'],
        'helvetica': ['Helvetica', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'ios': '10px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require("daisyui")],
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
} 