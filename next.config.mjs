import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        // Ownapi domains
        'docs.ownapi.dev',
        'ownapi.dev',
        // Legacy New API domains (compatibility)
        'docs.newapi.pro',
        'newapi.pro',
        'www.newapi.pro',
        'docs.newapi.ai',
        'newapi.ai',
        'www.newapi.ai',
        // Vercel preview
        'ownapi-docs.vercel.app',
        'new-api-docs-v1.vercel.app',
      ],
    },
  },
  async rewrites() {
    return [
      {
        source: '/:lang/docs/:path*.mdx',
        destination: '/:lang/llms.mdx/:path*',
      },
    ];
  },
};

export default withMDX(config);
