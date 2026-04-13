const { withNextVideo } = require('next-video/process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.chanel.com', // Wildcard pour tous les sous-domaines
      },
      {
        protocol: 'https',
        hostname: '**.dior.com',
      },
      {
        protocol: 'https',
        hostname: '**.yslbeauty.com', // ✅ Wildcard pour yslbeauty
      },
      {
        protocol: 'https',
        hostname: '**.yslbeautyus.com',
      },
      {
        protocol: 'https',
        hostname: '**.lancome-usa.com',
      },
      {
        protocol: 'https',
        hostname: '**.lancome.com',
      },
      {
        protocol: 'https',
        hostname: '**.tomford.com',
      },
      {
        protocol: 'https',
        hostname: '**.hermes.com',
      },
      {
        protocol: 'https',
        hostname: '**.guerlain.com',
      },
      {
        protocol: 'https',
        hostname: '**.franciskurkdjian.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
};

module.exports = withNextVideo(nextConfig, { folder: 'video' });
