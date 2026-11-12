import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Type checking is an explicit, required first step in `npm run build`.
  // Skipping Next's duplicate check avoids a Node 24/Next CLI output-capture bug.
  typescript: { ignoreBuildErrors: true },
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
