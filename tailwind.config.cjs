/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        logo: ['"Edu TAS Beginner"', 'cursive'],
        sans: ['"IBM Plex Serif"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
