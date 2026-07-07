const https = require("https");
const host = "https://main.d1mnwey66nth5p.amplifyapp.com";
const url = new URL("/api/auth/login", host);
const body = JSON.stringify({
  email: "admin@amanfoundation.org",
  password: "admin123",
});
const req = https.request(
  url,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  },
  (res) => {
    console.log("STATUS", res.statusCode);
    let out = "";
    res.on("data", (chunk) => (out += chunk.toString()));
    res.on("end", () => console.log(out));
  },
);
req.on("error", (e) => console.error("ERR", e.message));
req.write(body);
req.end();
