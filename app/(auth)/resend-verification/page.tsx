import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { ResendVerificationForm } from '@/components/auth/ResendVerificationForm';

export const metadata: Metadata = {
  title: 'Resend verification',
  robots: NOINDEX,
};

export default function ResendVerificationPage() {
  return <ResendVerificationForm />;
}
