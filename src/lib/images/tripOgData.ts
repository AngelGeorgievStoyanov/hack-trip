import { getTrip } from '@/lib/serverApi';
import { positiveIdParam } from '@/validations';

export interface TripOgData {
  title: string;
  subtitle: string;
  imageUrls: string[];
}

const FALLBACK_DATA: TripOgData = {
  title: 'Discover your next adventure',
  subtitle: 'Plan and share your trips with HackTrip',
  imageUrls: [],
};

/** Loads the selected public trip day for its generated social preview. */
export async function getTripOgData(
  rawId: string,
  rawDayNumber?: string | null,
): Promise<TripOgData> {
  const parsed = positiveIdParam.safeParse(rawId);
  if (!parsed.success) return FALLBACK_DATA;

  try {
    const trip = await getTrip(Number(parsed.data));
    const requestedDayNumber = rawDayNumber ? Number(rawDayNumber) : Number.NaN;
    const day = trip.days.find((item) => item.dayNumber === requestedDayNumber) ?? trip.days[0];
    if (!day) return FALLBACK_DATA;

    const title = day.title?.trim() || day.destination?.trim() || FALLBACK_DATA.title;
    const subtitle = day.description?.trim() || day.destination?.trim() || FALLBACK_DATA.subtitle;
    return {
      title: title.slice(0, 90),
      subtitle: subtitle.slice(0, 120),
      imageUrls: [
        ...day.images.map((image) => image.url),
        ...day.points.flatMap((point) => point.images.map((image) => image.url)),
      ],
    };
  } catch {
    return FALLBACK_DATA;
  }
}
