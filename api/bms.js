export default function handler(req, res) {
  console.log("METHOD:", req.method);

  if (req.method === "POST") {
    console.log("BODY:", req.body);

    return res.status(200).json({
      message: "POST received"
    });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "GET working"
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
