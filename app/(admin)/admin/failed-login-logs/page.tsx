import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Failed login logs',
  robots: { index: false, follow: false },
};

export default function FailedLoginLogsPage() {
  return (
    <section>
      <h1>Failed login logs</h1>
      <p>Failed login logs will be implemented in the admin step.</p>
    </section>
  );
}
