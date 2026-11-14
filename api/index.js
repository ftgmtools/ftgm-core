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

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let rawNum = req.query.number || req.query.num || '923277298973';
  if (!rawNum) {
    return res.status(400).json({ error: 'Please provide a number parameter' });
  }

  // Number ko clean karein (sirf digits rakhein)
  const cleanDigits = rawNum.toString().replace(/\D/g, '');
  
  // 92 format (e.g., 923277298973)
  const num92 = cleanDigits.startsWith('0') 
    ? '92' + cleanDigits.slice(1) 
    : (cleanDigits.startsWith('92') ? cleanDigits : '92' + cleanDigits);

  // 03 format (e.g., 03277298973) - Nahid Caller aksar 03 format maangta hai
  const num03 = '0' + num92.slice(2);

  // Define the 4 API endpoints
  const api1Url = `https://faisal-ali-truecaller.ftgmhacks.workers.dev/?key=ftgm2&number=${num92}`;
  const api2Url = `https://name-intelligence.ftgmhacks.workers.dev/?number=${num92}`;
  const api3Url = `https://alnayeem.top/nahid.php?number=${num03}`;
  const api4Url = `https://ftgm-simdb-api.vercel.app/api/sim?num=${num92}`;

  // Helper function with 12s timeout and proper headers
  async function fetchSafe(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://ftgmdb.pages.dev',
          'Referer': 'https://ftgmdb.pages.dev/'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { _rawError: text.slice(0, 150), _status: response.status };
      }
    } catch (err) {
      return { _fetchError: err.message };
    }
  }

  // Fetch all 4 APIs concurrently
  const [data1, data2, data3, data4] = await Promise.all([
    fetchSafe(api1Url),
    fetchSafe(api2Url),
    fetchSafe(api3Url),
    fetchSafe(api4Url)
  ]);

  // Extract exact fields (multiple fallback paths added)
  const outputData = {
    status: "success",
    query: num92,
    truecaller: {
      name: data1?.data?.name || data1?.name || data1?.result?.name || "Not Available"
    },
    name_intelligence: {
      fullName: data2?.fullName || data2?.data?.fullName || "Not Available",
      V1: data2?.V1 || "Not Available",
      V2: data2?.V2 || "Not Available",
      V3: data2?.V3 || "Not Available"
    },
    nahid_caller: {
      name: data3?.result?.caller_info?.raw_data?.[0]?.name || 
            data3?.caller_info?.raw_data?.[0]?.name || 
            data3?.name || 
            data3?.data?.name || 
            "Not Available"
    },
    sim_database: data4?.records ? data4.records.map(rec => ({
      name: rec.name || "Not Available",
      mobile: rec.mobile || "Not Available",
      cnic: rec.cnic || "Not Available",
      address: rec.address || "Not Available",
      network: rec.network || null
    })) : []
  };

  // Agar debug=1 ho to raw responses bhi dikhaye taake masla foran pakra jaye
  if (req.query.debug === '1') {
    outputData._debug = { api1: data1, api2: data2, api3: data3 };
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).send(JSON.stringify(outputData, null, 2));
}
