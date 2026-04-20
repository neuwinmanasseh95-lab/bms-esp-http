let latestBMS = null;

export default function handler(req, res) {

  // 🚫 REMOVE ALL AUTH CHECKS

  if (req.method === "POST") {
    try {
      latestBMS = req.body;

      console.log("BMS Received:", latestBMS);

      return res.status(200).json({
        status: "received"
      });

    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "GET") {
    return res.status(200).json({
      status: latestBMS ? "ok" : "waiting",
      data: latestBMS
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
