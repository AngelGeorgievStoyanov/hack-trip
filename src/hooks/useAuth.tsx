import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authToken, isAccountStatusError, normalizeApiError, restoreSession } from '../api/client';
import { authApi, type LoginInput } from '../api/auth';
import type { ProfileDto } from '../types';
import { useRouter } from 'next/navigation';

/**
 * Authentication state, distinguished per API_CONTRACT.md §2.3 and §10:
 * a failed/invalid JWT is never downgraded to anonymous access, and account-status
 * failures are surfaced distinctly.
 */
export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'accountError';

interface AuthContextValue {
  status: AuthStatus;
  viewerCacheKey: string;
  user: ProfileDto | null;
  token: string | null;
  login: (input: LoginInput) => Promise<ProfileDto>;
  logout: () => Promise<void>;
  updateUser: (user: ProfileDto) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ProfileDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [viewerSessionVersion, setViewerSessionVersion] = useState(0);
  const loginToken = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function initialize(): Promise<void> {
      let probe: { hasSession: boolean };
      try {
        probe = await authApi.sessionProbe();
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus('anonymous');
        }
        return;
      }
      if (cancelled) {
        return;
      }
      if (!probe.hasSession) {
        setUser(null);
        setStatus('anonymous');
        return;
      }
      const result = await restoreSession();
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
    }
    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const isNewLogin = loginToken.current === token;
    if (isNewLogin) {
      loginToken.current = null;
    }

    let cancelled = false;
    authApi
      .me()
      .then((response) => {
        if (!cancelled) {
          setUser(response.user);
          if (!isNewLogin) {
            setViewerSessionVersion((version) => version + 1);
          }
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
          setViewerSessionVersion((version) => version + 1);
          setStatus('anonymous');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (input: LoginInput): Promise<ProfileDto> => {
    const session = await authApi.login(input);
    authToken.set(session.accessToken);
    loginToken.current = session.accessToken;
    setToken(session.accessToken);
    setUser(session.user);
    setViewerSessionVersion((version) => version + 1);
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
    setViewerSessionVersion((version) => version + 1);
    setStatus('anonymous');
    // All logout cleanup (API call, token/session clearing, auth-state update) has
    // completed at this point, so it is safe to send the user to the public home page
    // regardless of which page they logged out from. `replace` avoids restoring the
    // previous (possibly protected) URL via the browser back button.
    router.replace('/');
  }, [router]);

  const updateUser = useCallback((nextUser: ProfileDto): void => {
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      viewerCacheKey: `${status}:${viewerSessionVersion}`,
      user,
      token,
      login,
      logout,
      updateUser,
    }),
    [status, viewerSessionVersion, user, token, login, logout, updateUser],
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
