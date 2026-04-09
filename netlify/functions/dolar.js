exports.handler = async () => {
  try {
    const res = await fetch("https://argentinadatos.com/api/v1/finanzas/dolar");
    const data = await res.json();

    // argentinadatos returns array like:
    // [{ "casa": "blue", "nombre": "Blue", "compra": 1265, "venta": 1275, "fechaActualizacion": "..." }, ...]
    const result = {};
    if (Array.isArray(data)) {
      for (const d of data) {
        const casa = (d.casa || d.nombre || "").toLowerCase();
        if (casa.includes("blue"))    result.blue   = { compra: d.compra, venta: d.venta };
        if (casa.includes("oficial")) result.oficial = { compra: d.compra, venta: d.venta };
        if (casa.includes("bolsa") || casa === "mep") result.mep = { compra: d.compra, venta: d.venta };
        if (casa.includes("contado") || casa.includes("cable") || casa.includes("ccl")) result.cable = { compra: d.compra, venta: d.venta };
        if (casa.includes("cripto"))  result.cripto  = { compra: d.compra, venta: d.venta };
        if (casa.includes("tarjeta")) result.tarjeta = { compra: d.compra, venta: d.venta };
      }
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ raw: data, parsed: result }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
