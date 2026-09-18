let DRUGS = [];
let rows = 0;

async function boot() {
  const d = await api("/drugs");
  DRUGS = d.items;
  const p = await api("/patients/search?limit=25");
  fillPatients(p.items);
  addRow();
}

function fillPatients(items) {
  const sel = document.getElementById("patient");
  sel.innerHTML = '<option value="">— select a patient —</option>' +
    items.map(p => `<option value="${p.id}">${p.name} · ${p.phone || ""}</option>`).join("");
}

let t;
document.getElementById("patient-q").addEventListener("input", e => {
  clearTimeout(t);
  t = setTimeout(async () => {
    const r = await api("/patients/search?limit=25&q=" + encodeURIComponent(e.target.value));
    fillPatients(r.items);
  }, 250);
});

function addRow() {
  const i = rows++;
  const div = document.createElement("div");
  div.className = "itemrow";
  div.dataset.i = i;
  div.innerHTML = `
    <div>
      <label>Medication</label>
      <select class="drug">${DRUGS.map(d =>
        `<option value="${d.id}" data-price="${d.unit_price}">${d.name} ${d.strength || ""}</option>`
      ).join("")}</select>
    </div>
    <div><label>Dose</label><input class="dose" value="1 tab"></div>
    <div><label>Times / day</label><input class="freq" type="number" min="1" value="3"></div>
    <div><label>Days</label><input class="days" type="number" min="1" value="7"></div>
    <div><label>Quantity</label><div class="qty">21 units</div></div>`;
  document.getElementById("items").appendChild(div);
  div.querySelectorAll("input,select").forEach(el => el.addEventListener("input", recalc));
  recalc();
}

function recalc() {
  let total = 0;
  document.querySelectorAll(".itemrow").forEach(r => {
    const f = +r.querySelector(".freq").value || 0;
    const d = +r.querySelector(".days").value || 0;
    const q = f * d;
    const opt = r.querySelector(".drug").selectedOptions[0];
    const price = +opt.dataset.price || 0;
    r.querySelector(".qty").textContent = `${f} × ${d} = ${q} units`;
    total += q * price;
  });
  document.getElementById("total").textContent = naira(total);
}

document.getElementById("add-item").onclick = addRow;

document.getElementById("submit").onclick = async () => {
  const btn = document.getElementById("submit");
  const errBox = document.getElementById("err");
  errBox.innerHTML = "";

  const patient_id = +document.getElementById("patient").value;
  if (!patient_id) {
    errBox.innerHTML = `<div class="panel bad"><div class="ttl">No patient selected</div>
      <div class="msg">Choose a patient before issuing.</div></div>`;
    return;
  }

  const items = [...document.querySelectorAll(".itemrow")].map(r => ({
    drug_id: +r.querySelector(".drug").value,
    dose: r.querySelector(".dose").value,
    frequency_per_day: +r.querySelector(".freq").value,
    days: +r.querySelector(".days").value,
  }));

  btn.disabled = true; btn.textContent = "Issuing…";
  try {
    const rx = await api("/prescriptions", {
      method: "POST",
      body: JSON.stringify({ patient_id, prescriber_id: PRESCRIBER_ID, items }),
    });
    show(rx);
  } catch (e) {
    errBox.innerHTML = `<div class="panel bad">
      <div class="ttl">Could not issue <span class="rcode">${e.code}</span></div>
      <div class="msg">${e.message}</div></div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Issue prescription & generate code";
  }
};

function show(rx) {
  document.getElementById("out-code").textContent = rx.code;
  document.getElementById("out-exp").textContent = "Valid until " + when(rx.expires_at);
  document.getElementById("out-patient").textContent = rx.patient.name;
  document.getElementById("out-prescriber").textContent = rx.prescriber.name;
  document.getElementById("out-org").textContent = rx.prescriber.org;
  document.getElementById("out-total").textContent = naira(rx.total);
  document.getElementById("out-items").innerHTML = rx.items.map(i => `
    <tr><td>${i.drug_name} <span class="muted">${i.dose}</span></td>
        <td class="muted">${i.frequency_per_day}× daily for ${i.days} days</td>
        <td class="num">${i.quantity}</td>
        <td class="num">${naira(i.line_total)}</td></tr>`).join("");
  document.getElementById("form-view").classList.add("hide");
  document.getElementById("done-view").classList.remove("hide");
  window.scrollTo(0, 0);
}

document.getElementById("again").onclick = () => {
  document.getElementById("done-view").classList.add("hide");
  document.getElementById("form-view").classList.remove("hide");
  document.getElementById("items").innerHTML = "";
  rows = 0; addRow();
};

boot();
