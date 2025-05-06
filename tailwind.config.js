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
        'brand-green': '#9ec2a1',
        'brand-green-dark': '#6d8770',
        'brand-purple': '#be99dc',
        'brand-red': '#b55c5c',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};