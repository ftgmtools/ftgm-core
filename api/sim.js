export default async function handler(req, res) {
  const allowedDomain = "https://ftgmdb.pages.dev";
  const origin = req.headers['origin'] || "";
  const referer = req.headers['referer'] || "";

  // 1. Domain Locking Check (Origin ya Referer ftgmdb.pages.dev hona chahiye)
  const isAllowedOrigin = origin === allowedDomain;
  const isAllowedReferer = referer.startsWith(allowedDomain);

  if (!isAllowedOrigin && !isAllowedReferer) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(403).send("Api is Down Or Error! Visit ftgmdb.pages.dev for The Real Website Of Sim Data.);
  }

  // Set CORS for allowed domain only
  res.setHeader('Access-Control-Allow-Origin', allowedDomain);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { num } = req.query;

  // 2. Validation: Check if number is provided
  if (!num) {
    const errorResponse = {
      status: "error",
      message: "Please provide a 'num' parameter. Example: /api/sim?num=3034992121"
    };
    return res.status(400).send(JSON.stringify(errorResponse, null, 2));
  }

  // WhatsApp Redirect Helper Function
  const redirectToWhatsApp = () => {
    const customMsg = `سلام FTGM! اس نمبر (${num}) کا فریش ڈیٹا چاہیے، براہ کرم پرائس بتا دیں۔`;
    const whatsappUrl = `https://wa.me/923104882921?text=${encodeURIComponent(customMsg)}`;
    return res.redirect(302, whatsappUrl);
  };

  try {
    const upstreamUrl = `https://ft-simdb.ftshehryar10044.workers.dev/ft/api?num=${encodeURIComponent(num)}`;
    const response = await fetch(upstreamUrl);

    // 3. Upstream Error Check
    if (!response.ok) {
      return redirectToWhatsApp();
    }

    const rawData = await response.json();

    const records = rawData.records || [];
    const recordCount = rawData.count || records.length;

    // 4. Data Not Found Check -> WhatsApp Redirect
    if (rawData.status !== "success" || recordCount === 0 || records.length === 0) {
      return redirectToWhatsApp();
    }

    // 5. Success Data Response
    const filteredData = {
      status: "success",
      number: rawData.number || num,
      count: recordCount,
      records: records,
      developer: "FTGM (RANA FAISAL ALI)",
      website: "https://ftgmtools.pages.dev",
      copyright: "© Rana Faisal Ali | FTGM HACKS",
      services: "\u200Fفریش نمبر کی ڈیٹیل کے لیے رابطہ کریں:\u200F 03104882921"
    };

    return res.status(200).send(JSON.stringify(filteredData, null, 2));

  } catch (error) {
    return redirectToWhatsApp();
  }
}
