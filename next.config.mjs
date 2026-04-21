/** @type {import('next').NextConfig} */
const nextConfig = {
  // Top-level key for dev server access
  allowedDevOrigins: ['172.20.10.3:3000', '172.20.10.3', 'localhost:3000'],
  
  // Helps assets load over the network hotspot
  crossOrigin: 'anonymous',

  experimental: {
    // If you are using Server Actions, this prevents CSRF blocks on your phone
    serverActions: {
      allowedOrigins: ['172.20.10.3:3000', 'localhost:3000'],
    },
  },
};

export default nextConfig;
