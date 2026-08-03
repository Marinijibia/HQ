import type { NextConfig } from 'next';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.hq.netify.ng'
    : 'http://127.0.0.1:5000');
const formattedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@hq/ui', '@hq/design-system'],
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
