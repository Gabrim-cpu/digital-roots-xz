/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,営業,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-contrast, accessible palettes friendly for elderly vision profiles
        rootPrimary: "#1b4332",   // Deep, comforting cultural green
        rootSecondary: "#d8f3dc", // Soft light background contrast
        rootAccent: "#ffb703"    // High-visibility gold for alerts/buttons
      }
    },
  },
  plugins: [],
}