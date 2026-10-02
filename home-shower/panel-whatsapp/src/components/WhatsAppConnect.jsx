import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useWaStore } from "../store.js";
import { postConnect } from "../lib/api.js";
import { BACKEND_URL } from "../config.js";

const LABELS = {
  disconnected: "Desconectado",
  waiting_scan: "Esperando escaneo",
  connected: "Conectado"
};

export default function WhatsAppConnect({ onRequestQr }) {
  const waStatus = useWaStore((s) => s.waStatus);
  const qr = useWaStore((s) => s.qr);
  const setWaStatus = useWaStore((s) => s.setWaStatus);
  const setHttpAlert = useWaStore((s) => s.setHttpAlert);
  const pushToast = useWaStore((s) => s.pushToast);
  const [qrImg, setQrImg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!qr) {
      setQrImg("");
      return undefined;
    }
    if (String(qr).startsWith("data:image")) {
      setQrImg(qr);
      return undefined;
    }
    QRCode.toDataURL(String(qr), { width: 440, margin: 1 })
      .then((url) => { if (alive) setQrImg(url); })
      .catch(() => { if (alive) setQrImg(""); });
    return () => { alive = false; };
  }, [qr]);

  async function vincular() {
    if (!BACKEND_URL) {
      pushToast({ kind: "err", text: "Falta WS_RENDER_BACKEND_URL" });
      return;
    }
    setBusy(true);
    setHttpAlert(null);
    try {
      const res = await postConnect();
      if (res.status === 503) {
        setHttpAlert("El backend no pudo arrancar WhatsApp (503). Probá de nuevo en un momento.");
        return;
      }
      if (!res.ok) {
        pushToast({ kind: "err", text: `No se pudo vincular (${res.status})` });
        return;
      }
      setWaStatus("waiting_scan");
      onRequestQr?.();
    } catch {
      pushToast({ kind: "err", text: "No hay respuesta de Render. ¿Está despierto el servicio?" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontWeight: 500, margin: "0 0 8px" }}>WhatsApp</h2>
      <p className="lead" style={{ marginBottom: 12 }}>
        Estado: <span className={`status-pill ${waStatus}`}>{LABELS[waStatus] || waStatus}</span>
      </p>
      <button type="button" onClick={vincular} disabled={busy || waStatus === "connected"}>
        {busy ? "Vinculando…" : "Vincular WhatsApp"}
      </button>
      <div className="qr-box" style={{ marginTop: 14 }}>
        {qrImg ? (
          <img src={qrImg} alt="Código QR de WhatsApp" />
        ) : (
          <span className="empty">
            {waStatus === "connected" ? "Sesión lista. Ya podés enviar." : "Acá aparece el QR."}
          </span>
        )}
      </div>
    </div>
  );
}
