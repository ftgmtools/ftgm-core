export default async function handler(req, res) {
  // 1. Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Extract the number query parameter
  const { number } = req.query;

  if (!number) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(400).send(
      JSON.stringify(
        {
          error: "Missing required 'number' query parameter.",
          developer: "Rana Faisal Ali (FTGM)",
          main_site: "ftgmtools.pages.dev",
          contact: "03104882921"
        },
        null,
        2
      )
    );
  }

  try {
    // 3. Fetch data from the target API
    const response = await fetch(`https://eyecon.faizankhichi.me/api/lookup?number=${encodeURIComponent(number)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CustomAPI/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Target API returned status: ${response.status}`);
    }

    const data = await response.json();

    // 4. Remove original branding fields
    delete data.brand;
    delete data.powered_by;

    // 5. Add your custom credits
    const customResponse = {
      ...data,
      developer: "Rana Faisal Ali (FTGM)",
      main_site: "ftgmtools.pages.dev",
      contact: "03104882921"
    };

    // 6. Return response formatted with indentation (Pretty Print)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(customResponse, null, 2));

  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).send(
      JSON.stringify(
        {
          error: "Failed to fetch data from the provider API.",
          details: error.message,
          developer: "Rana Faisal Ali (FTGM)",
          main_site: "ftgmtools.pages.dev",
          contact: "03104882921"
        },
        null,
        2
      )
    );
  }
}
