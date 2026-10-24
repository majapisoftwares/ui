import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export served from S3 + CloudFront.
  output: "export",
  images: { unoptimized: true },
  devIndicators: { position: "bottom-right" },
  transpilePackages: ["@majapisoftwares/ui"],
  turbopack: {
    // Workspace root, so the linked library resolves.
    root: fileURLToPath(new URL("..", import.meta.url)),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
