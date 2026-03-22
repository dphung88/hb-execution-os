import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d8ecff",
          200: "#b9ddff",
          300: "#8ac8ff",
          400: "#54a8ff",
          500: "#2f86f6",
          600: "#1b68db",
          700: "#1754b1",
          800: "#19488f",
          900: "#1b3f74"
        }
      },
      boxShadow: {
        panel: "0 12px 32px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
