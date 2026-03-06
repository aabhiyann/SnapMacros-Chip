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
        bg: "#0F0F14",
        card: "#1A1A24",
        elevated: "#22222F",
        primary: "#FF6B35",
        secondary: "#6C63FF",
        success: "#2DD4BF",
        warning: "#FBBF24",
        danger: "#F87171",
        text: "#FFFFFF",
        "text-secondary": "#A0A0B8",
        "text-muted": "#60607A",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
