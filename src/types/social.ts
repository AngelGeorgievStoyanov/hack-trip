export type SocialTargetType = 'tripGroup' | 'trip' | 'point' | 'image';

/** Accepted client input values for likes/reports (normalized by the backend). */
export type SocialTargetTypeInput = 'tripgroup' | 'day' | 'trip' | 'point' | 'image';

export interface SocialState {
  likes: number;
  likedByMe: boolean;
  comments: { count: number };
  /** Present only on trip-group targets. */
  favorites?: number;
  /** Present only on trip-group targets. */
  favoritedByMe?: boolean;
}
