import AsyncStorage from "@react-native-async-storage/async-storage";
import bcrypt from "bcryptjs";

export interface AuthUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  mobile?: string;
  roleId?: string;
  roleName?: string;
  status?: string;
  permissions?: string[];
  [key: string]: unknown;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  roleId: string;
  roleName?: string;
}

interface StoredUserRecord extends AuthUser {
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = "@aman_foundation_users";
const SESSION_KEY = "@aman_foundation_session";
const DEFAULT_ADMIN_EMAIL = "admin@amanfoundation.org";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function normalizeValue(value?: string) {
  return (value || "").trim().toLowerCase();
}

function sanitizeUser(user: StoredUserRecord): AuthUser {
  const { passwordHash, createdAt, ...rest } = user;
  return rest;
}

function resolveRoleName(roleId: string, fallback?: string) {
  const trimmedFallback = fallback?.trim();
  if (trimmedFallback) {
    return trimmedFallback;
  }

  const normalizedRoleId = normalizeValue(roleId);
  if (normalizedRoleId.includes("manager")) {
    return "Program Manager";
  }

  if (normalizedRoleId.includes("fellow")) {
    return "Fellow";
  }

  if (normalizedRoleId.includes("admin")) {
    return "Admin";
  }

  return "User";
}

async function readUsers(): Promise<StoredUserRecord[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoredUserRecord[];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUserRecord[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function ensureDefaultAdminUser() {
  const users = await readUsers();
  if (
    users.some((user) => normalizeValue(user.email) === DEFAULT_ADMIN_EMAIL)
  ) {
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  users.push({
    id: "admin-1",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    username: "admin",
    email: DEFAULT_ADMIN_EMAIL,
    mobile: "9999999999",
    passwordHash,
    roleId: "admin",
    roleName: "Admin",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });

  await writeUsers(users);
}

export async function registerLocalUser(payload: RegistrationPayload) {
  await ensureDefaultAdminUser();

  const users = await readUsers();
  const normalizedEmail = normalizeValue(payload.email);
  const normalizedMobile = normalizeValue(payload.mobile);

  if (users.some((user) => normalizeValue(user.email) === normalizedEmail)) {
    throw new Error("A user with this email already exists.");
  }

  if (users.some((user) => normalizeValue(user.mobile) === normalizedMobile)) {
    throw new Error("A user with this mobile number already exists.");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const userRecord: StoredUserRecord = {
    id: `local-${Date.now()}`,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    name: `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim(),
    email: payload.email.trim().toLowerCase(),
    mobile: payload.mobile.trim(),
    username: payload.email.trim().toLowerCase(),
    roleId: payload.roleId,
    roleName: resolveRoleName(payload.roleId, payload.roleName),
    status: "PENDING",
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(userRecord);
  await writeUsers(users);

  return sanitizeUser(userRecord);
}

export async function authenticateLocalUser(
  identifier: string,
  password: string,
) {
  await ensureDefaultAdminUser();

  const users = await readUsers();
  const normalizedIdentifier = normalizeValue(identifier);

  const user = users.find((candidate) => {
    return (
      normalizeValue(candidate.email) === normalizedIdentifier ||
      normalizeValue(candidate.username) === normalizedIdentifier
    );
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  const token = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function saveSession(session: AuthSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearStoredSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
