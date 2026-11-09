import { OG_IMAGE_SIZE } from '@/constants/seo';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 86400;
export const alt = 'HackTrip — plan and share your trips';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderTripOgImage({
    title: 'Discover your next adventure',
    subtitle: 'Plan and share your trips with HackTrip',
    imageUrls: [],
  });
}
