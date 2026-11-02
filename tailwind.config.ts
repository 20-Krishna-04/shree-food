import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F97316", // Primary Orange
          hover: "#EA580C",   // Secondary Orange
          light: "#FFEDD5",
          dark: "#C2410C",
        },
        cream: {
          DEFAULT: "#FFF7ED", // Background Cream
          light: "#FFFDF9",
          dark: "#FDEED9",
        },
        navy: {
          DEFAULT: "#172033", // Dark Navy
          light: "#1E293B",
          dark: "#0F172A",
        },
        success: {
          DEFAULT: "#16A34A", // Success Green
          hover: "#15803D",
          light: "#DCFCE7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
