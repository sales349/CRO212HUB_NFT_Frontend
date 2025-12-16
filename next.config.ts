import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Basic Configuration */
  reactStrictMode: true,

  /* Image Optimization */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.w3s.link',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  /* Webpack Configuration */
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // External packages that should not be bundled
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    return config;
  },

  /* Server Components Configuration */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  /* Environment Variables (public only) */
  env: {
    NEXT_PUBLIC_APP_NAME: 'CRO212HUB NFT Generator',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },
};

export default nextConfig;
