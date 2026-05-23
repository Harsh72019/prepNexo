import { sharedTailwindConfig } from "@interview-battlefield/config/tailwind";
import type { Config } from "tailwindcss";

export default {
  ...sharedTailwindConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ]
} satisfies Config;
