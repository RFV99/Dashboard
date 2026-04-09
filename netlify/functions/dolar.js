exports.handler = async () => {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/cotizaciones/dolares");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 29k registros históricos — tomar el más reciente por casa
    // Vienen ordenados por fecha asc, así que iteramos de atrás
    // y guardamos el primero (más reciente) que encontramos por casa
    const latest = {};
    for (let i = data.length - 1; i >= 0; i--) {
      const d = data[i];
      const casa = (d.casa || "").toLowerCase();
      if (!latest[casa]) {
        latest[casa] = { compra: d.compra, venta: d.venta, fecha: d.fecha };
      }
    }

    // Mapear a nombres claros
    // casas: "blue","oficial","bolsa","contadoconliqui","mayorista","cripto","tarjeta","solidario"
    const result = {
      blue:      latest["blue"]            || null,
      oficial:   latest["oficial"]         || null,
      mep:       latest["bolsa"]           || null,
      cable:     latest["contadoconliqui"] || null,
      mayorista: latest["mayorista"]       || null,
      cripto:    latest["cripto"]          || null,
      tarjeta:   latest["tarjeta"]         || null,
    };

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
