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
        // shadcn/ui tokens
        border:     "var(--border)",
        input:      "var(--input)",
        ring:       "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // SnapMacros palette (maps to CSS vars for theme switching)
        bg:       "var(--bg-base)",
        "bg-card":     "var(--bg-card)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-border":   "var(--bg-border)",

        // Legacy aliases kept for backward compat
        card:     "var(--bg-card)",
        elevated: "var(--bg-elevated)",

        primary: {
          DEFAULT: "var(--color-primary)",
          10:      "rgba(79,158,255,0.10)",
          20:      "rgba(79,158,255,0.20)",
        },
        secondary: "var(--color-secondary)",
        success:   "var(--color-success)",
        warning:   "var(--color-warning)",
        danger:    "var(--color-danger)",

        text: {
          DEFAULT:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
        },
      },

      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body:    ["var(--font-body)", "sans-serif"],
      },

      fontSize: {
        // Typography scale
        display: ["36px", { fontWeight: "800", letterSpacing: "-0.04em", lineHeight: "1.1" }],
        title:   ["24px", { fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }],
        heading: ["20px", { fontWeight: "600", letterSpacing: "-0.01em", lineHeight: "1.3" }],
        body:    ["16px", { fontWeight: "400", lineHeight: "1.6" }],
        caption: ["13px", { fontWeight: "400", lineHeight: "1.4" }],
      },

      borderRadius: {
        "2xl":  "16px",
        "3xl":  "20px",
        "4xl":  "24px",
        "5xl":  "28px",
      },

      boxShadow: {
        "glow-primary":  "0 0 24px rgba(79,158,255,0.30)",
        "glow-success":  "0 0 24px rgba(52,216,188,0.30)",
        "glow-warning":  "0 0 24px rgba(255,200,74,0.30)",
        "card":          "0 4px 24px rgba(0,0,0,0.30)",
        "card-elevated": "0 8px 40px rgba(0,0,0,0.40)",
      },
    },
  },
  plugins: [],
};

export default config;
