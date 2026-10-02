import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorites',
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <section>
      <h1>Favorites</h1>
      <p>Favorites will be implemented in a later step.</p>
    </section>
  );
}
