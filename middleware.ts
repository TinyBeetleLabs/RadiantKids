/**
 * Next.js Middleware for Security
 * 
 * Runs on all requests to enforce security policies
 * for sensitive children's data and medical information
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Additional security headers that may not be in static config
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Set security headers for all responses
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Prevent caching of sensitive data
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // Rate limiting hint (implement actual rate limiting in production)
  if (request.nextUrl.pathname.startsWith('/api/checkins')) {
    // Add custom rate limit tracking here if needed
    // For now, just add headers to inform about rate limiting
    response.headers.set('X-Rate-Limit-Policy', 'See documentation');
  }
  
  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

