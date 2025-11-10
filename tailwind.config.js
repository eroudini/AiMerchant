/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "muted-foreground": "rgb(161 161 170)",
      }
    },
  },
  plugins: [],
}