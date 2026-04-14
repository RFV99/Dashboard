exports.handler = async () => {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Returns: { fecha: "2026-04-08", valor: 756 }
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
