const { withNextVideo } = require('next-video/process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname, // ✅ Fixes the multiple lockfiles warning
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.chanel.com',
      },
      {
        protocol: 'https',
        hostname: '**.dior.com',
      },
      {
        protocol: 'https',
        hostname: '**.yslbeauty.com',
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