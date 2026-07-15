import { useEffect, useState } from "react";
import {
  clearStoredSession,
  getStoredSession,
  saveSession,
  type AuthSession,
  type AuthUser,
} from "./authStorage";
import { api, setApiToken } from "./api";

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
        setApiToken(persistedSession.token);
        notify();

        try {
          const profile = await api.get<ProfileResponse>("/api/users/profile");
          if (profile.success && profile.data) {
            authState = {
              token: persistedSession.token,
              user: {
                id: profile.data.id,
                name: profile.data.name,
                username: profile.data.username,
                email: profile.data.email,
                roleId: profile.data.roleId,
                roleName: profile.data.roleName,
                status: profile.data.status,
                mobile: profile.data.mobile,
                fellowId: (profile.data as Record<string, unknown>).fellowId as string | null,
                fellowName: (profile.data as Record<string, unknown>).fellowName as string | null,
              },
            };
            notify();
          }
        } catch {
          // Token is invalid, clear session
          authState = { token: null, user: null };
          setApiToken(null);
          notify();
          await clearStoredSession();
        }
      }
    };

    void restoreSession();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = async (identifier: string, password: string) => {
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

    const nextState: AuthState = {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleName,
        fellowId: user.fellowId,
        fellowName: user.fellowName,
      },
    };

    authState = nextState;
    notify();
    await saveSession({ token, user: nextState.user });
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
    roleId: string;
  }) => {
    await api.post<SignupResponse>("/api/auth/signup", payload, false);
  };

  const logout = async () => {
    authState = { token: null, user: null };
    setApiToken(null);
    notify();
    await clearStoredSession();
  };

  return {
    token: state.token,
    user: state.user,
    login,
    register,
    logout,
    isAuthenticated: Boolean(state.token),
  };
}
