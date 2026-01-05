/* =========================
   StartupSwipe — API-Integrated Script
   Modified to use backend API instead of local data
   ========================= */

/* ---------- THEME + ROUTING ---------- */
const themes = {
  home:    { bg:"#F6F6F6", tint:"rgba(255,203,116,.25)", darkwash:"rgba(17,17,17,.06)" },
  about:   { bg:"#F1F1F1", tint:"rgba(255,203,116,.18)", darkwash:"rgba(17,17,17,.10)" },
  explore: { bg:"#ECECEC", tint:"rgba(255,203,116,.12)", darkwash:"rgba(17,17,17,.14)" },
  profile: { bg:"#EFEFEF", tint:"rgba(255,203,116,.16)", darkwash:"rgba(17,17,17,.12)" }
};

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
  if (!id) return "";
  // Clean the ID (remove any URL parts if user pasted full URL)
  const cleanId = id.replace(/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/, '$1');
  return `https://www.youtube-nocookie.com/embed/${cleanId}?controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
}

function tickerFromName(name){
  const letters = (name || "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  return `$${letters || "START"}`;
}

/* ---------- DATA (NOW FROM API) ---------- */
let startups = [];
let index = 0;
const prevConfidence = new Map();

// Fetch startups from API
async function loadStartups(){
  try {
    const res = await fetch('/api/startups');
    if (!res.ok) throw new Error('Failed to load startups');
    startups = await res.json();
    
    // Initialize prevConfidence map
    startups.forEach(s => prevConfidence.set(s.id, s.confidence));
    
    if (startups.length > 0) {
      index = 0;
      render();
      renderTrending();
    }
  } catch (error) {
    console.error('Error loading startups:', error);
  }
}

// Load on page load
loadStartups();

/* ---------- USER STATE (FROM NEXTAUTH) ---------- */
let authUser = null;

async function loadUser(){
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    authUser = data.user;
    updateUserUI();
  } catch (error) {
    console.error('Error loading user:', error);
  }
}

// Check for NextAuth session
if (window.nextAuthSession) {
  authUser = window.nextAuthSession.user;
  updateUserUI();
} else {
  loadUser();
}

function updateUserUI(){
  if (authUser) {
    const name = authUser.name || authUser.email || 'User';
    const firstLetter = name.charAt(0).toUpperCase();
    avatarLetter.textContent = firstLetter;
    usernameEl.textContent = name;
    userSub.textContent = "Dashboard";
  } else {
    avatarLetter.textContent = "?";
    usernameEl.textContent = "Guest";
    userSub.textContent = "Sign in to submit";
  }
}

/* ---------- DOM ---------- */
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
const uploadModal = document.getElementById("uploadModal");
const closeUpload = document.getElementById("closeUpload");
const cancelUpload = document.getElementById("cancelUpload");
const submitUpload = document.getElementById("submitUpload");
const upName = document.getElementById("upName");
const upDesc = document.getElementById("upDesc");
const upYt = document.getElementById("upYt");
const upSite = document.getElementById("upSite");
const upSocial = document.getElementById("upSocial");
const userMenu = document.getElementById("userMenu");
const userTrigger = document.getElementById("userTrigger");
const userDropdown = document.getElementById("userDropdown");
const avatarLetter = document.getElementById("avatarLetter");
const usernameEl = document.getElementById("username");
const userSub = document.getElementById("userSub");
const logoutBtn = document.getElementById("logoutBtn");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileMeta = document.getElementById("profileMeta");
const statCount = document.getElementById("statCount");
const statAvg = document.getElementById("statAvg");
const statLatest = document.getElementById("statLatest");
const profileList = document.getElementById("profileList");
const profileSeedBtn = document.getElementById("profileSeedBtn");

/* ---------- MODAL HELPERS ---------- */
function showModal(el){ if (el) el.hidden = false; }
function hideModal(el){ if (el) el.hidden = true; }

function anyModalOpen(){
  return (
    infoModal && !infoModal.hidden ||
    feedbackModal && !feedbackModal.hidden ||
    uploadModal && !uploadModal.hidden
  );
}

function bindOverlayClose(overlayEl, closeFn){
  if (!overlayEl) return;
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeFn();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (uploadModal && !uploadModal.hidden) return hideModal(uploadModal);
  if (feedbackModal && !feedbackModal.hidden) return hideModal(feedbackModal);
  if (infoModal && !infoModal.hidden) return hideModal(infoModal);
  userMenu?.classList.remove("open");
});

/* ---------- USER MENU ---------- */
userTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!authUser){
    if (window.nextAuthSignIn) {
      window.nextAuthSignIn();
    }
    return;
  }
  userMenu.classList.toggle("open");
});

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
  if (window.nextAuthSignOut) {
    window.nextAuthSignOut();
  }
  authUser = null;
  updateUserUI();
  routeTo("home");
});

/* ---------- UPLOAD ---------- */
beSeedBtn?.addEventListener("click", () => {
  if (!authUser) {
    if (window.nextAuthSignIn) {
      window.nextAuthSignIn();
    }
    return;
  }
  showModal(uploadModal);
});

profileSeedBtn?.addEventListener("click", () => {
  if (!authUser) {
    if (window.nextAuthSignIn) {
      window.nextAuthSignIn();
    }
    return;
  }
  showModal(uploadModal);
});

closeUpload?.addEventListener("click", () => hideModal(uploadModal));
cancelUpload?.addEventListener("click", () => hideModal(uploadModal));
bindOverlayClose(uploadModal, () => hideModal(uploadModal));

submitUpload?.addEventListener("click", async () => {
  if (!authUser) {
    alert("Please log in first.");
    if (window.nextAuthSignIn) window.nextAuthSignIn();
    return;
  }

  const nm = (upName.value || "").trim();
  const ds = (upDesc.value || "").trim();
  const yt = (upYt.value || "").trim();

  if (!nm || !ds || !yt) {
    alert("Please add: name, description, and YouTube ID.");
    return;
  }

  try {
    const res = await fetch('/api/startups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nm,
        description: ds,
        ytId: yt,
        website: (upSite.value || "").trim() || null,
        social: (upSocial.value || "").trim() || null,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.error || "Failed to submit startup");
      return;
    }

    const newStartup = await res.json();
    
    upName.value = "";
    upDesc.value = "";
    upYt.value = "";
    upSite.value = "";
    upSocial.value = "";

    hideModal(uploadModal);

    // Reload startups and show new one
    await loadStartups();
    const newIndex = startups.findIndex(s => s.id === newStartup.id);
    if (newIndex >= 0) {
      index = newIndex;
      render();
    }
    routeTo("home");
  } catch (error) {
    console.error('Error submitting startup:', error);
    alert("Failed to submit startup. Please try again.");
  }
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
  if (startups.length === 0) {
    // Show placeholder if no startups
    if (nameEl) nameEl.textContent = "No startups yet";
    if (descEl) descEl.textContent = "Be the first to submit a startup!";
    if (video) video.src = "";
    return;
  }
  
  const s = startups[index];
  if (!s) return;

  if (pillTag) pillTag.textContent = s.pill || "Startup";
  if (nameEl) nameEl.textContent = s.name || "Startup Name";
  if (tagEl) tagEl.textContent = s.tag || "General";
  if (descEl) descEl.textContent = s.desc || "No description";
  if (captionEl) captionEl.textContent = s.caption || s.desc || "Startup demo";

  // Clear and set video source
  if (video && s.yt) {
    video.src = "";
    const newSrc = ytUrl(s.yt);
    if (newSrc) {
      // Use setTimeout to ensure iframe reloads properly
      setTimeout(() => {
        if (video) {
          video.src = newSrc;
          // Force reload by removing and re-adding src
          video.removeAttribute('src');
          video.setAttribute('src', newSrc);
        }
      }, 100);
    }
  } else if (video) {
    video.src = "";
  }

  animateConfidence(s.confidence || 50);
  document.querySelectorAll(".vote").forEach(b => b.classList.remove("active"));

  renderTrending();
}

/* ---------- VOTE (NOW POSTS TO API) ---------- */
async function submitVote(vote){
  if (startups.length === 0) return;
  const current = startups[index];
  
  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startupId: current.id,
        vote: vote,
      }),
    });

    if (!res.ok) {
      console.error('Failed to submit vote');
      return;
    }

    const data = await res.json();
    
    // Update local confidence
    prevConfidence.set(current.id, current.confidence);
    current.confidence = data.confidence;
    
    renderTrending();
  } catch (error) {
    console.error('Error submitting vote:', error);
  }
}

function voteAndSwipe(vote){
  const current = startups[index];
  const btn = document.querySelector(`.vote.${vote}`);
  if (!btn) return;

  document.querySelectorAll(".vote").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  submitVote(vote);
  
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
  submitVote("skip");
  swipeLeftToNext();
});

/* ---------- SWIPE GESTURE (UNCHANGED) ---------- */
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

  if (e.preventDefault) e.preventDefault();
  
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
  
  const dt = now - lastTime;
  if (dt > 0) {
    const dxInstant = clientX - lastX;
    velocity = dxInstant / dt;
  }
  
  dx = clientX - startX;
  dy = Math.abs(clientY - startY);
  
  if (Math.abs(dy) > Math.abs(dx) * 1.5) {
    return;
  }
  
  if (e.preventDefault) e.preventDefault();
  
  if (dx > 0) dx *= 0.15;

  const rot = dx / 25;
  
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

  const finalVelocity = velocity < -0.3;
  
  if (dx < -120 || (dx < -60 && finalVelocity)){
    const current = startups[index];
    submitVote("skip");
    swipeLeftToNext();
    return;
  }

  card.style.transition = "transform 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 180ms ease";
  card.style.transform = "";
  card.style.opacity = "";
  setTimeout(() => { 
    card.style.transition = "";
  }, 200);
  
  try {
    if (e && e.pointerId !== undefined && e.currentTarget) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  } catch (_) {}
}

function bindSwipe(el){
  if (!el) return;
  
  el.addEventListener("pointerdown", startDrag);
  el.addEventListener("pointermove", moveDrag);
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  
  el.addEventListener("touchstart", startDrag, { passive: false });
  el.addEventListener("touchmove", moveDrag, { passive: false });
  el.addEventListener("touchend", endDrag);
  el.addEventListener("touchcancel", endDrag);
}

bindSwipe(card);
bindSwipe(dragOverlay);

/* ---------- SWIPE TO NEXT ---------- */
function swipeLeftToNext(){
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

      requestAnimationFrame(() => {
        card.style.pointerEvents = "";
      });
    }, 340);
  });
}

/* ---------- READ MORE MODAL ---------- */
readMoreBtn?.addEventListener("click", () => {
  if (startups.length === 0) return;
  const s = startups[index];
  infoTitle.textContent = s.name;
  infoText.textContent = s.about || s.desc;
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
  hideModal(feedbackModal);
  if (feedbackTextareas) {
    feedbackTextareas.forEach(ta => ta.value = "");
  }
});

/* ---------- PROFILE ---------- */
function ytThumb(ytId){
  return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
}

async function renderProfile(){
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

  const uname = authUser.name || authUser.email || "User";
  profileAvatar.textContent = uname.charAt(0).toUpperCase();
  profileName.textContent = uname;

  const mine = startups.filter(s => s.userId === authUser.id);
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
updateUserUI();
if (startups.length > 0) {
  render();
  renderTrending();
}

