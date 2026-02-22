import type { NextConfig } from "next";

const nextConfig: NextConfig = {
typescript:{
  ignoreBuildErrors: true
},
  experimental: {
    serverActions: {
      // FormData для психологов включает изображения; 1MB по умолчанию недостаточно.
      bodySizeLimit: "30mb",
    },
  },

  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
