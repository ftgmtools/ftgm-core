export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { num } = req.query;

  if (!num) {
    return res.status(400).json({ success: false, message: "Parameter 'num' is required" });
  }

  try {
    const response = await fetch("https://sajideyecon.free.nf/?ajax=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://sajideyecon.free.nf",
        "Referer": "https://sajideyecon.free.nf/?i=3",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36"
      },
      body: JSON.stringify({
        action: "single",
        number: num
      })
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
