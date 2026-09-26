/* ══════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — SHARED UI LAYER  v1.0
   Loads AFTER site-data.js and (where present) main.js.

   Responsibilities
   ----------------
   1. Fixes toggleMenu() — the original in main.js referenced an
      element id ("hamburger") that does not exist in the markup,
      which threw on every menu tap. Redefining it here overrides
      the broken version.
   2. Renders the navbar, footer and floating buttons from
      SITE_DATA so contact details live in exactly one place.
   3. Fusion / Fusion Max toggle.
   4. Expandable pricing cards.
   5. Rotating secondary CTA ("See Demo" ↔ "See FAQ").
   6. Accordions (FAQ and elsewhere).

   All modules are defensive: if the markup they target is not on
   the page, they exit quietly.
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var D = window.SITE_DATA || {};
  var C = D.CONTACT || {};
  var L = D.LINKS || {};
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Path prefix so this works from /lab/ as well as the root */
  var PRE = (document.body && document.body.getAttribute("data-root")) || "";

  function p(path) {
    if (!path) return "#";
    if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
    return PRE + path;
  }

  /* ────────────────────────────────────────────────────────────
     1. HAMBURGER — corrected
     ──────────────────────────────────────────────────────────── */
  function toggleMenu() {
    var menu = document.getElementById("navMenu");
    if (!menu) return;
    var burger = document.querySelector(".hamburger");
    var open = menu.classList.toggle("show");

    if (burger) {
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    /* The menu is a compact scrollable dropdown, not a full-screen
       overlay, so the page behind is locked only while it is open. */
    document.body.style.overflow = open ? "hidden" : "";
    if (open) menu.scrollTop = 0;
  }
  window.toggleMenu = toggleMenu;

  function closeMenu() {
    var menu = document.getElementById("navMenu");
    if (!menu || !menu.classList.contains("show")) return;
    menu.classList.remove("show");
    var burger = document.querySelector(".hamburger");
    if (burger) {
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    }
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ────────────────────────────────────────────────────────────
     2. NAVBAR / FOOTER / FLOATING BUTTONS
     Rendered from SITE_DATA into placeholder elements:
       <div data-nav="pricing"></div>
       <div data-footer></div>
     ──────────────────────────────────────────────────────────── */

  var NAV = [
    { key: "home",     label: "Home",       href: "index.html" },
    { key: "services", label: "Services",   href: "services.html" },
    { key: "pricing",  label: "Pricing",    href: "pricing.html" },
    { key: "coaches",  label: "For Coaches", href: "coaches.html" },
    { key: "process",  label: "Process",    href: "process.html" },
    { key: "demo",     label: "Demo",       href: "demo.html" },
    { key: "faq",      label: "FAQ",        href: "faq.html" },
    { key: "about",    label: "About",      href: "about.html" },
    { key: "lab",      label: "Lab",        href: "lab/index.html" }
  ];

  var SVG = {
    mail:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>' +
      '<polyline points="22,6 12,13 2,6"></polyline></svg>',
    phone:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    whatsapp:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
    instagram:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>' +
      '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>' +
      '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
    linkedin:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>' +
      '<rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>'
  };

  function renderNav() {
    var host = document.querySelector("[data-nav]");
    if (!host) return;
    var active = host.getAttribute("data-nav");

    var links = NAV.map(function (n) {
      var cls = n.key === active ? ' class="active"' : "";
      var aria = n.key === active ? ' aria-current="page"' : "";
      return '<a href="' + p(n.href) + '"' + cls + aria + ">" + n.label + "</a>";
    }).join("");

    host.outerHTML =
      '<header class="navbar">' +
        '<div class="nav-container">' +
          '<a href="' + p("index.html") + '" class="brand" style="text-decoration:none;display:flex;align-items:center;gap:10px;">' +
            '<img src="' + p("logo.png") + '" alt="Ayush AI Automation" class="logo">' +
            '<span class="brand-name">Ayush AI Automation</span>' +
          "</a>" +
          '<button class="hamburger" type="button" onclick="toggleMenu()" ' +
            'aria-label="Menu" aria-expanded="false" aria-controls="navMenu" ' +
            'style="background:none;border:none;font:inherit;color:inherit;cursor:pointer;">&#9776;</button>' +
          '<nav class="nav-menu" id="navMenu" aria-label="Main">' +
            links +
            '<a href="' + p("book.html") + '" class="nav-cta">Book a Call</a>' +
          "</nav>" +
        "</div>" +
      "</header>";
  }

  function renderFooter() {
    var host = document.querySelector("[data-footer]");
    if (!host) return;

    host.outerHTML =
      '<footer class="footer">' +
        '<div class="footer-content">' +
          '<h3 class="footer-heading">Ayush AI Automation</h3>' +
          '<p class="footer-tag">' +
            '<strong>AI Agents</strong> &amp; <strong>DM Automation</strong> for Fitness Coaches' +
          "</p>" +
          '<p class="footer-sub">' +
            'The first automation systems built on the <strong style="color:var(--primary-light);">' +
            'F.I.T. DM Funnel Framework</strong> &mdash; Filter, Influence, Transfer &mdash; ' +
            'designed around how coaching clients actually decide to buy. ' +
            'Instagram and WhatsApp, built and run for you.' +
          "</p>" +
          '<div class="footer-contact">' +
            '<a href="mailto:' + C.email + '">' + SVG.mail + C.email + "</a>" +
            '<a href="tel:+' + C.phoneRaw + '">' + SVG.phone + C.phoneDisplay + "</a>" +
          "</div>" +
          '<div class="footer-socials">' +
            '<a href="' + (D.waLink ? D.waLink("general") : C.whatsapp) + '" class="social-icon" target="_blank" rel="noopener" aria-label="WhatsApp">' + SVG.whatsapp + "</a>" +
            '<a href="' + C.instagram + '" class="social-icon" target="_blank" rel="noopener" aria-label="Instagram">' + SVG.instagram + "</a>" +
            '<a href="' + C.linkedin + '" class="social-icon linkedin" target="_blank" rel="noopener" aria-label="LinkedIn">' + SVG.linkedin + "</a>" +
          "</div>" +
          '<div class="footer-links">' +
            '<a href="' + p("index.html") + '">Home</a>' +
            '<span style="color:var(--text-soft);">|</span>' +
            '<a href="' + p("pricing.html") + '">Pricing</a>' +
            '<span style="color:var(--text-soft);">|</span>' +
            '<a href="' + p("faq.html") + '">FAQ</a>' +
            '<span style="color:var(--text-soft);">|</span>' +
            '<a href="' + p("privacy.html") + '">Privacy Policy</a>' +
            '<span style="color:var(--text-soft);">|</span>' +
            '<a href="' + p("terms.html") + '">Terms &amp; Conditions</a>' +
          "</div>" +
          '<div class="footer-bottom">&copy; 2026 Ayush AI Automation. All rights reserved.</div>' +
        "</div>" +
      "</footer>";
  }

  function renderFloats() {
    var host = document.querySelector("[data-floats]");
    if (!host) return;
    host.outerHTML =
      '<div class="social-float">' +
        '<a href="' + (D.waLink ? D.waLink("general") : C.whatsapp) + '" class="whatsapp-float" target="_blank" rel="noopener" aria-label="WhatsApp">' +
          SVG.whatsapp + "<span>WhatsApp</span></a>" +
        '<a href="' + C.instagram + '" class="instagram-float" target="_blank" rel="noopener" aria-label="Instagram">' +
          SVG.instagram + "<span>Instagram</span></a>" +
      "</div>";

    /* Tell main.js the draggable buttons now exist */
    if (typeof window.AAA_initFloatDrag === "function") window.AAA_initFloatDrag();
  }

  /* ────────────────────────────────────────────────────────────
     3. FUSION TOGGLE — ONE card that transforms
     There is never a second Fusion card in the DOM. Selecting a
     level rewrites the single card's name, price, descriptor,
     summary, capability meter, badge and feature list in place.
     ──────────────────────────────────────────────────────────── */
  function initFusionToggle() {
    var group = document.querySelector("[data-fusion-switch]");
    var card  = document.querySelector("[data-fusion-card]");
    if (!group || !card || !D.getProduct) return;

    var opts  = Array.prototype.slice.call(group.querySelectorAll("[data-fusion-opt]"));
    var thumb = group.querySelector(".fusion-switch-thumb");

    var tick =
      '<svg class="ai-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
    var cross =
      '<svg class="ai-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/></svg>';

    function set(sel, html) {
      var el = card.querySelector(sel);
      if (el) el.innerHTML = html;
    }

    function moveThumb(btn) {
      if (!thumb || !btn) return;
      thumb.style.width = btn.offsetWidth + "px";
      thumb.style.transform = "translateX(" + (btn.offsetLeft - 5) + "px)";
    }

    function paint(id) {
      var p = D.getProduct(id);
      if (!p) return;
      var live = D.livePrice(p);

      card.classList.toggle("ai-card--max", id === "fusion-max");

      set("[data-f-name]", p.name);
      set("[data-f-desc]", p.descriptor);
      set("[data-f-summary]", p.summary);
      set("[data-f-level-label]", p.aiLevelLabel);
      set("[data-f-model-count]", (function () {
        if (p.modelCountByChannel) {
          return p.modelCountByChannel.instagram + " + " + p.modelCountByChannel.whatsapp;
        }
        return p.modelCount != null ? String(p.modelCount) : "";
      })());
      set("[data-f-badge]", p.badge || "");

      var badge = card.querySelector("[data-f-badge]");
      if (badge) badge.hidden = !p.badge;

      var meter = card.querySelector("[data-ai-level]");
      if (meter) {
        meter.setAttribute("data-ai-level", p.aiLevel);
        var track = meter.querySelector(".ai-meter-track");
        if (track) {
          var seg = "";
          for (var i = 1; i <= 5; i++) {
            seg += '<span class="ai-meter-seg' + (i <= p.aiLevel ? " on" : "") + '"></span>';
          }
          track.innerHTML = seg;
        }
      }

      set("[data-f-monthly]", D.inr(live.monthly));
      set("[data-f-setup]", D.inr(live.setup));

      var wasM = card.querySelector("[data-f-monthly-was]");
      if (wasM) {
        wasM.textContent = live.monthlyWas ? D.inr(live.monthlyWas) : "";
        wasM.hidden = !live.monthlyWas;
      }
      var wasS = card.querySelector("[data-f-setup-was]");
      if (wasS) {
        wasS.textContent = live.setupWas ? D.inr(live.setupWas) : "";
        wasS.hidden = !live.setupWas;
      }

      var feats = p.features.map(function (f) { return "<li>" + tick + f + "</li>"; }).join("");
      if (p.notIncluded && p.notIncluded.length) {
        feats += '</ul><p class="ai-sub-label">Not included at this level</p><ul class="ai-feature-list">';
        feats += p.notIncluded.map(function (f) { return "<li>" + cross + f + "</li>"; }).join("");
      }
      set("[data-f-features]", feats);
      set("[data-f-note]", p.note || "");

      var cta = card.querySelector("[data-f-cta]");
      if (cta) cta.setAttribute("href", "book.html?plan=" + p.id);

      var sec = card.querySelector("[data-rotate]");
      if (sec) {
        sec.setAttribute("data-demo-href", "demo.html#" + p.id);
        sec.setAttribute("data-faq-href", "faq.html#" + p.id);
      }
    }

    function select(id, animate) {
      opts.forEach(function (b) {
        var on = b.getAttribute("data-fusion-opt") === id;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
        if (on) moveThumb(b);
      });

      if (animate && !reduceMotion) {
        card.classList.add("is-swapping");
        setTimeout(function () {
          paint(id);
          card.classList.remove("is-swapping");
        }, 190);
      } else {
        paint(id);
      }
    }

    opts.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        select(btn.getAttribute("data-fusion-opt"), true);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var next = opts[(i + (e.key === "ArrowRight" ? 1 : opts.length - 1)) % opts.length];
        next.focus();
        select(next.getAttribute("data-fusion-opt"), true);
      });
    });

    select("fusion", false);
    window.addEventListener("resize", function () {
      moveThumb(group.querySelector('[aria-selected="true"]'));
    });
    setTimeout(function () {
      moveThumb(group.querySelector('[aria-selected="true"]'));
    }, 120);
  }

  /* ────────────────────────────────────────────────────────────
     4. EXPANDABLE CARDS
     <button class="ai-expand-btn" aria-controls="ID" aria-expanded="false">
     <div class="ai-expand-panel" id="ID" data-open="false">
     ──────────────────────────────────────────────────────────── */
  function initExpanders() {
    var btns = document.querySelectorAll(".ai-expand-btn");
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (!panel) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.setAttribute("data-open", open ? "false" : "true");
        var label = btn.querySelector("[data-expand-label]");
        if (label) {
          label.textContent = open
            ? label.getAttribute("data-closed") || "What's included"
            : label.getAttribute("data-opened") || "Hide details";
        }
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. ROTATING SECONDARY CTA
     <a class="ai-cta-secondary" data-rotate
        data-demo-href="demo.html#pro" data-faq-href="faq.html#pro">
        <span class="ai-rotate-label">See Demo</span></a>
     Text alternates every 4s. The button never changes size.
     ──────────────────────────────────────────────────────────── */
  function initRotatingCta() {
    var els = document.querySelectorAll("[data-rotate]");
    if (!els.length) return;

    var states = [
      { text: "See Demo", attr: "data-demo-href" },
      { text: "See FAQ",  attr: "data-faq-href" }
    ];

    Array.prototype.forEach.call(els, function (el) {
      var label = el.querySelector(".ai-rotate-label");
      if (!label) return;
      var i = 0;

      function paint() {
        var s = states[i];
        label.textContent = s.text;
        el.setAttribute("href", p(el.getAttribute(s.attr) || "#"));
      }
      paint();

      if (reduceMotion) return; // hold on "See Demo", no cycling

      setInterval(function () {
        if (document.hidden) return;
        label.classList.add("is-out");
        setTimeout(function () {
          i = (i + 1) % states.length;
          paint();
          label.classList.remove("is-out");
        }, 340);
      }, 4000);
    });
  }

  /* ────────────────────────────────────────────────────────────
     6. ACCORDION
     ──────────────────────────────────────────────────────────── */
  function initAccordions() {
    var trigs = document.querySelectorAll(".acc-trigger");
    Array.prototype.forEach.call(trigs, function (t) {
      t.addEventListener("click", function () {
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        var open = t.getAttribute("aria-expanded") === "true";
        t.setAttribute("aria-expanded", open ? "false" : "true");
        panel.setAttribute("data-open", open ? "false" : "true");
      });
    });

    /* Deep-link: /faq.html#pro opens and scrolls to that item */
    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target && target.classList.contains("acc-item")) {
        var trig = target.querySelector(".acc-trigger");
        if (trig && trig.getAttribute("aria-expanded") !== "true") trig.click();
        setTimeout(function () {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }, 220);
      }
    }
  }

  /* ────────────────────────────────────────────────────────────
     7. CAPABILITY METERS — fill from data-ai-level
     ──────────────────────────────────────────────────────────── */
  /* Single-source AI limitation statement */
  function initLimitation() {
    var nodes = document.querySelectorAll("[data-limitation]");
    if (!nodes.length || !D.POLICY || !D.POLICY.limitation) return;
    var L = D.POLICY.limitation;
    Array.prototype.forEach.call(nodes, function (n) {
      var short = n.hasAttribute("data-limitation-short");
      var heading = n.getAttribute("data-limitation-title") || "Service limitations";
      n.innerHTML = "<h3>" + heading + "</h3><p>" + (short ? L.short : L.full) + "</p>";
    });
  }

  function initAiMarks() {
    var marks = document.querySelectorAll("[data-ai-mark]");
    Array.prototype.forEach.call(marks, function (m) {
      if (m.querySelector("svg")) return;
      m.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z"/>' +
        '<circle cx="18.5" cy="17.5" r="1.6"/><circle cx="6" cy="18" r="1.1"/></svg>';
    });
  }

  function initMeters() {
    var meters = document.querySelectorAll("[data-ai-level]");
    Array.prototype.forEach.call(meters, function (m) {
      var lvl = parseInt(m.getAttribute("data-ai-level"), 10) || 0;
      var track = m.querySelector(".ai-meter-track");
      if (!track) return;
      var html = "";
      for (var i = 1; i <= 5; i++) {
        html += '<span class="ai-meter-seg' + (i <= lvl ? " on" : "") + '"></span>';
      }
      track.innerHTML = html;
    });
  }

  /* ────────────────────────────────────────────────────────────
     8. PRICE INJECTION — keeps every price tied to site-data.js
     <span data-price="pro" data-price-field="monthly"></span>
     ──────────────────────────────────────────────────────────── */
  /* ────────────────────────────────────────────────────────────
     RESOURCE LINKS — [data-wa="key"] opens the matching WA_MESSAGES
     link from site-data.js. [data-download="guide"] points at the
     PDF and forces a real download rather than opening a new tab.
     ──────────────────────────────────────────────────────────── */
  function initResourceLinks() {
    var waEls = document.querySelectorAll("[data-wa]");
    Array.prototype.forEach.call(waEls, function (el) {
      var key = "wa" + el.getAttribute("data-wa").replace(/(^|_)([a-z])/g, function (m, p1, p2) {
        return p2.toUpperCase();
      });
      var url = (D.LINKS && D.LINKS[key]) || D.CONTACT.whatsapp;
      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });

    var dlEls = document.querySelectorAll('[data-download="guide"]');
    Array.prototype.forEach.call(dlEls, function (el) {
      var url = p((D.LINKS && D.LINKS.guidePdf) || "");
      if (!url) { el.hidden = true; return; }
      el.setAttribute("href", url);
      el.setAttribute("download", "Ayush-AI-Automation-DM-Handling-Guide.pdf");
    });
  }

  function initModelCounts() {
    if (!D.getProduct) return;
    var nodes = document.querySelectorAll("[data-model-count]");
    Array.prototype.forEach.call(nodes, function (n) {
      var prod = D.getProduct(n.getAttribute("data-model-count"));
      if (!prod || prod.modelCount == null) { n.hidden = true; return; }
      n.textContent = prod.modelCount;
    });

    var noteEls = document.querySelectorAll("[data-ai-model-note]");
    if (D.AI_MODEL_INFO) {
      Array.prototype.forEach.call(noteEls, function (n) {
        n.textContent = D.AI_MODEL_INFO.note;
      });
    }
  }

  function initPrices() {
    if (!D.livePrice || !D.inr) return;
    var nodes = document.querySelectorAll("[data-price]");
    Array.prototype.forEach.call(nodes, function (n) {
      var id = n.getAttribute("data-price");
      // AI Agent products live in AI_PRODUCTS; Managed Automation plans live
      // in MANAGED_PLANS. Look an id up in both — never assume DOM order.
      var prod = (D.getProduct && D.getProduct(id)) || (D.getManaged && D.getManaged(id));
      if (!prod) return;
      var live = D.livePrice(prod);
      var field = n.getAttribute("data-price-field") || "monthly";
      var val = null;

      if (field === "monthly")         val = live.monthly;
      else if (field === "setup")      val = live.setup;
      else if (field === "monthlyWas") val = live.monthlyWas;
      else if (field === "setupWas")   val = live.setupWas;

      if (val === null || val === undefined) {
        n.hidden = true;
        return;
      }
      n.hidden = false;
      n.textContent = D.inr(val);
    });
  }

  /* ────────────────────────────────────────────────────────────
     BOOT
     ──────────────────────────────────────────────────────────── */
  function boot() {
    var bare = document.body.hasAttribute("data-bare");
    renderNav();
    if (!bare) renderFooter();
    if (!bare) renderFloats();
    initFusionToggle();
    initExpanders();
    initRotatingCta();
    initAccordions();
    initLimitation();
    initAiMarks();
    initMeters();
    initResourceLinks();
    initModelCounts();
    initPrices();

    /* Close mobile menu on outside tap */
    document.addEventListener("click", function (e) {
      var bar = document.querySelector(".navbar");
      if (bar && !bar.contains(e.target)) closeMenu();
    });

    /* Close mobile menu after following a nav link */
    var menu = document.getElementById("navMenu");
    if (menu) {
      menu.addEventListener("click", function (e) {
        if (e.target.tagName === "A") closeMenu();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
