import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /** Proxy /api/* to backend in production — dev uses NEXT_PUBLIC_API_URL directly */
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.founderbridge.in" },
      { protocol: "http",  hostname: "localhost" },
    ],
  },
};

export default nextConfig;
