import type { Metadata } from 'next';
import { absoluteUrl } from '@/config';

export const metadata: Metadata = {
  title: 'About',
  description: 'Plan trips, set every point and share your journey live with HackTrip.',
  alternates: { canonical: absoluteUrl('/about') },
  openGraph: {
    title: 'About',
    description: 'Plan trips, set every point and share your journey live with HackTrip.',
    url: absoluteUrl('/about'),
    siteName: 'HackTrip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About',
    description: 'Plan trips, set every point and share your journey live with HackTrip.',
  },
};

export default function AboutPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>About</h1>
      <p>
        HackTrip lets you plan an upcoming trip, set every single point of your journey and
        follow them. You can edit your trip later while you are on the spot, add photos or a
        description, and let others follow your journey live.
      </p>
      <p>Enjoy the Hack Trip!</p>
      <p>You can contact us at email: www.hack.trip@gmail.com</p>
    </main>
  );
}
