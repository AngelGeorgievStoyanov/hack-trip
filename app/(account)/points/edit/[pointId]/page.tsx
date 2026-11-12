import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { EditPointPage } from '@/components/points/EditPointPage';

export const metadata: Metadata = {
  title: 'Edit point',
  robots: NOINDEX,
};

export default function EditPointRoute() {
  return <EditPointPage />;
}
