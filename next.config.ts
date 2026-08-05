import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Único host externo permitido: os avatares do GitHub.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
    ],
  },
};

export default nextConfig;
