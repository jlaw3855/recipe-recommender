/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6ba77',
          400: '#f19340',
          500: '#ed751a',
          600: '#de5a10',
          700: '#b84310',
          800: '#933515',
          900: '#772d14',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#c9d7c9',
          300: '#a3bba3',
          400: '#779777',
          500: '#567a56',
          600: '#436143',
          700: '#374e37',
          800: '#2e402e',
          900: '#273527',
        },
      },
    },
  },
  plugins: [],
};
