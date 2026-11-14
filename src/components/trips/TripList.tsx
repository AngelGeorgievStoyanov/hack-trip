import type { CSSProperties } from 'react';
import { TripCard } from './TripCard';
import { cardListStyle, headingTextStyle } from '@/constants/ui';
import type { TripGroupResponse } from '@/types';

const EMPTY_TITLE_STYLE: CSSProperties = {
  margin: '2px',
  fontSize: '1.5rem',
  fontWeight: 500,
  ...headingTextStyle,
};

const EMPTY_TEXT_STYLE: CSSProperties = {
  margin: '2px',
  fontSize: '1rem',
  ...headingTextStyle,
};

interface TripListProps {
  trips: TripGroupResponse[];
  prioritizeFirstImage?: boolean;
}

export function TripList({ trips, prioritizeFirstImage = false }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div>
        <h5 style={EMPTY_TITLE_STYLE}>WELCOME!</h5>
        <p style={EMPTY_TEXT_STYLE}>No trips found!</p>
      </div>
    );
  }

  return (
    <ul style={cardListStyle}>
      {trips.map((tripGroup, index) => (
        <li key={tripGroup.id}>
          <TripCard tripGroup={tripGroup} prioritizeImage={prioritizeFirstImage && index === 0} />
        </li>
      ))}
    </ul>
  );
}
