// api/bms.js
// Handles both:
//   POST /api/bms  ← ESP32 sends JSON every second
//   GET  /api/bms  ← frontend polls every second

// ─── In-memory store ───────────────────────────────────────────────────────
// Vercel reuses warm serverless instances, so this persists between requests
// on the same instance. For multi-instance reliability, swap this for
// Vercel KV: https://vercel.com/docs/storage/vercel-kv
// ──────────────────────────────────────────────────────────────────────────
let latestData   = null;
let lastReceived = null;

const API_SECRET = process.env.API_SECRET ?? "qwertyuiopasdfghjklzxcvbnm1234567890";

export default function handler(req, res) {
  // ── CORS — allow the dashboard origin to poll this route ──
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ══════════════════════════════════════════════════════════════
  //  POST  — ESP32 pushes telemetry
  // ══════════════════════════════════════════════════════════════
  if (req.method === "POST") {
    // Validate bearer token
    const auth = req.headers["authorization"] ?? "";
    if (auth !== `Bearer ${API_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;

    // Basic shape validation
    if (!body || !body.pack1 || !body.pack2) {
      return res.status(400).json({ error: "Invalid payload — missing pack1 or pack2" });
    }

    latestData   = body;
    lastReceived = Date.now();

    return res.status(200).json({ ok: true, received_at: lastReceived });
  }

  // ══════════════════════════════════════════════════════════════
  //  GET  — dashboard polls for latest snapshot
  // ══════════════════════════════════════════════════════════════
  if (req.method === "GET") {
    if (!latestData) {
      return res.status(200).json({
        status:       "waiting",
        message:      "No data received yet. Make sure the ESP32 is powered and connected.",
        last_received: null,
        data:          null,
      });
    }

    // Mark stale if no packet received in last 5 seconds
    const stale = (Date.now() - lastReceived) > 5000;

    return res.status(200).json({
      status:        stale ? "stale" : "live",
      last_received: lastReceived,
      age_ms:        Date.now() - lastReceived,
      data:          latestData,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
