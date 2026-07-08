/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(2, 132, 199, 0.08), 0 4px 24px -4px rgba(2, 132, 199, 0.06)',
        card: '0 4px 24px -6px rgba(2, 132, 199, 0.12), 0 2px 8px -2px rgba(2, 132, 199, 0.08)',
        glow: '0 0 0 4px rgba(14, 165, 233, 0.12)',
      },
    },
  },
  plugins: [],
};
