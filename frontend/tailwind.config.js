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
      }
    },
  },
  plugins: [],
}