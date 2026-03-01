import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useActor } from '../hooks/useActor';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  sessionTimedOut: boolean;
  clearTimeoutFlag: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'chickngo_auth';
const TIMEOUT_KEY = 'chickngo_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const { actor } = useActor();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    sessionStorage.setItem(TIMEOUT_KEY, Date.now().toString());
  }, []);

  // Check session timeout
  const checkTimeout = useCallback(() => {
    const lastActivity = sessionStorage.getItem(TIMEOUT_KEY);
    if (!lastActivity) return;
    const elapsed = Date.now() - parseInt(lastActivity, 10);
    if (elapsed > SESSION_TIMEOUT_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TIMEOUT_KEY);
      setIsAuthenticated(false);
      setSessionTimedOut(true);
    }
  }, []);

  // Initialize admin on first load
  useEffect(() => {
    if (actor) {
      actor.initialize().catch(() => {
        // Already initialized, ignore error
      });
    }
  }, [actor]);

  // Session timeout check on mount and activity tracking
  useEffect(() => {
    if (isAuthenticated) {
      checkTimeout();
      updateActivity();

      const handleActivity = () => updateActivity();
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);

      // Check every minute
      timeoutRef.current = setInterval(checkTimeout, 60_000);

      return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        if (timeoutRef.current) clearInterval(timeoutRef.current);
      };
    }
  }, [isAuthenticated, checkTimeout, updateActivity]);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      setIsLoading(true);
      try {
        const result = await actor.authenticate(username, password);
        if (result) {
          sessionStorage.setItem(SESSION_KEY, 'true');
          updateActivity();
          setIsAuthenticated(true);
          setSessionTimedOut(false);
        }
        return result;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [actor, updateActivity]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TIMEOUT_KEY);
    setIsAuthenticated(false);
    setSessionTimedOut(false);
  }, []);

  const clearTimeoutFlag = useCallback(() => {
    setSessionTimedOut(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        sessionTimedOut,
        clearTimeoutFlag,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
