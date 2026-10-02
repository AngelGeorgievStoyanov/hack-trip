import type { SocialState } from './social';

/**
 * Image response DTOs.
 */

export interface ImageDto {
  id: number;
  url: string;
  thumbnailUrl: string;
}

export interface SocialImageDto extends ImageDto {
  social: SocialState;
}
