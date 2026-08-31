/**
 * Home Shower · Hogar Daniel y Jimena
 * Pega este archivo en Extensiones → Apps Script de tu Google Sheet.
 *
 * Hoja requerida: "Regalos"
 * Encabezados (fila 1): id | articulo | categoria | detalle | versiculo | cita | reservadoPor
 *
 * Publicar: Implementar → Nueva implementación → Aplicación web
 *   Ejecutar como: Yo
 *   Quién tiene acceso: Cualquier persona
 * Copia la URL y pégala en index.html → CONFIG.apiUrl
 */

function doGet(e) {
  e = e || { parameter: {} };
  const action = String(e.parameter.action || "");
  const id = String(e.parameter.id || "").trim();
  const nombre = String(e.parameter.nombre || "").trim();

  try {
    if (action === "reserve") return reserve_(id, nombre);
    if (action === "release") return release_(id);
    return list_();
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

function list_() {
  const rows = readRows_();
  return json_({ regalos: rows });
}

function reserve_(id, nombre) {
  if (!id || !nombre) return json_({ success: false, error: "missing" });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const found = findRow_(id);
    if (!found) return json_({ success: false, error: "not_found" });

    const current = String(found.sheet.getRange(found.row, found.colReservado).getValue() || "").trim();
    if (current) {
      return json_({ success: false, error: "taken", reservadoPor: current });
    }

    found.sheet.getRange(found.row, found.colReservado).setValue(nombre);
    return json_({ success: true });
  } finally {
    lock.releaseLock();
  }
}

function release_(id) {
  if (!id) return json_({ success: false, error: "missing" });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const found = findRow_(id);
    if (!found) return json_({ success: false, error: "not_found" });
    found.sheet.getRange(found.row, found.colReservado).setValue("");
    return json_({ success: true });
  } finally {
    lock.releaseLock();
  }
}

function readRows_() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (h) {
    return String(h).trim();
  });
  const idx = function (name) {
    return headers.indexOf(name);
  };

  const rows = [];
  for (var i = 1; i < values.length; i++) {
    var rec = {};
    headers.forEach(function (h, col) {
      rec[h] = values[i][col];
    });
    if (!rec.id) continue;
    rows.push({
      id: String(rec.id),
      articulo: rec.articulo || "",
      categoria: rec.categoria || "",
      detalle: rec.detalle || "",
      versiculo: rec.versiculo || "",
      cita: rec.cita || "",
      reservadoPor: rec.reservadoPor ? String(rec.reservadoPor).trim() : "",
      icon: rec.icon || ""
    });
  }
  return rows;
}

function findRow_(id) {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(function (h) {
    return String(h).trim();
  });
  const colId = headers.indexOf("id") + 1;
  const colReservado = headers.indexOf("reservadoPor") + 1;
  if (!colId || !colReservado) throw new Error("Faltan columnas id o reservadoPor");

  for (var r = 2; r <= values.length; r++) {
    if (String(values[r - 1][colId - 1]) === String(id)) {
      return { sheet: sh, row: r, colReservado: colReservado };
    }
  }
  return null;
}

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Regalos");
  if (!sh) throw new Error('No existe la hoja "Regalos"');
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
