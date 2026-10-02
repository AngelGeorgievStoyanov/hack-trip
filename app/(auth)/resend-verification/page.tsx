import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resend verification',
  robots: { index: false, follow: false },
};

export default function ResendVerificationPage() {
  return (
    <section>
      <h1>Resend verification</h1>
      <p>Resend verification will be implemented in the authentication step.</p>
    </section>
  );
}
