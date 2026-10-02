'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

/**
 * Application header. Client Component because it reads the auth session to show
 * login/account controls.
 */
export function Header() {
  const { status, user, logout } = useAuth();
  const isAuthenticated = status === 'authenticated';

  return (
    <header style={{ borderBottom: '1px solid #e0e0e0', padding: '0.75rem 1rem' }}>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link href="/" style={{ fontWeight: 700 }}>
          HackTrip
        </Link>
        <Link href="/trips">Trips</Link>
        {isAuthenticated ? (
          <>
            <Link href="/profile">{user?.firstName ?? 'Account'}</Link>
            <button type="button" onClick={() => void logout()}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
