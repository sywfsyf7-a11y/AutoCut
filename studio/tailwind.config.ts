import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { studio: { bg: "#0c1018", panel: "#151c28", line: "#293346", accent: "#ee6a3c" } } } },
  plugins: []
};
export default config;
