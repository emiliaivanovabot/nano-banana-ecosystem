import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui-components/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        card: "var(--card)",
        border: "var(--border)",
        // Nano Banana Farbschema
        yellow: {
          400: "#facc15", 
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207"
        },
        purple: {
          400: "#c084fc",
          500: "#a855f7", 
          600: "#9333ea",
          700: "#7c3aed"
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669"
        },
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        },
        slate: {
          400: "#94a3b8",
          600: "#475569", 
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a"
        },
        gray: {
          100: "#f3f4f6",
          200: "#e5e7eb",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;