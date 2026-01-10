/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
  extend: {
    colors: {
      primary: "#1F2937", // dark
      secondary: "#4B5563", 
      accent: "#6366F1", 
      bg: "#F9FAFB"
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
  },
},
  plugins: [],
}

