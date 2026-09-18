const LABEL = {
  prescribed: "Prescribed", verified: "Verified",
  dispensed: "Dispensed", stock_reduced: "Stock reduced", settled: "Settled",
};

(async () => {
  const r = await api(`/businesses/${PHARMACY_ID}/verified-activity?limit=15`);

  if (!r.items.length) {
    document.getElementById("feed").innerHTML =
      `<div class="card muted">No verified activity yet.</div>`;
    return;
  }

  document.getElementById("feed").innerHTML = r.items.map(it => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px">
        <div>
          <div class="flowhead">
            <span class="org c">${it.from_org}</span>
            <span class="to">&rarr;</span>
            <span class="org p">${it.to_org}</span>
          </div>
          <div class="muted small">Prescription #${it.prescription_id} &middot;
            ${it.prescriber} &middot; ${when(it.dispensed_at)}</div>
        </div>
        <div class="right">
          <div style="font-weight:700;font-size:17px">${naira(it.amount)}</div>
          ${badge("attested")}
        </div>
      </div>

      <div class="trail">
        ${it.steps.map((s, i) => `
          <div class="step">
            ${i < it.steps.length - 1 ? '<div class="line"></div>' : ''}
            <div class="dot"></div>
            <div class="nm">${LABEL[s.step] || s.step}</div>
            <div class="org ${orgClass(s.org)}">${s.org}</div>
            <div class="who">${s.actor ? s.actor + "<br>" : ""}${clock(s.timestamp)}</div>
          </div>`).join("")}
      </div>
    </div>`).join("");
})();
