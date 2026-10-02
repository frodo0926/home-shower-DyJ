import { API_URL, BACKEND_URL } from "../config.js";

export async function sha256hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function loadCreds() {
  try {
    return JSON.parse(sessionStorage.getItem("hs-admin") || "null");
  } catch {
    return null;
  }
}

export function saveCreds(creds) {
  sessionStorage.setItem("hs-admin", JSON.stringify(creds));
}

export function clearCreds() {
  sessionStorage.removeItem("hs-admin");
}

export async function fetchInvitados(uh, ph) {
  const url = new URL(API_URL);
  url.searchParams.set("action", "invitados");
  url.searchParams.set("uh", uh);
  url.searchParams.set("ph", ph);
  const res = await fetch(url.toString());
  const data = await res.json();
  return data;
}

export async function postConnect() {
  const res = await fetch(`${BACKEND_URL}/api/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  return res;
}

export async function postSendMessage(payload) {
  const res = await fetch(`${BACKEND_URL}/api/send-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}
