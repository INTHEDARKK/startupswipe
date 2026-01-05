/* =========================
   StartupSwipe — script.js
   (FULL REWRITE, JS ONLY)
   ========================= */

/* ---------- THEME + ROUTING ---------- */
const themes = {
  home:    { bg:"#F6F6F6", tint:"rgba(255,203,116,.25)", darkwash:"rgba(17,17,17,.06)" },
  about:   { bg:"#F1F1F1", tint:"rgba(255,203,116,.18)", darkwash:"rgba(17,17,17,.10)" },
  explore: { bg:"#ECECEC", tint:"rgba(255,203,116,.12)", darkwash:"rgba(17,17,17,.14)" },
  profile: { bg:"#EFEFEF", tint:"rgba(255,203,116,.16)", darkwash:"rgba(17,17,17,.12)" }
};


function extractYouTubeId(input) {
  const s = String(input || "").trim();

  // If user already pasted an ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  // Try parsing as a URL
  try {
    const url = new URL(s);

    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    // youtube.com/watch?v=<id>
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // youtube.com/embed/<id>
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        const id = parts[embedIndex + 1];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch (e) {
    // Not a valid URL, ignore
  }

  // Fallback regex (handles odd pastes)
  const m =
    s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    s.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    s.match(/\/embed\/([a-zA-Z0-9_-]{11})/);

  return m ? m[1] : null;
}


const views = Array.from(document.querySelectorAll(".view"));
const navLinks = Array.from(document.querySelectorAll(".navlink"));
const routeButtons = Array.from(document.querySelectorAll("[data-route]"));

let currentView = "home";
let isRouting = false;

function setTheme(route){
  const t = themes[route] || themes.home;
  document.documentElement.style.setProperty("--page-bg", t.bg);
  document.documentElement.style.setProperty("--page-tint", t.tint);
  document.documentElement.style.setProperty("--page-darkwash", t.darkwash);
}

function setActiveNav(route){
  navLinks.forEach(btn => btn.classList.toggle("active", btn.dataset.route === route));
}

function getView(route){
  return views.find(v => v.dataset.view === route);
}

function routeTo(nextRoute){
  if (isRouting) return;
  if (nextRoute === currentView) return;

  const from = getView(currentView);
  const to = getView(nextRoute);
  if (!from || !to) return;

  isRouting = true;

  // reduce heavy blur during transitions (CSS checks this class)
  document.body.classList.add("is-transitioning");
  setTimeout(() => document.body.classList.remove("is-transitioning"), 360);

  const order = ["home","about","explore","profile"];
  const dir = order.indexOf(nextRoute) > order.indexOf(currentView) ? "right" : "left";

  to.classList.remove("is-exiting-left","is-entering-right");
  from.classList.remove("is-exiting-left","is-entering-right");

  if (dir === "right") to.classList.add("is-entering-right");
  to.classList.add("is-active");

  setTheme(nextRoute);
  setActiveNav(nextRoute);

  // Use double RAF for smoother transitions
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      to.classList.remove("is-entering-right");
      if (dir === "left") from.classList.add("is-exiting-left");
    });
  });

  setTimeout(() => {
    from.classList.remove("is-active", "is-exiting-left");
    currentView = nextRoute;
    isRouting = false;

    if (nextRoute === "profile") {
      requestAnimationFrame(() => renderProfile());
    }
  }, 320);
}

routeButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    routeTo(btn.dataset.route);
  });
});

setTheme("home");

/* ---------- UTILS ---------- */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function ytUrl(id){
  // minimal YouTube embed (still shows small corner watermark sometimes — YouTube limitation)
  return `https://www.youtube-nocookie.com/embed/${id}?controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`;
}

function tickerFromName(name){
  const letters = (name || "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  return `$${letters || "START"}`;
}

/* ---------- DATA ---------- */
let authUser = null;

const startups = [
  {
    id: "pantry",
    name: "PantryPilot",
    pill: "Consumer",
    tag: "Consumer",
    caption: "Consumer demo: meal planning + waste reduction.",
    desc: "Smart grocery planning to reduce waste.",
    about: "PantryPilot helps users plan meals using what they already have and generates smart shopping lists.",
    confidence: 66,
    yt: "jNQXAC9IVRw",
    website: "https://example.com",
    social: "https://x.com"
  },
  {
    id: "orbit",
    name: "OrbitOps",
    pill: "DevTools",
    tag: "DevTools",
    caption: "DevTools demo: production issues explained clearly.",
    desc: "Observability explained in plain English.",
    about: "OrbitOps turns logs, traces, and metrics into explanations and likely root causes to reduce incident time.",
    confidence: 74,
    yt: "M7lc1UVf-VE",
    website: "https://example.com",
    social: "https://linkedin.com"
  },
  {
    id: "neuralsync",
    name: "NeuralSync",
    pill: "AI",
    tag: "AI / ML",
    caption: "AI demo: assistive workflow prototype.",
    desc: "Human-AI collaboration layer for faster decisions.",
    about: "NeuralSync focuses on intent-to-action workflows and lightweight agent assist in everyday tools.",
    confidence: 58,
    yt: "M7lc1UVf-VE",
    website: "https://example.com",
    social: "https://x.com"
  }
];

let index = 0;

// to compute ▲ ▼ ▬ movement in trending
const prevConfidence = new Map();
startups.forEach(s => prevConfidence.set(s.id, s.confidence));

/* ---------- DOM ---------- */
// Home card
const card = document.getElementById("card");
const video = document.getElementById("video");
const videoWrap = document.getElementById("videoWrap");
const dragOverlay = document.getElementById("dragOverlay");
const pillTag = document.getElementById("pillTag");

const nameEl = document.getElementById("name");
const tagEl = document.getElementById("tag");
const descEl = document.getElementById("desc");
const captionEl = document.getElementById("videoCaption");

const confEl = document.getElementById("confidence");
const ringFg = document.querySelector(".ring-fg");

const skipBtn = document.getElementById("skipBtn");
const trendList = document.getElementById("trendList");

// modals
const readMoreBtn = document.getElementById("readMoreBtn");
const infoModal = document.getElementById("infoModal");
const closeInfo = document.getElementById("closeInfo");
const infoTitle = document.getElementById("infoTitle");
const infoText = document.getElementById("infoText");
const siteLink = document.getElementById("siteLink");
const socialLink = document.getElementById("socialLink");

const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeFeedback = document.getElementById("closeFeedback");
const cancelFeedback = document.getElementById("cancelFeedback");

const beSeedBtn = document.getElementById("beSeedBtn");
const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");
const cancelAuth = document.getElementById("cancelAuth");
const doAuth = document.getElementById("doAuth");
const authTitle = document.getElementById("authTitle");
const authHint = document.getElementById("authHint");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const registerExtra = document.getElementById("registerExtra");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPass = document.getElementById("authPass");

const uploadModal = document.getElementById("uploadModal");
const closeUpload = document.getElementById("closeUpload");
const cancelUpload = document.getElementById("cancelUpload");
const submitUpload = document.getElementById("submitUpload");
const upName = document.getElementById("upName");
const upDesc = document.getElementById("upDesc");
const upYt = document.getElementById("upYt");
const upSite = document.getElementById("upSite");
const upSocial = document.getElementById("upSocial");

// user dropdown
const userMenu = document.getElementById("userMenu");
const userTrigger = document.getElementById("userTrigger");
const userDropdown = document.getElementById("userDropdown");
const avatarLetter = document.getElementById("avatarLetter");
const usernameEl = document.getElementById("username");
const userSub = document.getElementById("userSub");
const logoutBtn = document.getElementById("logoutBtn");

// profile
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileMeta = document.getElementById("profileMeta");
const statCount = document.getElementById("statCount");
const statAvg = document.getElementById("statAvg");
const statLatest = document.getElementById("statLatest");
const profileList = document.getElementById("profileList");
const profileSeedBtn = document.getElementById("profileSeedBtn");

/* ---------- MODAL OPEN/CLOSE HELPERS ---------- */
function showModal(el){ if (el) el.hidden = false; }
function hideModal(el){ if (el) el.hidden = true; }

function anyModalOpen(){
  return (
    infoModal && !infoModal.hidden ||
    feedbackModal && !feedbackModal.hidden ||
    authModal && !authModal.hidden ||
    uploadModal && !uploadModal.hidden
  );
}

// click outside to close (generic)
function bindOverlayClose(overlayEl, closeFn){
  if (!overlayEl) return;
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeFn();
  });
}

// ESC closes top-most open modal
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  // Close in priority order
  if (uploadModal && !uploadModal.hidden) return hideModal(uploadModal);
  if (authModal && !authModal.hidden) return hideModal(authModal);
  if (feedbackModal && !feedbackModal.hidden) return hideModal(feedbackModal);
  if (infoModal && !infoModal.hidden) return hideModal(infoModal);
  userMenu?.classList.remove("open");
});

/* ---------- USER MENU ---------- */
function setLoggedOutUI(){
  authUser = null;
  avatarLetter.textContent = "?";
  usernameEl.textContent = "Guest";
  userSub.textContent = "Sign in to submit";
  userMenu.classList.remove("open");
}

function setLoggedInUI(username){
  authUser = { username };
  avatarLetter.textContent = username.slice(0, 1).toUpperCase();
  usernameEl.textContent = username;
  userSub.textContent = "Dashboard";
}

userTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!authUser){
    openAuth("login");
    return;
  }
  userMenu.classList.toggle("open");
});

// Close user menu when clicking outside
document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target) && !userTrigger.contains(e.target)) {
    userMenu.classList.remove("open");
  }
});

userDropdown.querySelectorAll("[data-route]").forEach(btn => {
  btn.addEventListener("click", () => {
    userMenu.classList.remove("open");
    routeTo(btn.dataset.route);
  });
});

logoutBtn.addEventListener("click", () => {
  setLoggedOutUI();
  routeTo("home");
});

/* ---------- AUTH + UPLOAD ---------- */
let authMode = "login";

function setAuthMode(mode){
  authMode = mode;
  const isLogin = mode === "login";

  tabLogin.classList.toggle("active", isLogin);
  tabRegister.classList.toggle("active", !isLogin);

  tabLogin.setAttribute("aria-selected", String(isLogin));
  tabRegister.setAttribute("aria-selected", String(!isLogin));

  registerExtra.hidden = isLogin;

  authTitle.textContent = isLogin ? "Log in" : "Register";
  doAuth.textContent = isLogin ? "Continue" : "Create account";
  authHint.textContent = "Demo UI only. Backend later.";

  setTimeout(() => authName.focus(), 0);
}

function openAuth(mode="login"){
  setAuthMode(mode);
  showModal(authModal);
}
function closeAuthFn(){
  hideModal(authModal);
}

function openUpload(){
  showModal(uploadModal);
}
function closeUploadFn(){
  hideModal(uploadModal);
}

closeAuth?.addEventListener("click", closeAuthFn);
cancelAuth?.addEventListener("click", closeAuthFn);
bindOverlayClose(authModal, closeAuthFn);

tabLogin?.addEventListener("click", () => setAuthMode("login"));
tabRegister?.addEventListener("click", () => setAuthMode("register"));

beSeedBtn?.addEventListener("click", () => {
  if (!authUser) openAuth("login");
  else openUpload();
});

profileSeedBtn?.addEventListener("click", () => {
  if (!authUser) openAuth("login");
  else openUpload();
});

doAuth?.addEventListener("click", () => {
  const nm = (authName.value || "").trim();
  if (!nm) return alert("Please enter a username.");

  if (authMode === "register"){
    const em = (authEmail.value || "").trim();
    if (!em || !em.includes("@")) return alert("Please enter a valid email.");
  }

  setLoggedInUI(nm);
  closeAuthFn();

  authName.value = "";
  authEmail.value = "";
  authPass.value = "";

  openUpload();
});

closeUpload?.addEventListener("click", closeUploadFn);
cancelUpload?.addEventListener("click", closeUploadFn);
bindOverlayClose(uploadModal, closeUploadFn);

/* ---------- UPDATED SUBMIT HANDLER ---------- */
submitUpload?.addEventListener("click", () => {
  if (!authUser) return alert("Please log in first.");

  const nm = (upName.value || "").trim();
  const ds = (upDesc.value || "").trim();
  const rawYt = (upYt.value || "").trim(); // Get the raw input

  // FIX: Extract the ID from the URL before saving
  const extractedId = extractYouTubeId(rawYt);

  if (!nm || !ds || !extractedId) {
    return alert("Please provide a valid YouTube link or ID.");
  }

  const id = `u_${Math.random().toString(16).slice(2)}`;
  const newStartup = {
    id,
    name: nm,
    pill: "Submitted",
    tag: "Submitted",
    caption: `Submitted by ${authUser.username}`,
    desc: ds,
    about: ds,
    confidence: 50,
    yt: extractedId, // Save the clean ID here
    website: (upSite.value || "").trim() || "#",
    social: (upSocial.value || "").trim() || "#"
  };

  startups.unshift(newStartup);
  prevConfidence.set(id, newStartup.confidence);

  // Clear inputs
  upName.value = "";
  upDesc.value = "";
  upYt.value = "";
  upSite.value = "";
  upSocial.value = "";

  closeUploadFn();

  index = 0;
  routeTo("home");
  render();
});
  startups.unshift(newStartup);
  prevConfidence.set(id, newStartup.confidence);

  upName.value = "";
  upDesc.value = "";
  upYt.value = "";
  upSite.value = "";
  upSocial.value = "";

  closeUploadFn();

  index = 0;
  routeTo("home");
  render();
});

/* ---------- CONFIDENCE RING ---------- */
function animateConfidence(toPercent){
  if (!ringFg || !confEl) return;
  
  const r = 18;
  const c = 2 * Math.PI * r;
  ringFg.style.strokeDasharray = `${c} ${c}`;
  ringFg.style.willChange = "stroke-dashoffset";

  const duration = 520;
  const t0 = performance.now();

  function tick(now){
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);

    const val = Math.round(toPercent * eased);
    confEl.textContent = val;

    const offset = c * (1 - (val / 100));
    ringFg.style.strokeDashoffset = `${offset}`;

    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      ringFg.style.willChange = "";
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- TRENDING ---------- */
function movementSymbol(id, current){
  const prev = prevConfidence.get(id) ?? current;
  const diff = current - prev;
  if (diff >= 1) return { sym: "▲", cls: "up" };
  if (diff <= -1) return { sym: "▼", cls: "down" };
  return { sym: "▬", cls: "flat" };
}

function renderTrending(){
  const ranked = [...startups]
    .sort((a,b) => b.confidence - a.confidence)
    .slice(0, 10);

  trendList.innerHTML = ranked.map(s => {
    const tkr = tickerFromName(s.name);
    const mv = movementSymbol(s.id, s.confidence);
    const barW = clamp(s.confidence, 0, 100);

    return `
      <div class="trend-item">
        <div class="trend-name">
          ${s.name}
          <span class="ticker">
            ${tkr}
            <span class="move ${mv.cls}">${mv.sym}</span>
          </span>
        </div>
        <div class="trend-bar"><div style="width:${barW}%"></div></div>
        <div class="trend-meta">
          <span>${s.tag}</span>
          <span><strong>${s.confidence}%</strong></span>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------- CARD RENDER ---------- */
function render(){
  const s = startups[index];

  pillTag.textContent = s.pill;
  nameEl.textContent = s.name;
  tagEl.textContent = s.tag;
  descEl.textContent = s.desc;
  captionEl.textContent = s.caption;

  // reset + set
  video.src = "";
  video.src = ytUrl(s.yt);

  animateConfidence(s.confidence);
  document.querySelectorAll(".vote").forEach(b => b.classList.remove("active"));

  renderTrending();
}

/* ---------- VOTE IMPACT + SWIPE ---------- */
function applyVoteImpact(id, vote){
  const s = startups.find(x => x.id === id);
  if (!s) return;

  prevConfidence.set(s.id, s.confidence);

  let delta = 0;
  if (vote === "yes") delta = 2;
  if (vote === "maybe") delta = 1;
  if (vote === "no") delta = -2;
  if (vote === "skip") delta = -1;

  s.confidence = clamp(s.confidence + delta, 0, 100);
}

function swipeLeftToNext(){
  // stop video before animating out
  if (video) video.src = "";

  card.style.pointerEvents = "none";
  card.style.willChange = "transform, opacity";
  card.classList.add("swipe-out");

  requestAnimationFrame(() => {
    setTimeout(() => {
      card.classList.remove("swipe-out");
      card.style.transform = "";
      card.style.opacity = "";
      card.style.transition = "";
      card.style.willChange = "";

      index = (index + 1) % startups.length;
      render();

      // Reset card position for next render
      requestAnimationFrame(() => {
        card.style.pointerEvents = "";
      });
    }, 340);
  });
}

function voteAndSwipe(vote){
  const current = startups[index];
  const btn = document.querySelector(`.vote.${vote}`);
  if (!btn) return;

  document.querySelectorAll(".vote").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  applyVoteImpact(current.id, vote);
  renderTrending();

  setTimeout(swipeLeftToNext, 140);
}

document.querySelectorAll(".vote").forEach(btn => {
  btn.addEventListener("click", () => voteAndSwipe(btn.dataset.vote));
});

/* ---------- SKIP BUTTON ---------- */
skipBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const current = startups[index];
  applyVoteImpact(current.id, "skip");
  renderTrending();

  swipeLeftToNext();
});

/* ---------- DRAG-TO-SWIPE (WITH OVERLAY) ---------- */
let isDragging = false;
let startX = 0;
let startY = 0;
let dx = 0;
let dy = 0;
let startTime = 0;
let lastX = 0;
let lastTime = 0;
let velocity = 0;
let rafId = null;

function startDrag(e){
  if (anyModalOpen()) return;
  if (e.target.closest("button")) return;
  if (currentView !== "home") return;

  isDragging = true;
  const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
  const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
  startX = clientX;
  startY = clientY;
  lastX = clientX;
  dx = 0;
  dy = 0;
  startTime = performance.now();
  lastTime = startTime;
  velocity = 0;

  card.style.transition = "none";
  card.style.willChange = "transform, opacity";
  videoWrap.classList.add("dragging");
  dragOverlay.classList.add("dragging");

  // Prevent default touch behaviors
  if (e.preventDefault) e.preventDefault();
  
  // capture on the element you started on
  try { 
    if (e.pointerId !== undefined) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  } catch (_) {}
}

function moveDrag(e){
  if (!isDragging) return;

  const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || lastX;
  const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
  const now = performance.now();
  
  // Calculate velocity for momentum
  const dt = now - lastTime;
  if (dt > 0) {
    const dxInstant = clientX - lastX;
    velocity = dxInstant / dt; // pixels per ms
  }
  
  dx = clientX - startX;
  dy = Math.abs(clientY - startY);
  
  // Only allow horizontal swipes (ignore if too vertical)
  if (Math.abs(dy) > Math.abs(dx) * 1.5) {
    return;
  }
  
  // Prevent default to stop scrolling
  if (e.preventDefault) e.preventDefault();
  
  if (dx > 0) dx *= 0.15; // resist dragging right

  const rot = dx / 25;
  
  // Use requestAnimationFrame for smooth 60fps
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    card.style.transform = `translate3d(${dx}px,0,0) rotate(${rot}deg)`;
    const fade = Math.max(0.4, 1 - Math.abs(dx) / 600);
    card.style.opacity = String(fade);
  });

  lastX = clientX;
  lastTime = now;
}

function endDrag(e){
  if (!isDragging) return;
  isDragging = false;
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  videoWrap.classList.remove("dragging");
  dragOverlay.classList.remove("dragging");
  card.style.willChange = "";

  // Calculate final velocity (negative = left swipe)
  const finalVelocity = velocity < -0.3; // threshold for momentum swipe
  
  // threshold: 120px OR high velocity left swipe
  if (dx < -120 || (dx < -60 && finalVelocity)){
    const current = startups[index];
    applyVoteImpact(current.id, "skip");
    renderTrending();
    swipeLeftToNext();
    return;
  }

  // snap back
  card.style.transition = "transform 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 180ms ease";
  card.style.transform = "";
  card.style.opacity = "";
  setTimeout(() => { 
    card.style.transition = "";
  }, 200);
  
  // Release pointer capture
  try {
    if (e && e.pointerId !== undefined && e.currentTarget) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  } catch (_) {}
}

function bindSwipe(el){
  if (!el) return;
  
  // Pointer events (modern browsers, works for mouse + touch)
  el.addEventListener("pointerdown", startDrag);
  el.addEventListener("pointermove", moveDrag);
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  
  // Touch events fallback for older browsers
  el.addEventListener("touchstart", startDrag, { passive: false });
  el.addEventListener("touchmove", moveDrag, { passive: false });
  el.addEventListener("touchend", endDrag);
  el.addEventListener("touchcancel", endDrag);
}

bindSwipe(card);
bindSwipe(dragOverlay); // IMPORTANT: so iframe doesn't steal gestures

/* ---------- READ MORE MODAL ---------- */
readMoreBtn?.addEventListener("click", () => {
  const s = startups[index];
  infoTitle.textContent = s.name;
  infoText.textContent = s.about;
  const siteUrl = s.website && s.website !== "#" ? s.website : "#";
  const socialUrl = s.social && s.social !== "#" ? s.social : "#";
  siteLink.href = siteUrl;
  socialLink.href = socialUrl;
  if (siteUrl === "#") {
    siteLink.style.pointerEvents = "none";
    siteLink.style.opacity = "0.5";
  } else {
    siteLink.style.pointerEvents = "auto";
    siteLink.style.opacity = "1";
  }
  if (socialUrl === "#") {
    socialLink.style.pointerEvents = "none";
    socialLink.style.opacity = "0.5";
  } else {
    socialLink.style.pointerEvents = "auto";
    socialLink.style.opacity = "1";
  }
  showModal(infoModal);
});
closeInfo?.addEventListener("click", () => hideModal(infoModal));
bindOverlayClose(infoModal, () => hideModal(infoModal));

/* ---------- FEEDBACK MODAL ---------- */
const feedbackTextareas = feedbackModal?.querySelectorAll("textarea");
const feedbackSubmit = feedbackModal?.querySelector(".submit");

feedbackBtn?.addEventListener("click", () => {
  if (feedbackTextareas) {
    feedbackTextareas.forEach(ta => ta.value = "");
  }
  showModal(feedbackModal);
});

closeFeedback?.addEventListener("click", () => hideModal(feedbackModal));
cancelFeedback?.addEventListener("click", () => hideModal(feedbackModal));
bindOverlayClose(feedbackModal, () => hideModal(feedbackModal));

feedbackSubmit?.addEventListener("click", () => {
  // Demo: just close the modal
  // In real app, would submit to backend
  hideModal(feedbackModal);
  if (feedbackTextareas) {
    feedbackTextareas.forEach(ta => ta.value = "");
  }
});

/* ---------- PROFILE ---------- */
function ytThumb(ytId){
  return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
}

function renderProfile(){
  if (!authUser){
    profileAvatar.textContent = "?";
    profileName.textContent = "Guest";
    profileMeta.textContent = "Sign in to track submissions";
    statCount.textContent = "0";
    statAvg.textContent = "--";
    statLatest.textContent = "--";
    profileList.innerHTML = "";
    return;
  }

  const uname = authUser.username;
  profileAvatar.textContent = uname.slice(0,1).toUpperCase();
  profileName.textContent = uname;

  const mine = startups.filter(s => (s.caption || "").includes(`Submitted by ${uname}`));
  profileMeta.textContent = `${mine.length} submissions`;

  statCount.textContent = String(mine.length);

  if (mine.length){
    const avg = Math.round(mine.reduce((a,x)=>a+(x.confidence||50),0)/mine.length);
    statAvg.textContent = `${avg}%`;
    statLatest.textContent = "Today";
  } else {
    statAvg.textContent = "--";
    statLatest.textContent = "--";
  }

  profileList.innerHTML = mine.map(it => `
    <div class="profile-item">
      <div class="profile-thumb">
        <img src="${ytThumb(it.yt)}" alt="" />
      </div>
      <div class="profile-item-main">
        <div class="profile-item-title">${it.name}</div>
        <div class="profile-item-sub">
          <span><strong>${it.confidence}%</strong> confidence</span>
          <span>${it.tag}</span>
        </div>
      </div>
      <button class="profile-open" data-open-id="${it.id}" type="button">Open</button>
    </div>
  `).join("");

  profileList.querySelectorAll("[data-open-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-open-id");
      const idx = startups.findIndex(s => s.id === id);
      if (idx >= 0) {
        index = idx;
        routeTo("home");
        render();
      } else {
        routeTo("home");
      }
    });
  });
}

/* ---------- INIT ---------- */
setLoggedOutUI();
renderTrending();
render();

