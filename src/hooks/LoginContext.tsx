import { createContext, FC, ReactNode, useEffect, useState } from 'react';

export type LoginContextType = {
  token: string | null;
  loginUser: (authToken: string) => void;
  logoutUser: () => void;
};

export const LoginContext = createContext({} as LoginContextType);

export const LoginProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const loginUser = (authToken: string) => {
    setToken(authToken);
    localStorage.setItem('accessToken', authToken);
  };

  const logoutUser = () => {
    setToken(null);
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('pathname');
  };

  const contextValue: LoginContextType = {
    token,
    loginUser,
    logoutUser,
  };

  return (
    <LoginContext.Provider value={contextValue}>
      {children}
    </LoginContext.Provider>
  );
};
