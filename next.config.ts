import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder QRIS memakai SVG. Ganti dengan PNG/JPG asli kalau sudah tersedia.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
