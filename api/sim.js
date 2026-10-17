// Network mapping function based on Pakistani mobile prefixes
function detectNetwork(number) {
  if (!number) return 'Unknown';

  // Normalize string: remove spaces, dashes, or country code (+92 / 92)
  let cleanNumber = String(number).replace(/[\s\-\+]/g, '');
  if (cleanNumber.startsWith('92')) {
    cleanNumber = '0' + cleanNumber.slice(2);
  }

  // Ensure standard 11-digit format starting with 03
  const match = cleanNumber.match(/^(03\d{2})/);
  if (!match) return 'Unknown / Invalid Format';

  const prefix = match[1]; // e.g. "0303", "0312", etc.
  const code = parseInt(prefix.slice(2), 10); // Extract the two digits after 03

  // Special prefix check
  if (prefix === '0355') return 'SCOM';

  // Standard ranges
  if (code >= 0 && code <= 9) return 'Jazz / Mobilink';
  if (code >= 10 && code <= 19) return 'Zong';
  if (code >= 20 && code <= 29) return 'Warid / Jazz';
  if (code >= 30 && code <= 39) return 'Ufone';
  if (code >= 40 && code <= 49) return 'Telenor';

  return 'Other / Ported Network';
}

export default async function handler(req, res) {
  const allowedOrigin = 'https://ftgmdb.pages.dev';
  const origin = req.headers.origin || req.headers.referer || '';

  // Handle CORS preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Strict origin check: block unauthorized domains
  const isAllowed = origin.startsWith(allowedOrigin);

  if (!isAllowed) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(403).send(
      JSON.stringify(
        {
          success: false,
          error: 'Access Denied: Contact 03104882921 To Buy Api.',
          developer: 'FTGM (RANA FAISAL ALI)',
          website: 'https://ftgmtools.pages.dev',
          copyright: '© Rana Faisal Ali | FTGM HACKS'
        },
        null,
        2
      )
    );
  }

  // Set CORS headers for the allowed domain
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const { query } = req.query;

  if (!query) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(400).send(
      JSON.stringify(
        {
          success: false,
          error: "Missing required query parameter: 'query'",
          developer: 'FTGM (RANA FAISAL ALI)',
          website: 'https://ftgmtools.pages.dev',
          copyright: '© Rana Faisal Ali | FTGM HACKS'
        },
        null,
        2
      )
    );
  }

  try {
    const upstreamUrl = `https://simtrueok-4son.vercel.app/api/search?query=${encodeURIComponent(query)}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Upstream API returned status ${upstreamResponse.status}`);
    }

    const data = await upstreamResponse.json();

    // Strip original credits
    delete data.developer;
    delete data.group;

    // Detect network from query or from output fields
    const targetNumber = query || data.number || data.phone || data.mobile || '';
    const detectedNetwork = detectNetwork(targetNumber);

    // If upstream returns an array/object with nested records, tag network there too
    if (Array.isArray(data.data)) {
      data.data = data.data.map(item => ({
        ...item,
        network: detectNetwork(item.mobile || item.phone || item.number || query)
      }));
    } else if (typeof data.data === 'object' && data.data !== null) {
      data.data.network = detectNetwork(data.data.mobile || data.data.phone || data.data.number || query);
    }

    // Assemble final response with custom credits and detected network
    const finalData = {
      developer: 'FTGM (RANA FAISAL ALI)',
      website: 'https://ftgmtools.pages.dev',
      copyright: '© Rana Faisal Ali | FTGM HACKS',
      network: detectedNetwork,
      ...data
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(finalData, null, 2));
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: error.message || 'Internal Server Error',
          developer: 'FTGM (RANA FAISAL ALI)',
          website: 'https://ftgmtools.pages.dev',
          copyright: '© Rana Faisal Ali | FTGM HACKS'
        },
        null,
        2
      )
    );
  }
}
