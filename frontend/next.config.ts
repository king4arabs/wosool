import type { NextConfig } from "next";

const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "private, no-store" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.wosool.org",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipomedia.kaust.edu.sa",
        pathname: "/files/assets/img/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/eoa/riyadh-hero.webm",
        headers: [{ key: "Content-Type", value: "video/webm" }],
      },
      {
        source: "/eoa/riyadh-hero.mp4",
        headers: [{ key: "Content-Type", value: "video/mp4" }],
      },
      {
        source: "/accelerator/apply",
        headers: privateHeaders,
      },
      {
        source: "/eoa/:path(account|apply|admin|coach|forgot-password|reset-password)",
        headers: privateHeaders,
      },
      {
        source: "/:path(admin|dashboard|review|verify-email|login|register|forgot-password|reset-password)/:rest*",
        headers: privateHeaders,
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/eoa/reset-password",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/:path(reset-password|verify-email)",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  async rewrites() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
    return [
      { source: "/broadcasting/auth", destination: `${apiUrl}/broadcasting/auth` },
      { source: "/storage/eoa/board/:path*", destination: `${apiUrl}/storage/eoa/board/:path*` },
      { source: "/storage/eoa/mentors/:path*", destination: `${apiUrl}/storage/eoa/mentors/:path*` },
      { source: "/storage/founders/avatars/:path*", destination: `${apiUrl}/storage/founders/avatars/:path*` },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
