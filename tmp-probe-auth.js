const https = require("https");
const host = "https://main.d1mnwey66nth5p.amplifyapp.com";
const tests = [
  { path: "/", method: "GET" },
  {
    path: "/api/auth/login",
    method: "POST",
    body: { email: "admin@amanfoundation.org", password: "admin123" },
  },
  {
    path: "/api/auth/signup",
    method: "POST",
    body: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "Test12345!",
      mobile: "9999999999",
      roleId: "cm0v1a2b3c4d5e6f7g8h9i0j1",
    },
  },
];

tests.forEach((test, index) => {
  const url = new URL(test.path, host);
  const body = test.body ? JSON.stringify(test.body) : null;
  const headers = { "Content-Type": "application/json" };
  if (body) headers["Content-Length"] = Buffer.byteLength(body);
  const req = https.request(url, { method: test.method, headers }, (res) => {
    let out = "";
    res.on("data", (chunk) => {
      out += chunk.toString();
    });
    res.on("end", () => {
      console.log("---", test.method, test.path, "STATUS", res.statusCode);
      console.log(out.slice(0, 1200));
      if (index === tests.length - 1) process.exit(0);
    });
  });
  req.on("error", (err) => {
    console.log("---", test.method, test.path, "ERROR", err.message);
    if (index === tests.length - 1) process.exit(1);
  });
  if (body) req.write(body);
  req.end();
});
