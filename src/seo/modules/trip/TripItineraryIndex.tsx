import type { TripSeoContent } from './types';

/**
 * Expandable, server-rendered itinerary index. Real place names remain in the
 * HTML without requiring client state or JavaScript interaction.
 */
export function TripItineraryIndex({ itinerary }: Pick<TripSeoContent, 'itinerary'>) {
  if (itinerary.length === 0) return null;

  return (
    <section aria-label="Full trip itinerary">
      <details>
        <summary>Explore all days and places</summary>
        <ol>
          {itinerary.map((day) => (
            <li key={day.dayNumber}>
              <h2>{day.name}</h2>
              {day.description ? <p>{day.description}</p> : null}
              {day.points.length > 0 ? (
                <ul>
                  {day.points.map((point, index) => (
                    <li key={`${day.dayNumber}-${index}-${point.name}`}>
                      <strong>{point.name}</strong>
                      {point.description ? <p>{point.description}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
