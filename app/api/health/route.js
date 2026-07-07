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

export async function GET() {
  return jsonResponse({ status: "ok", message: "Health check passed" }, 200);
}

export async function OPTIONS() {
  return jsonResponse({}, 204);
}
