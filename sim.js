export default async function handler(req, res) {
  const allowedDomain = "https://ftgmdb.pages.dev";

  // Check request Origin and Referer headers
  const origin = req.headers["origin"] || "";
  const referer = req.headers["referer"] || "";

  // Verify if request originates from the allowed domain
  const isAllowedDomain =
    origin.startsWith(allowedDomain) || referer.startsWith(allowedDomain);

  // Set CORS header to only allow authorized domain
  res.setHeader("Access-Control-Allow-Origin", allowedDomain);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Developer Branding Structure
  const customDeveloperInfo = {
    Developer: "RANA FAISAL ALI",
    website: "https://ftgmdb.pages.dev",
  };

  // Helper function to send Pretty Printed JSON
  const sendPrettyJson = (statusCode, payload) => {
    return res.status(statusCode).send(JSON.stringify(payload, null, 2));
  };

  // IF domain match FAILS: Return restricted fallback response
  if (!isAllowedDomain) {
    return sendPrettyJson(200, {
      ok: true,
      cached: "yes",
      data: [
        {
          nbr: "03104882921",
          nam: "FTGM HACKS",
          cni: "Contact On Uper Number For Data",
          adr: 'Visit pak-digital.store For More &quot;',
        },
      ],
      contact_developer: customDeveloperInfo,
    });
  }

  // Extract search query parameter
  const { search } = req.query;

  if (!search) {
    return sendPrettyJson(400, {
      ok: false,
      message: "Search query parameter is required (e.g. ?search=03034992121)",
    });
  }

  try {
    // Fetch data from target API
    const targetUrl = `https://simdata.faizankhichi.me/?search=${encodeURIComponent(search)}`;
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return sendPrettyJson(response.status, {
        ok: false,
        message: "Failed to fetch data from the upstream service.",
      });
    }

    const data = await response.json();

    // Reconstruct response with fetched data and custom developer branding
    const customResponse = {
      ok: data.ok ?? true,
      cached: data.cached ?? "no",
      data: data.data || [],
      contact_developer: customDeveloperInfo,
    };

    return sendPrettyJson(200, customResponse);
  } catch (error) {
    return sendPrettyJson(500, {
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
