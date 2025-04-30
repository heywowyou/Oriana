/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // -- Keep the build from failing on lint / type errors while you polish the code
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
