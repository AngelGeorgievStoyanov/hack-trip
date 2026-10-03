'use client';

import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';

interface TripFiltersProps {
  search?: string;
  sort?: string;
  group?: string;
  transport?: string;
}

/**
 * Trip list filters. A plain GET form so the query string keeps driving the server-rendered
 * list. The group/transport options come from the shared `/config/selects` cache and are omitted
 * while that config is unavailable, leaving search and sort fully usable.
 */
export function TripFilters({ search, sort, group, transport }: TripFiltersProps) {
  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, group);
  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, transport);

  return (
    <form
      action="/trips"
      method="get"
      style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}
    >
      <input type="search" name="search" defaultValue={search} placeholder="Search trips" />
      {groupChoices.length > 0 ? (
        <select name="group" defaultValue={group ?? ''} aria-label="Group">
          <option value="">All groups</option>
          {groupChoices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      ) : null}
      {transportChoices.length > 0 ? (
        <select name="transport" defaultValue={transport ?? ''} aria-label="Transport">
          <option value="">All transport</option>
          {transportChoices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      ) : null}
      <select name="sort" defaultValue={sort ?? 'newest'}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <button type="submit">Apply</button>
    </form>
  );
}
