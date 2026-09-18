(async () => {
  const m = await api(`/businesses/${PHARMACY_ID}/dashboard-metrics`);

  document.getElementById("stats").innerHTML = `
    <div class="stat"><div class="lab">Revenue</div><div class="val">${naira(m.revenue)}</div></div>
    <div class="stat"><div class="lab">Expenses</div><div class="val">${naira(m.expenses)}</div></div>
    <div class="stat"><div class="lab">Profit</div>
      <div class="val ${m.profit < 0 ? "neg" : ""}">${naira(m.profit)}</div></div>
    <div class="stat"><div class="lab">Cash position</div>
      <div class="val ${m.cash_position < 0 ? "neg" : ""}">${naira(m.cash_position)}</div></div>`;

  const c = m.coverage;
  document.getElementById("bar-settled").style.width  = c.settled_pct + "%";
  document.getElementById("bar-attested").style.width = c.attested_pct + "%";
  document.getElementById("l-set").textContent = c.settled_pct + "%";
  document.getElementById("l-att").textContent = c.attested_pct + "%";
  document.getElementById("cov-note").innerHTML =
    `Of ${naira(c.recorded)} recorded, ${naira(c.settled)} (${c.settled_pct}%) has settlement evidence,
     and ${naira(c.attested)} (${c.attested_pct}%) is independently attested by another organisation.
     These are nested, not separate amounts.`;

  const t = await api(`/businesses/${PHARMACY_ID}/transactions?limit=8`);
  document.getElementById("txns").innerHTML = t.items.map(x => `
    <tr>
      <td>${x.description}<div class="muted small">${when(x.occurred_at)}</div></td>
      <td class="num">${naira(x.amount)}</td>
      <td class="right">${badge(x.attestation_level)}</td>
    </tr>`).join("");
})();
