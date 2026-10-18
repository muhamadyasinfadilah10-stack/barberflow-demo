import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      colors: { ink: { DEFAULT: "#0f172a", soft: "#334155" }, brand: { DEFAULT: "#0f172a", hover: "#1e293b" } },
      boxShadow: { soft: "0 1px 2px rgba(15,23,42,0.04)" },
    },
  },
  plugins: [],
};
export default config;
