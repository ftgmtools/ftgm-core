export default async function handler(req, res) {
  // Allow all origins (No restrictions)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accept query via ?query= or ?num=
  const queryParam = req.query.query || req.query.num;
  const { format } = req.query;

  if (!queryParam) {
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        status: 'error',
        message: 'Missing parameter: Please provide ?query= or ?num=',
        developer: 'Rana Faisal Ali',
        website: 'https://ftgmtools.pages.dev'
      });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>API Error - Missing Parameter</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; display: grid; place-items: center; height: 100vh; margin: 0; }
          .card { background: #111827; padding: 2rem; border-radius: 12px; border: 1px solid #1f2937; text-align: center; max-width: 420px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); }
          code { background: #1f2937; padding: 3px 8px; border-radius: 4px; color: #38bdf8; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color: #ef4444; margin-top: 0;">Missing Parameter</h2>
          <p style="color: #94a3b8;">Please provide a mobile number or CNIC.</p>
          <p>Example: <code>?query=03034992121</code></p>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const targetUrl = `https://simtrueok-ten.vercel.app/api/search?query=${encodeURIComponent(queryParam)}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const rawText = await response.text();
    let rawData;

    try {
      rawData = JSON.parse(rawText);
    } catch {
      throw new Error('Upstream provider returned an invalid response or HTML page');
    }

    // Strip out third-party credits and unwanted metadata
    const { developer: _dev, group: _grp, whatsapp: _wa, channel: _ch, ...cleanData } = rawData;

    // Attach your credits
    const finalData = {
      ...cleanData,
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    };

    // Return raw JSON when requested or when called via standard frontend fetch
    const acceptsHtml = req.headers['accept'] && req.headers['accept'].includes('text/html');
    if (format === 'json' || (!acceptsHtml && format !== 'html')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(finalData);
    }

    // Extract records list
    const records = Array.isArray(finalData.records)
      ? finalData.records
      : Array.isArray(finalData.data)
      ? finalData.data
      : (finalData.name || finalData.cnic) ? [finalData] : [];

    // Return styled HTML preview for direct browser visits
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Record Details - ${queryParam}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #0b0f19;
            color: #e2e8f0;
            padding: 2.5rem 1rem;
            display: flex;
            justify-content: center;
          }
          .container { width: 100%; max-width: 720px; }
          .header {
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title { font-size: 1.4rem; font-weight: 700; color: #f8fafc; }
          .badge {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          .card {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.25rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.25rem;
          }
          .item-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin-bottom: 0.35rem;
          }
          .item-value {
            font-size: 1rem;
            font-weight: 600;
            color: #f1f5f9;
            word-break: break-word;
          }
          .full-width { grid-column: 1 / -1; }
          pre {
            background: #030712;
            border: 1px solid #1f2937;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
            color: #38bdf8;
            font-family: ui-monospace, Menlo, Consolas, monospace;
            font-size: 0.85rem;
          }
          .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.85rem;
            color: #64748b;
            border-top: 1px solid #1f2937;
            padding-top: 1.25rem;
          }
          .footer a { color: #38bdf8; text-decoration: none; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Record Details</h1>
            <span class="badge">${finalData.status ? String(finalData.status).toUpperCase() : 'SUCCESS'}</span>
          </div>

          ${records.length > 0 ? records.map((rec) => `
            <div class="card">
              <div class="grid">
                <div>
                  <div class="item-label">Full Name</div>
                  <div class="item-value">${rec.name || rec.full_name || 'N/A'}</div>
                </div>
                <div>
                  <div class="item-label">Mobile Number</div>
                  <div class="item-value">${rec.mobile || rec.phone || queryParam}</div>
                </div>
                <div>
                  <div class="item-label">CNIC / ID</div>
                  <div class="item-value">${rec.cnic || rec.nic || 'N/A'}</div>
                </div>
                <div>
                  <div class="item-label">Network</div>
                  <div class="item-value">${rec.network || 'N/A'}</div>
                </div>
                <div class="full-width">
                  <div class="item-label">Address</div>
                  <div class="item-value">${rec.address || 'N/A'}</div>
                </div>
              </div>
            </div>
          `).join('') : `
            <div class="card">
              <p style="color: #94a3b8;">No records found for this query.</p>
            </div>
          `}

          <div class="card">
            <div class="item-label" style="margin-bottom: 0.75rem;">JSON Output</div>
            <pre><code>${JSON.stringify(finalData, null, 2)}</code></pre>
          </div>

          <div class="footer">
            <div>Developer: <strong>${finalData.developer}</strong></div>
            <div style="margin-top: 4px;">Website: <a href="${finalData.website}" target="_blank" rel="noopener">${finalData.website}</a></div>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlResponse);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Error processing request',
      developer: 'Rana Faisal Ali',
      website: 'https://ftgmtools.pages.dev'
    });
  }
}
