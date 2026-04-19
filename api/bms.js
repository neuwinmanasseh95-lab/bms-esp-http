// api/bms.js

let latestData   = null;
let lastReceived = null;

export default function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ───── POST (ESP32 sends data) ─────
  if (req.method === "POST") {

    const body = req.body;

    if (!body || !body.pack1 || !body.pack2) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    latestData   = body;
    lastReceived = Date.now();

    return res.status(200).json({
      ok: true,
      received_at: lastReceived
    });
  }

  // ───── GET (Frontend fetches data) ─────
  if (req.method === "GET") {

    if (!latestData) {
      return res.status(200).json({
        status: "waiting",
        data: null
      });
    }

    const stale = (Date.now() - lastReceived) > 5000;

    return res.status(200).json({
      status: stale ? "stale" : "live",
      last_received: lastReceived,
      data: latestData
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
