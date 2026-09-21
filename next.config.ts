import type { NextConfig } from "next";
import { buildImageRemotePatterns } from "./lib/next/imageRemotePatterns";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2"],
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
