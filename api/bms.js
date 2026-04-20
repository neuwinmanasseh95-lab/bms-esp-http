let latestBMS = null;

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      const data = req.body;

      // Basic validation
      if (!data.device_id) {
        return res.status(400).json({ error: "Invalid data" });
      }

      latestBMS = data;

      console.log("Received BMS:", data);

      return res.status(200).json({
        status: "OK",
        received: true
      });

    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "GET") {
    return res.status(200).json(latestBMS || {});
  }

  res.status(405).json({ error: "Method not allowed" });
}
