/**
 * Developer: FTGM HACKS
 * Contact: 03104882921
 * API From: https://ftgmdb.pages.dev
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS from all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Configure JSON pretty formatting (2 spaces indentation)
app.set('json spaces', 2);

// Main API Route
app.get('/api/sim', async (req, res) => {
  const query = req.query.num || req.query.number || req.query.term;

  // Validate input parameter
  if (!query) {
    return res.status(400).send(
      JSON.stringify(
        {
          success: false,
          developer: "FTGM HACKS",
          contact: "03104882921",
          api_source: "https://ftgmdb.pages.dev",
          message: "Please provide a phone number or CNIC using ?num= or ?term="
        },
        null,
        2
      )
    );
  }

  try {
    const targetUrl = `https://simownerdetails.net/wp-admin/admin-ajax.php?action=fetch_sim_data&term=${encodeURIComponent(query)}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Upstream server returned status ${response.status}`);
    }

    const externalData = await response.json();

    // Custom Pretty Output Structure
    const output = {
      developer: "FTGM HACKS",
      contact: "03104882921",
      api_source: "https://ftgmdb.pages.dev",
      success: externalData.success || false,
      data: externalData.data || []
    };

    // Return pretty JSON string response
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(output, null, 2));

  } catch (error) {
    res.status(500).setHeader('Content-Type', 'application/json');
    return res.send(
      JSON.stringify(
        {
          success: false,
          developer: "FTGM HACKS",
          contact: "03104882921",
          api_source: "https://ftgmdb.pages.dev",
          error: "Failed to fetch details from target source.",
          details: error.message
        },
        null,
        2
      )
    );
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
