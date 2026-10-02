import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import WhatsAppConnect from "./components/WhatsAppConnect.jsx";
import GuestTable from "./components/GuestTable.jsx";
import { useSocket } from "./hooks/useSocket.js";
import { useWaStore } from "./store.js";
import { BACKEND_URL } from "./config.js";
import { loadCreds, clearCreds, fetchInvitados } from "./lib/api.js";
import { buildMensaje } from "./lib/templates.js";

export default function App() {
  const [authed, setAuthed] = useState(!!loadCreds());
  const setGuests = useWaStore((s) => s.setGuests);
  const sessionLost = useWaStore((s) => s.sessionLost);
  const socketOk = useWaStore((s) => s.socketOk);
  const httpAlert = useWaStore((s) => s.httpAlert);
  const setHttpAlert = useWaStore((s) => s.setHttpAlert);
  const setSessionLost = useWaStore((s) => s.setSessionLost);
  const toasts = useWaStore((s) => s.toasts);
  const { requestQr } = useSocket(BACKEND_URL);

  useEffect(() => {
    const c = loadCreds();
    if (!c) return;
    fetchInvitados(c.uh, c.ph)
      .then((data) => {
        if (!data.success) {
          clearCreds();
          setAuthed(false);
          return;
        }
        hydrate(data.invitados || []);
        setAuthed(true);
      })
      .catch(() => {
        clearCreds();
        setAuthed(false);
      });
  }, []);

  function hydrate(rows) {
    setGuests(
      rows.map((r) => ({
        ...r,
        plantilla: r.plantilla || "tarjeta-boda",
        mensaje: r.mensaje || buildMensaje(r.plantilla || "tarjeta-boda", r),
        estado: r.estado || "Pendiente",
        sending: false
      }))
    );
  }

  async function reload() {
    const c = loadCreds();
    if (!c) return;
    const data = await fetchInvitados(c.uh, c.ph);
    if (data.success) hydrate(data.invitados || []);
  }

  function onBannerClick() {
    setSessionLost(false);
    requestQr();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authed) {
    return (
      <div className="wrap">
        <h1>Envíos WhatsApp</h1>
        <p className="lead">Misma clave de la bitácora. Esta página no se comparte con invitados.</p>
        <Login onOk={(rows) => { hydrate(rows); setAuthed(true); }} />
      </div>
    );
  }

  return (
    <div className="wrap">
      <h1>Envíos WhatsApp</h1>
      <p className="lead">Invitaciones personalizadas · Jimena &amp; Daniel</p>

      {sessionLost ? (
        <div className="banner lost" onClick={onBannerClick} role="alert">
          ⚠️ La sesión de WhatsApp se ha perdido. Haz clic aquí para volver a vincular tu número.
        </div>
      ) : null}
      {!socketOk ? (
        <div className="banner socket">El socket se desconectó. Reintentando solo…</div>
      ) : null}
      {httpAlert ? (
        <div className="banner warn" onClick={() => setHttpAlert(null)}>
          {httpAlert}
        </div>
      ) : null}

      <div className="toolbar">
        <button type="button" className="ghost" onClick={reload}>↻ Recargar lista</button>
        <a className="ghost" href="/admin" style={{ display: "inline-block", padding: "10px 16px", borderRadius: 12, border: "1.5px solid var(--blush)", textDecoration: "none", color: "inherit", fontWeight: 600 }}>Bitácora</a>
        <button
          type="button"
          className="ghost"
          onClick={() => { clearCreds(); setAuthed(false); }}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid-two">
        <WhatsAppConnect onRequestQr={requestQr} />
        <div className="card">
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontWeight: 500, margin: "0 0 8px" }}>Cómo enviar</h2>
          <ol style={{ color: "var(--taupe)", paddingLeft: 18, margin: 0, lineHeight: 1.55 }}>
            <li>Vinculá WhatsApp y escaneá el QR.</li>
            <li>Elegí la plantilla (la tarjeta HTML es la que diseñamos).</li>
            <li>Revisá el texto y dale a Enviar. El botón se bloquea hasta que llegue el estado.</li>
          </ol>
          {!BACKEND_URL ? (
            <p className="err">Falta pegar la URL de Render en <code>envios/backend.js</code> (<code>WS_RENDER_BACKEND_URL</code>).</p>
          ) : (
            <p className="empty" style={{ marginTop: 12 }}>Backend: {BACKEND_URL}</p>
          )}
        </div>
      </div>

      <GuestTable />

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind || ""}`}>{t.text}</div>
        ))}
      </div>
    </div>
  );
}
