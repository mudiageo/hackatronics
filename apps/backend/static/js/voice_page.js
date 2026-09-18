const ring = document.getElementById("ring");
const hint = document.getElementById("hint");
let on = false;

ring.onclick = () => {
  on = !on;
  ring.classList.toggle("live", on);
  hint.textContent = on
    ? "Listening… (simulated — speech capture arrives in v2)"
    : "Not yet available — planned for the next version.";
  if (on) setTimeout(() => {
    on = false;
    ring.classList.remove("live");
    hint.textContent = "Not yet available — planned for the next version.";
  }, 3000);
};
