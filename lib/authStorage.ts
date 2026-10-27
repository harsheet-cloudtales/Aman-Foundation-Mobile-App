import AsyncStorage from "@react-native-async-storage/async-storage";
import bcrypt from "bcryptjs";

// ============================================
// TYPES
// ============================================
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

// ============================================
// CONSTANTS
// ============================================
const USERS_KEY = "@aman_foundation_users";
const SESSION_KEY = "@aman_foundation_session";
const DEFAULT_ADMIN_EMAIL = "admin@amanfoundation.org";
const DEFAULT_ADMIN_PASSWORD = "admin123";

/**
 * Status values stored in AsyncStorage.
 * Using uppercase to stay consistent with existing data.
 * All comparisons are done case-insensitively via `normalizeStatus`.
 */
export const USER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// ============================================
// HELPERS
// ============================================
function normalizeValue(value?: string) {
  return (value || "").trim().toLowerCase();
}

function normalizeStatus(value?: string): string {
  return (value || "").trim().toUpperCase();
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
    status: USER_STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
  });

  await writeUsers(users);
}

// ============================================
// EXPORTED STORAGE KEY (for admin pages that need direct access)
// ============================================
export const USERS_STORAGE_KEY = USERS_KEY;

// ============================================
// REGISTRATION
// ============================================
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
    status: USER_STATUS.PENDING,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(userRecord);
  await writeUsers(users);

  return sanitizeUser(userRecord);
}

// ============================================
// LOGIN
// ============================================
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

  // Block non-active accounts with a clear error message.
  const status = normalizeStatus(user.status);
  if (status !== USER_STATUS.ACTIVE) {
    if (status === USER_STATUS.PENDING) {
      throw new Error(
        "Your account is pending admin approval. Please try again later.",
      );
    }
    if (status === USER_STATUS.REJECTED) {
      throw new Error(
        "Your account request was rejected. Please contact an administrator.",
      );
    }
    throw new Error(
      "Your account is not active. Please contact an administrator.",
    );
  }

  const token = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    token,
    user: sanitizeUser(user),
  };
}

// ============================================
// ADMIN / ACCESS PORTAL HELPERS
// ============================================

/**
 * Returns every stored user (password hash stripped).
 */
export async function getAllUsers(): Promise<AuthUser[]> {
  const users = await readUsers();
  return users.map(sanitizeUser);
}

/**
 * Returns only users whose status is PENDING (case-insensitive).
 */
export async function getPendingUsers(): Promise<AuthUser[]> {
  const users = await readUsers();
  return users
    .filter((u) => normalizeStatus(u.status) === USER_STATUS.PENDING)
    .map(sanitizeUser);
}

/**
 * Returns only users whose status is ACTIVE (case-insensitive).
 */
export async function getActiveUsers(): Promise<AuthUser[]> {
  const users = await readUsers();
  return users
    .filter((u) => normalizeStatus(u.status) === USER_STATUS.ACTIVE)
    .map(sanitizeUser);
}

/**
 * Returns only users whose status is REJECTED (case-insensitive).
 */
export async function getRejectedUsers(): Promise<AuthUser[]> {
  const users = await readUsers();
  return users
    .filter((u) => normalizeStatus(u.status) === USER_STATUS.REJECTED)
    .map(sanitizeUser);
}

/**
 * Approve a pending user → status becomes ACTIVE.
 */
export async function approveUser(userId: string): Promise<void> {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("User not found.");
  }

  users[index] = { ...users[index], status: USER_STATUS.ACTIVE };
  await writeUsers(users);
}

/**
 * Reject a pending user → status becomes REJECTED.
 */
export async function rejectUser(userId: string): Promise<void> {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("User not found.");
  }

  users[index] = { ...users[index], status: USER_STATUS.REJECTED };
  await writeUsers(users);
}

// ============================================
// SESSION
// ============================================
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
