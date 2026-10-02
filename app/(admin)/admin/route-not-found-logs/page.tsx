import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminRouteNotFoundLogs } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Route not found logs',
  robots: NOINDEX,
};

export default function RouteNotFoundLogsPage() {
  return (
    <section>
      <AdminRouteNotFoundLogs />
    </section>
  );
}

