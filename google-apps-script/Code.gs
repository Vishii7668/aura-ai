/**
 * Aura AI – website backend (Google Apps Script, free)
 *
 * What it does
 *  • Saves every workshop registration in the "Registrations" sheet
 *  • Sends the participant an automatic confirmation email (from your Gmail)
 *  • Sends YOU (the founder) a notification for every registration and certificate download
 *  • Lets a certificate be downloaded only by people who registered for that workshop
 *  • Logs website visits and emails you one daily summary (no inbox flooding)
 *
 * Setup: see README → "Registrations, emails and notifications".
 */

const FOUNDER_EMAIL = "visheshmaurya82@gmail.com";   // where notifications go
const BRAND = "Aura AI";
const SITE_URL = "https://vishii7668.github.io/aura-ai/"; // change if your link is different
const NOTIFY_ON_EVERY_VISIT = false;  // true = an email for every visit (not recommended)

/* ---------- sheets ---------- */
function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) { sh.appendRow(header); sh.setFrozenRows(1); sh.getRange(1, 1, 1, header.length).setFontWeight("bold"); }
  return sh;
}
const REG_HEADER = ["Registered at", "Registration ID", "Name", "Email", "Phone", "Company / team", "Workshop ID", "Workshop", "Workshop date", "Time", "Mode", "Attended (Y/N)"];
const regs_ = () => sheet_("Registrations", REG_HEADER);
const certs_ = () => sheet_("Certificates", ["Downloaded at", "Name", "Email", "Workshop", "Registration ID", "Certificate ID"]);
const visits_ = () => sheet_("Visits", ["Visited at", "Page", "Referrer", "Device"]);
const subs_ = () => sheet_("Tips subscribers", ["Subscribed at", "Email"]);

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
const clean_ = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
const emailOk_ = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function counts_() {
  const rows = regs_().getDataRange().getValues(), c = {};
  for (let i = 1; i < rows.length; i++) { const id = rows[i][6]; if (id) c[id] = (c[id] || 0) + 1; }
  return c;
}
function findReg_(email, workshopId) {
  const rows = regs_().getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][3]).toLowerCase() === email && (!workshopId || rows[i][6] === workshopId)) {
      return { row: i + 1, id: rows[i][1], name: rows[i][2], workshop: rows[i][7], date: rows[i][8], attended: String(rows[i][11] || "").toUpperCase() };
    }
  }
  return null;
}

/* ---------- emails ---------- */
function shell_(title, body) {
  return '<div style="background:#0b0a10;padding:32px 0;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto;background:#141218;border:1px solid #2c2a22;border-radius:18px;overflow:hidden">' +
    '<div style="padding:22px 28px;border-bottom:1px solid #2c2a22"><span style="font-size:22px;font-weight:800;color:#F7F2DC">Aura</span>' +
    '<span style="font-size:16px;font-weight:800;color:#000;background:#FFE58A;border-radius:6px;padding:2px 7px;margin-left:4px">AI</span></div>' +
    '<div style="padding:28px;color:#E4DEC6;font-size:15px;line-height:1.6"><h1 style="margin:0 0 14px;font-size:24px;color:#F7F2DC">' + title + '</h1>' + body + '</div>' +
    '<div style="padding:18px 28px;border-top:1px solid #2c2a22;color:#8F8A78;font-size:12px">' + BRAND + ' · Level up your work with AI ✦<br><a href="' + SITE_URL + '" style="color:#FFE58A">' + SITE_URL + '</a></div>' +
    '</div></div>';
}
function row_(k, v, hi) {
  return '<tr><td style="padding:10px 14px;color:#8F8A78">' + k + '</td><td style="padding:10px 14px;' + (hi ? 'color:#FFE58A;font-weight:700' : 'color:#F7F2DC') + '">' + v + '</td></tr>';
}
function sendConfirmation_(r) {
  const body = '<p>Hi ' + r.name.split(" ")[0] + ' 👋</p>' +
    '<p>You\'re registered! We can\'t wait to see you at the workshop.</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:18px 0;background:#0b0a10;border-radius:12px">' +
    row_("Workshop", r.title, true) + row_("Date", r.date) + row_("Time", r.time || "Shared before the session") + row_("Mode", r.mode || "Online") + row_("Registration ID", r.id) +
    '</table>' +
    '<p><b style="color:#F7F2DC">Bring one real task from your work</b> – a report, a PPT or an email you write every week. You\'ll do it with AI during the session.</p>' +
    '<p>After the workshop, download your certificate on the website using <b>this same email address</b>.</p>' +
    '<p style="margin-top:22px"><a href="' + SITE_URL + '#certificate" style="background:#FFE58A;color:#000;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:999px;display:inline-block">Get your certificate</a></p>' +
    '<p style="margin-top:22px">See you soon,<br>Team ' + BRAND + '</p>';
  MailApp.sendEmail({ to: r.email, subject: "You're in! " + r.title + " – " + BRAND, htmlBody: shell_("Registration confirmed ✦", body), name: BRAND, replyTo: FOUNDER_EMAIL });
}
function notifyFounder_(subject, lines) {
  const body = '<table style="border-collapse:collapse">' + lines.map(function (l) { return row_(l[0], l[1]); }).join("") + '</table>';
  MailApp.sendEmail({ to: FOUNDER_EMAIL, subject: "[" + BRAND + "] " + subject, htmlBody: shell_(subject, body), name: BRAND + " website" });
}

/* ---------- web endpoints ---------- */
function doGet() { return json_({ ok: true, counts: counts_() }); }

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = b.action || "register";
    const now = new Date();

    if (action === "register") {
      const r = { name: clean_(b.name, 80), email: clean_(b.email, 120).toLowerCase(), phone: clean_(b.phone, 30), company: clean_(b.company, 80),
        wid: clean_(b.workshopId, 60), title: clean_(b.title, 120), date: clean_(b.date, 40), time: clean_(b.time, 40), mode: clean_(b.mode, 40) };
      if (!r.name || !emailOk_(r.email) || !r.wid) return json_({ ok: false, error: "Please enter your name and a valid email." });
      const existing = findReg_(r.email, r.wid);
      if (existing) return json_({ ok: true, already: true, id: existing.id, counts: counts_() });
      r.id = "AURA-" + Utilities.getUuid().slice(0, 6).toUpperCase();
      regs_().appendRow([now, r.id, r.name, r.email, r.phone, r.company, r.wid, r.title, r.date, r.time, r.mode, ""]);
      try { sendConfirmation_(r); } catch (err) {}
      try { notifyFounder_("New registration 🎉", [["Name", r.name], ["Email", r.email], ["Phone", r.phone || "—"], ["Company", r.company || "—"], ["Workshop", r.title + " · " + r.date], ["Registration ID", r.id]]); } catch (err) {}
      return json_({ ok: true, id: r.id, counts: counts_() });
    }

    if (action === "verify") { // certificate check
      const email = clean_(b.email, 120).toLowerCase(), wid = clean_(b.workshopId, 60);
      if (!emailOk_(email)) return json_({ ok: false, error: "Enter the email you used to register." });
      const reg = findReg_(email, wid);
      if (!reg) return json_({ ok: false, error: "We couldn't find a registration for this email and workshop. Please register for the workshop first." });
      if (reg.attended === "N") return json_({ ok: false, error: "Our records show you didn't attend this workshop. Join the next session to get your certificate." });
      const certId = clean_(b.certId, 40);
      certs_().appendRow([now, reg.name, email, reg.workshop, reg.id, certId]);
      try { notifyFounder_("Certificate downloaded 🎓", [["Name", reg.name], ["Email", email], ["Workshop", reg.workshop], ["Registration ID", reg.id], ["Certificate ID", certId || "—"]]); } catch (err) {}
      return json_({ ok: true, name: reg.name, id: reg.id });
    }

    if (action === "visit") {
      visits_().appendRow([now, clean_(b.page, 200), clean_(b.ref, 200), clean_(b.device, 40)]);
      if (NOTIFY_ON_EVERY_VISIT) { try { notifyFounder_("New visitor 👀", [["Page", clean_(b.page, 200)], ["From", clean_(b.ref, 200) || "Direct"], ["Device", clean_(b.device, 40)]]); } catch (err) {} }
      return json_({ ok: true });
    }

    if (action === "subscribe") {
      const email = clean_(b.email, 120).toLowerCase();
      if (!emailOk_(email)) return json_({ ok: false, error: "Enter a valid email." });
      subs_().appendRow([now, email]);
      try { notifyFounder_("New tips subscriber 💌", [["Email", email]]); } catch (err) {}
      return json_({ ok: true });
    }

    return json_({ ok: false, error: "Unknown action" });
  } catch (err) {
    return json_({ ok: false, error: "Something went wrong. Please try again." });
  } finally { lock.releaseLock(); }
}

/* ---------- daily summary (add a daily trigger for this function) ---------- */
function dailySummary() {
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const countSince = function (sh) { return sh.getDataRange().getValues().slice(1).filter(function (r) { return r[0] instanceof Date && r[0] >= since; }).length; };
  notifyFounder_("Your daily summary 📊", [["Visits (24h)", countSince(visits_())], ["New registrations (24h)", countSince(regs_())], ["Certificates (24h)", countSince(certs_())], ["Total registrations", regs_().getLastRow() - 1]]);
}

/* Run this once from the editor: it asks for permissions and sends you a test email. */
function testSetup() {
  notifyFounder_("Setup test ✅", [["Status", "Your Aura AI backend can send emails."], ["Sheet", SpreadsheetApp.getActiveSpreadsheet().getUrl()]]);
}
