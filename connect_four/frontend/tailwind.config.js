/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        board: {
          dark: "#1e293b",
          light: "#b45309",
          "hole-dark": "#0f172a",
          "hole-light": "#fef3c7",
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 1.5s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { filter: "brightness(1) drop-shadow(0 0 6px currentColor)" },
          "50%": { filter: "brightness(1.3) drop-shadow(0 0 20px currentColor)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
