/**
 * AI MindSET – registration counter
 * Paste this into Google Apps Script (Extensions → Apps Script in a Google Sheet),
 * then Deploy → New deployment → Web app → "Who has access: Anyone".
 * Every registration is saved as a row in the "Registrations" sheet.
 */
const SHEET_NAME = "Registrations";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(["Registered at", "Type", "Workshop ID", "Workshop", "Workshop date"]);
  return sh;
}

function counts_() {
  const rows = sheet_().getDataRange().getValues();
  const c = {};
  for (let i = 1; i < rows.length; i++) {
    const id = rows[i][2];
    if (id) c[id] = (c[id] || 0) + 1;
  }
  return c;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, counts: counts_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const id = String(b.workshopId || "").slice(0, 60);
    if (!id) return json_({ ok: false, error: "missing workshop" });
    sheet_().appendRow([new Date(), String(b.type || "workshop").slice(0, 20), id, String(b.title || "").slice(0, 120), String(b.date || "").slice(0, 40)]);
    return json_({ ok: true, counts: counts_() });
  } finally {
    lock.releaseLock();
  }
}
