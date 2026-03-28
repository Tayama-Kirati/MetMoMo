/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'Syne', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#FF4500', light: '#FF6B35', dark: '#D93800', 50: '#FFF3EF', 100: '#FFE2D6' },
        secondary: { DEFAULT: '#1A1A2E', light: '#16213E', card: '#0F3460' },
        gold: { DEFAULT: '#FFB800', light: '#FFD060' },
        sage: { DEFAULT: '#2ECC71', dark: '#27AE60' },
        cream: { DEFAULT: '#FFF8F0', dark: '#F5EDE0' },
        charcoal: { DEFAULT: '#1C1C1E', 2: '#2C2C2E', 3: '#3A3A3C' },
        slate: { DEFAULT: '#8E8E93', light: '#C7C7CC', faint: '#E5E5EA' },
      },
      boxShadow: {
        'glow-primary': '0 0 40px rgba(255,69,0,0.25)',
        'glow-sm': '0 4px 20px rgba(255,69,0,0.18)',
        'card': '0 2px 20px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.12)',
        'card-xl': '0 20px 60px rgba(0,0,0,0.15)',
        'float': '0 16px 48px rgba(0,0,0,0.18)',
      },
      borderRadius: { '2xl': '16px', '3xl': '24px', '4xl': '32px' },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-light': 'bounceLight 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(30px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.8)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(-2deg)' }, '50%': { transform: 'translateY(-16px) rotate(2deg)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceLight: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: 1 }, '100%': { transform: 'scale(2)', opacity: 0 } },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #FFB800 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
    },
  },
  plugins: [],
}