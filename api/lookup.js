export default async function handler(req, res) {
  // 1. Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Extract number from query parameters
  const { number } = req.query;

  if (!number) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).send(
      JSON.stringify(
        {
          success: false,
          error: "Query parameter 'number' is required. Example: ?number=923104882921"
        },
        null,
        2
      )
    );
  }

  try {
    const targetUrl = `https://eyecon.faizankhichi.me/api/lookup?number=${encodeURIComponent(number)}`;

    // 3. Fetch with browser emulation headers to prevent 403 Forbidden
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://eyecon.faizankhichi.me/',
        'Origin': 'https://eyecon.faizankhichi.me',
        'Sec-Ch-Ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Upstream API returned status ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();

    // 4. Remove original brand fields
    delete data.brand;
    delete data.powered_by;

    // 5. Append your custom credits
    const customResponse = {
      ...data,
      developer: "Rana Faisal Ali (FTGM)",
      main_site: "ftgmtools.pages.dev",
      contact: "03104882921"
    };

    // 6. Return response formatted as pretty-printed JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(customResponse, null, 2));

  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: "Failed to fetch lookup data",
          details: error.message
        },
        null,
        2
      )
    );
  }
}
