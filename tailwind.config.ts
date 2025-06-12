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
        'helvetica': ['Helvetica', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'sf-pro': ['Helvetica', 'Helvetica Neue', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sf-pro-rounded': ['Helvetica', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sf-mono': ['SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'hero': ['4rem', { 
          lineHeight: '1.1', 
          letterSpacing: '-0.025em',
          fontWeight: '500' 
        }],
        'display': ['3rem', { 
          lineHeight: '1.1', 
          letterSpacing: '-0.02em',
          fontWeight: '500'
        }],
        'title': ['1.75rem', { 
          lineHeight: '1.2', 
          letterSpacing: '-0.02em',
          fontWeight: '500'
        }],
        'body-large': ['1.5rem', { 
          lineHeight: '1.33',
          letterSpacing: '-0.02em',
          fontWeight: '400'
        }],
        'body': ['1rem', { 
          lineHeight: '1.5',
          letterSpacing: '0',
          fontWeight: '400'
        }],
        'small': ['0.875rem', { 
          lineHeight: '1.4',
          letterSpacing: '0',
          fontWeight: '400'
        }],
      },
      borderWidth: {
        '0.5': '0.5px',
        '3': '3px',
        '4': '4px',
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
        'spring-green': '#B2DE26',
        'moss-green': '#394816',
        'midnight-forest': '#001818',
        'seafoam-blue': '#E0FFFF',
        'sand-gray': '#EBE9E1',
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
        primary: "#B2DE26",
        secondary: "#394816",
        accent: "#E0FFFF",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      boxShadow: {
        'ios-subtle': '0 1px 3px rgba(0, 24, 24, 0.1)',
        'ios-normal': '0 4px 12px rgba(0, 24, 24, 0.15)',
        'ios-prominent': '0 8px 25px rgba(0, 24, 24, 0.15)',
        'ios-elevated': '0 12px 35px rgba(0, 24, 24, 0.18)',
        'ios-button': '0 2px 8px rgba(178, 222, 38, 0.15)',
        'act-glow': '0 0 20px rgba(178, 222, 38, 0.3)',
      },
      backdropBlur: {
        'ios': '10px',
        'ios-light': '5px',
        'ios-heavy': '20px',
      },
      backgroundOpacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
        '95': '0.95',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'act-glow': 'actGlow 2s ease-in-out infinite',
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
        actGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(178, 222, 38, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(178, 222, 38, 0.5)' 
          },
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
    require("tailwindcss-animate"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        "light": {
          "primary": "#B2DE26",
          "primary-content": "#001818",
          "secondary": "#394816",
          "secondary-content": "#ffffff",
          "accent": "#E0FFFF",
          "accent-content": "#001818",
          "neutral": "#001818",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#EBE9E1",
          "base-content": "#001818",
          "info": "#E0FFFF",
          "info-content": "#001818",
          "success": "#B2DE26",
          "success-content": "#001818",
          "warning": "#FF9500",
          "warning-content": "#ffffff",
          "error": "#FF3B30",
          "error-content": "#ffffff",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
