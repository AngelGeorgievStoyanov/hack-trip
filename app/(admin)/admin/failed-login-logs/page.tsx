import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { AdminFailedLogs } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Failed login logs',
  robots: NOINDEX,
};

export default function FailedLoginLogsPage() {
  return (
    <section>
      <AdminFailedLogs />
    </section>
  );
}

