(async () => {
  const p = await api(`/businesses/${PHARMACY_ID}/passport`);
  document.getElementById("biz").textContent = p.business.name;

  const c = p.coverage;
  document.getElementById("bar-settled").style.width  = c.settled_pct + "%";
  document.getElementById("bar-attested").style.width = c.attested_pct + "%";
  document.getElementById("l-set").textContent = c.settled_pct + "%";
  document.getElementById("l-att").textContent = c.attested_pct + "%";
  document.getElementById("cov-note").innerHTML =
    `${naira(c.recorded)} recorded &middot; ${naira(c.settled)} settled &middot;
     ${naira(c.attested)} attested. Nested, not separate amounts.`;

  document.getElementById("score").textContent = p.readiness.score;
  document.getElementById("weights").textContent =
    Object.entries(p.readiness.weights).map(([k, v]) => `${k} ${Math.round(v * 100)}%`).join(" · ");
  document.getElementById("limit").textContent = naira(p.credit_limit);

  document.getElementById("metrics").innerHTML = p.metrics.map(m => `
    <div class="stat">
      <div class="lab">${m.label}</div>
      <div class="val">${m.unit === "kobo" ? naira(m.value) : m.value}</div>
    </div>`).join("");

  const fc = document.getElementById("flagcard");
  fc.innerHTML = p.flags.length
    ? `<h2>Flags</h2>` + p.flags.map(f => `
        <div class="panel warn"><div class="ttl">${f.type}
          <span class="rcode">${f.severity}</span></div>
          <div class="msg">${f.detail}</div></div>`).join("")
    : `<h2>Integrity checks</h2>
       <div class="panel ok"><div class="ttl">&#10003; Reconciled</div>
       <div class="msg">Attested revenue matches settled payments exactly.
       No discrepancies flagged.</div></div>`;

  const a = await api(`/businesses/${PHARMACY_ID}/verified-activity?limit=8`);
  document.getElementById("evidence").innerHTML = a.items.map(i => `
    <tr><td>${when(i.dispensed_at)}</td>
        <td>${i.prescriber}</td>
        <td class="org c" style="font-weight:600">${i.from_org}</td>
        <td class="num">${naira(i.amount)}</td></tr>`).join("");
})();
