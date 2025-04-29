/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/src/**/*.{js,jsx,ts,tsx}", "./client/index.html"],
  theme: {
    extend: {
      colors: {
        'brand-teal': '#74ccd4',
        'brand-teal-dark': '#45878a',
        'brand-blue': '#72accc',
        'brand-blue-dark': '#458eb5',
        'brand-green': '#47784d',
        'brand-green-dark': '#427a48',
        'brand-purple': '#be99dc',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};