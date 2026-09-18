const drop = document.getElementById("drop");
const file = document.getElementById("file");
const box  = document.getElementById("result");
let parsed = null;

drop.onclick = () => file.click();
file.onchange = () => { if (file.files[0]) upload(file.files[0]); };

async function upload(f) {
  box.innerHTML = `<div class="spin">Reading your receipt…</div>`;
  const fd = new FormData();
  fd.append("file", f);
  try {
    const res = await fetch("/ai/scan-transaction", { method: "POST", body: fd });
    const body = await res.json();
    if (!res.ok) {
      const d = body.detail || {};
      const e = d.error || {};
      return failed(e.code || "AI_FAILED", e.message || "Could not read that image");
    }
    parsed = body;
    review(body);
  } catch (err) {
    failed("NETWORK", "Could not reach the scanner");
  }
}

function failed(code, msg) {
  box.innerHTML = `
    <div class="panel bad">
      <div class="ttl">Scan failed <span class="rcode">${code}</span></div>
      <div class="msg">${msg}</div>
    </div>
    <div class="row">
      <button class="ghost" onclick="location.reload()">Try another photo</button>
      <button onclick="location.href='/transactions'">Enter it manually</button>
    </div>`;
}

function review(d) {
  box.innerHTML = `
    <div class="card">
      <h2>Check before saving</h2>

      <div class="field">
        <label>Customer</label>
        <input id="cust" value="${d.customer || ""}" placeholder="Walk-in customer">
      </div>

      <label>Items read from the note</label>
      ${d.items.map((it, i) => `
        <div class="scanrow ${it.resolved ? "" : "unres"}">
          <div class="readas">read as: "${it.read_as}" &times; ${it.quantity}</div>
          ${it.matches.length ? `
            <select class="pick" data-i="${i}">
              ${it.resolved ? "" : '<option value="">— which product? —</option>'}
              ${it.matches.map(m =>
                `<option value="${m.id}">${m.name} ${m.strength || ""}</option>`).join("")}
            </select>`
          : `<div class="muted small">No match in inventory — pick it manually
               on the transactions page.</div>`}
        </div>`).join("")}

      <div class="field" style="margin-top:16px">
        <label>Amount (&#8358;)</label>
        <input id="amt" type="number" value="${(d.amount || 0) / 100}">
      </div>

      <div style="padding:14px 16px;background:var(--card2);border-radius:10px">
        <div style="margin-bottom:6px">${badge(d.attestation_level)}</div>
        <div class="muted small">${d.note}</div>
      </div>
    </div>

    <div class="row">
      <button class="ghost" onclick="location.reload()">Discard</button>
      <button id="save">Save transaction</button>
    </div>`;

  document.getElementById("save").onclick = save;
}

async function save() {
  const btn = document.getElementById("save");
  btn.disabled = true; btn.textContent = "Saving…";
  const cust = document.getElementById("cust").value.trim();
  const amount = Math.round((+document.getElementById("amt").value || 0) * 100);
  try {
    await api(`/businesses/${PHARMACY_ID}/transactions`, {
      method: "POST",
      body: JSON.stringify({
        type: "income",
        description: "Counter sale" + (cust ? " — " + cust : ""),
        amount,
      }),
    });
    box.innerHTML = `
      <div class="panel ok">
        <div class="ttl">&#10003; Saved as ${naira(amount)}</div>
        <div class="msg">Recorded at the self-reported tier — a photo of your own
          note is still your own claim.</div>
      </div>
      <div class="row">
        <button class="ghost" onclick="location.reload()">Scan another</button>
        <button onclick="location.href='/transactions'">See transactions &rarr;</button>
      </div>`;
  } catch (e) {
    failed(e.code, e.message);
  }
}
