export type SocialTargetType = 'tripGroup' | 'trip' | 'point' | 'image' | 'comment';

/** Accepted client input values for likes (normalized by the backend). */
export type SocialTargetTypeInput = 'tripgroup' | 'day' | 'trip' | 'point' | 'image' | 'comment';

/** Accepted client input values for reports (likes plus comment targets). */
export type ReportTargetTypeInput = 'tripgroup' | 'day' | 'trip' | 'point' | 'image' | 'comment';

export interface SocialState {
  likes: number;
  likedByMe: boolean;
  comments: { count: number };
  reportedByMe: boolean;
  favorites?: number;
  favoritedByMe?: boolean;
}

export type SocialAction = 'like' | 'favorite' | 'report' | 'comment' | 'replyComment';
export type SocialOperation = 'create' | 'edit' | 'delete';
export type SocialConfigTargetKey = 'tripGroup' | 'trip' | 'point' | 'image' | 'comment';

export interface SocialConfigOperations {
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface SocialConfigContextRule {
  key: SocialConfigTargetKey;
  operations: SocialConfigOperations;
}

export interface SocialConfigTarget extends SocialConfigOperations {
  key: SocialConfigTargetKey;
  operations: SocialConfigOperations;
  contextRules?: SocialConfigContextRule[];
}

export interface SocialActionConfig {
  key: SocialAction;
  isActive: boolean;
  targets: SocialConfigTarget[];
}

export interface SocialConfigResponse {
  social: SocialActionConfig[];
}
