export default async function handler(req, res) {
  const allowedHost = 'ftgmdb.pages.dev';

  // Extract Origin and Referer
  const origin = req.headers['origin'] || '';
  const referer = req.headers['referer'] || '';

  const getHostname = (urlStr) => {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return '';
    }
  };

  const originHost = getHostname(origin);
  const refererHost = getHostname(referer);

  // Check if request is strictly from ftgmdb.pages.dev
  const isAuthorized = originHost === allowedHost || refererHost === allowedHost;

  // Preflight check
  if (req.method === 'OPTIONS') {
    if (isAuthorized) {
      res.setHeader('Access-Control-Allow-Origin', `https://${allowedHost}`);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      return res.status(200).end();
    }
    return res.status(403).end();
  }

  // Set response to Pretty-Printed JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Block unauthorized requests
  if (!isAuthorized) {
    const blockedResponse = {
      status: "error",
      message: "Dear Copy Paster you are Chutiya",
      developer: "Rana Faisal Ali",
      website: "https://ftgmtools.pages.dev"
    };
    return res.status(403).send(JSON.stringify(blockedResponse, null, 2));
  }

  // Set CORS for allowed domain
  res.setHeader('Access-Control-Allow-Origin', `https://${allowedHost}`);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Accept ?query= or ?num=
  const queryParam = req.query.query || req.query.num;

  if (!queryParam) {
    const errorResponse = {
      status: 'error',
      message: 'Please provide mobile number or CNIC (?query=03034992121)',
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    };
    return res.status(400).send(JSON.stringify(errorResponse, null, 2));
  }

  try {
    const targetUrl = `https://simtrueok-ten.vercel.app/api/search?query=${encodeURIComponent(queryParam)}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const rawText = await response.text();
    let rawData;

    try {
      rawData = JSON.parse(rawText);
    } catch {
      throw new Error('Upstream API server returned an invalid response');
    }

    // Filter unwanted fields & external credits
    const { 
      developer: _dev, 
      group: _grp, 
      whatsapp: _wa, 
      channel: _ch, 
      credit: _crd, 
      credits: _crds, 
      truecaller_data: _tc, 
      ...cleanData 
    } = rawData;

    // Attach verified credits
    const finalData = {
      ...cleanData,
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    };

    // Return Indented Pretty JSON
    return res.status(200).send(JSON.stringify(finalData, null, 2));

  } catch (err) {
    const errObj = {
      status: 'error',
      message: err.message || 'Error fetching details',
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    };
    return res.status(500).send(JSON.stringify(errObj, null, 2));
  }
}
