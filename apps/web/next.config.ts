import { config } from "dotenv";
import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(appDir, "../../.env") });

const nextConfig: NextConfig = {
  transpilePackages: ["@interview-battlefield/ui", "@interview-battlefield/types", "@interview-battlefield/config"]
};

export default nextConfig;
