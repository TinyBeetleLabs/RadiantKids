/** @type {import('next').NextConfig} */

const { securityHeaders } = require('./next.config.security');

const nextConfig = {
  reactStrictMode: true,
  
  // Security headers to protect sensitive children's data
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  // Disable powered-by header to reduce information disclosure
  poweredByHeader: false,
  
  // Enable compression for better performance
  compress: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for security
}

module.exports = nextConfig

