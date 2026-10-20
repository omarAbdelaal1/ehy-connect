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
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/showcase.html',
        },
      ],
    };
  },
};

module.exports = nextConfig;
