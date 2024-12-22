/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      rotate: {
        '-0.5': '-0.5deg', // -1 derece döndürme
      },
    },
  },
  plugins: [],
};
