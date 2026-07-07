const https = require("https");
const host = "https://main.d1mnwey66nth5p.amplifyapp.com";
const tests = [
  { path: "/api/auth/signup", method: "OPTIONS" },
  { path: "/api/auth/login", method: "OPTIONS" },
];
tests.forEach((test, index) => {
  const url = new URL(test.path, host);
  const req = https.request(
    url,
    {
      method: test.method,
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    },
    (res) => {
      console.log("---", test.method, test.path, "STATUS", res.statusCode);
      let out = "";
      res.on("data", (c) => (out += c));
      res.on("end", () =>
        console.log("HEADERS", JSON.stringify(res.headers), out.slice(0, 200)),
      );
      if (index === tests.length - 1) process.exit(0);
    },
  );
  req.on("error", (e) => {
    console.log("ERR", test.path, e.message);
    if (index === tests.length - 1) process.exit(1);
  });
  req.end();
});
