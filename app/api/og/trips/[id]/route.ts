import { getTripOgData } from '@/lib/images/tripOgData';
import { renderTripOgImage } from '@/lib/images/renderTripOgImage';

export const runtime = 'nodejs';
export const revalidate = 3600;

interface TripOgRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: TripOgRouteProps) {
  const [{ id }, url] = await Promise.all([params, Promise.resolve(new URL(request.url))]);
  const data = await getTripOgData(id, url.searchParams.get('day'));
  return renderTripOgImage(data);
}
