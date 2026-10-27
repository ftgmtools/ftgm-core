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
    // 3. Fetch data from source API
    const targetUrl = `https://eyecon.faizankhichi.me/api/lookup?number=${encodeURIComponent(number)}`;
    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error(`Upstream API error: ${response.statusText}`);
    }

    const data = await response.json();

    // 4. Remove original brand fields
    delete data.brand;
    delete data.powered_by;

    // 5. Append custom credits
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
  
