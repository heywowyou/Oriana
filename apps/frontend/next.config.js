/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required for monorepos using Yarn workspaces
  experimental: {
    appDir: true,
    outputFileTracing: true,
    outputFileTracingRoot: require("path").join(__dirname, "../../"),
  },

  eslint: {
    // Avoid breaking the build on ESLint errors during deploy
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Avoid breaking the build on type errors during deploy
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
