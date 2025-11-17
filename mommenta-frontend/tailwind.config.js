/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // class-based dark mode
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7C3AED",
          accent: "#EC4899",
          gradientStart: "#7C3AED",
            gradientBetween: "#974BE4", // new in-between color
          gradientMid: "#B77CF0",    // new lighter mid color
          gradientEnd: "#E1C7FB",    // new lighter end color
          bgboard: "#B77CF0",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      // backgroundColor: {
      //   "brand-gradient": "linear-gradient(to right, #7C3AED, #B77CF0, #E1C7FB)", // updated gradient
      // },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #7C3AED, #EC4899)",
        "brand-gradient2": "linear-gradient(to right, #7C3AED, #B77CF0, #E1C7FB)", // updated gradient

      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require('tailwind-scrollbar-hide'),
    function ({ addComponents }) {
      addComponents({
        ".btn": {
          "@apply px-5 py-2 rounded-lg font-medium transition": {},
        },
        ".btn-primary": {
          "@apply btn text-white bg-brand hover:bg-brand-accent": {},
        },
        ".btn-gradient": {
          "@apply btn text-white bg-brand-gradient hover:opacity-90": {},
        },
        ".card": {
          "@apply bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4": {},
        },
        ".input": {
          "@apply w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand": {},
        },
      });
    },
  ],
};
