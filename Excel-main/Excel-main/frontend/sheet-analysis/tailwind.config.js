/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6', // blue-500
          dark: '#2563eb',  // blue-600
        },
        background: {
          light: '#f9fafb', // gray-50
          dark: '#1f2937',  // gray-800
        },
        text: {
          light: '#111827', // gray-900
          dark: '#f9fafb',  // gray-50
        },
      },
    },
  },
  plugins: [],
}
