"""
proxy.py — Servidor proxy para data912, IOL y ArgentinaDatos
Correr: python proxy.py
Requiere: pip install flask flask-cors requests
Variables de entorno opcionales (solo para IOL):
  IOL_USER=tu@mail.com
  IOL_PASS=tupassword
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests, os, time, logging

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app)

IOL_USER = os.getenv("IOL_USER", "")
IOL_PASS = os.getenv("IOL_PASS", "")
iol_token = {"access": None, "refresh": None, "expires_at": 0}

# ─── IOL Auth ────────────────────────────────────────────────────────────────

def get_iol_token():
    r = requests.post("https://api.invertironline.com/token", data={
        "grant_type": "password",
        "username": IOL_USER,
        "password": IOL_PASS,
        "scope": ""
    }, timeout=10)
    d = r.json()
    iol_token["access"]     = d.get("access_token")
    iol_token["refresh"]    = d.get("refresh_token")
    iol_token["expires_at"] = time.time() + d.get("expires_in", 3600) - 60
    return iol_token["access"]

def refresh_iol():
    try:
        r = requests.post("https://api.invertironline.com/token", data={
            "grant_type": "refresh_token",
            "refresh_token": iol_token["refresh"]
        }, timeout=10)
        d = r.json()
        iol_token["access"]     = d.get("access_token")
        iol_token["refresh"]    = d.get("refresh_token")
        iol_token["expires_at"] = time.time() + d.get("expires_in", 3600) - 60
        return iol_token["access"]
    except Exception:
        return get_iol_token()

def iol_headers():
    if not iol_token["access"] or time.time() > iol_token["expires_at"]:
        get_iol_token() if not iol_token["refresh"] else refresh_iol()
    return {"Authorization": f"Bearer {iol_token['access']}"}

# ─── data912 endpoints ───────────────────────────────────────────────────────

@app.route("/api/bonds")
def bonds():
    """Bonos soberanos USD — Bonares + Globales + Bopreales"""
    try:
        r = requests.get("https://data912.com/live/arg_bonds", timeout=12)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/lecaps")
def lecaps():
    """LECAPS y BONCAPS en ARS"""
    try:
        r = requests.get("https://data912.com/live/arg_lecaps", timeout=12)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/corp")
def corp():
    """ONs corporativas USD"""
    try:
        r = requests.get("https://data912.com/live/arg_corp", timeout=12)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

# ─── ArgentinaDatos endpoints ────────────────────────────────────────────────

@app.route("/api/dolar")
def dolar():
    """Tipos de cambio: blue, mep, ccl, oficial, cripto"""
    try:
        r = requests.get("https://argentinadatos.com/api/v1/finanzas/dolar", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/riesgo_pais")
def riesgo_pais():
    try:
        r = requests.get("https://argentinadatos.com/api/v1/finanzas/indices/riesgo-pais/ultimo", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

# ─── IOL endpoints ───────────────────────────────────────────────────────────

@app.route("/api/iol/bonos")
def iol_bonos():
    if not IOL_USER:
        return jsonify({"error": "IOL_USER no configurado"}), 400
    try:
        url = "https://api.invertironline.com/api/v2/Cotizaciones/bonos/argentina/Todos"
        r = requests.get(url, headers=iol_headers(), timeout=12)
        if r.status_code == 401:
            refresh_iol()
            r = requests.get(url, headers=iol_headers(), timeout=12)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/iol/letras")
def iol_letras():
    if not IOL_USER:
        return jsonify({"error": "IOL_USER no configurado"}), 400
    try:
        url = "https://api.invertironline.com/api/v2/Cotizaciones/letras/argentina/Todos"
        r = requests.get(url, headers=iol_headers(), timeout=12)
        if r.status_code == 401:
            refresh_iol()
            r = requests.get(url, headers=iol_headers(), timeout=12)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

# ─── Health check ────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": time.time()})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"\n✓ Proxy corriendo en http://localhost:{port}")
    print("  Endpoints: /api/bonds  /api/lecaps  /api/dolar  /api/riesgo_pais")
    print("  IOL activo:", bool(IOL_USER))
    app.run(host="0.0.0.0", port=port, debug=False)
