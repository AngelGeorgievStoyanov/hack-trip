import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <section>
      <h1>Register</h1>
      <p>The registration form will be implemented in the authentication step.</p>
    </section>
  );
}
