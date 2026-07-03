/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1E4FFF',
          navy: '#0A1E3C',
          light: '#3B6BFF',
          dark: '#0039CC',
          50: '#EBF0FF',
          100: '#CCD9FF',
          200: '#99B3FF',
          300: '#668DFF',
          400: '#3366FF',
          500: '#1E4FFF',
          600: '#0039CC',
          700: '#002699',
          800: '#001366',
          900: '#000D4D',
        },
      },
      fontFamily: {
        brand: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
