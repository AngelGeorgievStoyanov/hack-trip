import { getTripOgData } from '@/lib/images/tripOgData';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TripOgRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: TripOgRouteProps) {
  const [{ id }, url] = await Promise.all([params, Promise.resolve(new URL(request.url))]);
  const data = await getTripOgData(id, url.searchParams.get('day'));
  const response = await renderTripOgImage(data);
  // The metadata URL contains a content-derived version; changed content gets a new cache key.
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return response;
}
