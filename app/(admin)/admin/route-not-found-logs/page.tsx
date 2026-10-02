import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Route not found logs',
  robots: { index: false, follow: false },
};

export default function RouteNotFoundLogsPage() {
  return (
    <section>
      <h1>Route not found logs</h1>
      <p>Route-not-found logs will be implemented in the admin step.</p>
    </section>
  );
}
