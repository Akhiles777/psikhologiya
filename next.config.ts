import type { NextConfig } from "next";

const nextConfig: NextConfig = {

typescript:{
  ignoreBuildErrors: true
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
