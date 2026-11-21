import type { NextConfig } from "next";
import { APPLIANCES, APPLIANCES_PATH } from "./src/lib/appliances";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: `/categoria/${encodeURIComponent(APPLIANCES)}`,
      destination: APPLIANCES_PATH,
      permanent: true,
    }];
  },
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.samsung.com",
      },
    ],
  },
};

export default nextConfig;
