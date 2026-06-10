import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://plausible.io`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://plausible.io https://api.openai.com https://api.stripe.com",
      "frame-src https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@lawyer-free/shared'],
  poweredByHeader: false,
  // Set Turbopack root to monorepo root so it can resolve hoisted packages (e.g. next)
  // from the workspace root node_modules without hitting the cross-boundary security check.
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
