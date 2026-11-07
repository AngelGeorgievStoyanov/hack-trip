import { getTripOgData } from '@/lib/images/tripOgData';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'HackTrip Trip Group preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTripOgData(id);
  return renderTripOgImage(data);
}
