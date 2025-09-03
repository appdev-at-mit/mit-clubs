/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/src/**/*.{js,jsx,ts,tsx}", "./client/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", "sans-serif"],
      },
      // usage guidelines
      // blue: primary (links, nav)
      // green: success states
      // red: error states, warnings
      // purple: secondary
      // teal: accents
      colors: {
        "appdev-teal": "#96C2C5",
        "appdev-blue": "#7DAACA",
        "appdev-green": "#A3BFA2",
        "appdev-purple": "#B796D9",
        "appdev-pink": "#F2A6C1",
        "appdev-yellow": "#F2D16B",
        "appdev-red": "#C26B6B",
        "appdev-teal-dark": "#5A8B8D",
        "appdev-blue-dark": "#4A6F8B",
        "appdev-green-dark": "#6A8B6C",
        "appdev-purple-dark": "#7A5B8B",
        "appdev-pink-dark": "#C47A9B",
        "appdev-yellow-dark": "#C4A24B",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
