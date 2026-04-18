import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { setToken, clearToken } from '../api/tokenStore';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Decodes a JWT payload without verifying — only used to read the exp claim
function parseJwtPayload(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

let silentRefreshTimer = null;

function scheduleRefresh(accessToken, onRefreshed) {
  if (silentRefreshTimer) clearTimeout(silentRefreshTimer);
  const payload = parseJwtPayload(accessToken);
  if (!payload?.exp) return;
  // Fire 60 s before the access token actually expires
  const msUntilRefresh = payload.exp * 1000 - Date.now() - 60_000;
  if (msUntilRefresh <= 0) {
    onRefreshed();
    return;
  }
  silentRefreshTimer = setTimeout(onRefreshed, msUntilRefresh);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    scheduleRefresh(accessToken, () => performSilentRefresh());
  }, []);

  const performSilentRefresh = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      applySession(data.accessToken, data.user);
    } catch {
      // Refresh token expired or invalid — user needs to sign in again
      clearToken();
      setUser(null);
    }
  }, [applySession]);

  // On mount: attempt to restore the session using the HttpOnly refresh cookie
  useEffect(() => {
    performSilentRefresh().finally(() => setIsLoading(false));
    return () => {
      if (silentRefreshTimer) clearTimeout(silentRefreshTimer);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    applySession(data.accessToken, data.user);
    return data.user;
  }, [applySession]);

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    applySession(data.accessToken, data.user);
    return data.user;
  }, [applySession]);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    clearToken();
    setUser(null);
    if (silentRefreshTimer) {
      clearTimeout(silentRefreshTimer);
      silentRefreshTimer = null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

