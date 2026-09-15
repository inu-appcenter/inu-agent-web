/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0958d9",
          dark: "#003eb3",
          light: "#e6f4ff",
        },
      },
    },
  },
  plugins: [],
}
