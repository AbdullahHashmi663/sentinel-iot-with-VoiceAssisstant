import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.SENTINEL_INTERFACE === "client" ? ".next-client" : ".next",
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
