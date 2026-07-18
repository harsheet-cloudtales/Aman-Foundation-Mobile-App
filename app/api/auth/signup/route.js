import bcrypt from "bcryptjs";

const storeKey = "__amanFoundationUsers"; //data storage

function getStore() {
  if (!globalThis[storeKey]) {
    globalThis[storeKey] = [];
  }
  return globalThis[storeKey];
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
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, mobile, roleId } = body;

    if (!firstName || !lastName || !email || !password || !roleId) {
      return jsonResponse(
        {
          error:
            "First name, last name, email, password, and roleId are required",
        },
        400,
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return jsonResponse({ error: "Please enter a valid email address" }, 400);
    }

    if (password.length < 8) {
      return jsonResponse(
        { error: "Password must be at least 8 characters" },
        400,
      );
    }

    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return jsonResponse(
        { error: "Please enter a valid 10-digit mobile number" },
        400,
      );
    }

    const store = getStore();
    const normalizedEmail = email.toLowerCase().trim();
    const baseUsername = normalizedEmail
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    let username = baseUsername;
    let counter = 1;

    while (store.some((item) => item.username === username)) {
      username = `${baseUsername}${counter}`;
      counter += 1;
    }

    if (store.some((item) => item.email === normalizedEmail)) {
      return jsonResponse(
        { error: "User with this email already exists" },
        409,
      );
    }

    if (mobile && store.some((item) => item.mobile === mobile)) {
      return jsonResponse({ error: "Mobile number already registered" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      username,
      email: normalizedEmail,
      mobile: mobile?.trim() || null,
      password: hashedPassword,
      roleId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    store.push(newUser);

    return jsonResponse(
      {
        success: true,
        message: "Registration successful! Please wait for admin approval.",
        data: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          mobile: newUser.mobile,
          status: newUser.status,
          roleId: newUser.roleId,
          createdAt: newUser.createdAt,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Signup error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}
