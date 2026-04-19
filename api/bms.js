// Simple in-memory storage
let latestData = null;
let lastReceived = null;

export default function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ───────── POST (ESP32 sends data) ─────────
  if (req.method === "POST") {
    try {
      const body = req.body;

      console.log("Incoming Data:", body);

      if (!body) {
        return res.status(400).json({ error: "No data received" });
      }

      latestData = body;
      lastReceived = Date.now();

      return res.status(200).json({
        success: true,
        message: "Data received"
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ───────── GET (Frontend reads data) ─────────
  if (req.method === "GET") {

    if (!latestData) {
      return res.json({
        status: "waiting",
        data: null
      });
    }

    const age = Date.now() - lastReceived;

    return res.json({
      status: age > 5000 ? "stale" : "live",
      last_received: lastReceived,
      age_ms: age,
      data: latestData
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
