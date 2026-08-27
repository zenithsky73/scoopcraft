/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    serverComponentsExternalPackages: [
      'bcryptjs',
      '@prisma/client',
      'jsdom',
      '@mozilla/readability',
      'playwright',
      'bullmq',
      'ioredis',
      '@anthropic-ai/sdk',
    ],
  },
};

export default nextConfig;
