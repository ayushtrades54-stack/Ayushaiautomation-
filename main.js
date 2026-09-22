/* ══════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — CORE JS
   1. Live AI-node network background (public pages only)
   2. Scroll reveal
   3. Draggable / magnetic floating social buttons
   4. Floating side tag (hides while scrolling)

   Shared UI behaviour (nav, footer, toggles, accordions) lives in
   ui.js, which loads after this file.

   Nothing here exposes backend architecture. The nodes are a
   decorative abstraction — no workflow names, endpoints, tokens
   or customer data are represented or transmitted.
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia && window.matchMedia("(max-width: 860px)").matches;

  /* ────────────────────────────────────────────────────────────
     1. LIVE AI-NODE NETWORK BACKGROUND

     Rendered only where <body data-bg="live"> is set.
     Protected pages (forms, booking, legal) omit the attribute
     and get no canvas at all.
     ──────────────────────────────────────────────────────────── */
  function initNodeField(canvas) {
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var nodes = [];
    var pulses = [];
    var raf = null;
    var lastFrame = 0;

    /* Deliberately few nodes — this is ambience, not a simulation */
    var NODE_COUNT = isMobile ? 12 : 22;
    var LINK_DIST  = isMobile ? 130 : 175;
    var FPS_CAP    = 30;            // capped to keep CPU low
    var FRAME_MS   = 1000 / FPS_CAP;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.20,   // slight vertical drift
          r: 1.5 + Math.random() * 1.9,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.72 ? 265 : 214   // mostly blue, some violet
        });
      }
    }

    /* A pulse is a packet of "information" travelling a link */
    function spawnPulse() {
      if (pulses.length > (isMobile ? 2 : 4)) return;
      var a = Math.floor(Math.random() * nodes.length);
      var b = Math.floor(Math.random() * nodes.length);
      if (a === b) return;
      var n1 = nodes[a], n2 = nodes[b];
      var d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
      if (d > LINK_DIST) return;
      pulses.push({ a: a, b: b, t: 0, speed: 0.006 + Math.random() * 0.008 });
    }

    function draw(ts) {
      raf = requestAnimationFrame(draw);
      if (ts - lastFrame < FRAME_MS) return;
      lastFrame = ts;

      ctx.clearRect(0, 0, w, h);

      var i, j, n, m, d, alpha;

      /* Links — appear and fade as nodes drift in and out of range */
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          n = nodes[i]; m = nodes[j];
          d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d >= LINK_DIST) continue;
          alpha = (1 - d / LINK_DIST) * 0.30;
          ctx.strokeStyle = "rgba(96,165,250," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }

      /* Data pulses travelling between nodes */
      for (i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        var na = nodes[p.a], nb = nodes[p.b];
        if (!na || !nb) { pulses.splice(i, 1); continue; }
        var px = na.x + (nb.x - na.x) * p.t;
        var py = na.y + (nb.y - na.y) * p.t;
        var fade = Math.sin(p.t * Math.PI);
        ctx.fillStyle = "rgba(0,229,255," + (0.72 * fade).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(px, py, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Nodes — gentle breathing glow */
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        n.phase += 0.012;

        if (n.x < -30) n.x = w + 30;
        if (n.x > w + 30) n.x = -30;
        if (n.y < -30) n.y = h + 30;
        if (n.y > h + 30) n.y = -30;

        var pulse = 0.62 + Math.sin(n.phase) * 0.34;
        var rad = n.r * (1 + Math.sin(n.phase) * 0.16);

        var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rad * 5);
        g.addColorStop(0, "hsla(" + n.hue + ",92%,68%," + (0.5 * pulse).toFixed(3) + ")");
        g.addColorStop(1, "hsla(" + n.hue + ",92%,68%,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, rad * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "hsla(" + n.hue + ",96%,80%," + (0.82 * pulse).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function start() {
      if (raf) return;
      lastFrame = 0;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    makeNodes();
    start();

    var pulseTimer = setInterval(function () {
      if (!document.hidden) spawnPulse();
    }, isMobile ? 1500 : 900);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); makeNodes(); }, 220);
    });

    /* Never burn CPU on a hidden tab */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    window.addEventListener("pagehide", function () {
      stop(); clearInterval(pulseTimer);
    });
  }

  /* ────────────────────────────────────────────────────────────
     2. SCROLL REVEAL — subtle, fast, staggered
     ──────────────────────────────────────────────────────────── */
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    var SELECTOR = [
      ".ai-card", ".card", ".service-card", ".demo-card",
      ".ai-callout", ".ai-cat", ".ai-step", ".acc-item",
      ".aiform-step", ".ai-compare-wrap"
    ].join(",");

    var els = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    if (!els.length) return;

    els.forEach(function (el) {
      /* Don't hide anything already in view on load */
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      el.classList.add("reveal");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Math.min(i * 55, 220);   // gentle stagger, capped
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ────────────────────────────────────────────────────────────
     3. FLOATING SOCIAL — draggable with magnetic snap to side
     ──────────────────────────────────────────────────────────── */
  function initFloatDrag() {
    var el = document.querySelector(".social-float");

    /* ui.js renders .social-float from its placeholder, and it may not
       exist yet when this file boots. Wait for it rather than bailing —
       this was why the buttons rendered but would not drag. */
    if (!el) {
      if (!window.MutationObserver) return;
      var mo = new MutationObserver(function () {
        if (document.querySelector(".social-float")) {
          mo.disconnect();
          initFloatDrag();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (el.dataset.dragReady) return;
    el.dataset.dragReady = "1";

    var dragging = false, moved = false;
    var startX = 0, startY = 0, originX = 0, originY = 0;

    function pointer(e) {
      return e.touches && e.touches[0] ? e.touches[0] : e;
    }

    function down(e) {
      var p = pointer(e);
      var r = el.getBoundingClientRect();
      dragging = true; moved = false;
      startX = p.clientX; startY = p.clientY;
      originX = r.left; originY = r.top;
      el.classList.add("dragging");
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.left = originX + "px";
      el.style.top = originY + "px";
    }

    function move(e) {
      if (!dragging) return;
      var p = pointer(e);
      var dx = p.clientX - startX;
      var dy = p.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      if (e.cancelable) e.preventDefault();

      var r = el.getBoundingClientRect();
      var x = originX + dx;
      var y = originY + dy;
      x = Math.max(6, Math.min(x, window.innerWidth  - r.width  - 6));
      y = Math.max(70, Math.min(y, window.innerHeight - r.height - 12));
      el.style.left = x + "px";
      el.style.top = y + "px";
    }

    function up() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      if (!moved) return;

      /* Magnetic snap to whichever side is nearer */
      var r = el.getBoundingClientRect();
      var toLeft = (r.left + r.width / 2) < window.innerWidth / 2;
      el.style.left = "auto";
      el.style.right = "auto";
      el.classList.toggle("snap-left", toLeft);
      if (toLeft) el.style.left = "12px"; else el.style.right = "12px";
    }

    el.addEventListener("mousedown", down);
    el.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    window.addEventListener("touchcancel", up);

    /* Keep it on-screen after an orientation change or resize */
    window.addEventListener("resize", function () {
      var r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight - 8 || r.right > window.innerWidth) {
        el.style.left = "auto"; el.style.top = "auto";
        el.style.right = "16px"; el.style.bottom = "104px";
        el.classList.remove("snap-left");
      }
    });

    /* A drag must not fire the link */
    el.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        if (moved) { ev.preventDefault(); moved = false; }
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     4. FLOATING SIDE AD — text only
     Appears only after the reader has scrolled a meaningful
     amount AND then paused. Hides again the moment they scroll.
     All settings live in SITE_DATA.SIDE_AD.
     ──────────────────────────────────────────────────────────── */
  function initSideAd() {
    var D = window.SITE_DATA;
    if (!D || !D.SIDE_AD || !D.SIDE_AD.enabled) return;

    var cfg = D.SIDE_AD;

    /* Page targeting — configured entirely in site-data.js */
    var page = window.location.pathname.split("/").pop();
    var allowed = cfg.pages || [];
    if (allowed.indexOf(page) === -1) return;

    var idleMs = (cfg.idleSeconds || 4) * 1000;

    var el = document.createElement("div");
    el.className = "side-tag";
    el.setAttribute("role", "complementary");
    el.setAttribute("aria-label", cfg.text);

    var txt = document.createElement("span");
    txt.className = "side-tag-text";
    txt.textContent = cfg.text;

    var cta = document.createElement("a");
    cta.className = "side-tag-cta";
    cta.textContent = cfg.ctaLabel || (D.BUTTONS && D.BUTTONS.auditLabel) || "Get Audit";
    cta.href = cfg.url;
    if (/^https?:/.test(cfg.url)) { cta.target = "_blank"; cta.rel = "noopener"; }

    el.appendChild(txt);
    el.appendChild(cta);
    document.body.appendChild(el);

    var timer = null;

    function show() { el.classList.add("is-shown"); }

    function hideAndReset() {
      el.classList.remove("is-shown");
      clearTimeout(timer);
      timer = setTimeout(show, idleMs);
    }

    /* Hide on any interaction, reappear once the visitor has been
       still for the configured number of seconds. */
    ["scroll", "touchstart", "touchmove", "wheel", "pointerdown"]
      .forEach(function (evt) {
        window.addEventListener(evt, function (e) {
          if (el.contains(e.target)) return;   // don't hide when tapping the ad
          hideAndReset();
        }, { passive: true });
      });

    timer = setTimeout(show, idleMs);
  }

  window.AAA_initFloatDrag = initFloatDrag;

  /* Navbar condenses slightly once the page is scrolled */
  function initNavScroll() {
    var bar = document.querySelector(".navbar");
    if (!bar) return;
    function update() {
      bar.classList.toggle("scrolled", window.scrollY > 30);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function boot() {
    initNavScroll();
    if (document.body.getAttribute("data-bg") === "live") {
      initNodeField(document.getElementById("automation-bg"));
      initNodeField(document.getElementById("hero-bg"));
    }
    initReveal();
    initFloatDrag();
    initSideAd();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
