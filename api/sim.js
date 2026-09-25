export default async function handler(req, res) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { num } = req.query;

  // 1. Validation: Chek if number is provided
  if (!num) {
    const errorResponse = {
      status: "error",
      message: "Please provide a 'num' parameter. Example: /api/sim?num=3034992121"
    };
    return res.status(400).send(JSON.stringify(errorResponse, null, 2));
  }

  try {
    const upstreamUrl = `https://ft-simdb.ftshehryar10044.workers.dev/ft/api?num=${encodeURIComponent(num)}`;
    const response = await fetch(upstreamUrl);

    if (!response.ok) {
      const upstreamError = {
        status: "error",
        message: "Failed to fetch data from upstream API"
      };
      return res.status(response.status).send(JSON.stringify(upstreamError, null, 2));
    }

    const rawData = await response.json();

    const records = rawData.records || [];
    const recordCount = rawData.count || records.length;

    // 2. Direct WhatsApp Redirect if No Record Found (count === 0)
    if (recordCount === 0 || records.length === 0) {
      const customMsg = `سلام FTGM! اس نمبر (${num}) کا ڈیٹا اس API میں نہیں ملا، براہ کرم اس کی فریش ڈیٹیل / ڈیٹا نکال دیں۔`;
      const whatsappUrl = `https://wa.me/923104882921?text=${encodeURIComponent(customMsg)}`;
      
      // Perform 302 Direct Redirect
      return res.redirect(302, whatsappUrl);
    }

    // 3. Return Pretty JSON Response if Data Found
    const waText = encodeURIComponent(`سلام FTGM! مجھے اس نمبر (${num}) کی اور مزید تفصیلات / تصویر چاہیے۔`);
    const directWhatsappLink = `https://wa.me/923104882921?text=${waText}`;

    const filteredData = {
      status: rawData.status || "success",
      number: rawData.number || num,
      count: recordCount,
      records: records,
      developer: "FTGM (RANA FAISAL ALI)",
      website: "https://ftgmtools.pages.dev",
      copyright: "© Rana Faisal Ali | FTGM HACKS",
      services: "کسی بھی فریش نمبر کی ڈیٹیل، تصویر یا کسی بھی نمبر اور CNIC کا فریش ڈیٹا نکلوانے کے لیے ہم سے رابطہ کریں: 03104882921",
      direct_whatsapp: directWhatsappLink
    };

    return res.status(200).send(JSON.stringify(filteredData, null, 2));

  } catch (error) {
    const serverError = {
      status: "error",
      message: "Internal Server Error",
      error: error.message
    };
    return res.status(500).send(JSON.stringify(serverError, null, 2));
  }
}
