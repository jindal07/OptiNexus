/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Ivory (lime/green accent)
        'brand': {
          50: '#f6faeb',
          100: '#edf4d7',
          200: '#dbe9af',
          300: '#c8de87',
          400: '#b6d35f',
          500: '#a4c837',
          600: '#83a02c',
          700: '#627821',
          800: '#425016',
          900: '#21280b',
          950: '#171c08',
        },
        // Accent color - Dry Sage
        'accent': {
          50: '#f5f5f0',
          100: '#eaeae1',
          200: '#d6d5c2',
          300: '#c1c0a4',
          400: '#acab86',
          500: '#989667',
          600: '#797853',
          700: '#5b5a3e',
          800: '#3d3c29',
          900: '#1e1e15',
          950: '#15150e',
        },
        // Surface colors - Ebony (dark backgrounds)
        'surface': {
          50: '#f2f3f2',
          100: '#e4e7e4',
          200: '#caceca',
          300: '#afb6af',
          400: '#959d95',
          500: '#7a857a',
          600: '#626a62',
          700: '#495049',
          800: '#313531',
          900: '#181b18',
          950: '#111311',
        },
        // Muted color - Dim Grey
        'muted': {
          50: '#f1f3f3',
          100: '#e3e7e8',
          200: '#c8d0d0',
          300: '#acb8b9',
          400: '#91a0a1',
          500: '#75888a',
          600: '#5e6d6e',
          700: '#465253',
          800: '#2f3737',
          900: '#171b1c',
          950: '#101313',
        },
        // Slate - Dark Slate Grey
        'slate-custom': {
          50: '#f1f4f2',
          100: '#e2e9e4',
          200: '#c6d2ca',
          300: '#a9bcaf',
          400: '#8da595',
          500: '#708f7a',
          600: '#5a7262',
          700: '#435649',
          800: '#2d3931',
          900: '#161d18',
          950: '#101411',
        },
      },
      fontFamily: {
        'sans': ['"Exo 2"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['"Exo 2"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(164, 200, 55, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(164, 200, 55, 0.4)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.2)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
