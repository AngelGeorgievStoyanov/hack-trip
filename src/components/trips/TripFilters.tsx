interface TripFiltersProps {
  search?: string;
  sort?: string;
}

/**
 * Trip list filters. A plain GET form (Server Component) so search/sort use the query
 * string and the page stays server-rendered — no client JavaScript required.
 */
export function TripFilters({ search, sort }: TripFiltersProps) {
  return (
    <form
      action="/trips"
      method="get"
      style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}
    >
      <input type="search" name="search" defaultValue={search} placeholder="Search trips" />
      <select name="sort" defaultValue={sort ?? 'newest'}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <button type="submit">Apply</button>
    </form>
  );
}
