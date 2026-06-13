/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#321847',
          50:  '#f3eef8',
          100: '#e3d6f1',
          200: '#c9ade4',
          300: '#a87fd1',
          400: '#8755be',
          500: '#6d37a8',
          600: '#582b8b',
          700: '#47226f',
          800: '#321847',
          900: '#1e0e2b',
          950: '#0f0716',
        },
        ember: {
          DEFAULT: '#f15153',
          50:  '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa0a1',
          400: '#ff6869',
          500: '#f15153',
          600: '#de2022',
          700: '#bb1719',
          800: '#9b181a',
          900: '#801a1b',
        },
        gold: '#F5A623',
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-void': 'linear-gradient(135deg, #0f0716 0%, #321847 50%, #4A2060 100%)',
        'gradient-ember': 'linear-gradient(135deg, #f15153 0%, #de2022 100%)',
        'gradient-xp': 'linear-gradient(90deg, #F5A623 0%, #f15153 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(74,32,96,0.7) 0%, rgba(50,24,71,0.9) 100%)',
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
          from: { boxShadow: '0 0 10px rgba(241,81,83,0.3), 0 0 20px rgba(241,81,83,0.1)' },
          to:   { boxShadow: '0 0 20px rgba(241,81,83,0.6), 0 0 40px rgba(241,81,83,0.3)' },
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
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        streakFire: {
          from: { transform: 'scale(1) rotate(-3deg)', filter: 'brightness(1)' },
          to:   { transform: 'scale(1.1) rotate(3deg)', filter: 'brightness(1.3)' },
        },
      },
      boxShadow: {
        'quest':  '0 8px 32px rgba(50,24,71,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        'ember':  '0 4px 20px rgba(241,81,83,0.4)',
        'glow':   '0 0 30px rgba(241,81,83,0.5)',
        'card':   '0 2px 12px rgba(15,7,22,0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
