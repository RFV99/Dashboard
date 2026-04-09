exports.handler = async () => {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/cotizaciones/dolares");
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { return { statusCode: 200, headers: {"Access-Control-Allow-Origin":"*"}, body: text.slice(0,500) }; }
    // Return last 10 entries (most recent) and all unique "casa" values
    const casas = [...new Set(data.map(d => d.casa))];
    const last10 = data.slice(-10);
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ total: data.length, casas_unicas: casas, ultimos_10: last10 }),
    };
  } catch (e) {
    return { statusCode: 502, headers: {"Access-Control-Allow-Origin":"*"}, body: JSON.stringify({ error: e.message }) };
  }
};
