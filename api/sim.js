export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { num } = req.query;

  if (!num) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a 'num' parameter. Example: /api/sim?num=3034992121"
    });
  }

  try {
    const upstreamUrl = `https://ft-simdb.ftshehryar10044.workers.dev/ft/api?num=${encodeURIComponent(num)}`;
    const response = await fetch(upstreamUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        status: "error",
        message: "Failed to fetch data from upstream API"
      });
    }

    const rawData = await response.json();

    // Reconstruct response while removing unwanted developer credits
    const filteredData = {
      status: rawData.status || "success",
      number: rawData.number || num,
      count: rawData.count || (rawData.records ? rawData.records.length : 0),
      records: rawData.records || [],
      developer: "FTGM (RANA FAISAL ALI)",
      website: "https://ftgmtools.pages.dev",
      copyright: "© Rana Faisal Ali | FTGM HACKS"
    };

    return res.status(200).json(filteredData);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message
    });
  }
}
