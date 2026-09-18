const thread = document.getElementById("thread");
const q = document.getElementById("q");

const CANNED = "Grounded answers arrive in v2. The assistant will read only " +
  "the verified ledger your role is permitted to see, and cite the dispensing " +
  "records behind every figure it quotes.";

function bubble(text, who) {
  const d = document.createElement("div");
  d.style.cssText = `margin-bottom:14px;display:flex;${
    who === "me" ? "justify-content:flex-end" : ""}`;
  d.innerHTML = `<div style="max-width:78%;padding:11px 15px;border-radius:14px;
    background:${who === "me" ? "var(--accent)" : "var(--card2)"};
    ${who === "me" ? "color:#fff" : ""}">${text}</div>`;
  thread.appendChild(d);
  thread.scrollTop = thread.scrollHeight;
}

bubble("Ask me about your business. I read your verified ledger — " +
       "not general advice from the internet.", "ai");

function send() {
  const text = q.value.trim();
  if (!text) return;
  bubble(text, "me");
  q.value = "";
  setTimeout(() => bubble(CANNED, "ai"), 400);
}

document.getElementById("send").onclick = send;
q.addEventListener("keydown", e => { if (e.key === "Enter") send(); });