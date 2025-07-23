import React, { createContext, useState, useEffect, useContext } from "react";
import { getMe, getToken, setToken, clearToken } from "./auth";

// Shape: { user, token, login, logout }
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
/**
 * AuthProvider - Provides authentication context to children.
 * Loads user info on startup if token exists.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      getMe(token)
        .then(u => {
          setUser(u);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setTokenState(null);
          clearToken();
          setLoading(false);
        });
    }
  }, [token]);

  // PUBLIC_INTERFACE
  const login = (tokenValue) => {
    setToken(tokenValue);
    setTokenState(tokenValue);
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
/**
 * useAuth hook to access authentication state and actions.
 */
export function useAuth() {
  return useContext(AuthContext);
}
