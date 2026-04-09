exports.handler = async () => {
  try {
    // api.argentinadatos.com/v1/cotizaciones/dolares — endpoint correcto
    const res = await fetch("https://api.argentinadatos.com/v1/cotizaciones/dolares");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Devuelve: [{ moneda, casa, fecha, compra, venta }]
    // "casa" values: "blue", "oficial", "bolsa", "contadoconliquidacion", "cripto", "tarjeta", "mayorista"
    const result = {};
    if (Array.isArray(data)) {
      // Toma el registro más reciente por casa (vienen ordenados por fecha desc)
      const seen = new Set();
      for (const d of data) {
        const casa = (d.casa || "").toLowerCase();
        if (seen.has(casa)) continue;
        seen.add(casa);
        const entry = { compra: d.compra, venta: d.venta, fecha: d.fecha };
        if (casa === "blue")                      result.blue      = entry;
        if (casa === "oficial")                   result.oficial   = entry;
        if (casa === "bolsa")                     result.mep       = entry;
        if (casa === "contadoconliquidacion")     result.cable     = entry;
        if (casa === "cripto")                    result.cripto    = entry;
        if (casa === "tarjeta")                   result.tarjeta   = entry;
        if (casa === "mayorista")                 result.mayorista = entry;
      }
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
