/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Palette du jeu « Les Gardiens du Lagon » (lagon de l'Ermitage)
        ocean: { 600: '#0e7a99', 700: '#0a5d7a', 800: '#06415c', 900: '#06324a' },
        turq: { 300: '#8fe6e0', 400: '#5fd9d2', 500: '#19b8c4', 600: '#0f8d9a' },
        sable: '#F7F5F0',
        corail: { 400: '#f6846b', 500: '#f2674a', 600: '#dc4f33' },
        soleil: { 300: '#fbd679', 400: '#f5b83d' },
        lagoon: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        sand: {
          50: '#fdfbf7',
          100: '#f7f2e8',
          200: '#eee5d0',
          300: '#e2d3b2',
          400: '#cbb382',
          500: '#b8985c',
        }
      }
    },
  },
  plugins: [],
}
