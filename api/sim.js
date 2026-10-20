export default async function handler(req, res) {
  // CORS Headers (Allowed from all origins)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accept ?query= or ?num=
  const queryParam = req.query.query || req.query.num;

  if (!queryParam) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

    // یہاں سے truecaller_data اور دیگر غیر ضروری فیلڈز فلٹر ہو جائیں گی
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

    // آپ کے اپنے کریڈٹس
    const finalData = {
      ...cleanData,
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    };

    // Pretty-Printed JSON (2-space indented)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(finalData, null, 2));

  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const errObj = {
      status: 'error',
      message: err.message || 'Error fetching details',
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    };
    return res.status(500).send(JSON.stringify(errObj, null, 2));
  }
}
