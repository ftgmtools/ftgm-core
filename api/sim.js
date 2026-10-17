export default async function handler(req, res) {
  // Allow all origins (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).setHeader('Content-Type', 'application/json').send(
      JSON.stringify(
        {
          success: false,
          error: "Missing required query parameter: 'query'",
          developer: "FTGM (RANA FAISAL ALI)",
          website: "https://ftgmtools.pages.dev",
          copyright: "© Rana Faisal Ali | FTGM HACKS"
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

    // Remove unwanted developer/group credits if present
    delete data.developer;
    delete data.group;

    // Inject your custom credits
    const finalData = {
      developer: "FTGM (RANA FAISAL ALI)",
      website: "https://ftgmtools.pages.dev",
      copyright: "© Rana Faisal Ali | FTGM HACKS",
      ...data
    };

    // Return formatted / pretty-printed JSON (indentation = 2)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(finalData, null, 2));
  } catch (error) {
    return res.status(500).setHeader('Content-Type', 'application/json').send(
      JSON.stringify(
        {
          success: false,
          error: error.message || 'Internal Server Error',
          developer: "FTGM (RANA FAISAL ALI)",
          website: "https://ftgmtools.pages.dev",
          copyright: "© Rana Faisal Ali | FTGM HACKS"
        },
        null,
        2
      )
    );
  }
}
