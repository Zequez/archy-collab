/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        kalam: ["Kalam", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        esgreen1: "#90b461",
        esgreen2: "#53c8aa",
        espurple1: "#b461b2",
        espurple2: "#8561B4",
      },
    },
  },
  plugins: [],
};
