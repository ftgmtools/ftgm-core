export default async function handler(req, res) {
  const allowedOrigin = 'https://ftgmdb.pages.dev';
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  // Strict Domain Locking: Sirf ftgmdb.pages.dev ko allow karega
  if (origin !== allowedOrigin && !referer.startsWith(allowedOrigin)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(403).send(JSON.stringify({
      status: "error",
      message: "FTGM HACKS OFFICIAL APIS ARE NOT ALLOWED FOR PUBLIC USE"
    }, null, 2));
  }

  // CORS Headers sirf allowed domain ke liye
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryNum = req.query.number || req.query.num || '923277298973';

  if (!queryNum) {
    return res.status(400).json({ error: 'Please provide a number parameter, e.g., ?number=923277298973' });
  }

  // Define the 4 API endpoints
  const api1Url = `https://faisal-ali-truecaller.ftgmhacks.workers.dev/?key=ftgm2&number=${queryNum}`;
  const api2Url = `https://name-intelligence.ftgmhacks.workers.dev/?number=${queryNum}`;
  const api3Url = `https://alnayeem.top/nahid.php?number=${queryNum}`;
  const api4Url = `https://ftgm-simdb-api.vercel.app/api/sim?num=${queryNum}`;

  // Helper function with timeout to prevent hanging / high load
  async function fetchSafe(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      return null;
    }
  }

  // Fetch all 4 APIs concurrently
  const [data1, data2, data3, data4] = await Promise.all([
    fetchSafe(api1Url),
    fetchSafe(api2Url),
    fetchSafe(api3Url),
    fetchSafe(api4Url)
  ]);

  // Extract exact fields requested
  const outputData = {
    status: "success",
    query: queryNum,
    truecaller: {
      name: data1?.data?.name || "Not Available"
    },
    name_intelligence: {
      fullName: data2?.fullName || "Not Available",
      V1: data2?.V1 || "Not Available",
      V2: data2?.V2 || "Not Available",
      V3: data2?.V3 || "Not Available"
    },
    nahid_caller: {
      name: data3?.result?.caller_info?.raw_data?.[0]?.name || data3?.caller_info?.raw_data?.[0]?.name || "Not Available"
    },
    sim_database: data4?.records ? data4.records.map(rec => ({
      name: rec.name || "Not Available",
      mobile: rec.mobile || "Not Available",
      cnic: rec.cnic || "Not Available",
      address: rec.address || "Not Available",
      network: rec.network || null
    })) : []
  };

  // Return clean, pretty-printed JSON (2 spaces indentation)
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).send(JSON.stringify(outputData, null, 2));
}
