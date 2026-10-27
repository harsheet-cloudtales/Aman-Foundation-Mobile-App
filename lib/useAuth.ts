import { useEffect, useState } from "react";
import { api, setApiToken } from "./api";
import {
  authenticateLocalUser,
  clearStoredSession,
  getStoredSession,
  registerLocalUser,
  saveSession,
  type AuthUser,
} from "./authStorage";

export interface User extends AuthUser {}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean; // Only true during initial session restore
}

let authState: AuthState = {
  token: null,
  user: null,
  isLoading: true,
};

const listeners = new Set<(state: AuthState) => void>();

const notify = () => {
  const snapshot = { ...authState };
  listeners.forEach((listener) => listener(snapshot));
};

/**
 * Centralized state setter that only notifies when something actually changed.
 * This prevents redundant re-renders across every `useAuth()` consumer.
 */
const setAuthState = (next: Partial<AuthState>) => {
  const merged: AuthState = { ...authState, ...next };
  if (
    merged.token === authState.token &&
    merged.user === authState.user &&
    merged.isLoading === authState.isLoading
  ) {
    return;
  }
  authState = merged;
  notify();
};

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      roleId: string;
      roleName: string;
      name: string;
      fellowId: string | null;
      fellowName: string | null;
    };
  };
}

interface SignupResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    username: string;
    email: string;
    status: string;
    roleId: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    username: string;
    email: string;
    roleId: string;
    roleName: string;
    status: string;
    mobile: string | null;
    fellowId?: string | null;
    fellowName?: string | null;
  };
}

/**
 * Singleton promise so the session restore only runs ONCE for the entire app,
 * no matter how many components call `useAuth()`.
 */
let restorePromise: Promise<void> | null = null;

const restoreSession = (): Promise<void> => {
  if (restorePromise) return restorePromise;

  restorePromise = (async () => {
    try {
      setAuthState({ isLoading: true });

      const persistedSession = await getStoredSession();

      if (!persistedSession) {
        setAuthState({ token: null, user: null, isLoading: false });
        return;
      }

      // Local device sessions are already trusted and do not need a remote
      // profile validation call, which would fail against the configured server.
      if (persistedSession.token.startsWith("local-")) {
        setAuthState({
          token: persistedSession.token,
          user: persistedSession.user as User,
          isLoading: false,
        });
        setApiToken(persistedSession.token);
        return;
      }

      // Optimistically hydrate from storage while we validate the token.
      authState = {
        token: persistedSession.token,
        user: persistedSession.user,
        isLoading: true,
      };
      setApiToken(persistedSession.token);
      notify();

      try {
        const profile = await api.get<ProfileResponse>("/api/users/profile");

        if (profile.success && profile.data) {
          setAuthState({
            token: persistedSession.token,
            user: {
              id: profile.data.id,
              name: profile.data.name,
              username: profile.data.username,
              email: profile.data.email,
              roleId: profile.data.roleId,
              roleName: profile.data.roleName,
              status: profile.data.status,
              fellowId: (profile.data as Record<string, unknown>).fellowId as
                | string
                | null,
              fellowName: (profile.data as Record<string, unknown>)
                .fellowName as string | null,
            },
            isLoading: false,
          });
        } else {
          // No profile data returned — treat as unauthenticated.
          authState = { token: null, user: null, isLoading: false };
          setApiToken(null);
          notify();
          await clearStoredSession();
        }
      } catch {
        // Token is invalid, clear session.
        authState = { token: null, user: null, isLoading: false };
        setApiToken(null);
        notify();
        await clearStoredSession();
      }
    } catch (error) {
      console.error("Session restore error:", error);
      authState = { token: null, user: null, isLoading: false };
      notify();
    }
  })();

  return restorePromise;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    const listener = (nextState: AuthState) => setState(nextState);
    listeners.add(listener);

    void restoreSession();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    // Prefer the local device-backed auth flow used by this app.
    try {
      const localSession = await authenticateLocalUser(identifier, password);
      if (localSession) {
        const nextUser: User = {
          id: localSession.user.id,
          name: localSession.user.name,
          username: localSession.user.username,
          email: localSession.user.email,
          roleId: localSession.user.roleId,
          roleName: localSession.user.roleName,
          fellowId: (localSession.user as Record<string, unknown>).fellowId as
            | string
            | null,
          fellowName: (localSession.user as Record<string, unknown>)
            .fellowName as string | null,
        };

        setApiToken(localSession.token);
        setAuthState({
          token: localSession.token,
          user: nextUser,
          isLoading: false,
        });
        await saveSession({ token: localSession.token, user: nextUser });
        return;
      }
    } catch (error) {
      console.warn("Local auth failed, trying remote login fallback:", error);
    }

    // Fallback for a real backend, if one is configured and working.
    const isEmail = identifier.includes("@");
    const body = isEmail
      ? { email: identifier, password }
      : { username: identifier, password };

    const response = await api.post<LoginResponse>(
      "/api/auth/login",
      body,
      false,
    );

    const { token, user } = response.data;

    setApiToken(token);

    const nextUser: User = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      fellowId: user.fellowId,
      fellowName: user.fellowName,
    };

    setAuthState({ token, user: nextUser, isLoading: false });
    await saveSession({ token, user: nextUser });
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
    roleId: string;
  }) => {
    const localUser = await registerLocalUser({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      mobile: payload.mobile ?? "",
      password: payload.password,
      roleId: payload.roleId,
    });

    return localUser;
  };

  const logout = async () => {
    // Reset state first, then clear storage. No global loading toggle.
    setAuthState({ token: null, user: null, isLoading: false });
    setApiToken(null);
    await clearStoredSession();
  };

  return {
    token: state.token,
    user: state.user,
    isLoading: state.isLoading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(state.token),
  };
}
