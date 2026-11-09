import { OG_IMAGE_SIZE } from '@/constants/seo';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 86400;
export const alt = 'HackTrip — plan and share your trips';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderTripOgImage({
    title: 'Plan. Explore. Share every stop.',
    subtitle: 'Create itineraries, save any GPS place and discover more with HackTrip.',
    imageUrls: [],
  });
}
