export type SocialTargetType = 'tripGroup' | 'trip' | 'point' | 'image' | 'comment';

/** Accepted client input values for likes (normalized by the backend). */
export type SocialTargetTypeInput = 'tripgroup' | 'day' | 'trip' | 'point' | 'image';

/** Accepted client input values for reports (likes plus comment targets). */
export type ReportTargetTypeInput = 'tripgroup' | 'day' | 'trip' | 'point' | 'image' | 'comment';

export interface SocialState {
  likes: number;
  likedByMe: boolean;
  comments: { count: number };
  reportedByMe: boolean;
  /** Present only on trip-group targets. */
  favorites?: number;
  /** Present only on trip-group targets. */
  favoritedByMe?: boolean;
}
