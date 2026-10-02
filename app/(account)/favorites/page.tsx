import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorites',
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <section>
      <h1>Favorites</h1>
      <p>
        A &quot;favorites&quot; list is not available in the current backend API contract:
        favorites can only be added/removed (POST/DELETE); there is no endpoint to list them.
      </p>
    </section>
  );
}
