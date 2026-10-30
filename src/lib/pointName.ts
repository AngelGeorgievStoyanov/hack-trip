import { POINT_TITLE_MAX_LENGTH } from '@/constants/points';

export function truncatePointName(value: string): string {
  const normalized = value.trim();
  if (normalized.length <= POINT_TITLE_MAX_LENGTH) return normalized;

  const limited = normalized.slice(0, POINT_TITLE_MAX_LENGTH);
  const lastSpace = Math.max(limited.lastIndexOf(' '), limited.lastIndexOf('\t'));
  return (lastSpace > 0 ? limited.slice(0, lastSpace) : limited).trimEnd();
}

export function getPointNameFromMapAddress(value: string): string {
  const commaPart = value.split(',')[0] ?? value;
  const legacyName = commaPart.split('-')[0] ?? commaPart;
  return truncatePointName(legacyName);
}
