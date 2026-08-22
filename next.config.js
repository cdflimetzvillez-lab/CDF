/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'super-duper-train-r7rqg594w4vgc65v-3000.app.github.dev',
        'super-duper-train-r7rqg594w4vgc65v-3004.app.github.dev',
        '*.app.github.dev',
        'localhost:3000',
      ],
    },
  },
};
module.exports = nextConfig;
