/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          bgDark:    '#0d1117',
          bgCard:    '#161b27',
          border:    '#252f42',
          accent:    '#3b82f6',
          accentLight: '#eff6ff',
          textMain:  '#f1f5f9',
          textMuted: '#8b9ab5',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'card':   '0 2px 16px 0 rgba(0,0,0,0.18)',
        'card-lg':'0 8px 40px 0 rgba(0,0,0,0.28)',
        'blue':   '0 4px 24px 0 rgba(59,130,246,0.35)',
        'fab':    '0 8px 32px 0 rgba(59,130,246,0.45)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
