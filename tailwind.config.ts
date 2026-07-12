import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201a",
        muted: "#657268",
        panel: "#ffffff",
        line: "#dce3dd",
        teal: {
          700: "#0f766e",
          800: "#0b5e58",
        },
      },
      boxShadow: {
        soft: "0 16px 40px rgb(23 32 26 / 10%)",
      },
    },
  },
  plugins: [],
};

export default config;
