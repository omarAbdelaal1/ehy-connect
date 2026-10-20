/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'sample-videos.com',
      'graph.facebook.com',
      'lookaside.fbsbx.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
