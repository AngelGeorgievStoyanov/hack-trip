import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section>
      <h1>Login</h1>
      <p>The login form will be implemented in the authentication step.</p>
    </section>
  );
}
