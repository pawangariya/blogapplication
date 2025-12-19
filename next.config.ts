import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.freepik.com",
      },
    ],
  },

  experimental: {
    // @ts-expect-error Turbopack config isn't typed yet
    turbo: {
      enabled: false,
    },
  },

  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
