import type { Metadata } from 'next';
import { ResendVerificationForm } from '@/components/auth/ResendVerificationForm';

export const metadata: Metadata = {
  title: 'Resend verification',
  robots: { index: false, follow: false },
};

export default function ResendVerificationPage() {
  return <ResendVerificationForm />;
}
