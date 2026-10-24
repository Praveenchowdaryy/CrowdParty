/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        surface: "#111726",
        "surface-elevated": "#1A2236",
        "surface-card": "#1E273D",
        border: "#26334D",
        "border-glow": "#4C3888",
        brand: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6", // Electric violet primary
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        coral: {
          light: "#FFA07A",
          DEFAULT: "#FF5E62",
          dark: "#E04044",
        },
        cyan: {
          light: "#67E8F9",
          DEFAULT: "#06B6D4",
          dark: "#0891B2",
        },
        yellow: {
          light: "#FDE047",
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
        mint: {
          light: "#6EE7B7",
          DEFAULT: "#10B981",
          dark: "#059669",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Plus Jakarta Sans",
          "Inter",
          "sans-serif",
        ]
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.4)",
        "glow-lg": "0 0 45px -5px rgba(139, 92, 246, 0.55)",
        "glow-coral": "0 0 25px -5px rgba(255, 94, 98, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        }
      }
    },
  },
  plugins: [],
};
