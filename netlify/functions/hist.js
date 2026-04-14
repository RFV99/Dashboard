// Proxy para serie histórica OHLC de data912
// GET /api/hist?ticker=AL30D&limit=365
exports.handler = async (event) => {
  const { ticker, limit = 365 } = event.queryStringParameters || {};
  if (!ticker) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "ticker requerido" }),
    };
  }
  try {
    const lim = Math.min(parseInt(limit) || 365, 2000);
    // data912 OHLC endpoint
    const url = `https://data912.com/ohlc/${encodeURIComponent(ticker)}?period=1d&limit=${lim}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`data912 HTTP ${res.status}`);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
