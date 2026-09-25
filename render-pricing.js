#!/usr/bin/env node
/* render-pricing.js — writes the values from site-data.js into the HTML as real text.
   Run after ANY pricing or offer change:      node render-pricing.js
   Prices then exist in the HTML source, not only in JavaScript. */
const fs = require("fs"), path = require("path");
const ROOT = process.argv[2] || __dirname;

global.window = {};
eval(fs.readFileSync(path.join(ROOT, "site-data.js"), "utf8"));
const D = window.SITE_DATA;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── 1. every [data-price][data-price-field] element ───────────────────────── */
function renderPrices(html) {
  let count = 0;
  html = html.replace(/<(span|strong)([^>]*\bdata-price="([a-z-]+)"[^>]*\bdata-price-field="(\w+)"[^>]*)>([\s\S]*?)<\/\1>/g,
    (m, tag, attrs, id, field) => {
      const t = D.priceText(id);
      if (!t) return m;
      const value = t[field] === undefined ? null : t[field];
      attrs = attrs.replace(/\s*\bhidden\b/g, "");
      count++;
      return value === null || value === undefined
        ? `<${tag}${attrs} hidden></${tag}>`
        : `<${tag}${attrs}>${value}</${tag}>`;
    });
  console.log("  price elements rendered:", count);
  return html;
}

/* ── 2. the Fusion / Fusion Max card ───────────────────────────────────────── */
const TICK = '<svg class="ai-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
const CROSS = '<svg class="ai-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

/* ── product feature / "not included" lists, rendered as real static HTML ─── */
function renderFeatures(html) {
  const ids = ["basic", "pro", "business", "wapa"];
  let count = 0;
  for (const id of ids) {
    const p = D.getProduct(id);
    const feats = (p.features || []).map(f => `<li>${TICK}${esc(f)}</li>`).join("");
    html = html.replace(new RegExp(`(<ul class="ai-feature-list" data-features="${id}">)[\\s\\S]*?(</ul>)`),
      `$1${feats}$2`);
    const not = p.notIncluded || [];
    const nots = not.map(f => `<li>${CROSS}${esc(f)}</li>`).join("");
    html = html.replace(new RegExp(`(<ul class="ai-feature-list" data-not-included="${id}">)[\\s\\S]*?(</ul>)`),
      `$1${nots}$2`);
    html = html.replace(new RegExp(`(<div data-notgroup="${id}")[^>]*(>)`),
      not.length ? "$1$2" : "$1 hidden$2");
    count++;
  }
  console.log("  product feature lists rendered:", count);
  return html;
}

/* ── the DEFAULT Fusion state (before the toggle runs), also as static HTML ── */
function renderFusionDefault(html) {
  const p = D.getProduct("fusion");
  const feats = (p.features || []).map(f => `<li>${TICK}${esc(f)}</li>`).join("");
  html = html.replace(/(<ul class="ai-feature-list" data-f-features>)[\s\S]*?(<\/ul>)/, `$1${feats}$2`);
  const not = p.notIncluded || [];
  const nots = not.map(f => `<li>${CROSS}${esc(f)}</li>`).join("");
  html = html.replace(/(<ul class="ai-feature-list" data-f-notincluded>)[\s\S]*?(<\/ul>)/, `$1${nots}$2`);
  html = html.replace(/(<div data-f-notgroup)([^>]*)(>)/, not.length ? "$1$3" : "$1 hidden$3");
  return html;
}

function fusionValues(html) {
  const p = D.getProduct("fusion"), t = D.priceText("fusion");
  const set = (attr, value) => {
    html = html.replace(new RegExp(`<(span|strong)([^>]*\\b${attr}\\b[^>]*)>([\\s\\S]*?)</\\1>`), (m, tag, attrs) => {
      attrs = attrs.replace(/\s*\bhidden\b/g, "");
      return value === null ? `<${tag}${attrs} hidden></${tag}>` : `<${tag}${attrs}>${value}</${tag}>`;
    });
  };
  set("data-f-monthly-was", t.monthlyWas);
  set("data-f-setup-was", t.setupWas);
  set("data-f-monthly", t.monthly);
  set("data-f-setup", t.setup);
  set("data-f-name", esc(p.name));
  set("data-f-badge", esc(p.badge || ""));
  return html;
}

/* A crawlable copy of the Fusion Max side of the switch (the switch itself is
   unchanged; this block exists so the text is in the HTML, not only in JS). */
function fusionAlt() {
  const p = D.getProduct("fusion-max"), t = D.priceText("fusion-max");
  const feats = (p.features || []).map(f => `<li>${TICK}${esc(f)}</li>`).join("");
  const nots = (p.notIncluded || []).map(f => `<li>${CROSS}${esc(f)}</li>`).join("");
  return `<!--RENDER:fusion-alt-->
    <article class="ai-card" data-f-panel="fusion-max" hidden style="display:none" aria-hidden="true">
      <span class="ai-badge">${esc(p.badge || "")}</span>
      <div class="ai-card-title"><h3>${esc(p.name)}</h3><p>${esc(p.descriptor)}</p></div>
      <p class="ai-summary">${esc(p.summary)}</p>
      <div class="ai-meter"><div class="ai-meter-top"><span class="ai-meter-label">AI capability</span><span class="ai-meter-value">${esc(p.aiLevelLabel)}</span></div></div>
      <div class="ai-price">
        <div class="ai-price-monthly"><span class="ai-price-amount" data-price="fusion-max" data-price-field="monthly">${t.monthly}</span><span class="ai-price-per">/ month</span></div>
        <p class="ai-price-setup"><strong data-price="fusion-max" data-price-field="setup">${t.setup}</strong> one-time setup ${t.setupWas ? `<span class="ai-price-was" data-price="fusion-max" data-price-field="setupWas">${t.setupWas}</span>` : `<span class="ai-price-was" data-price="fusion-max" data-price-field="setupWas" hidden></span>`}</p>
        <p class="ai-price-gst">Excluding GST</p>
      </div>
      <ul class="ai-feature-list">${feats}</ul>
      ${nots ? `<p class="ai-sub-label">Not included at this level</p><ul class="ai-feature-list">${nots}</ul>` : ""}
      <p class="ai-card-note">${esc(p.note || "")}</p>
    </article>
<!--/RENDER-->`;
}

/* ── 3. offer banner ───────────────────────────────────────────────────────── */
function offerBanner(html) {
  const ai = D.PRICING.offers.ai;
  const body = ai.active
    ? `<span class="offer-badge" id="offer-banner">${esc(ai.badge)}</span>`
    : "";
  return html.replace(/<!--RENDER:offer-banner-->[\s\S]*?<!--\/RENDER-->/,
    `<!--RENDER:offer-banner-->${body}<!--/RENDER-->`);
}

/* ── 4. structured data, from the same source as the visible prices ────────── */
function schema(html) {
  const site = "https://www.ayushaiautomation.in";
  const org = { "@id": site + "/#organization" };
  const offerFor = (plan, cat) => {
    const t = D.priceText(plan.id), live = D.livePrice(plan);
    const offers = [{
      "@type": "Offer", "name": "Monthly managed service", "price": String(live.monthly), "priceCurrency": "INR",
      "priceSpecification": { "@type": "UnitPriceSpecification", "price": String(live.monthly), "priceCurrency": "INR",
        "valueAddedTaxIncluded": false, "billingDuration": 1, "billingIncrement": 1, "unitCode": "MON" },
      "availability": "https://schema.org/InStock", "seller": org, "url": site + "/pricing.html"
    }];
    if (live.setup > 0) offers.push({
      "@type": "Offer", "name": live.discounted ? "One-time setup (limited-time offer)" : "One-time setup",
      "price": String(live.setup), "priceCurrency": "INR", "valueAddedTaxIncluded": false,
      "seller": org, "url": site + "/pricing.html"
    });
    return {
      "@type": "Service", "@id": `${site}/pricing.html#${plan.id}`, "name": plan.name,
      "serviceType": cat === "ai" ? "AI Agent DM automation for fitness coaches" : "Rule-based managed DM automation for fitness coaches",
      "provider": org, "areaServed": "Worldwide",
      "audience": { "@type": "Audience", "audienceType": "Fitness coaches" },
      "offers": offers
    };
  };
  const graph = [
    { "@type": "WebPage", "@id": site + "/pricing.html#webpage", "url": site + "/pricing.html",
      "name": "Pricing & Plans | Ayush AI Automation", "isPartOf": { "@id": site + "/#website" }, "publisher": org },
    ...D.AI_PRODUCTS.map(p => offerFor(p, "ai")),
    ...D.MANAGED_PLANS.map(p => offerFor(p, "managed"))
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 1);
  return html.replace(/<!--RENDER:pricing-schema-->[\s\S]*?<!--\/RENDER-->/,
    `<!--RENDER:pricing-schema--><script type="application/ld+json">\n${json}\n</script><!--/RENDER-->`);
}

/* ── run ───────────────────────────────────────────────────────────────────── */
const file = path.join(ROOT, "pricing.html");
let html = fs.readFileSync(file, "utf8");
html = html.replace(/<!--RENDER:fusion-alt-->[\s\S]*?<!--\/RENDER-->/, "<!--RENDER:fusion-alt-->");
html = html.replace("<!--RENDER:fusion-alt-->", fusionAlt());
html = fusionValues(html);
html = renderFusionDefault(html);
html = renderFeatures(html);
html = renderPrices(html);
html = offerBanner(html);
html = schema(html);
fs.writeFileSync(file, html);

/* ── self-check ────────────────────────────────────────────────────────────── */
const out = fs.readFileSync(file, "utf8");
const problems = [];
const aiOn = D.PRICING.offers.ai.active;
D.AI_PRODUCTS.concat(D.MANAGED_PLANS).forEach(p => {
  const t = D.priceText(p.id), live = D.livePrice(p);
  let own = [...out.matchAll(new RegExp(`data-price="${p.id}" data-price-field="(\\w+)"([^>]*)>([^<]*)<`, "g"))];
  if (p.id === "fusion") own = ["monthly", "setup", "setupWas", "monthlyWas"].map(f => {
    const attr = "data-f-" + (f === "setupWas" ? "setup-was" : f === "monthlyWas" ? "monthly-was" : f);
    const m = out.match(new RegExp(`<(?:span|strong)[^>]*\\b${attr}\\b([^>]*)>([^<]*)<`));
    return m ? [null, f, m[1], m[2]] : null;
  }).filter(Boolean);
  if (!own.length) { problems.push(`${p.id}: no price element found in the HTML`); return; }
  own.forEach(([, field, attrs, text]) => {
    const want = t[field] === undefined ? null : t[field];
    const hidden = /\bhidden\b/.test(attrs);
    if (want === null && (!hidden || text.trim())) problems.push(`${p.id}.${field}: should be empty/hidden, found "${text}"`);
    if (want !== null && text.trim() !== want) problems.push(`${p.id}.${field}: HTML shows "${text}", site-data says "${want}"`);
  });
});
if (!aiOn && /class="offer-badge"/.test(out)) problems.push("offer badge still present while the AI offer is off");
console.log(problems.length ? "PROBLEMS:\n  " + problems.join("\n  ") : "  self-check passed · AI offer: " + (aiOn ? "ON (setup only)" : "OFF"));
