import { OG_IMAGE_SIZE } from '@/constants/seo';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 86400;
export const alt = 'HackTrip — Plan your trip. Discover your world.';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderTripOgImage({
    title: 'Plan your trip. Discover your world.',
    subtitle: 'Plan each day. Save places anywhere. Share your route with HackTrip.',
    imageUrls: [],
  });
}
