/* Shared helpers. Same origin as the API — no base URL, no CORS. */

const PHARMACY_ID   = 23;
const CLINIC_ID     = 22;
const BANK_ID       = 24;
const PRESCRIBER_ID = 36;
const PHARMACIST_ID = 38;

/* money is stored in kobo */
function naira(kobo) {
  const n = (kobo || 0) / 100;
  return "\u20A6" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function clock(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

async function api(path, opts = {}) {
  const role = localStorage.getItem("role") || "owner";
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-Role": role,
      ...(opts.headers || {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch (e) { body = null; }

  if (!res.ok) {
    const err = new Error("request failed");
    err.status = res.status;
    const d = body && body.detail;
    err.code = (d && d.error && d.error.code) || "ERROR";
    err.message = (d && d.error && d.error.message)
      || (typeof d === "string" ? d : null)
      || JSON.stringify(body && body.detail ? body.detail : body);
    throw err;
  }
  return body;
}



function badge(level) {
  const cls = level === "attested" ? "attested"
            : level === "settled"  ? "settled" : "self";
  const txt = level === "attested" ? "ATTESTED"
            : level === "settled"  ? "SETTLED" : "SELF-REPORTED";
  return `<span class="badge ${cls}">${txt}</span>`;
}

function orgClass(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("bank") || n.includes("wema")) return "b";
  if (n.includes("pharm")) return "p";
  return "c";
}

/* highlight the current nav link */
document.addEventListener("DOMContentLoaded", () => {
  const here = location.pathname;
  document.querySelectorAll(".nav a").forEach(a => {
    if (a.getAttribute("href") === here) a.classList.add("on");
  });
});

function denied(err, el) {
  el.innerHTML = `
    <div class="panel bad">
      <div class="ttl">&#128274; Access denied
        <span class="rcode">${err.code}</span></div>
      <div class="msg">${err.message}</div>
    </div>
    <div class="card small muted">
      Enforced by the backend, not hidden in the interface — the data never
      leaves the server. This attempt is in the audit trail.
    </div>`;
}
