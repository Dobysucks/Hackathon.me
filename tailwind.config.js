/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Medical Pink theme — primary #ec4899, secondary #f472b6, accent #f9a8d4
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4', // accent
          400: '#f472b6', // secondary
          500: '#ec4899', // primary
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(219, 39, 119, 0.08), 0 4px 24px -4px rgba(219, 39, 119, 0.06)',
        card: '0 4px 24px -6px rgba(219, 39, 119, 0.14), 0 2px 8px -2px rgba(219, 39, 119, 0.08)',
        glow: '0 0 0 4px rgba(236, 72, 153, 0.14)',
      },
    },
  },
  plugins: [],
};
