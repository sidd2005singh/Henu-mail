import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          50: "var(--surface-50)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          300: "var(--surface-300)",
          400: "var(--surface-400)",
          500: "var(--surface-500)",
          600: "var(--surface-600)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        henu: {
          50: "#e0f8ff",
          100: "#b8efff",
          200: "#7ae2ff",
          300: "#38d4ff",
          400: "#00c4f5",
          500: "#00d2ff", // HENU primary signal cyan
          600: "#0099cc",
          700: "#007399",
          800: "#004d66",
          900: "#002633",
        },
        status: {
          online: "var(--status-online)",
          warming: "var(--status-warming)",
          paused: "var(--status-paused)",
          critical: "var(--status-critical)",
          delivered: "var(--status-delivered)",
          queued: "var(--status-queued)",
        }
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "scientific-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        "scientific-md": "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)",
        "scientific-glow": "0 0 15px -3px rgba(0, 210, 255, 0.2)",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      }
    },
  },
  plugins: [],
};
export default config;
