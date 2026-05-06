import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Firebase App Hosting server builds, export for legacy static hosting
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "export" : "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
