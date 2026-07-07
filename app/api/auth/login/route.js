import bcrypt from "bcryptjs";

const storeKey = "__amanFoundationUsers";

function getStore() {
  if (!globalThis[storeKey]) {
    globalThis[storeKey] = [];
  }
  return globalThis[storeKey];
}

async function seedAdminUser() {
  const store = getStore();
  if (store.some((user) => user.email === "admin@amanfoundation.org")) {
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  store.push({
    id: "admin-1",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    username: "admin",
    email: "admin@amanfoundation.org",
    mobile: "9999999999",
    password: hashedPassword,
    roleId: "admin",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export async function POST(req) {
  await seedAdminUser();

  try {
    const body = await req.json();
    const { email, username, password } = body;

    if ((!email && !username) || !password) {
      return jsonResponse(
        { error: "Email/username and password are required" },
        400,
      );
    }

    const maybeEmail = (email || "").toLowerCase().trim();
    const maybeUsername = (username || "").toLowerCase().trim();
    const store = getStore();
    const user = store.find(
      (item) =>
        item.email === maybeEmail ||
        (maybeUsername && item.username === maybeUsername),
    );

    if (!user) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

    const token = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return jsonResponse({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          roleId: user.roleId,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}
