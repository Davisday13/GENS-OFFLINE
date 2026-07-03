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
          50:  '#eaf1ff',
          100: '#d4e2ff',
          200: '#a9c5ff',
          300: '#7ea7ff',
          400: '#4f82fb',
          500: '#2f63f2',
          600: '#1f4fe0',
          700: '#1a3fb4',
          800: '#1b3790',
          900: '#142a6e',
        },
        navy: {
          700: '#0e1f3a',
          800: '#0a1730',
          900: '#060f1f',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        brand: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
