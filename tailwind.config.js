/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        fluid: "repeat(auto-fill, minmax(160px, 1fr))",
      },
      aspectRatio: {
        poster: "2 / 3",
      },
    },
  },
  plugins: [],
};
