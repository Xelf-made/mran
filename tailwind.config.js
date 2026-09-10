/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { sand: '#e8dfd3', clay: '#c9a98a', olive: '#7c7669', ink: '#2b2823', cream: '#faf7f2', earth: '#8b6f52' }, fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Cormorant Garamond', 'serif'] } } },
  plugins: [],
};
