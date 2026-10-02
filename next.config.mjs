/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Backend-provided image URLs (API host and object storage). Refined once the
    // runtime `image_base_url` host is confirmed.
    remotePatterns: [
      { protocol: 'https', hostname: 'www.api-hack-trip.com' },
      { protocol: 'https', hostname: 'api-hack-trip.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
};

export default nextConfig;
