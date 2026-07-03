/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#003153',
          verde: '#00A859',
        },
        accent: {
          orange: '#FF6B35',
          green: '#00C853',
          blue: '#2979FF',
          yellow: '#FFD600',
          red: '#FF1744',
          purple: '#D500F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        brand: ['Righteous', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
