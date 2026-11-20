import crypto from 'crypto';

export default async function handler(req, res) {
  const allowedOrigin = 'https://ftgmdb.pages.dev';
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-FTGM-Token, X-FTGM-Time');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let rawNum = req.query.number || req.query.num || '923277298973';
  const cleanDigits = rawNum.toString().replace(/\D/g, '');
  const num92 = cleanDigits.startsWith('0') 
    ? '92' + cleanDigits.slice(1) 
    : (cleanDigits.startsWith('92') ? cleanDigits : '92' + cleanDigits);

  // Trap / Fake Response Function (Jab koi bypass ya galat domain se try kare)
  function sendTrapResponse() {
    const trapData = {
      status: "success",
      query: num92,
      sim_database: [
        {
          name: "FTGM KING",
          mobile: num92,
          cnic: "https://shorturl.at/QjRYj",
          address: "Visit : https://shorturl.at/QjRYj",
          network: "FTGM NETWORK"
        }
      ]
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(trapData, null, 2));
  }

  // 1. Origin & Referer Check
  if (origin !== allowedOrigin && !referer.startsWith(allowedOrigin)) {
    return sendTrapResponse();
  }

  // 2. Dynamic Signature & Timestamp Check
  const clientToken = req.headers['x-ftgm-token'];
  const clientTime = parseInt(req.headers['x-ftgm-time'], 10);

  if (!clientToken || !clientTime || !rawNum) {
    return sendTrapResponse();
  }

  // 20 Seconds Expiry Check
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - clientTime) > 20) {
    return sendTrapResponse();
  }

  // Signature Verification
  const secretKey = process.env.FTGM_SECRET || 'FTGM_RANA_FAISAL_998877_SUPER_SECRET';
  const payload = `${rawNum}:${clientTime}:${allowedOrigin}`;
  const expectedToken = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

  if (clientToken !== expectedToken) {
    return sendTrapResponse();
  }

  // --- Valid Request: Sirf SIM Database API Fetch Karein ---
  const api4Url = `https://ftgm-simdb-api.vercel.app/api/sim?num=${num92}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(api4Url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://ftgmdb.pages.dev',
        'Referer': 'https://ftgmdb.pages.dev/'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data4 = await response.json();

    const outputData = {
      status: "success",
      query: num92,
      sim_database: data4?.records ? data4.records.map(rec => ({
        name: rec.name || "Not Available",
        mobile: rec.mobile || "Not Available",
        cnic: rec.cnic || "Not Available",
        address: rec.address || "Not Available",
        network: rec.network || null
      })) : []
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(outputData, null, 2));

  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify({
      status: "success",
      query: num92,
      sim_database: []
    }, null, 2));
  }
}
