import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export ONLY when explicitly requested for legacy static hosting
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
