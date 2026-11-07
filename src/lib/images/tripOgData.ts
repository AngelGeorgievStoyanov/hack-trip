import { getTrip } from '@/lib/serverApi';
import { tripOpenGraphImage } from '@/lib/images/representative';
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

/** Loads public Trip Group details for the generated social preview. */
export async function getTripOgData(rawId: string): Promise<TripOgData> {
  const parsed = positiveIdParam.safeParse(rawId);
  if (!parsed.success) {
    return FALLBACK_DATA;
  }

  try {
    const trip = await getTrip(Number(parsed.data));
    const firstDay = trip.days[0];
    const destinations = Array.from(
      new Set(
        trip.days
          .map((day) => day.destination?.trim())
          .filter((destination): destination is string => Boolean(destination)),
      ),
    );

    const title =
      firstDay?.title?.trim() ||
      destinations[0] ||
      FALLBACK_DATA.title;
    const subtitle =
      destinations.length > 1
        ? destinations.slice(0, 3).join(' · ')
        : firstDay?.description?.trim() || FALLBACK_DATA.subtitle;

    return {
      title: title.slice(0, 90),
      subtitle: subtitle.slice(0, 120),
      imageUrl: tripOpenGraphImage(trip),
    };
  } catch {
    // Keep social sharing usable even if the trip API is temporarily unavailable.
    return FALLBACK_DATA;
  }
}
