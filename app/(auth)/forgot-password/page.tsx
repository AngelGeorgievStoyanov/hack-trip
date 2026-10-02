import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <section>
      <h1>Forgot password</h1>
      <p>Password recovery will be implemented in the authentication step.</p>
    </section>
  );
}
