// 1) typed intro
const typedEl = document.getElementById("typed");
const lines = [
  "I made this little page just for you.",
  "Today I want you to feel loved, safe, and special.",
  "Watch the flowers draw… then open your note 💗"
];

async function typeLine(text, speed=28){
  for (let i = 0; i < text.length; i++){
    typedEl.textContent += text[i];
    await new Promise(r => setTimeout(r, speed));
  }
}
async function runTyping(){
  typedEl.textContent = "";
  for (const l of lines){
    await typeLine(l);
    await new Promise(r => setTimeout(r, 520));
    typedEl.textContent += " ";
  }
}
runTyping();

// 2) floating hearts
const heartsWrap = document.querySelector(".hearts");
function spawnHeart(){
  const h = document.createElement("div");
  h.className = "heart";
  const left = Math.random() * 100;
  const size = 10 + Math.random() * 18;
  const dur = 4 + Math.random() * 5;
  h.style.left = `${left}vw`;
  h.style.bottom = `-20px`;
  h.style.width = `${size}px`;
  h.style.height = `${size}px`;
  h.style.animationDuration = `${dur}s`;
  h.style.opacity = `${0.35 + Math.random() * 0.5}`;
  heartsWrap.appendChild(h);
  setTimeout(() => h.remove(), dur * 1000 + 100);
}
setInterval(spawnHeart, 260);

// 3) bouquet drawing animation (SVG stroke reveal)
const paths = Array.from(document.querySelectorAll(".step"));
const bar = document.getElementById("bar");

function prep(){
  paths.forEach(p => {
    const len = p.getTotalLength();
    p.dataset.len = String(len);
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });
  bar.style.width = "0%";
}
prep();

const totalMs = 7200;
let raf = null;
let start = null;

function setProgress(t){
  const prog = Math.min(1, Math.max(0, t / totalMs));
  bar.style.width = `${prog * 100}%`;

  const n = paths.length;
  for (let i=0;i<n;i++){
    const segS = (i/n) * totalMs;
    const segE = ((i+1)/n) * totalMs;
    const local = (t - segS) / (segE - segS);
    const clamped = Math.min(1, Math.max(0, local));
    const len = Number(paths[i].dataset.len);
    paths[i].style.strokeDashoffset = String(len * (1 - clamped));
  }
}

function loop(ts){
  if (!start) start = ts;
  const t = ts - start;
  setProgress(t);
  if (t >= totalMs) { raf = null; return; }
  raf = requestAnimationFrame(loop);
}
function play(){
  cancelAnimationFrame(raf);
  start = null;
  prep();
  raf = requestAnimationFrame(loop);
}
play();

// 4) note reveal
const note = document.getElementById("note");
const noteText = document.getElementById("noteText");

const noteLines = [
  "Happy Valentine’s Day, my love.",
  "Thank you for being the best part of my days.",
  "I’m proud of you, I appreciate you, and I choose you — always.",
  "💗"
];

function revealNote(){
  note.classList.remove("hidden");
  noteText.textContent = noteLines.join(" ");
  note.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("reveal").addEventListener("click", revealNote);
document.getElementById("replay").addEventListener("click", () => {
  runTyping();
  play();
  note.classList.add("hidden");
});
