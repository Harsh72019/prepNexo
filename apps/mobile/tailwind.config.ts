import type { Config } from "tailwindcss";
import nativewind from "nativewind/preset";

export default {
  presets: [nativewind],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f131d",
        foreground: "#f8fafc",
        card: "#171c28",
        primary: "#20df95",
        muted: "#252b38",
        mutedForeground: "#99a3b3",
        accent: "#f5a524"
      },
      borderRadius: {
        lg: "8px"
      }
    }
  },
  plugins: []
} satisfies Config;
