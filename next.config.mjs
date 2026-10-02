/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Backend images are stored on Google Cloud Storage (API_CONTRACT.md §11.2 — object
    // keys `images/<uuid>.<ext>`). `ImageDto.url` / `thumbnailUrl` are built from the
    // runtime `visual.image_base_url` config (§11.3), which points at a GCS bucket
    // (`https://storage.googleapis.com/<bucket>/...`), so the image hostname is
    // `storage.googleapis.com`. If `image_base_url` is later pointed at a custom CDN or
    // another host, add that hostname here.
    remotePatterns: [{ protocol: 'https', hostname: 'storage.googleapis.com' }],
  },
};

export default nextConfig;

