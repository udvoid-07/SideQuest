/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Warm espresso dark — replaces cold void purple
        void: {
          DEFAULT: '#2A1A0E',
          50:  '#FBF5EE',
          100: '#F5EDE3',
          200: '#D4B09A',
          300: '#A07860',
          400: '#6E4830',
          500: '#4A2E18',
          600: '#3A2210',
          700: '#2A1A0E',
          800: '#1C1109',
          900: '#100B06',
          950: '#0A0705',
        },
        // Warm coral-ember — replaces harsh cold red
        ember: {
          DEFAULT: '#E8663D',
          50:  '#FFF4EF',
          100: '#FFE2D0',
          200: '#FFC0A0',
          300: '#FF9568',
          400: '#F07848',
          500: '#E8663D',
          600: '#C84D28',
          700: '#A43A18',
          800: '#7A2B10',
          900: '#5A1F0A',
        },
        // Warm amber-peach — replaces cold gold
        gold: '#F4A261',
        // New warm accents
        terracotta: '#C2855A',
        sage:       '#7BA7A0',
        cream:      '#F5EDE3',
        sand:       '#A08060',
        // Quest category colours (kept vibrant for energy)
        quest: {
          creative:  '#ec4899',
          social:    '#38bdf8',
          physical:  '#f97316',
          mental:    '#8b5cf6',
          culinary:  '#f59e0b',
          adventure: '#10b981',
          learning:  '#3b82f6',
          wellness:  '#34d399',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        equinox: ['Cinzel', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-void':  'linear-gradient(135deg, #0A0705 0%, #1C1109 50%, #2A1A0E 100%)',
        'gradient-ember': 'linear-gradient(135deg, #E8663D 0%, #C84D28 100%)',
        'gradient-xp':    'linear-gradient(90deg, #F4A261 0%, #E8663D 100%)',
        'gradient-card':  'linear-gradient(135deg, rgba(42,26,14,0.7) 0%, rgba(28,17,9,0.9) 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'float-slow':  'float 8s ease-in-out 1s infinite',
        'glow':        'glow 3s ease-in-out infinite alternate',
        'xp-fill':     'xpFill 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-up':     'fadeUp 0.5s ease-out forwards',
        'pop':         'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'shimmer':     'shimmer 2s linear infinite',
        'streak-fire': 'streakFire 1s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-12px) rotate(1deg)' },
          '66%':      { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(232,102,61,0.3), 0 0 20px rgba(232,102,61,0.1)' },
          to:   { boxShadow: '0 0 20px rgba(232,102,61,0.6), 0 0 40px rgba(232,102,61,0.3)' },
        },
        xpFill: {
          from: { width: '0%', opacity: '0.6' },
          to:   { width: 'var(--xp-pct)', opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        streakFire: {
          from: { transform: 'scale(1) rotate(-3deg)',   filter: 'brightness(1)' },
          to:   { transform: 'scale(1.1) rotate(3deg)', filter: 'brightness(1.3)' },
        },
      },
      boxShadow: {
        'quest':      '0 8px 32px rgba(10,7,5,0.6), 0 0 0 1px rgba(255,210,180,0.05)',
        'ember':      '0 4px 20px rgba(232,102,61,0.4)',
        'glow':       '0 0 30px rgba(232,102,61,0.45)',
        'card':       '0 2px 12px rgba(10,7,5,0.7)',
        'inner-glow': 'inset 0 1px 0 rgba(255,220,180,0.08)',
        'warm':       '0 8px 32px rgba(232,102,61,0.15), 0 2px 8px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
