import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#14171b",
        surface: "#1a1e23",
        surfaceRaised: "#21262c",
        border: "#2c323a",
        text: "#eef1f3",
        muted: "#8d97a1",
        accent: "#e8a33d",
        safe: "#4fae8c",
        danger: "#d8564a",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SF Mono",
          "Cascadia Code",
          "Roboto Mono",
          "Menlo",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
