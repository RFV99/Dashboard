exports.handler = async () => {
  try {
    const res = await fetch("https://data912.com/live/arg_lecaps");
    const data = await res.json();
    const sample = Array.isArray(data) ? data.slice(0, 5) : data;
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ total: Array.isArray(data) ? data.length : 'not array', sample }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
