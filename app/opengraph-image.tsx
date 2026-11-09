import { OG_IMAGE_SIZE } from '@/constants/seo';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 86400;
export const alt = 'HackTrip — Discover places and share travel experiences.';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderTripOgImage({
    title: 'Discover places. Share experiences.',
    subtitle: 'Explore destinations, photos and real experiences shared by travelers. Share your own discoveries with HackTrip.',
    imageUrls: [],
  });
}
