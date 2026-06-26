/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: '#740A03',
          roseMuted: '#A77272',
          bgLight: '#FBF9F6',
          bgCard: '#FFFFFF',
          darkText: '#2B2323',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      fontSize: {
        'senior-sm': ['0.9375rem', { lineHeight: '1.5' }],
        'senior-base': ['1.0625rem', { lineHeight: '1.6' }],
        'senior-lg': ['1.25rem', { lineHeight: '1.5' }],
        'senior-xl': ['1.5rem', { lineHeight: '1.4' }],
        'senior-2xl': ['1.875rem', { lineHeight: '1.3' }],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
