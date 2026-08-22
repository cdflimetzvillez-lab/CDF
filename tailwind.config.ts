import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0D0D0D",
        panel: "#17171A",
        paper: "#FFFFFF",
        mist: "rgba(255,255,255,0.55)",
        accent: "#0D0D0D", // couleur des CTA sur fond blanc
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
export default config;

