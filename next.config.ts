import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow scraped images from any https domain.
    // The scraped URLs come from real retail sites (John Lewis, Amazon, etc.)
    // so locking to specific hostnames would be too restrictive. Because
    // image URLs are stored per-gift and controlled by the admin, the risk
    // is low. We use `unoptimized` in the <Image> component anyway for
    // scraped images.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
