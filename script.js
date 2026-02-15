// ====== Customize your story here ======
const GIRL_NAME = "my love";         // change to her name
const YOUR_SIGN = "Qi Ming";         // change to your name

const STORY = [
  { t: 0.0,  a: `Hey ${GIRL_NAME}…`, b: "I made this just for you." },
  { t: 0.12, a: "It started with a black screen…", b: "and one tiny moment that changed everything." },
  { t: 0.24, a: "We met at a bubble tea fundraising.", b: "I still remember the vibe like it was yesterday." },
  { t: 0.38, a: "At first it was small things:", b: "your smile, your voice, the way you looked at me." },
  { t: 0.52, a: "Then somehow…", b: "I fell in love with you." },
  { t: 0.66, a: "So I’m drawing you flowers", b: "the kind that don’t fade." },
  { t: 0.82, a: "Happy Valentine’s Day 💗", b: "I choose you — always." },
];

// Final note (shown near the end)
const NOTE = [
  "Thank you for being the best part of my days.",
  "You make life feel softer, brighter, and more real.",
  "I’m proud of you, I appreciate you, and I love you.",
  "💗",
].join(" ");

// ====== Typed intro ======
const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const skipBtn  = document.getElementById("skipBtn");
const subtitle = document.getElementById("subtitle");
document.getElementById("sig").textContent = `— ${YOUR_SIGN}`;

async function typeText(el, text, speed=26){
  el.textContent = "";
  for (let i=0;i<text.length;i++){
    el.textContent += text[i];
    await new Promise(r=>setTimeout(r,speed));
  }
}

let started = false;
async function runIntro(){
  await typeText(subtitle, "Press Start. I want to tell you our story.", 24);
}

runIntro();

function begin(){
  if (started) return;
  started = true;
  intro.classList.add("fade");
  intro.style.transition = "opacity 900ms ease";
  intro.style.opacity = "0";
  setTimeout(()=> intro.remove(), 950);
  playAll();
}

startBtn.addEventListener("click", begin);
skipBtn.addEventListener("click", begin);

// ====== Canvas scene setup ======
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: true });

function resize(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width  = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width  = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resize);
resize();

// ====== “Flower object” generator (no flicker)
// Inspired by the blog’s key point: store random petal lengths in an array
// once, instead of randomizing every frame, to avoid flickering. ======
function makeFlower({x,y, petals=56, minR=12, maxR=48, spin=0.012, hueShift=0}){
  const lengths = new Array(petals).fill(0).map(()=> rand(minR, maxR)); // fixed per flower
  const widths  = new Array(petals).fill(0).map(()=> rand(6, 14));      // fixed per flower
  const tilt    = rand(-0.25, 0.25);
  const seed    = rand(0, Math.PI*2);
  return { x,y, petals, lengths, widths, tilt, seed, spin, hueShift, age:0 };
}

function drawFlower(f, progress){
  // progress: 0..1 controls how much of the flower is revealed
  const revealCount = Math.floor(f.petals * progress);
  const aStep = (Math.PI*2)/f.petals;

  // glow stroke
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.seed + f.age * f.spin);

  // soft bloom
  const g = ctx.createRadialGradient(0,0,0, 0,0,120);
  g.addColorStop(0, `rgba(255,77,166,0.12)`);
  g.addColorStop(1, `rgba(139,92,246,0.00)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0,0,140,0,Math.PI*2);
  ctx.fill();

  // petals (elliptical “paddles” like the chrysanthemum idea)
  for (let i=0;i<revealCount;i++){
    const len = f.lengths[i];
    const w = f.widths[i];
    const a = i*aStep + f.tilt;

    ctx.save();
    ctx.rotate(a);

    // petal gradient
    const pg = ctx.createLinearGradient(0,0,len,0);
    pg.addColorStop(0, `rgba(255,255,255,0.12)`);
    pg.addColorStop(0.35, `rgba(255,77,166,0.55)`);
    pg.addColorStop(1, `rgba(255,255,255,0.80)`);

    ctx.strokeStyle = `rgba(255,255,255,0.75)`;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(255,255,255,0.18)";
    ctx.shadowBlur = 14;

    // draw petal outline
    ctx.beginPath();
    roundedLeaf(0, 0, len, w);
    ctx.stroke();

    // inner fill
    ctx.shadowBlur = 0;
    ctx.fillStyle = pg;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // center
  ctx.shadowColor = "rgba(255,255,255,0.25)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(0,0,10,0,Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function roundedLeaf(x,y,len,w){
  // a simple leaf/petal shape using quadratic curves
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(len*0.35, -w, len, 0);
  ctx.quadraticCurveTo(len*0.35,  w, x, y);
  ctx.closePath();
}

function rand(a,b){ return a + Math.random()*(b-a); }

// ====== Story timing + animation ======
const line = document.getElementById("line");
const line2 = document.getElementById("line2");
const bar  = document.getElementById("bar");
const noteBox = document.getElementById("note");
const noteText = document.getElementById("noteText");
noteText.textContent = NOTE;

let t0 = null;
let raf = null;

const DURATION = 22000; // total run ms

// Create bouquet (3 flowers) centered lower-mid
function makeBouquet(){
  const cx = window.innerWidth * 0.52;
  const cy = window.innerHeight * 0.55;
  return [
    makeFlower({ x: cx-170, y: cy-20, petals: 54, minR: 12, maxR: 46, spin: 0.010 }),
    makeFlower({ x: cx,     y: cy-80, petals: 66, minR: 14, maxR: 56, spin: 0.012 }),
    makeFlower({ x: cx+170, y: cy-15, petals: 54, minR: 12, maxR: 46, spin: 0.009 }),
  ];
}

let bouquet = makeBouquet();
window.addEventListener("resize", ()=> { bouquet = makeBouquet(); });

function drawBackground(){
  // subtle stars + gradient fog
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const w = window.innerWidth;
  const h = window.innerHeight;

  // fog
  const fog = ctx.createRadialGradient(w*0.35,h*0.25, 80, w*0.5,h*0.55, Math.max(w,h));
  fog.addColorStop(0, "rgba(255,77,166,0.12)");
  fog.addColorStop(0.5, "rgba(139,92,246,0.10)");
  fog.addColorStop(1, "rgba(0,0,0,0.00)");
  ctx.fillStyle = fog;
  ctx.fillRect(0,0,w,h);

  // stars
  ctx.globalAlpha = 0.55;
  for (let i=0;i<110;i++){
    const x = (i*97 % 997) / 997 * w;
    const y = (i*193 % 991) / 991 * h;
    const r = (i%7===0) ? 1.4 : 0.9;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function storyAt(p){
  // p = 0..1
  let current = STORY[0];
  for (const s of STORY){
    if (p >= s.t) current = s;
  }
  return current;
}

function loop(ts){
  if (!t0) t0 = ts;
  const elapsed = ts - t0;
  const p = Math.min(1, elapsed / DURATION);

  // UI progress
  bar.style.width = `${p*100}%`;

  // Story text
  const s = storyAt(p);
  line.textContent = s.a;
  line2.textContent = s.b;

  // Scene
  drawBackground();

  // Bouquet reveal window: from ~0.55 to 0.92
  const bloomStart = 0.55;
  const bloomEnd   = 0.92;
  let bloomP = (p - bloomStart) / (bloomEnd - bloomStart);
  bloomP = Math.min(1, Math.max(0, bloomP));

  // stems (simple)
  if (bloomP > 0){
    drawStems(bloomP);
    bouquet.forEach(f=>{
      f.age += 1;
      drawFlower(f, bloomP);
    });
  }

  // show note near end
  if (p > 0.84){
    noteBox.classList.remove("hidden");
  } else {
    noteBox.classList.add("hidden");
  }

  if (p < 1) raf = requestAnimationFrame(loop);
}

function drawStems(k){
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cx = w * 0.52;
  const baseY = h * 0.92;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255,255,255,0.12)";
  ctx.shadowBlur = 16;

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 3.2;

  const topY = h * 0.55;
  const t = k;

  function stem(x1,y1,x2,y2, bend){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.bezierCurveTo(
      x1 + bend, y1 - (y1-y2)*0.35,
      x2 - bend, y1 - (y1-y2)*0.70,
      x2, y2
    );
    // reveal by drawing partial using dash
    const pathLen = 1200;
    ctx.setLineDash([pathLen*t, pathLen]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  stem(cx-120, baseY, cx-170, topY+40, -60);
  stem(cx,     baseY, cx,     topY-20,  0);
  stem(cx+120, baseY, cx+170, topY+45,  60);

  // ribbon-ish glow
  if (k > 0.78){
    ctx.shadowBlur = 22;
    ctx.strokeStyle = "rgba(255,77,166,0.55)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, baseY-30, 22, 0, Math.PI*2);
    ctx.stroke();
  }

  ctx.restore();
}

function playAll(){
  cancelAnimationFrame(raf);
  t0 = null;
  raf = requestAnimationFrame(loop);
}

document.getElementById("replayBtn").addEventListener("click", ()=>{
  noteBox.classList.add("hidden");
  playAll();
});

// Auto-start if user hits Enter on intro
window.addEventListener("keydown",(e)=>{
  if (!started && (e.key === "Enter" || e.key === " ")) begin();
});
