import { useState } from "react";
import { sha256hex, saveCreds, fetchInvitados } from "../lib/api.js";

export default function Login({ onOk }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const uh = await sha256hex(user.trim());
      const ph = await sha256hex(pass);
      const data = await fetchInvitados(uh, ph);
      if (Array.isArray(data.regalos) && data.invitados === undefined) {
        setErr("El puente de Google aún no tiene la lista de invitados. Pegá el Code.gs nuevo y creá una Nueva versión.");
        return;
      }
      if (!data.success) {
        setErr(data.error === "unauthorized" ? "Usuario o clave no coinciden." : (data.error || "No se pudo entrar."));
        return;
      }
      saveCreds({ uh, ph });
      onOk(data.invitados || []);
    } catch {
      setErr("No se pudo hablar con Google Sheets. Revisá la URL /exec.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card login-card">
      <label>Usuario</label>
      <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" />
      <label>Clave</label>
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="current-password"
      />
      <button type="button" onClick={submit} disabled={busy}>
        {busy ? "Entrando…" : "Entrar"}
      </button>
      {err ? <p className="err">{err}</p> : null}
    </div>
  );
}
