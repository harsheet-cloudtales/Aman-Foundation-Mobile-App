import { useEffect, useState } from "react";
import {
  clearStoredSession,
  getStoredSession,
  saveSession,
  type AuthSession,
  type AuthUser,
} from "./authStorage";
export interface User extends AuthUser {}

interface AuthState {
  token: string | null;
  user: User | null;
}

let authState: AuthState = {
  token: null,
  user: null,
};

const listeners = new Set<(state: AuthState) => void>();

const notify = () => {
  const snapshot = { ...authState };
  listeners.forEach((listener) => listener(snapshot));
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    const listener = (nextState: AuthState) => setState(nextState);
    listeners.add(listener);

    const restoreSession = async () => {
      const persistedSession = await getStoredSession();
      if (persistedSession) {
        authState = {
          token: persistedSession.token,
          user: persistedSession.user,
        };
        notify();
      }
    };

    void restoreSession();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = async (user: User, token: string) => {
    const nextState: AuthState = { token, user };
    authState = nextState;
    notify();
    await saveSession(nextState as AuthSession);
  };

  const logout = async () => {
    authState = { token: null, user: null };
    notify();
    await clearStoredSession();
  };

  return {
    token: state.token,
    user: state.user,
    login,
    logout,
    isAuthenticated: Boolean(state.token),
  };
}
