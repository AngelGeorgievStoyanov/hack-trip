import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify email',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <section>
      <h1>Verify email</h1>
      <p>Email verification will be implemented in the authentication step.</p>
    </section>
  );
}
