import { POINT_TITLE_MAX_LENGTH } from '@/constants/points';

export function truncatePointName(value: string): string {
  const normalized = value.trim();
  if (normalized.length <= POINT_TITLE_MAX_LENGTH) return normalized;

  const limited = normalized.slice(0, POINT_TITLE_MAX_LENGTH);
  const lastSpace = Math.max(limited.lastIndexOf(' '), limited.lastIndexOf('\t'));
  return (lastSpace > 0 ? limited.slice(0, lastSpace) : limited).trimEnd();
}

export function getPointNameFromMapAddress(value: string): string {
  const commaParts = value.split(',');
  const legacyName = commaParts.length > 1
    ? commaParts[0]
    : value.split('-')[0];

  return truncatePointName(legacyName ?? value);
}
