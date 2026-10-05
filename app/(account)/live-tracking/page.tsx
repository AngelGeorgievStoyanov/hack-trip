import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { LiveTracker } from '@/components/tracking';

export const metadata: Metadata = {
  title: 'Live trip tracking',
  robots: NOINDEX,
};

export default function LiveTrackingPage() {
  return (
    <section>
      <h1>Live trip tracking</h1>
      <p>Record your position while you travel and watch the route build on the map.</p>
      <LiveTracker />
    </section>
  );
}
