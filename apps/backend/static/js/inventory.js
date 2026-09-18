const modal = document.getElementById("modal");

async function load() {
  const r = await api(`/businesses/${PHARMACY_ID}/inventory`);
  document.getElementById("rows").innerHTML = r.items.map(d => {
    const status = d.quantity === 0
      ? `<span class="badge self">OUT OF STOCK</span>`
      : d.low_stock
        ? `<span class="badge settled" style="background:rgba(245,158,11,.18);color:#fbbf24">LOW STOCK</span>`
        : `<span class="badge attested">IN STOCK</span>`;
    return `<tr>
      <td><strong>${d.name}</strong> <span class="muted">${d.strength || ""}</span></td>
      <td class="num"
          style="${d.quantity === 0 ? "color:var(--red)" : d.low_stock ? "color:var(--amber)" : ""}">
          ${d.quantity}</td>
      <td class="num muted">${naira(d.unit_cost)}</td>
      <td class="num">${naira(d.unit_price)}</td>
      <td class="num">${naira(d.value)}</td>
      <td class="right">${status}</td>
    </tr>`;
  }).join("");
}

async function fillDrugs() {
  const d = await api("/drugs");
  document.getElementById("drug").innerHTML = d.items.map(x =>
    `<option value="${x.id}">${x.name} ${x.strength || ""}</option>`).join("");
}

document.getElementById("add").onclick = () => modal.classList.remove("hide");
document.getElementById("close").onclick = () => modal.classList.add("hide");
document.getElementById("cancel").onclick = () => modal.classList.add("hide");

document.getElementById("save").onclick = async () => {
  const btn = document.getElementById("save");
  const drug_id = +document.getElementById("drug").value;
  const quantity = +document.getElementById("qty").value || 0;
  btn.disabled = true; btn.textContent = "Saving…";
  try {
    await api(`/businesses/${PHARMACY_ID}/inventory/stock-in?drug_id=${drug_id}&quantity=${quantity}`,
              { method: "POST" });
    modal.classList.add("hide");
    load();
  } catch (e) {
    document.getElementById("merr").innerHTML =
      `<div class="panel bad"><div class="ttl">Could not save
        <span class="rcode">${e.code}</span></div>
       <div class="msg">${e.message}</div></div>`;
  } finally {
    btn.disabled = false; btn.textContent = "Save movement";
  }
};

fillDrugs();
load();
