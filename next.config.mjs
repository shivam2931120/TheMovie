import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    env: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_TMDB_API_KEY:
            process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.VITE_TMDB_API_KEY,
        NEXT_PUBLIC_OMDB_API_KEY:
            process.env.NEXT_PUBLIC_OMDB_API_KEY || process.env.VITE_OMDB_API_KEY,
        NEXT_PUBLIC_TASTEDIVE_API_KEY:
            process.env.NEXT_PUBLIC_TASTEDIVE_API_KEY || process.env.VITE_TASTEDIVE_API_KEY,
    },
    turbopack: {
        root: rootDir,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
        ],
    },
};

export default nextConfig;
