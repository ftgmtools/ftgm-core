export default async function handler(req, res) {
  // Get query parameter (supports ?number= or ?num=)
  const queryNum = req.query.number || req.query.num || '923277298973';
  const isDebug = req.query.debug === 'true' || req.query.debug === '1';

  // Define the 4 API endpoints
  const api1Url = `https://faisal-ali-truecaller.ftgmhacks.workers.dev/?key=ftgm2&number=${queryNum}`;
  const api2Url = `https://name-intelligence.ftgmhacks.workers.dev/?number=${queryNum}`;
  const api3Url = `https://alnayeem.top/nahid.php?number=${queryNum}`;
  const api4Url = `https://ftgm-simdb-api.vercel.app/api/sim?num=${queryNum}`;

  // Helper function to safely fetch and parse JSON without crashing
  async function fetchSafe(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      const text = await response.text();
      try {
        return { success: true, status: response.status, data: JSON.parse(text) };
      } catch (e) {
        return { success: false, status: response.status, error: 'Not JSON', raw: text.substring(0, 200) };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  try {
    // Fetch all 4 APIs concurrently
    const [res1, res2, res3, res4] = await Promise.all([
      fetchSafe(api1Url),
      fetchSafe(api2Url),
      fetchSafe(api3Url),
      fetchSafe(api4Url)
    ]);

    // If debug mode is enabled, return raw responses so you can inspect what each API returned
    if (isDebug) {
      return res.status(200).json({
        query: queryNum,
        debug_results: { api1: res1, api2: res2, api3: res3, api4: res4 }
      });
    }

    // Extract fields safely
    const data1 = res1.success ? res1.data : null;
    const data2 = res2.success ? res2.data : null;
    const data3 = res3.success ? res3.data : null;
    const data4 = res4.success ? res4.data : null;

    const truecallerName = data1?.data?.name || 'Not Available';
    
    const nameIntel = {
      fullName: data2?.fullName || 'Not Available',
      V1: data2?.V1 || 'Not Available',
      V2: data2?.V2 || 'Not Available',
      V3: data2?.V3 || 'Not Available'
    };

    const nahidName = data3?.result?.caller_info?.raw_data?.[0]?.name || data3?.caller_info?.raw_data?.[0]?.name || 'Not Available';
    const simRecords = data4?.records || [];

    // Check if JSON response was requested via header or ?format=json
    const accept = req.headers['accept'] || '';
    if (accept.includes('application/json') || req.query.format === 'json') {
      return res.status(200).json({
        query: queryNum,
        api1_truecaller: { name: truecallerName },
        api2_name_intelligence: nameIntel,
        api3_nahid: { name: nahidName },
        api4_sim_records: simRecords
      });
    }

    // Pretty HTML Preview response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-API Intelligence - ${queryNum}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen py-10 px-4">
    <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Header & Search Bar -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Multi-Source API Aggregator</h1>
                <p class="text-slate-400 text-sm mt-1">Showing results for: <span class="font-mono text-cyan-400 font-semibold">${queryNum}</span></p>
            </div>
            <form method="GET" action="" class="flex gap-2 w-full md:w-auto">
                <input type="text" name="number" value="${queryNum}" placeholder="Enter number..." class="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-64">
                <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-blue-600/20">Search</button>
            </form>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- 1. Truecaller API -->
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <h2 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> Truecaller API
                    </h2>
                    <span class="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">${res1.success ? 'Online' : 'Error'}</span>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-400 text-sm">
                    "name": "${truecallerName}"
                </div>
            </div>

            <!-- 2. Name Intelligence API -->
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <h2 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span> Name Intelligence
                    </h2>
                    <span class="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20">${res2.success ? 'Online' : 'Error'}</span>
                </div>
                <div class="space-y-2 font-mono text-xs">
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300">
                        <span class="text-purple-400">"fullName":</span> "${nameIntel.fullName}"
                    </div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300">
                        <span class="text-purple-400">"V1":</span> "${nameIntel.V1}"
                    </div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300">
                        <span class="text-purple-400">"V2":</span> "${nameIntel.V2}"
                    </div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300">
                        <span class="text-purple-400">"V3":</span> "${nameIntel.V3}"
                    </div>
                </div>
            </div>

            <!-- 3. Nahid Caller API -->
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <h2 class="font-semibold text-emerald-400 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Nahid Caller Info
                    </h2>
                    <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">${res3.success ? 'Online' : 'Error'}</span>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-400 text-sm">
                    "name": "${nahidName}"
                </div>
            </div>

            <!-- 4. SIM / CNIC Database API -->
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <h2 class="font-semibold text-amber-400 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> SIM Database
                    </h2>
                    <span class="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">${res4.success ? 'Online' : 'Error'}</span>
                </div>
                <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                    ${simRecords.length > 0 ? simRecords.map(rec => `
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-1 text-slate-300">
                            <div><span class="text-amber-400">"name":</span> "${rec.name || 'N/A'}"</div>
                            <div><span class="text-amber-400">"mobile":</span> "${rec.mobile || 'N/A'}"</div>
                            <div><span class="text-amber-400">"cnic":</span> "${rec.cnic || 'N/A'}"</div>
                            <div><span class="text-amber-400">"address":</span> "${rec.address || 'N/A'}"</div>
                            <div><span class="text-amber-400">"network":</span> ${rec.network ? `"${rec.network}"` : 'null'}</div>
                        </div>
                    `).join('') : '<div class="text-slate-500 text-xs italic p-2">No records found or unavailable.</div>'}
                </div>
            </div>

        </div>

        <div class="flex justify-between items-center text-xs text-slate-500 pt-4">
            <span>Unified Vercel Serverless Function</span>
            <a href="?number=${queryNum}&debug=true" class="text-blue-400 hover:underline">Check Debug Data &rarr;</a>
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
