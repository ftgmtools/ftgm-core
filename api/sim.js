export default async function handler(req, res) {
  // CORS اور JSON ہیڈرز
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { num } = req.query;

  // 1. اگر نمبر فراہم نہ کیا گیا ہو
  if (!num) {
    const errorResponse = {
      status: "error",
      message: "Please provide a 'num' parameter. Example: /api/sim?num=3034992121"
    };
    return res.status(400).send(JSON.stringify(errorResponse, null, 2));
  }

  // واٹس ایپ ری ڈائریکشن والا ہیلپر فنکشن
  const redirectToWhatsApp = () => {
    const customMsg = `سلام FTGM! اس نمبر (${num}) کا فریش ڈیٹا چاہیے، براہ کرم پرائس بتا دیں۔`;
    const whatsappUrl = `https://wa.me/923104882921?text=${encodeURIComponent(customMsg)}`;
    return res.redirect(302, whatsappUrl);
  };

  try {
    const upstreamUrl = `https://ft-simdb.ftshehryar10044.workers.dev/ft/api?num=${encodeURIComponent(num)}`;
    const response = await fetch(upstreamUrl);

    // 2. اگر API سے رسپانس 200 OK نہ آئے (مثلاً API ڈاؤن ہو یا 404/500 ایرر دے)
    if (!response.ok) {
      return redirectToWhatsApp();
    }

    const rawData = await response.json();

    const records = rawData.records || [];
    const recordCount = rawData.count || records.length;

    // 3. اگر API کا رسپانس success نہ ہو یا کوئی ریکارڈ نہ ملے (Data Find Na Ho)
    if (rawData.status !== "success" || recordCount === 0 || records.length === 0) {
      return redirectToWhatsApp();
    }

    // 4. اگر تمام معلومات ٹھیک ہوں اور ڈیٹا مل جائے (Data Show With Credits)
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
    // 5. اگر کوڈ میں یا نیٹ ورک کنیکشن میں کوئی بھی مسئلہ آئے تو بھی ڈائریکٹ واٹس ایپ پر ری ڈائریکٹ کر دو
    return redirectToWhatsApp();
  }
}
