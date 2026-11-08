import { getTrip } from '@/lib/serverApi';
import { tripDayRepresentativeImage } from '@/lib/images/representative';
import { positiveIdParam } from '@/validations';

export interface TripOgData {
  title: string;
  subtitle: string;
  imageUrl: string | null;
}

const FALLBACK_DATA: TripOgData = {
  title: 'Discover your next adventure',
  subtitle: 'Plan and share your trips with HackTrip',
  imageUrl: null,
};

/** Loads the selected public Trip Group day for its generated social preview. */
export async function getTripOgData(
  rawId: string,
  rawDayNumber?: string | null,
): Promise<TripOgData> {
  const parsed = positiveIdParam.safeParse(rawId);
  if (!parsed.success) {
    return FALLBACK_DATA;
  }

  try {
    const trip = await getTrip(Number(parsed.data));
    const requestedDayNumber = rawDayNumber ? Number(rawDayNumber) : Number.NaN;
    const day =
      trip.days.find((item) => item.dayNumber === requestedDayNumber) ?? trip.days[0];

    if (!day) {
      return FALLBACK_DATA;
    }

    const title = day.title?.trim() || day.destination?.trim() || FALLBACK_DATA.title;
    const subtitle =
      day.description?.trim() || day.destination?.trim() || FALLBACK_DATA.subtitle;

    return {
      title: title.slice(0, 90),
      subtitle: subtitle.slice(0, 120),
      imageUrl: tripDayRepresentativeImage(day),
    };
  } catch {
    // Keep social sharing usable even if the trip API is temporarily unavailable.
    return FALLBACK_DATA;
  }
}
