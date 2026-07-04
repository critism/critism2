/* ============================================================
   CONFIG — everything you'd want to change lives here.
   This one file drives every page.
   ============================================================ */
const CONFIG = {
  name: "valentin",           // your handle — the big wordmark on home
  dotLetter: "auto",          // "auto" = blue dot on last "i" (or last letter). Or an index, e.g. 4
  tagline: "fourteen-year-old developer from germany",
  location: "in germany",
  timezone: "Europe/Berlin",  // IANA timezone for the live clock
  status: "free",             // nav pill: "busy", "online", "afk"...
  moodLines: ["do not disturb", "probably building something,\nor maybe nothing"],
  nav: [
    ["home", "index.html"],
    ["now", "now.html"],
    ["log", "log.html"],
    ["about", "about.html"],
    ["work", "work.html"],
    ["projects", "projects.html"],
  ],
};

/* ---------- nav ---------- */
(function buildNav(){
  const nav = document.getElementById("nav");
  if(!nav) return;
  const current = document.body.dataset.page;
  CONFIG.nav.forEach(([label, href])=>{
    const a = document.createElement("a");
    a.href = href; a.textContent = label;
    if(label === current) a.classList.add("active");
    nav.appendChild(a);
  });
  const div = document.createElement("div");
  div.className = "nav-divider";
  nav.appendChild(div);
  const st = document.createElement("div");
  st.className = "nav-status";
  st.innerHTML = `<span class="dot"></span><span>${CONFIG.status}</span><span class="nav-time" id="navTime"></span>`;
  nav.appendChild(st);
})();

/* ---------- live clock (nav + optional big clock) ---------- */
function tick(){
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB",{timeZone:CONFIG.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  const p = Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));
  const navTime = document.getElementById("navTime");
  if(navTime) navTime.textContent = `· ${p.hour}:${p.minute}`;
  const hm = document.getElementById("hm");
  if(hm){
    hm.textContent = `${p.hour}:${p.minute}:`;
    document.getElementById("sec").textContent = p.second;
  }
}
tick(); setInterval(tick, 1000);

/* ---------- ambient stars ---------- */
(function stars(){
  const wrap = document.getElementById("stars");
  if(!wrap) return;
  for(let i=0;i<60;i++){
    const s = document.createElement("span");
    s.style.left = Math.random()*100+"vw";
    s.style.top = Math.random()*100+"vh";
    s.style.animationDelay = (Math.random()*6)+"s";
    wrap.appendChild(s);
  }
})();

/* ---------- home-only: wordmark + rail text ---------- */
(function home(){
  const wm = document.getElementById("wordmark");
  if(!wm) return;
  const name = CONFIG.name;
  const dotIdx = CONFIG.dotLetter === "auto"
    ? (name.lastIndexOf("i") >= 0 ? name.lastIndexOf("i") : name.length-1)
    : CONFIG.dotLetter;
  [...name].forEach((ch,i)=>{
    const s = document.createElement("span");
    if(i === dotIdx){
      // if it's an "i", swap in a dotless ı so our accent dot BECOMES the tittle
      s.textContent = (ch === "i") ? "ı" : ch;
      s.className = "dot-i";
    } else {
      s.textContent = ch;
    }
    wm.appendChild(s);
  });
  document.getElementById("tagline").textContent = CONFIG.tagline;
  document.getElementById("loc").textContent = CONFIG.location;
  document.getElementById("statusLine").textContent = CONFIG.moodLines[0] || "";
  document.getElementById("mood").innerText = CONFIG.moodLines[1] || "";
  document.title = `${CONFIG.name} — developer`;
})();

/* ============================================================
   ANIMATIONS — added layer
   ============================================================ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* stagger the wordmark letters */
(function staggerWordmark(){
  const wm = document.getElementById("wordmark");
  if(!wm) return;
  [...wm.children].forEach((s,i)=> s.style.setProperty("--d", (0.06*i + 0.15)+"s"));
})();

/* mouse spotlight follows cursor */
(function spotlight(){
  if(reduceMotion) return;
  const el = document.createElement("div");
  el.className = "spotlight";
  document.body.appendChild(el);
  window.addEventListener("pointermove", e=>{
    el.style.setProperty("--mx", e.clientX+"px");
    el.style.setProperty("--my", e.clientY+"px");
  }, {passive:true});
})();

/* occasional shooting star */
(function shootingStars(){
  if(reduceMotion) return;
  function shoot(){
    const s = document.createElement("div");
    s.className = "shoot";
    s.style.left = (40 + Math.random()*55) + "vw";
    s.style.top  = (Math.random()*35) + "vh";
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 1400);
    setTimeout(shoot, 4000 + Math.random()*9000);
  }
  setTimeout(shoot, 2500);
})();

/* scroll reveal on sub pages */
(function scrollReveal(){
  const page = document.querySelector(".page");
  if(!page) return;
  const targets = page.querySelectorAll(".now-item,.job,.card,.section-label,.page p,.chips,.updated,.page-foot");
  targets.forEach((el,i)=>{
    el.classList.add("reveal");
    el.style.setProperty("--d", (Math.min(i%6,4)*0.07)+"s");
  });
  if(reduceMotion){ targets.forEach(el=>el.classList.add("in")); return; }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
  targets.forEach(el=>io.observe(el));
})();

/* project card tilt + cursor shine */
(function cardTilt(){
  if(reduceMotion) return;
  document.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("pointermove", e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width, y = (e.clientY - r.top)/r.height;
      card.style.setProperty("--cx", x*100+"%");
      card.style.setProperty("--cy", y*100+"%");
      card.style.transform = `translateY(-2px) rotateX(${(0.5-y)*6}deg) rotateY(${(x-0.5)*6}deg)`;
    });
    card.addEventListener("pointerleave", ()=>{ card.style.transform = ""; });
  });
})();

/* smooth fade-out when navigating between pages */
(function pageTransitions(){
  if(reduceMotion) return;
  document.addEventListener("click", e=>{
    const a = e.target.closest("a");
    if(!a) return;
    const href = a.getAttribute("href") || "";
    if(!href.endsWith(".html")) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(()=>{ location.href = href; }, 240);
  });
})();

/* ============================================================
   V3 — SIGNATURE LAYER
   ============================================================ */

/* film grain overlay */
if(!reduceMotion){
  const g = document.createElement("div");
  g.className = "grain";
  document.body.appendChild(g);
}

/* ---------- constellation canvas (interactive stars) ---------- */
(function constellation(){
  const cv = document.createElement("canvas");
  cv.id = "net";
  document.body.prepend(cv);
  const ctx = cv.getContext("2d");
  let W,H,pts=[],mouse={x:-9999,y:-9999};
  const N = () => Math.min(90, Math.floor(innerWidth/16));

  function size(){
    W = cv.width = innerWidth * devicePixelRatio;
    H = cv.height = innerHeight * devicePixelRatio;
    cv.style.width = innerWidth+"px"; cv.style.height = innerHeight+"px";
    pts = Array.from({length:N()},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.12*devicePixelRatio,
      vy:(Math.random()-.5)*.12*devicePixelRatio,
      r:(Math.random()*1.1+.4)*devicePixelRatio
    }));
  }
  size(); addEventListener("resize", size);
  addEventListener("pointermove", e=>{ mouse.x=e.clientX*devicePixelRatio; mouse.y=e.clientY*devicePixelRatio; },{passive:true});

  const ACCENT_RGB = { "": "46,124,255", mint: "46,230,168", violet: "139,92,246", amber: "255,176,46", rose: "255,77,109" };
  const accentRGB = () => ACCENT_RGB[document.body.dataset.accent || ""] || "46,124,255";

  function frame(){
    ctx.clearRect(0,0,W,H);
    const LINK = 130*devicePixelRatio, MLINK = 170*devicePixelRatio;
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;
      if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle="rgba(255,255,255,.22)"; ctx.fill();
    }
    ctx.lineWidth = devicePixelRatio*.5;
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
        if(d<LINK){
          ctx.strokeStyle=`rgba(140,160,220,${(1-d/LINK)*.10})`;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
      const dm=Math.hypot(pts[i].x-mouse.x,pts[i].y-mouse.y);
      if(dm<MLINK){
        ctx.strokeStyle = `rgba(${accentRGB()},${(1-dm/MLINK)*.35})`;
        ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
      }
    }
    if(!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- custom cursor ---------- */
(function cursor(){
  if(reduceMotion || !matchMedia("(pointer:fine)").matches) return;
  document.body.classList.add("has-cursor");
  const dot = document.createElement("div"); dot.className="cursor-dot";
  const ring = document.createElement("div"); ring.className="cursor-ring";
  document.body.append(dot,ring);
  let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;
  addEventListener("pointermove",e=>{x=e.clientX;y=e.clientY;
    dot.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
  },{passive:true});
  (function loop(){
    rx+=(x-rx)*.16; ry+=(y-ry)*.16;
    ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener("pointerover",e=>{
    document.body.classList.toggle("cursor-hover", !!e.target.closest("a,.card,.dot-i,button"));
  });
})();

/* ---------- magnetic nav links ---------- */
(function magnetic(){
  if(reduceMotion) return;
  document.querySelectorAll("nav a").forEach(a=>{
    a.addEventListener("pointermove",e=>{
      const r=a.getBoundingClientRect();
      a.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;
    });
    a.addEventListener("pointerleave",()=>{ a.style.transform=""; a.style.transition="transform .35s cubic-bezier(.2,.9,.3,1.4)";
      setTimeout(()=>a.style.transition="",380);
    });
  });
})();

/* ---------- wordmark: parallax + sheen + scramble-in ---------- */
(function wordmarkFX(){
  const wm = document.getElementById("wordmark");
  if(!wm) return;

  // sheen sweep
  const sheen = document.createElement("span");
  sheen.className = "sheen"; sheen.setAttribute("aria-hidden","true");
  wm.appendChild(sheen);

  // scramble decode on top of the rise-in — starts on enter, not behind the gate
  if(!reduceMotion){
    const startScramble = ()=>{
      const CHARS = "abcdefghijklmnopqrstuvwxyz#@$%&*+";
      [...wm.children].forEach((s,i)=>{
        if(s===sheen) return;
        const finalCh = s.textContent;
        let n = 0, max = 6 + i*2;
        const iv = setInterval(()=>{
          s.textContent = (n++ < max) ? CHARS[Math.floor(Math.random()*CHARS.length)] : finalCh;
          if(n>max){ clearInterval(iv); s.textContent = finalCh; }
        }, 45);
      });
    };
    if(document.body.dataset.page === "home"){   // gate is added later on home → wait for it
      addEventListener("site:entered", startScramble, {once:true});
    } else {
      startScramble();
    }
  }

  // gentle parallax
  if(!reduceMotion){
    addEventListener("pointermove",e=>{
      const dx=(e.clientX/innerWidth-.5), dy=(e.clientY/innerHeight-.5);
      wm.style.transform=`translateY(-50%) translate(${dx*14}px,${dy*10}px)`;
    },{passive:true});
  }
})();

/* ---------- clickable blue dot = accent theme switcher ---------- */
(function accentSwitch(){
  const themes = ["", "mint", "violet", "amber", "rose"]; // "" = electric blue
  let i = 0;
  document.addEventListener("click", e=>{
    if(!e.target.closest(".dot-i")) return;
    i = (i+1) % themes.length;
    if(themes[i]) document.body.dataset.accent = themes[i];
    else delete document.body.dataset.accent;
  });
})();

/* ---------- marquee on home ---------- */
(function marquee(){
  if(document.body.dataset.page !== "home") return;
  const items = `<span>available for freelance work</span><span>·</span><b>${CONFIG.tagline}</b><span>·</span><span>${CONFIG.location}</span><span>·</span><span>status: ${CONFIG.status}</span><span>·</span><span>click the blue dot ↑</span><span>·</span>`;
  const m = document.createElement("div");
  m.className = "marquee";
  m.innerHTML = `<div class="track">${items.repeat(2)}</div>`;
  (document.querySelector(".hero") || document.querySelector("main")).appendChild(m);
})();

/* ---------- time-aware mood line on home ---------- */
(function moodByTime(){
  const mood = document.getElementById("mood");
  if(!mood) return;
  const h = parseInt(new Intl.DateTimeFormat("en-GB",{timeZone:CONFIG.timezone,hour:"2-digit",hour12:false}).format(new Date()),10);
  const lines =
    h < 6  ? "definitely asleep.\nor coding. hard to say" :
    h < 12 ? "probably at school,\nthinking about code" :
    h < 18 ? "probably building something,\nor maybe nothing" :
    h < 23 ? "peak coding hours.\ndo not expect replies" :
             "one more commit,\nthen bed. promise";
  mood.innerText = lines;
})();

/* ---------- scroll progress bar on sub pages ---------- */
(function progress(){
  if(document.body.dataset.page === "home") return;
  const bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);
  function upd(){
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max>0 ? scrollY/max : 0})`;
  }
  addEventListener("scroll", upd, {passive:true}); upd();
})();

/* ============================================================
   V4 — MASSIVE LANDING + UNIQUE DETAILS
   ============================================================ */

/* auto-fit the wordmark to ~92vw, however long the name is */
(function fitWordmark(){
  const wm = document.getElementById("wordmark");
  if(!wm) return;
  function fit(){
    // measure the raw text at 100px with the wordmark's real font — immune to overlays/containers
    const cs = getComputedStyle(wm);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${cs.fontWeight} 100px ${cs.fontFamily}`;
    const w = ctx.measureText(CONFIG.name).width * 0.95; // letter-spacing is negative, so slightly less
    if(w > 0) wm.style.fontSize = Math.min(100 * (innerWidth*0.92)/w, innerHeight*0.5) + "px";
  }
  fit(); addEventListener("resize", fit);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();

/* letters subtly flee the cursor */
(function fleeLetters(){
  if(reduceMotion) return;
  const wm = document.getElementById("wordmark");
  if(!wm) return;
  const letters = [...wm.querySelectorAll("span:not(.sheen)")];
  // once the rise-in finishes, drop the animation so inline transforms take over
  letters.forEach(s => s.addEventListener("animationend", ()=>{ s.style.animation = "none"; }, {once:true}));
  addEventListener("pointermove", e=>{
    for(const s of letters){
      const r = s.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = cx - e.clientX, dy = cy - e.clientY;
      const d = Math.hypot(dx,dy), R = Math.max(r.height*1.1, 160);
      if(d < R && d > 0){
        const f = (1 - d/R) * 26;
        s.style.transform = `translate(${(dx/d)*f}px,${(dy/d)*f}px)`;
      } else {
        s.style.transform = "";
      }
    }
  }, {passive:true});
})();

/* corner HUD */
(function hud(){
  if(document.body.dataset.page !== "home") return;
  const tl = document.createElement("div");
  tl.className = "hud tl";
  tl.innerHTML = `portfolio <b>/2026</b><br>${CONFIG.location.replace("in ","")} · utc+2`;
  const tr = document.createElement("div");
  tr.className = "hud tr";
  tr.innerHTML = `handcrafted, no framework<br><b>${CONFIG.status}</b> — reply time: eventually`;
  document.body.append(tl, tr);
})();

/* enter gate — "click anywhere to enter", like the reference site */
(function enterGate(){
  if(document.body.dataset.page !== "home") return;
  if(reduceMotion){ document.body.classList.add("entered"); return; }

  const el = document.createElement("div");
  el.className = "enter";
  el.innerHTML = `
    <div class="enter-name">${CONFIG.name.replace(/i([^i]*)$/, "ı$1")}<span class="enter-dot"></span></div>
    <div class="enter-hint">click anywhere to enter</div>`;
  document.body.appendChild(el);
  document.body.classList.add("pre");   // hold all hero animations until entered

  function enter(){
    el.classList.add("out");
    document.body.classList.remove("pre");
    document.body.classList.add("entered");
    dispatchEvent(new Event("site:entered"));
    setTimeout(()=>el.remove(), 900);
    removeEventListener("keydown", enter);
  }
  el.addEventListener("click", enter, {once:true});
  addEventListener("keydown", enter, {once:true});
})();

/* ============================================================
   V5 — FULL LANDING + FOOTER
   ============================================================ */

/* footer, injected on every page */
(function footer(){
  const f = document.createElement("footer");
  const year = new Date().getFullYear();
  const navLinks = CONFIG.nav.map(([l,h])=>`<a href="${h}">${l}</a>`).join("");
  f.innerHTML = `
    <div class="foot-inner">
      <div class="foot-grid">
        <div class="foot-col">
          <h4>sitemap</h4>
          ${navLinks}
        </div>
        <div class="foot-col">
          <h4>elsewhere</h4>
          <a href="#" rel="me">github</a>
          <a href="#" rel="me">twitter / x</a>
          <a href="#" rel="me">discord</a>
          <a href="mailto:hi@example.com">email</a>
        </div>
        <div class="foot-col">
          <h4>local time</h4>
          <div class="ftime"><span id="footTime">--:--</span><small>${CONFIG.location}</small></div>
        </div>
        <div class="foot-col">
          <h4>accent</h4>
          <div class="swatches" id="swatches"></div>
        </div>
      </div>
      <div class="foot-ghost" aria-hidden="true">${CONFIG.name}</div>
    </div>
    <div class="foot-base">
      <span>© ${year} ${CONFIG.name} — built by hand, fueled by caffeine</span>
      <a class="to-top">back to top ↑</a>
    </div>`;
  document.body.appendChild(f);

  // footer clock
  setInterval(()=>{
    const fmt = new Intl.DateTimeFormat("en-GB",{timeZone:CONFIG.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
    const el = document.getElementById("footTime");
    if(el) el.textContent = fmt.format(new Date());
  }, 1000);

  // back to top
  f.querySelector(".to-top").addEventListener("click", ()=> scrollTo({top:0, behavior: reduceMotion ? "auto" : "smooth"}));

  // accent swatches
  const SWATCHES = [["","#2e7cff"],["mint","#2ee6a8"],["violet","#8b5cf6"],["amber","#ffb02e"],["rose","#ff4d6d"]];
  const wrap = f.querySelector("#swatches");
  SWATCHES.forEach(([key,color])=>{
    const b = document.createElement("button");
    b.style.background = color;
    b.title = key || "electric blue";
    b.setAttribute("aria-label", "accent: " + (key || "electric blue"));
    if((document.body.dataset.accent||"") === key) b.classList.add("on");
    b.addEventListener("click", ()=>{
      if(key) document.body.dataset.accent = key; else delete document.body.dataset.accent;
      wrap.querySelectorAll("button").forEach(x=>x.classList.remove("on"));
      b.classList.add("on");
    });
    wrap.appendChild(b);
  });
})();

/* reveal home sections + footer on scroll */
(function homeReveal(){
  const targets = document.querySelectorAll(".home-section .eyebrow,.home-section .h2,.big-line,.stats > div,.home-section .card,.more-link,.cta-btn,.foot-col,.foot-ghost");
  if(!targets.length) return;
  targets.forEach((el,i)=>{
    el.classList.add("reveal");
    el.style.setProperty("--d",(Math.min(i%4,3)*0.08)+"s");
  });
  if(reduceMotion){ targets.forEach(el=>el.classList.add("in")); return; }
  const io = new IntersectionObserver(es=>{
    es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} });
  },{threshold:.15});
  targets.forEach(el=>io.observe(el));
})();

/* count-up stats when they scroll into view */
(function counters(){
  const nums = document.querySelectorAll(".stats b[data-count]");
  if(!nums.length) return;
  if(reduceMotion){ nums.forEach(b=>b.textContent=b.dataset.count); return; }
  const io = new IntersectionObserver(es=>{
    es.forEach(en=>{
      if(!en.isIntersecting) return;
      io.unobserve(en.target);
      const target = +en.target.dataset.count, t0 = performance.now(), dur = 1200;
      (function step(t){
        const p = Math.min((t-t0)/dur, 1), ease = 1-Math.pow(1-p,3);
        en.target.textContent = Math.round(target*ease);
        if(p<1) requestAnimationFrame(step);
      })(t0);
    });
  },{threshold:.6});
  nums.forEach(b=>io.observe(b));
})();

/* hero fades slightly as you scroll past it */
(function heroFade(){
  if(reduceMotion) return;
  const hero = document.querySelector(".hero");
  if(!hero) return;
  addEventListener("scroll", ()=>{
    const p = Math.min(scrollY/(innerHeight*.9), 1);
    hero.style.opacity = String(1 - p*.85);
    hero.style.transform = `translateY(${p*-40}px)`;
  }, {passive:true});
})();

/* ============================================================
   V6 — CINEMATIC + COMMAND PALETTE
   ============================================================ */

/* ---------- lenis-style smooth scrolling (handwritten) ---------- */
(function smoothScroll(){
  if(reduceMotion || matchMedia("(pointer:coarse)").matches) return;
  let target = scrollY, current = scrollY, raf = null;
  const maxY = () => document.documentElement.scrollHeight - innerHeight;

  addEventListener("wheel", e=>{
    if(e.ctrlKey) return;                                  // keep pinch-zoom native
    if(document.querySelector(".palette.open")) return;    // palette scrolls itself
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY*16 : e.deltaY;
    target = Math.max(0, Math.min(maxY(), target + delta));
    if(!raf) raf = requestAnimationFrame(loop);
  }, {passive:false});

  function loop(){
    current += (target - current) * 0.085;                 // the "butter"
    if(Math.abs(target - current) < 0.4){
      current = target; scrollTo(0, current); raf = null; return;
    }
    scrollTo(0, current);
    raf = requestAnimationFrame(loop);
  }
  // stay in sync when scrolled by keyboard / scrollbar / anchors
  addEventListener("scroll", ()=>{ if(!raf){ target = current = scrollY; } }, {passive:true});
})();

/* ---------- nav hides on scroll down, returns on scroll up ---------- */
(function navHide(){
  const nav = document.getElementById("nav");
  if(!nav) return;
  nav.addEventListener("animationend", ()=>{ nav.style.animation = "none"; }, {once:true});
  let last = scrollY;
  addEventListener("scroll", ()=>{
    const y = scrollY;
    nav.classList.toggle("hidden", y > 140 && y > last);
    last = y;
  }, {passive:true});
})();

/* ---------- scroll parallax layers ---------- */
(function parallax(){
  if(reduceMotion) return;
  const layers = [
    [document.querySelector(".glow"), -0.12],
    [document.querySelector(".glow.blue"), -0.06],
  ].filter(([el])=>el);
  addEventListener("scroll", ()=>{
    for(const [el, sp] of layers){
      el.style.translate = `0 ${scrollY * sp}px`;
    }
  }, {passive:true});
})();

/* cinematic hero: add slight scale-down to the existing fade */
(function heroZoom(){
  if(reduceMotion) return;
  const hero = document.querySelector(".hero");
  if(!hero) return;
  addEventListener("scroll", ()=>{
    const p = Math.min(scrollY/(innerHeight*.9), 1);
    hero.style.transform = `translateY(${p*-40}px) scale(${1 - p*0.05})`;
  }, {passive:true});
})();

/* ---------- command palette (⌘K / ctrl+K) ---------- */
(function palette(){
  CONFIG.email = CONFIG.email || "hi@example.com";

  const ACCENTS = [["electric blue",""],["mint","mint"],["violet","violet"],["amber","amber"],["rose","rose"]];
  const actions = [
    ...CONFIG.nav.map(([l,h]) => ({label:"go to /"+l, k:"page", run:()=>{ location.href = h; }})),
    ...ACCENTS.map(([name,key]) => ({label:"accent: "+name, k:"theme", run:()=>{
      if(key) document.body.dataset.accent = key; else delete document.body.dataset.accent;
    }})),
    {label:"copy email", k:"contact", run:()=>{ navigator.clipboard && navigator.clipboard.writeText(CONFIG.email); }},
    {label:"write email", k:"contact", run:()=>{ location.href = "mailto:"+CONFIG.email; }},
    {label:"scroll to top", k:"nav", run:()=>scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"})},
    {label:"scroll to bottom", k:"nav", run:()=>scrollTo({top:document.documentElement.scrollHeight,behavior:reduceMotion?"auto":"smooth"})},
    {label:"surprise me", k:"✦", run:()=>{
      const pick = ACCENTS[Math.floor(Math.random()*ACCENTS.length)][1];
      if(pick) document.body.dataset.accent = pick; else delete document.body.dataset.accent;
    }},
  ];

  const pal = document.createElement("div");
  pal.className = "palette";
  pal.innerHTML = `
    <div class="pal-box" role="dialog" aria-label="command palette">
      <input type="text" placeholder="type a command…" spellcheck="false">
      <div class="pal-list"></div>
      <div class="pal-hint"><span>↑↓ navigate</span><span>↵ run</span><span>esc close</span></div>
    </div>`;
  document.body.appendChild(pal);
  const input = pal.querySelector("input");
  const list = pal.querySelector(".pal-list");
  let filtered = actions, sel = 0;

  function render(){
    list.innerHTML = filtered.length
      ? filtered.map((a,i)=>`<div class="pal-item${i===sel?" sel":""}" data-i="${i}"><span>${a.label}</span><span class="k">${a.k}</span></div>`).join("")
      : `<div class="pal-empty">nothing found — try "accent" or "go to"</div>`;
  }
  function open(){
    pal.classList.add("open");
    input.value = ""; filtered = actions; sel = 0; render();
    setTimeout(()=>input.focus(), 30);
  }
  function close(){ pal.classList.remove("open"); input.blur(); }
  function run(a){ close(); if(a) setTimeout(a.run, 60); }

  addEventListener("keydown", e=>{
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); pal.classList.contains("open") ? close() : open(); return; }
    if(!pal.classList.contains("open")) return;
    if(e.key === "Escape") close();
    else if(e.key === "ArrowDown"){ e.preventDefault(); sel = Math.min(sel+1, filtered.length-1); render(); }
    else if(e.key === "ArrowUp"){ e.preventDefault(); sel = Math.max(sel-1, 0); render(); }
    else if(e.key === "Enter"){ run(filtered[sel]); }
  });
  input.addEventListener("input", ()=>{
    const q = input.value.trim().toLowerCase();
    filtered = actions.filter(a => (a.label + " " + a.k).toLowerCase().includes(q));
    sel = 0; render();
  });
  list.addEventListener("click", e=>{
    const item = e.target.closest(".pal-item");
    if(item) run(filtered[+item.dataset.i]);
  });
  pal.addEventListener("click", e=>{ if(e.target === pal) close(); });

  // ⌘K hint chip in the nav
  const nav = document.getElementById("nav");
  if(nav){
    const kbd = document.createElement("span");
    kbd.className = "nav-kbd"; kbd.textContent = "⌘K";
    kbd.title = "command palette";
    kbd.addEventListener("click", open);
    nav.appendChild(kbd);
  }
})();

/* ============================================================
   V7 — LIVE ROOM + LOG (Lanyard for Discord/Spotify, free counter)
   ------------------------------------------------------------
   SETUP:
   1. CONFIG.discordId  → deine Discord User ID (Rechtsklick auf dein
      Profil → "ID kopieren", Entwicklermodus muss an sein)
   2. Tritt dem Lanyard Discord-Server bei: discord.gg/lanyard
      → danach liefert die API deinen Live-Status & Spotify
   3. Fertig. Ohne ID läuft alles im Demo-Modus.
   ============================================================ */
CONFIG.discordId = CONFIG.discordId || "";        // <-- HIER deine Discord ID eintragen
CONFIG.statusMessage = CONFIG.statusMessage || "im here";

(function liveRoom(){
  const page = document.body.dataset.page;
  if(page !== "now" && page !== "log") return;

  const STATUS_MAP = {
    online: ["online", "online"],
    idle: ["idle", "idle"],
    dnd: ["do not disturb", "dnd"],
    offline: ["offline", "offline"],
  };
  const $ = id => document.getElementById(id);

  /* ---- tiny event log stored in the visitor's browser ---- */
  const LOG_KEY = "roomlog";
  function readLog(){ try{ return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }catch(e){ return []; } }
  function writeLog(items){ try{ localStorage.setItem(LOG_KEY, JSON.stringify(items.slice(0,40))); }catch(e){} }
  function addLog(type, text){
    const items = readLog();
    if(items[0] && items[0].text === text) return;   // no duplicates in a row
    items.unshift({type, text, t: Date.now()});
    writeLog(items);
    if(page === "log") renderLog();
  }
  function rel(t){
    const m = Math.max(1, Math.round((Date.now()-t)/60000));
    if(m < 60) return m+"m ago";
    const h = Math.round(m/60);
    if(h < 24) return h+"h ago";
    return Math.round(h/24)+"d ago";
  }
  function renderLog(){
    const list = $("logList");
    if(!list) return;
    let items = readLog();
    if(!items.length){
      items = [
        {type:"track", text:"listened to <b>nachbar</b> <i>by gard</i>", t:Date.now()-52*60000},
        {type:"track", text:"listened to <b>rags2riches</b> <i>by Joje</i>", t:Date.now()-52*60000},
        {type:"status", text:"went <b>do not disturb</b>", t:Date.now()-70*60000},
        {type:"track", text:"listened to <b>blocc cruise</b> <i>by Lyno Nine8</i>", t:Date.now()-57*60000},
      ];
    }
    list.innerHTML = items.map(i =>
      `<div class="log-item"><div class="what">${i.text}</div><div class="when">${rel(i.t)}</div></div>`
    ).join("");
  }
  renderLog();

  /* ---- visitor count (free, anonymous counter API) ---- */
  (function count(){
    const el = $("lrCount");
    if(!el) return;
    const ns = encodeURIComponent(location.hostname || "local") ;
    fetch(`https://abacus.jasoncameron.dev/hit/${ns}/liveroom`)
      .then(r => r.json())
      .then(d => { el.textContent = d.value ?? "1"; })
      .catch(()=>{ el.textContent = "1"; });
  })();

  /* ---- Discord + Spotify via Lanyard ---- */
  let lastStatus = "", lastTrack = "";
  function applyLanyard(d){
    const [label, cls] = STATUS_MAP[d.discord_status] || STATUS_MAP.offline;
    if($("lrStatus")) $("lrStatus").textContent = label;
    if($("logNow")) $("logNow").textContent = label;
    if($("lrDot")){ $("lrDot").className = "bdot " + cls; }
    if($("lrDevice")){
      $("lrDevice").textContent = d.active_on_discord_mobile ? "mobile" : d.active_on_discord_web ? "web" : "desktop";
    }
    if($("lrMessage")) $("lrMessage").textContent = CONFIG.statusMessage;

    // activities (skip spotify, that has its own card)
    const act = (d.activities || []).find(a => a.type !== 2 && a.name !== "Spotify");
    if($("lrActivity")){
      $("lrActivity").textContent = act
        ? `${act.name}${act.details ? " — " + act.details : ""}`
        : "got no activity running rn";
    }
    if($("lrSpotify")){
      $("lrSpotify").innerHTML = d.spotify
        ? `listening to <b>${d.spotify.song}</b> by ${d.spotify.artist}`
        : "nothing playing on spotify at the moment.";
    }
    // feed the log
    if(label !== lastStatus){
      if(lastStatus) addLog("status", `went <b>${label}</b>`);
      lastStatus = label;
    }
    if(d.spotify){
      const key = d.spotify.song + "|" + d.spotify.artist;
      if(key !== lastTrack){
        addLog("track", `listened to <b>${d.spotify.song}</b> <i>by ${d.spotify.artist}</i>`);
        lastTrack = key;
      }
    }
  }
  function poll(){
    if(!CONFIG.discordId) return;   // demo mode: keep the static texts
    fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`)
      .then(r => r.json())
      .then(j => { if(j.success) applyLanyard(j.data); })
      .catch(()=>{});
  }
  poll();
  setInterval(poll, 30000);
})();
