/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./src/**/*.html", "./src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF22",
        secondary: "#FBBF24",
        accent: "#EF4444",
        background: "#F3F4F6",
      },
     fontFamily: {
        ibm: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
