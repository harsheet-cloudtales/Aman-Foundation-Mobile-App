# API Integration Guide — Aman Foundation Mobile App

## Architecture Overview

```
┌──────────────────┐
│    Screens       │  (login.tsx, index.tsx, education_*.tsx, etc.)
│  (app/(tabs)/)   │
└────────┬─────────┘
         │ Import useAuth() for login/logout/user info
         │ Import api for all API calls
         ▼
┌──────────────────┐
│  lib/useAuth.ts  │  Auth state management (login, register, logout, session restore)
└────────┬─────────┘
         │ Sets token via setApiToken()
         │ Calls api.post() internally for login/register
         ▼
┌──────────────────┐
│   lib/api.ts     │  Centralized API client — ALL backend calls go through here
│                  │  • Auto-attaches Authorization: Bearer <token>
│                  │  • Handles 401 → clears token
│                  │  • Throws typed ApiError on failure
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Backend (Next.js + PostgreSQL)          │
│  https://main.d1mnwey66nth5p.amplifyapp.com  │
│                                           │
│  Auth: JWT (HS256, 7-day expiry)         │
│  Transport: Authorization: Bearer <token> │
└──────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/api.ts` | API client — `api.get()`, `api.post()`, `api.put()`, `api.del()` |
| `lib/useAuth.ts` | Auth hook — `login()`, `register()`, `logout()`, `user`, `token`, `isAuthenticated` |
| `lib/authStorage.ts` | AsyncStorage helpers — session persistence only (save/restore/clear) |

---

## 1. Authentication Flow

### Login

```typescript
// In login.tsx handleLogin():
const { login } = useAuth();
await login("user@email.com", "password123");
```

**What happens internally:**
1. `useAuth().login()` calls `api.post("/api/auth/login", { email, password }, false)`
   - `auth: false` — no token attached (we don't have one yet)
2. Backend returns `{ success: true, data: { token, user } }`
3. Token stored: `setApiToken(token)` (in-memory, fast reads)
4. Session saved: `saveSession({ token, user })` → AsyncStorage (persistent)
5. All screens re-render via listener notification
6. `router.replace("/")` → navigate to dashboard

### Session Restore on App Start

```
App opens
  → useAuth() mounts
  → reads session from AsyncStorage
  → calls GET /api/users/profile to validate token
      ├── 200: Token valid → refresh user data, stay logged in
      └── 401: Token expired/invalid → clear storage, redirect to login
```

### Logout

```typescript
const { logout } = useAuth();
await logout();
// Clears in-memory token, AsyncStorage, navigates to login
```

### Request/Response Shapes

**POST /api/auth/login** (called by `useAuth().login()`)

```json
// Request
{
  "email": "admin@amanfoundation.org",  // OR "username": "admin"
  "password": "mypassword"
}

// Success (200)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@amanfoundation.org",
      "roleId": "role-uuid",
      "roleName": "Admin",
      "name": "Admin User",
      "fellowId": null,
      "fellowName": null
    }
  }
}

// Errors
// 400 → "Email/username and password are required"
// 401 → "Invalid credentials"
// 403 → "Your account is pending. Please wait for admin approval."
// 403 → "Account access denied. Status is BLOCKED"
```

**POST /api/auth/signup** (called by `useAuth().register()`)

```json
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile": "1234567890",
  "roleId": "role-uuid"
}

// Success (201)
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "username": "john",
    "email": "john@example.com",
    "status": "PENDING",
    "roleId": "role-uuid"
  }
}
```

---

## 2. Making API Calls (Normal Authenticated Requests)

### You NEVER need to pass the token manually.

```typescript
import { api } from "@/lib/api";

// GET — fetch a list
const response = await api.get("/api/schools");
// Response auto-typed, Authorization header auto-attached

// POST — create something
const response = await api.post("/api/beneficiaries", {
  name: "Jane Doe",
  schoolId: "abc-123",
});

// PUT — update
const response = await api.put("/api/schools/abc-123", {
  name: "Updated School Name",
});

// DELETE
const response = await api.del("/api/schools/abc-123");
```

### Error Handling

```typescript
import { api, ApiError } from "@/lib/api";

try {
  const data = await api.get("/api/schools");
  // Use data...
} catch (err) {
  if (err instanceof ApiError) {
    // err.message → "Invalid credentials" etc.
    // err.status → 400, 401, 403, 404, 500
  }
}
```

### Unauthenticated Calls

For calls that don't need a token (login, signup), pass `false` as 3rd arg:

```typescript
api.post("/api/auth/login", body, false);  // No Authorization header
api.post("/api/auth/signup", body, false); // No Authorization header
```

For all other calls (after login), omit the 3rd arg or leave default (`true`):

```typescript
api.get("/api/schools");                    // Auto-attaches token
api.post("/api/beneficiaries", body);       // Auto-attaches token
```

---

## 3. Checking Auth State in Screens

```typescript
import { useAuth } from "@/lib/useAuth";

function MyScreen() {
  const { user, token, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please log in</Text>;
  }

  // user.name, user.roleName, user.email, etc.
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Text>Role: {user?.roleName}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

---

## 4. 401 Auto-Logout Behavior

When any API call receives a **401 response**:
- `api.ts` automatically clears the in-memory token
- The next screen using `useAuth()` will show `isAuthenticated: false`
- The old session in AsyncStorage will also be cleared on next mount

You should handle this gracefully — a common pattern:

```typescript
// Guard in a screen or layout
const { isAuthenticated } = useAuth();

useEffect(() => {
  if (!isAuthenticated) {
    router.replace("/login");
  }
}, [isAuthenticated]);
```

---

## 5. Adding a New API Call (Step by Step)

1. **Find the endpoint** you need from the backend (e.g., `GET /api/programs`)
2. **In your screen component:**

```typescript
import { api, ApiError } from "@/lib/api";
import { useState, useEffect } from "react";

function ProgramsScreen() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/programs")
      .then((res) => setPrograms(res.data))
      .catch((err: ApiError) => console.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // render programs...
}
```

3. **That's it.** No token config, no base URL — the API client handles it all.

---

## 6. Rules to Remember

| Do | Don't |
|---|---|
| Use `api.get()` / `api.post()` / `api.put()` / `api.del()` | Never use raw `fetch()` directly |
| Use `useAuth().login(id, pw)` for login | Never call `api.post("/api/auth/login")` directly |
| Use `useAuth().register(data)` for signup | Never call `api.post("/api/auth/signup")` directly |
| Pass `false` as 3rd arg ONLY for login/signup | Never pass `auth: false` for normal API calls |
| Import `ApiError` from `@/lib/api` | Never import from `@/lib/authStorage` (legacy) |
| `@/lib/api` = how to talk | `@/lib/useAuth` = who is talking |

---

## 7. Backend API Routes (Reference)

All routes are under `https://main.d1mnwey66nth5p.amplifyapp.com`

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/signup` |
| **Users** | `GET/POST /api/users`, `GET/PUT /api/users/:id`, `GET /api/users/profile` |
| **Schools** | `GET/POST /api/schools`, `GET/PUT/DELETE /api/schools/:id` |
| **Students** | `GET/POST /api/students`, `GET/PUT/DELETE /api/students/:id` |
| **Fellows** | `GET/POST /api/fellows`, `GET/PUT/DELETE /api/fellows/:id` |
| **Programs** | `GET/POST /api/programs`, `GET/PUT/DELETE /api/programs/:id` |
| **Events** | `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id` |
| **Beneficiaries** | `GET/POST /api/beneficiaries`, `GET/PUT/DELETE /api/beneficiaries/:id` |
| **Attendance** | `GET /api/attendance`, `GET /api/attendance/:userId` |
| **Leaves** | `GET/POST /api/leaves`, `GET/PUT/DELETE /api/leaves/:id` |
| **Livelihood** | `/api/livelihood/programs`, `/api/livelihood/goat-events` |
| **Disaster Relief** | `/api/disaster-relief/incidents`, `/api/disaster-relief/resources` |
| **Livestock** | `GET/POST /api/livestock`, `GET/PUT/DELETE /api/livestock/:id` |
