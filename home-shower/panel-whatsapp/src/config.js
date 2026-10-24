function readWin(key) {
  try {
    return String(window[key] || "").trim();
  } catch {
    return "";
  }
}

export const BACKEND_URL = (
  readWin("WS_RENDER_BACKEND_URL") ||
  import.meta.env.VITE_WS_RENDER_BACKEND_URL ||
  ""
).replace(/\/$/, "");

export const API_URL = (
  readWin("HS_API_URL") ||
  import.meta.env.VITE_HS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyT4YjFX5Eix0I2C0Z4jGSjeWzFE4y6AYcUCh2rpbxcynCLhyhfJvVS3nzr2xs-0AA1Tg/exec"
);

export const SITE_URL = (
  readWin("HS_SITE_URL") ||
  import.meta.env.VITE_HS_SITE_URL ||
  "https://home-shower-d-y-j.vercel.app"
).replace(/\/$/, "");
