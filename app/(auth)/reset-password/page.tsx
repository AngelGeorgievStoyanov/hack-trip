import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <section>
      <h1>Reset password</h1>
      <p>Password reset will be implemented in the authentication step.</p>
    </section>
  );
}
