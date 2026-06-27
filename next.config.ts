import type { NextConfig } from "next";

/**
 * Supabase Storage serves public assets from `<project-ref>.supabase.co`.
 * Read NEXT_PUBLIC_SUPABASE_URL so next/image is allowed to optimize them.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Pin the workspace root — multiple lockfiles exist on this machine.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Avatars from GitHub OAuth + dev placeholders used by the seed data.
      { protocol: "https" as const, hostname: "avatars.githubusercontent.com" },
      { protocol: "https" as const, hostname: "images.unsplash.com" },
      { protocol: "https" as const, hostname: "picsum.photos" },
      { protocol: "https" as const, hostname: "i.pravatar.cc" },
      // YouTube thumbnails for embedded videos.
      { protocol: "https" as const, hostname: "img.youtube.com" },
      { protocol: "https" as const, hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
