/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard-Regular', 'sans-serif'],
      },
      colors: {
        yellow: {
          primary: '#FFBC00',
          500: '#EAB308',
          450: '#FFCC00',
          400: '#FFD338',
          100: '#FEF9C3',
          50: '#FFF9EC',
        },
        'gray-warm': {
          700: '#60584C',
          500: '#918274',
        },
        gray: {
          900: '#000000',
          800: '#26282C',
          700: '#484B51',
          600: '#696E76',
          500: '#AAB0B8',
          400: '#C6CBD0',
          300: '#DDE1E4',
          200: '#EBEEF0',
          100: '#F7F7F8',
        },
        green: {
          900: '#065F46',
          800: '#166534',
          600: '#10B981',
          500: '#059669',
          400: '#22C55E',
          100: '#D1FAE5',
          50: '#F0FDF4',
        },
        red: {
          800: '#991B1B',
          500: '#EF4444',
          100: '#FEE2E2',
          50: '#FFF2F2',
        },
        purple: {
          600: '#7C3AED',
          50: '#FAF5FF',
        },
        orange: {
          600: '#EA580C',
          50: '#FFF7ED',
        },
      },
    },
  },
  plugins: [],
}
