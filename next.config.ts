import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs', 'pdf-parse'],
  turbopack: {},
};

export default nextConfig;
