import { create } from "zustand";

function guestKey(g) {
  return String(g.telefono || g.id || "").replace(/\D/g, "") || String(g.id);
}

function mapAck(ackValue, status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("error") || s === "failed") return "Error";
  if (s.includes("lei") || s.includes("read") || ackValue === 3) return "Leído";
  if (s.includes("entreg") || s.includes("deliver") || ackValue === 2) return "Entregado";
  if (s.includes("envi") || s.includes("sent") || ackValue === 1) return "Enviado";
  if (s.includes("enviando") || s.includes("pending") || ackValue === 0) return "Enviando...";
  if (status) return status;
  return "Enviado";
}

export const useWaStore = create((set, get) => ({
  guests: [],
  waStatus: "disconnected",
  qr: null,
  sessionLost: false,
  socketOk: true,
  toasts: [],
  httpAlert: null,

  setGuests: (guests) => set({ guests }),
  patchGuest: (match, patch) => {
    const key = String(match.telefono || "").replace(/\D/g, "") || String(match.alias || "");
    set({
      guests: get().guests.map((g) => {
        const gk = guestKey(g);
        const aliasOk = match.alias && g.alias === match.alias;
        if (gk === key || (aliasOk && !key)) return { ...g, ...patch };
        if (String(g.telefono) === String(match.telefono)) return { ...g, ...patch };
        return g;
      })
    });
  },
  setWaStatus: (waStatus) => set({ waStatus }),
  setQr: (qr) => set({ qr }),
  setSessionLost: (sessionLost) => set({ sessionLost }),
  setSocketOk: (socketOk) => set({ socketOk }),
  setHttpAlert: (httpAlert) => set({ httpAlert }),
  pushToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    set({ toasts: [...get().toasts, { id, ...toast }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, toast.ttl || 4200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  applyMessageStatus: ({ telefono, alias, status, ackValue }) => {
    const next = mapAck(ackValue, status);
    get().patchGuest({ telefono, alias }, { estado: next, sending: false });
    if (next === "Entregado" || next === "Leído") {
      get().pushToast({
        kind: "ok",
        text: `${alias || telefono}: ${next}`
      });
    }
    if (next === "Error") {
      get().pushToast({
        kind: "err",
        text: `No se pudo enviar a ${alias || telefono}`
      });
    }
  }
}));

export { guestKey };
