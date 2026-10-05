import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';

export const metadata: Metadata = {
  title: 'Favorites',
  robots: NOINDEX,
};

export default function FavoritesPage() {
  return (
    <section>
      <h1>Favorites</h1>
      <p>You don&apos;t have a favorites trip yet.</p>
    </section>
  );
}
