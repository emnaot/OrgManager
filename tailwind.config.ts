/**
 * Tailwind CSS Configuration
 * File: tailwind.config.ts
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#877EFF",
          600: "#5D5FEF",
        },
        secondary: {
          500: "#FFB620",
        },
        "off-white": "#D0DFFF",
        red: "#FF5A5A",
        dark: {
          1: "#000000",
          2: "#09090A",
          3: "#101012",
          4: "#1F1F22",
        },
        light: {
          1: "#FFFFFF",
          2: "#EFEFEF",
          3: "#7878A3",
          4: "#5C5C7B",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out forwards",
        slideIn: "slideIn 0.6s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        gradient: "gradientShift 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(135, 126, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(135, 126, 255, 0.6)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;