import { PLANTILLAS, buildMensaje } from "../lib/templates.js";
import { useWaStore, guestKey } from "../store.js";
import { postSendMessage } from "../lib/api.js";
import { BACKEND_URL } from "../config.js";

function canSend(estado) {
  return estado === "Pendiente" || estado === "Error";
}

function sendLabel(estado) {
  if (estado === "Enviando...") return "Enviando";
  if (estado === "Enviado") return "Enviado";
  if (estado === "Entregado") return "Entregado";
  if (estado === "Leído") return "Leído";
  if (estado === "Error") return "Reintentar";
  return "Enviar";
}

export default function GuestTable() {
  const guests = useWaStore((s) => s.guests);
  const setGuests = useWaStore((s) => s.setGuests);
  const patchGuest = useWaStore((s) => s.patchGuest);
  const setHttpAlert = useWaStore((s) => s.setHttpAlert);
  const pushToast = useWaStore((s) => s.pushToast);
  const waStatus = useWaStore((s) => s.waStatus);

  function update(i, patch) {
    const next = guests.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
    setGuests(next);
  }

  function onPlantilla(i, plantilla) {
    const g = guests[i];
    const mensaje = g.mensajeTouched ? g.mensaje : buildMensaje(plantilla, g);
    update(i, { plantilla, mensaje });
  }

  async function send(i) {
    const g = guests[i];
    if (!canSend(g.estado) || g.sending) return;
    if (!BACKEND_URL) {
      pushToast({ kind: "err", text: "Falta la URL de Render" });
      return;
    }
    if (waStatus !== "connected") {
      pushToast({ kind: "err", text: "Vinculá WhatsApp antes de enviar" });
      return;
    }
    patchGuest(g, { estado: "Enviando...", sending: true });
    setHttpAlert(null);
    try {
      const { res, body } = await postSendMessage({
        telefono: g.telefono,
        alias: g.alias || g.nombres,
        plantilla: g.plantilla,
        mensaje: g.mensaje
      });
      if (res.status === 503) {
        setHttpAlert("El envío falló con 503. El backend de WhatsApp no está listo.");
        patchGuest(g, { estado: "Error", sending: false });
        return;
      }
      if (!res.ok) {
        pushToast({ kind: "err", text: body?.error || `Error ${res.status}` });
        patchGuest(g, { estado: "Error", sending: false });
        return;
      }
      // El estado real llega por Socket.IO (message_status).
    } catch {
      patchGuest(g, { estado: "Error", sending: false });
      pushToast({ kind: "err", text: "No hubo respuesta al enviar" });
    }
  }

  if (!guests.length) {
    return (
      <p className="empty">
        No hay filas en la hoja <strong>Invitados</strong>. Agregá nombres, alias y teléfono (con indicativo, ej. 57300…).
        La primera vez que entres, el Script crea la pestaña vacía.
      </p>
    );
  }

  return (
    <div className="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Nombres</th>
            <th>Alias</th>
            <th>Teléfono</th>
            <th>Plantilla</th>
            <th>Texto msg</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g, i) => {
            const estado = g.estado || "Pendiente";
            const cls = estado.replace("...", "");
            return (
              <tr key={guestKey(g) + i}>
                <td>{g.nombres}</td>
                <td>{g.alias}</td>
                <td>{g.telefono}</td>
                <td>
                  <select value={g.plantilla || "tarjeta-boda"} onChange={(e) => onPlantilla(i, e.target.value)}>
                    {PLANTILLAS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </td>
                <td className="msg-cell">
                  <textarea
                    value={g.mensaje || ""}
                    onChange={(e) => update(i, { mensaje: e.target.value, mensajeTouched: true })}
                  />
                </td>
                <td className={`estado ${cls}`}>{estado}</td>
                <td>
                  <button
                    type="button"
                    className={`btn-send ${cls}`}
                    disabled={!canSend(estado) || g.sending}
                    onClick={() => send(i)}
                  >
                    {g.sending || estado === "Enviando..." ? <span className="spin" /> : null}
                    {sendLabel(estado)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
