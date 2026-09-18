/* Sidebar + topbar, built on every page. Role lives in localStorage. */

const ORGS = {
  clinic:   { name: "Grace Medical Centre", short: "G", cls: "clinic", sub: "Clinic" },
  pharmacy: { name: "Wellcare Pharmacy",    short: "W", cls: "pharm",  sub: "Pharmacy" },
  owner:    { name: "Wellcare Pharmacy",    short: "W", cls: "pharm",  sub: "Pharmacy Admin" },
  bank:     { name: "Wema Bank",            short: "W", cls: "bank",   sub: "Credit Desk" },
};

/* role-specific group that sits above the common ones */
const TOP = {
  clinic:   ["CLINICAL", [["/prescribe", "New Prescription", "doc"]]],
  pharmacy: ["COUNTER",  [["/pharmacy", "Verify &amp; Dispense", "shield"]]],
  owner:    null,
  bank:     null,
};

const COMMON = [
  ["OVERVIEW", [
    ["/", "Dashboard", "grid"],
    ["/transactions", "Transactions", "receipt"],
    ["/inventory", "Inventory", "box"],
  ]],
  ["TRUST &amp; VERIFICATION", [
    ["/activity", "Verified Activity", "shield"],
    ["/passport", "Financial Passport", "doc"],
  ]],
  ["AI ASSISTANCE", [
    ["/scan", "AI Scan", "camera"],
    ["/voice", "AI Voice Recording", "mic"],
    ["/chat", "AI Business Advisor", "chat"],
  ]],
  ["BANKING", [
    ["/wallet", "Wallet", "wallet"],
  ]],
];

/* the bank only ever sees these */
const BANK_NAV = [
  ["OVERVIEW", [
    ["/", "Dashboard", "grid"],
  ]],
  ["TRUST &amp; VERIFICATION", [
    ["/activity", "Verified Activity", "shield"],
    ["/passport", "Financial Passport", "doc"],
  ]],
];

function navFor(role) {
  if (role === "bank") return BANK_NAV;
  return (TOP[role] ? [TOP[role]] : []).concat(COMMON);
}

const ACTION = {
  clinic:   ["New Prescription", "/prescribe"],
  pharmacy: ["Verify Code", "/pharmacy"],
  owner:    ["Record a sale", "/transactions"],
  bank:     null,
};

const ICON = {
  grid:   "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  receipt:"M6 2h12v20l-3-2-3 2-3-2-3 2z",
  box:    "M12 2l9 5v10l-9 5-9-5V7z",
  shield: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z",
  doc:    "M6 2h8l4 4v16H6z",
  wallet: "M3 7h18v12H3zM16 12h4",
  camera: "M3 7h4l2-2h6l2 2h4v12H3zM12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  mic:    "M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3",
  chat:   "M21 12a8 8 0 01-8 8H7l-4 3v-6a8 8 0 018-8h2a8 8 0 018 3z",
};

function svg(k) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="${ICON[k] || ICON.grid}"/></svg>`;
}

function currentRole() {
  const forced = document.body.dataset.role;
  if (forced) { localStorage.setItem("role", forced); return forced; }
  return localStorage.getItem("role") || "owner";
}

(function build() {
  const role = currentRole();
  const org = ORGS[role];
  const here = location.pathname;

  const groups = navFor(role);

  const navHtml = groups.map(([title, items]) => `
    <div class="navgroup">
      <div class="navtitle">${title}</div>
      ${items.map(([href, label, icon]) => `
        <a href="${href}" class="navitem ${here === href ? "on" : ""}">
          ${svg(icon)}<span>${label}</span>
        </a>`).join("")}
    </div>`).join("");

  const act = ACTION[role];

  const shell = document.createElement("div");
  shell.className = "shell";
  shell.innerHTML = `
    <aside class="side">
      <div class="orgid">
        <div class="avatar ${org.cls}">${org.short}</div>
        <div>
          <div class="onm">${org.name}</div>
          <div class="osub">${org.sub}</div>
        </div>
      </div>
      <nav>${navHtml}</nav>
    </aside>

    <div class="content">
      <header class="bar">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input placeholder="Search records, transactions, products…">
        </div>
        ${act ? `<button class="act" onclick="location.href='${act[1]}'">${act[0]}</button>` : ""}
        <select id="roleSel" class="rolesel">
          <option value="owner">Role: Owner</option>
          <option value="clinic">Role: Clinic</option>
          <option value="pharmacy">Role: Pharmacy</option>
          <option value="bank">Role: Bank</option>
        </select>
        <div class="avatar sm ${org.cls}">${org.short}</div>
      </header>
      <div id="slot"></div>
    </div>`;

  const main = document.querySelector("main");
  document.body.insertBefore(shell, main);
  shell.querySelector("#slot").appendChild(main);

  const sel = document.getElementById("roleSel");
  sel.value = role;
  sel.onchange = () => {
    const r = sel.value;
    localStorage.setItem("role", r);
    const first = (TOP[r] ? TOP[r][1][0][0] : "/");
    location.href = first;
  };
})();
