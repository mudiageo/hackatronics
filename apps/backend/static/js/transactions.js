let ALL = [], filter = "";
const modal = document.getElementById("modal");

async function load() {
  try {
    const r = await api(`/businesses/${PHARMACY_ID}/transactions?limit=100`);
    ALL = r.items;
    render();
  } catch (e) {
    denied(e, document.querySelector(".wrap"));
  }
}

function render() {
  const rows = filter ? ALL.filter(x => x.attestation_level === filter) : ALL;

  if (!rows.length) {
    document.getElementById("rows").innerHTML =
      `<tr><td colspan="5" class="spin">Nothing at this level.</td></tr>`;
    return;
  }

  document.getElementById("rows").innerHTML = rows.map(x => `
    <tr>
      <td class="muted small" style="white-space:nowrap">${when(x.occurred_at)}</td>
      <td>
        <div style="font-weight:600">${x.description}</div>
        <div class="muted small">${x.reference} &middot; ${x.category}</div>
      </td>
      <td>
        <div>${x.counterparty}</div>
        ${x.via_org ? `<div class="small org c">via ${x.via_org}</div>` : ""}
      </td>
      <td class="num" style="white-space:nowrap;${x.inflow ? "color:var(--green)" : ""}">
        ${x.inflow ? "+" : "\u2212"}${naira(x.amount)}
      </td>
      <td class="right">${badge(x.attestation_level)}</td>
    </tr>`).join("");
}

document.getElementById("filter").onchange = e => {
  filter = e.target.value;
  render();
};

document.getElementById("add").onclick = () => {
  document.getElementById("date").valueAsDate = new Date();
  modal.classList.remove("hide");
};
document.getElementById("close").onclick = () => modal.classList.add("hide");
document.getElementById("cancel").onclick = () => modal.classList.add("hide");

document.getElementById("save").onclick = async () => {
  const btn = document.getElementById("save");
  const desc = document.getElementById("desc").value || "Counter sale";
  const party = document.getElementById("party").value.trim();
  const amount = Math.round(Math.abs(+document.getElementById("amt").value || 0) * 100);
  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value;

  btn.disabled = true; btn.textContent = "Saving…";
  try {
    await api(`/businesses/${PHARMACY_ID}/transactions`, {
      method: "POST",
      body: JSON.stringify({
        type,
        description: party ? `${desc} — ${party}` : desc,
        amount,
        occurred_at: date ? new Date(date).toISOString() : null,
      }),
    });
    modal.classList.add("hide");
    document.getElementById("desc").value = "";
    document.getElementById("party").value = "";
    document.getElementById("merr").innerHTML = "";
    load();
  } catch (e) {
    document.getElementById("merr").innerHTML =
      `<div class="panel bad"><div class="ttl">Could not save
        <span class="rcode">${e.code}</span></div>
       <div class="msg">${e.message}</div></div>`;
  } finally {
    btn.disabled = false; btn.textContent = "Record Transaction";
  }
};

load();
