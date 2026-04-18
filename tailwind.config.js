/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFFBEF',
        'cream-dark': '#FFF3CC',
        navy: '#1a1a2e',
      },
    },
  },
  plugins: [],
}

