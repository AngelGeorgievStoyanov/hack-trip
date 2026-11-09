import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 86400;
export const alt = 'HackTrip — plan and share your trips';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return renderTripOgImage({
    title: 'Discover your next adventure',
    subtitle: 'Plan and share your trips with HackTrip',
    imageUrls: [],
  });
}
