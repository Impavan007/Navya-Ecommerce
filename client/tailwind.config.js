/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        canela: ['var(--font-canela)', 'serif'],
        playfair: ['var(--font-playfair)', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      screens: {
        '3xl': '1800px',
      },
    },
  },
  plugins: [],
};
