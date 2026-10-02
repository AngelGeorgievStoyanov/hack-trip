'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MODERATOR_ROLES } from '@/constants/roles';

/**
 * Application header. Client Component because it reads the auth session to show
 * login/account controls. `useAuth()` is the single source of frontend auth state.
 */
export function Header() {
  const { status, user, logout } = useAuth();
  const isAuthenticated = status === 'authenticated';
  const isModerator = (MODERATOR_ROLES as readonly string[]).includes(user?.role ?? '');

  return (
    <header style={{ borderBottom: '1px solid #e0e0e0', padding: '0.75rem 1rem' }}>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ fontWeight: 700 }}>
          HackTrip
        </Link>
        <Link href="/trips">Trips</Link>
        {isAuthenticated ? (
          <>
            <Link href="/trips/create">Create trip</Link>
            <Link href="/profile">{user?.firstName ?? 'Account'}</Link>
            <Link href="/my-trips">My trips</Link>
            <Link href="/favorites">Favorites</Link>
            {isModerator ? <Link href="/admin">Admin</Link> : null}
            <button type="button" onClick={() => void logout()}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

