import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authToken, isAccountStatusError, normalizeApiError, restoreSession } from '../api/client';
import { authApi, type LoginInput } from '../api/auth';
import type { AuthUserDto } from '../types';

/**
 * Authentication state, distinguished per API_CONTRACT.md §2.3 and §10:
 * a failed/invalid JWT is never downgraded to anonymous access, and account-status
 * failures are surfaced distinctly.
 */
export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'accountError';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUserDto | null;
  token: string | null;
  login: (input: LoginInput) => Promise<AuthUserDto>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUserDto) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    restoreSession().then((result) => {
      if (cancelled) {
        return;
      }
      if (result.status === 'ok') {
        setToken(result.token);
      } else if (result.status === 'accountError') {
        setUser(null);
        setStatus('accountError');
      } else {
        setUser(null);
        setStatus('anonymous');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    setStatus('loading');
    authApi
      .me()
      .then((response) => {
        if (!cancelled) {
          setUser(response.user);
          setStatus('authenticated');
        }
      })
      .catch((error) => {
        if (cancelled) return;
        const code = normalizeApiError(error).code;
        if (isAccountStatusError(code)) {
          setStatus('accountError');
        } else {
          authToken.set(null);
          setToken(null);
          setUser(null);
          setStatus('anonymous');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (input: LoginInput): Promise<AuthUserDto> => {
    const session = await authApi.login(input);
    authToken.set(session.accessToken);
    setToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Local session is cleared regardless of backend response.
    }
    authToken.set(null);
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const updateUser = useCallback((nextUser: AuthUserDto): void => {
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, token, login, logout, updateUser }),
    [status, user, token, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
