import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@majapisoftwares/ui"],
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
