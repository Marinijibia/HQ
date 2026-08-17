import type { NextConfig } from 'next';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.hq.netify.ng'
    : 'http://127.0.0.1:5000');
const formattedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

const isStandalone =
  process.env.NEXT_OUTPUT_STANDALONE === '1' ||
  process.env.DOCKER_BUILD === '1' ||
  (process.env.NODE_ENV === 'production' && process.platform !== 'win32');

const nextConfig: NextConfig = {
  ...(isStandalone ? { output: 'standalone' } : {}),
  transpilePackages: ['@hq/ui', '@hq/design-system'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${formattedApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
