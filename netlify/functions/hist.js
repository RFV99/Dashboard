// Proxy para serie histórica de data912
// data912 endpoint: GET /historical/bonds/{ticker}
// Returns: [{date, close, open, high, low, volume}, ...]
exports.handler = async (event) => {
  const { ticker } = event.queryStringParameters || {};
  if (!ticker) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "ticker requerido" }),
    };
  }
  try {
    const url = `https://data912.com/historical/bonds/${encodeURIComponent(ticker)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`data912 HTTP ${res.status} — ${url}`);
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
