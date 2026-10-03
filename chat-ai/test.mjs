/* chat-ai/test.mjs — run: node chat-ai/test.mjs
   Verifies retrieval, tiered model selection, the OpenRouter fail-over
   chain, CTAs and error handling using a stubbed fetch (no real API
   key or network needed — so it proves the LOGIC, not live model output). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

process.env.OPENROUTER_API_KEY = "test-key";
const CFG = require("./ai-config.js");            // same cached instance ai-assistant.js uses
const { handleChat, pickTier, resetHealth } = await import("./ai-assistant.js");
CFG.perTryMs = 300; CFG.totalMs = 5000;   // keep the timeout tests fast
const SHIPPED = { dailyLimit: CFG.dailyLimit, accountPerMinute: CFG.accountPerMinute };   // what the config really ships with
CFG.maxTries = 8; CFG.dailyLimit = 1e9; CFG.accountPerMinute = 1e9;   // quota guards get their own tests (section 12)

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (detail ? "  \u2192 " + detail : "")); }
}

const realFetch = globalThis.fetch;
let calls, keysUsed, lastBody, lastOpts, lastUrl;
const ALL_STATIC = () => Array.from(new Set([...CFG.tiers.light, ...CFG.tiers.standard]));
const modelRow = (id, price = "0") => ({ id, context_length: 262144, pricing: { prompt: price, completion: price }, architecture: { output_modalities: ["text"] } });
function stub({ okOn = "any", replyText = "Pro is \u20b92,499/month plus a one-time setup fee.",
                failModels = [], failStatus = 503, failMessage = "simulated failure", emptyModels = [], errBodyModels = [], hangModels = [],
                liveIds = null, liveRows = null, liveFail = false, policy404 = false, failKeys = {} } = {}) {
  calls = []; keysUsed = [];
  resetHealth();   // each scenario starts with every model considered healthy and quotas empty
  globalThis.fetch = async (url, opts) => {
    if (String(url).includes("/models")) {                          // OpenRouter's free-model list (not a chat call)
      if (liveFail) return new Response("nope", { status: 500 });
      const rows = liveRows || (liveIds || ALL_STATIC()).map(id => modelRow(id));
      return new Response(JSON.stringify({ data: rows }), { status: 200 });
    }
    const body = JSON.parse(opts.body);
    lastBody = body; lastOpts = opts; lastUrl = url;
    calls.push(body.model);
    const usedKey = String(opts.headers.Authorization).replace("Bearer ", "");
    keysUsed.push(usedKey);
    if (failKeys[usedKey]) return new Response(JSON.stringify({ error: { message: failKeys[usedKey].message || "key problem" } }), { status: failKeys[usedKey].status });
    if (hangModels.includes(body.model)) {
      return new Promise((_, rej) => opts.signal.addEventListener("abort", () => { const e = new Error("aborted"); e.name = "AbortError"; rej(e); }));
    }
    if (policy404 && body.provider) return new Response(JSON.stringify({ error: { message: "No endpoints found matching your data policy" } }), { status: 404 });
    const shouldFail = okOn === "none" || (okOn === "fallback-only" && calls.length === 1) || failModels.includes(body.model);
    if (shouldFail) return new Response(JSON.stringify({ error: { message: failMessage } }), { status: failStatus });
    if (emptyModels.includes(body.model)) return new Response(JSON.stringify({ choices: [{ message: { content: "" } }] }), { status: 200 });
    if (errBodyModels.includes(body.model)) return new Response(JSON.stringify({ error: { code: 502, message: "provider down" } }), { status: 200 });
    return new Response(JSON.stringify({ choices: [{ message: { content: replyText } }] }), { status: 200 });
  };
}

console.log("\n1. OPENROUTER CONFIGURATION");
const cfgSrc = fs.readFileSync(path.join(here, "ai-config.js"), "utf8");
check("API keys are read from environment variables (OPENROUTER_API_KEY, _2.._10), never hardcoded",
  cfgSrc.includes("process.env") && cfgSrc.includes("OPENROUTER_API_KEY") && !/apiKeys:\s*\[\s*["']/.test(cfgSrc));
check("key pool picked up the env key", Array.isArray(CFG.apiKeys) && CFG.apiKeys.length === 1 && CFG.apiKeys[0] === "test-key");
check("no literal API key committed in the config file", !/sk-or-[A-Za-z0-9_-]{10,}|gsk_[A-Za-z0-9]{10,}/.test(cfgSrc));
check("endpoint is OpenRouter's chat-completions URL", CFG.endpoint === "https://openrouter.ai/api/v1/chat/completions");
check("no Groq references left in the config or engine",
  !/groq/i.test(cfgSrc) && !/api\.groq\.com/i.test(fs.readFileSync(path.join(here, "ai-assistant.js"), "utf8")));
check("light tier has 3+ models (so one outage never kills the chat)", CFG.tiers.light.length >= 3);
check("standard tier has 3+ models", CFG.tiers.standard.length >= 3);
check("EVERY configured model is a :free slug (cannot spend money)",
  [...CFG.tiers.light, ...CFG.tiers.standard].every(m => /:free$/.test(m)), [...CFG.tiers.light, ...CFG.tiers.standard].join(","));
check("default daily cap is safe for the 50/day no-credits tier", SHIPPED.dailyLimit <= 50);
check("account per-minute guard is below OpenRouter's 20 RPM free cap", SHIPPED.accountPerMinute < 20);
check("no code/safety-classifier/stealth models are configured",
  ![...CFG.tiers.light, ...CFG.tiers.standard].some(m => /code|safety|guard|stealth|poolside/i.test(m)));
check("standard tier starts with a different (stronger) model than light", CFG.tiers.standard[0] !== CFG.tiers.light[0]);
check("every tier lists only unique slugs",
  ["light", "standard"].every(t => new Set(CFG.tiers[t]).size === CFG.tiers[t].length));
check("the two tiers share models, so a total tier outage still has backup",
  CFG.tiers.light.some(m => CFG.tiers.standard.includes(m)));

console.log("\n2. RETRIEVAL TARGETING");
const CASES = [
  ["What plans do you have?", "products"],
  ["how much does pro cost?", "pricing"],
  ["what is F.I.T.?", "fit"],
  ["how does it work?", "how-it-works"],
  ["do you have a demo?", "demo"],
  ["does it understand voice notes?", "voice"],
  ["do i need a separate whatsapp number?", "channels"],
  ["can i cancel anytime?", "guarantee"],
  ["what happens to my data?", "privacy"],
  ["do you have case studies?", "proof"],
  ["how long does setup take?", "setup"],
  ["is this just manychat?", "managed"],
  ["do you have a free guide?", "guide"],
  ["can I get a free audit of my profile?", "audit"],
  ["what's the difference between managed and ai agent automation?", "managed-vs-ai"],
  ["what's your instagram handle?", "contact"],
  ["do you have a linkedin?", "contact"],
  ["how do I contact you?", "contact"],
  ["does it work on instagram?", "channels"],
  ["do i need a separate whatsapp number?", "channels"],
  ["who are you guys?", "company"],
  ["how much does pro cost, and can I also get your contact?", "pricing"],
  // real strings from the live screenshots that misbehaved
  ["Manychys", "managed"],
  ["Manu chat", "managed"],
  ["can u teach me how to build dm", "diy"],
  ["Yes manychat, can u teach me how to build dm", "diy"],
  ["teach me step by step how to set it up myself", "diy"]
];
for (let ci = 0; ci < CASES.length; ci++) {
  const [q, expect] = CASES[ci];
  stub({ okOn: "any" });
  // unique IP per case so this loop (now > 12 cases) never trips the
  // per-minute rate limiter, which section 9 tests on its own IP
  const r = await handleChat({ message: q, history: [], ip: "2.2.2." + ci });
  check(`"${q}" \u2192 ${expect}`, r.topics[0] === expect, `got ${JSON.stringify(r.topics)}`);
  check(`   \u2026 small reference, not the whole site (${r.topics.length} \u2264 3)`, r.topics.length <= 3);
}

// "fees" checked separately: it's a supporting topic (shares the pricing
// CTA on purpose), so what matters is it reaches the model, not that it
// wins primary over "pricing" itself.
for (const [q, ci] of [["what does the setup fee actually cover?", 90], ["what am i paying the monthly fee for?", 91]]) {
  stub({ okOn: "any" });
  const r = await handleChat({ message: q, history: [], ip: "2.2.2." + ci });
  check(`"${q}" \u2192 includes fees`, r.topics.includes("fees"), `got ${JSON.stringify(r.topics)}`);
  check(`   \u2026 small reference, not the whole site (${r.topics.length} \u2264 3)`, r.topics.length <= 3);
}

console.log("\n2b. TOPIC ISOLATION (fixing the reported bug: pricing question pulling in a contact/book link)");
stub({ okOn: "any" });
let rMix = await handleChat({ message: "how much is pro monthly?", history: [], ip: "3.3.3.1" });
check("pure pricing question → pricing stays primary (not contact/company)", rMix.topics[0] === "pricing", `got ${JSON.stringify(rMix.topics)}`);
check("CTA for a pure pricing question is the pricing button, not book/contact",
  rMix.ctas[0] && rMix.ctas[0].href === "/pricing.html", `got ${JSON.stringify(rMix.ctas)}`);

console.log("\n2b2. NO BUTTON ON A GOODBYE / DECLINE (screenshot bug: 'Managed plans' under 'I don't need your service')");
for (const msg of ["Thanks now i don't need ur service", "no thanks", "not interested", "bye"]) {
  stub({ okOn: "any" });
  const rBye = await handleChat({ message: msg, history: [], ip: "3.3.4." + msg.length });
  check(`"${msg}" → no CTA attached`, rBye.ctas.length === 0, `got ${JSON.stringify(rBye.ctas)}`);
}
stub({ okOn: "any" });
const rStill = await handleChat({ message: "thanks, how much is pro?", history: [], ip: "3.3.4.99" });
check("but a real question that merely says 'thanks' still gets its button",
  rStill.ctas.length > 0, `got ${JSON.stringify(rStill.ctas)}`);

console.log("\n2c. FALLBACK ON A TOTALLY OFF-TOPIC MESSAGE (never empty-handed, still small)");
stub({ okOn: "any" });
let rOff = await handleChat({ message: "asdkjh random gibberish zzz", history: [], ip: "3.3.3.2" });
check("off-topic message still gets a real reference (company+products), not nothing",
  rOff.topics.length === 2 && rOff.topics.includes("company") && rOff.topics.includes("products"),
  `got ${JSON.stringify(rOff.topics)}`);
check("...but no CTA button on that clarification reply (screenshot bug)",
  rOff.ctas.length === 0, `got ${JSON.stringify(rOff.ctas)}`);

console.log("\n2d. HISTORY IS TRIMMED (the actual token-cost fix)");
const longHistory = [];
for (let i = 0; i < 20; i++) {
  longHistory.push({ role: "user", content: "question number " + i + " " + "x".repeat(3000) });
  longHistory.push({ role: "assistant", content: "answer number " + i + " " + "x".repeat(3000) });
}
stub({ okOn: "any" });
await handleChat({ message: "pricing?", history: longHistory, ip: "3.3.3.3" });
const historyMsgsSent = lastBody.messages.length - 3; // minus 2 system msgs + the new user msg
const totalCharsSent = lastBody.messages.reduce((n, m) => n + m.content.length, 0);
check("only the last 6 history turns are sent, not all 40", historyMsgsSent === 6, `sent ${historyMsgsSent}`);
check("each old turn is cut to 500 chars, not the full 3000+",
  lastBody.messages.slice(2, -1).every(m => m.content.length <= 500));
check("total request stays well under the ~8k-token complaint (roughly <2000 tokens ≈ 8000 chars)",
  totalCharsSent < 8000, `${totalCharsSent} chars ≈ ${Math.round(totalCharsSent / 4)} tokens`);

console.log("\n3. LIVE PRICING (pulled from site-data.js, never duplicated)");
stub({ okOn: "any" });
let r = await handleChat({ message: "how much is pro?", history: [], ip: "1.1.1.2" });
check("model called once, with the retrieved reference", calls.length === 1);
check("request goes to OpenRouter with a Bearer key header",
  lastUrl === CFG.endpoint && lastOpts.headers.Authorization === "Bearer test-key");
check("every request carries the system prompt + REFERENCE (rules always sent)",
  lastBody.messages[0].role === "system" && /^REFERENCE/.test(lastBody.messages[1].content));
// Regression guard: loadPricingText() used to call a function site-data.js
// does not export, so every pricing question silently degraded to "pricing
// could not be loaded" and the assistant could never quote a price.
const priceRef = lastBody.messages[1].content;
check("pricing reference actually loaded (not the silent failure message)",
  !/could not be loaded/i.test(priceRef), priceRef.slice(0, 120));
check("pricing reference contains real ₹ figures from site-data.js",
  (priceRef.match(/₹[\d,]+/g) || []).length >= 8,
  `found ${(priceRef.match(/₹[\d,]+/g) || []).length} price figures`);
check("pricing reference lists every AI product and managed plan",
  ["Basic", "Pro", "Business", "WhatsApp Personal Assistant", "Fusion", "Fusion Max",
   "Starter", "Growth", "Combo"].every(n => priceRef.includes(n)));

console.log("\n4. TIER CHOICE (small → light, big/complex → standard)");
const mk = n => Array.from({ length: n }, () => ({ role: "user", content: "x" }));
check("short simple question → light", pickTier("how much is pro?", 1, mk(3)) === "light");
check("question touching 3 topics → standard", pickTier("pricing and voice and setup", 3, mk(3)) === "standard");
check("comparison wording → standard", pickTier("what's the difference between pro and business?", 2, mk(3)) === "standard");
check("long detailed message → standard", pickTier("x ".repeat(200), 1, mk(3)) === "standard");
check("oversized request (many tokens) → standard", pickTier("hi", 1, [{ role: "user", content: "y".repeat(7000) }]) === "standard");
stub({ okOn: "any" });
await handleChat({ message: "how much is pro?", history: [], ip: "4.4.4.1" });
check("simple message really calls the light chain's first model", calls[0] === CFG.tiers.light[0], calls[0]);
stub({ okOn: "any" });
await handleChat({ message: "what's the difference between pro and business?", history: [], ip: "4.4.4.2" });
check("comparison message really calls the standard chain's first model", calls[0] === CFG.tiers.standard[0], calls[0]);

console.log("\n5. FAIL-OVER CHAIN (a model goes down \u2192 the next one answers, visitor never notices)");
stub({ okOn: "fallback-only" });
r = await handleChat({ message: "pricing?", history: [], ip: "1.1.1.3" });
check("first attempt uses the tier's first model", calls[0] === CFG.tiers.light[0]);
check("second attempt uses the tier's next model", calls[1] === CFG.tiers.light[1]);
check("reply still returned successfully after fail-over", r.ok === true && r.reply.includes("\u20b9"));

stub({ failModels: CFG.tiers.light.slice(0, 3) });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.1" });
check("three models down in a row \u2192 fourth still answers", r.ok === true && calls.length === 4, calls.join(","));

stub({ failModels: [CFG.tiers.light[0]], failStatus: 429 });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.2" });
check("rate-limited (429) model \u2192 next model answers", r.ok === true && calls.length === 2);

stub({ failModels: [CFG.tiers.light[0]], failStatus: 402 });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.3" });
check("402 (low credits for that request) \u2192 tries the next model instead of dying", r.ok === true && calls.length === 2);

stub({ failModels: [CFG.tiers.light[0]], failStatus: 404 });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.4" });
check("model removed from OpenRouter (404) \u2192 next model answers", r.ok === true && calls.length === 2);

stub({ emptyModels: [CFG.tiers.light[0]] });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.5" });
check("empty reply from a model \u2192 next model answers", r.ok === true && calls.length === 2);

stub({ errBodyModels: [CFG.tiers.light[0]] });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.6" });
check("HTTP 200 with an error object inside \u2192 treated as a failure, next model answers", r.ok === true && calls.length === 2);

stub({ hangModels: [CFG.tiers.light[0]] });
const t0 = Date.now();
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.7" });
check("model that hangs is cut off by the per-try timeout, next model answers",
  r.ok === true && calls.length === 2 && Date.now() - t0 < 2000, `${Date.now() - t0}ms`);

stub({ okOn: "none", failStatus: 401 });
r = await handleChat({ message: "pricing?", history: [], ip: "5.5.5.8" });
check("invalid key (401) \u2192 stops at once, does not hammer every model", calls.length === 1 && r.ok === false, calls.join(","));

console.log("\n5b. COOL-DOWN (a model that just failed is skipped for the next visitor)");
stub({ failModels: [CFG.tiers.light[0]] });
await handleChat({ message: "pricing?", history: [], ip: "6.6.6.1" });
globalThis.fetch = (u, o) => { const b = JSON.parse(o.body); calls.push(b.model); return Promise.resolve(new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 })); };
calls = [];
r = await handleChat({ message: "pricing?", history: [], ip: "6.6.6.2" });
check("next visitor goes straight to a healthy model (no wasted wait on the failed one)",
  calls.length === 1 && calls[0] === CFG.tiers.light[1], calls.join(","));

console.log("\n5c. EVERYTHING DOWN \u2192 safe fallback message, nothing fabricated");
stub({ okOn: "none" });
r = await handleChat({ message: "pricing?", history: [], ip: "1.1.1.4" });
check("every available free model (tier + live backups) was attempted before giving up", calls.length === ALL_STATIC().length, calls.join(","));
check("safe fallback message shown to the visitor", r.reply.includes("currently unavailable"));
check("ok:false reported on failure", r.ok === false);
check("no model name / provider detail leaks to the visitor", !/openrouter|gpt-oss|gemini|llama/i.test(JSON.stringify(r)));
stub({ okOn: "any" });
r = await handleChat({ message: "pricing?", history: [], ip: "6.6.6.3" });
check("even right after a total outage, resting models are retried (chat can come back by itself)", r.ok === true);

console.log("\n6. MISSING API KEY \u2192 fails safely, no silent substitution");
const savedKey = CFG.apiKeys;
CFG.apiKeys = [];
stub({ okOn: "any" });
r = await handleChat({ message: "hi", history: [], ip: "1.1.1.5" });
check("no key \u2192 fallback message, no request even attempted", r.reply.includes("currently unavailable") && calls.length === 0);
CFG.apiKeys = savedKey;

console.log("\n7. CONVERSATION CONTEXT");
stub({ okOn: "any" });
r = await handleChat({
  message: "how much is it?",
  history: [{ role: "user", content: "tell me about business" }, { role: "assistant", content: "Business is the advanced Instagram agent." }],
  ip: "1.1.1.6"
});
check("follow-up (\"how much is it?\") still resolves to pricing via prior context", r.topics.includes("pricing"));

console.log("\n8. CONTEXTUAL CTAs");
stub({ okOn: "any" });
r = await handleChat({ message: "what is f.i.t.?", history: [], ip: "1.1.1.7" });
check("F.I.T. question \u2192 F.I.T. CTA", r.ctas[0] && r.ctas[0].href.includes("fit-framework"));
stub({ okOn: "any" });
r = await handleChat({ message: "how does it work?", history: [], ip: "1.1.1.8" });
check("how-it-works question \u2192 how-it-works CTA", r.ctas[0] && r.ctas[0].href.includes("how-it-works"));
check("CTAs are not spammed (\u2264 2)", r.ctas.length <= 2);

console.log("\n9. ABUSE PROTECTION");
stub({ okOn: "any" });
let limited = false;
for (let i = 0; i < 16; i++) {
  const rr = await handleChat({ message: "hi", history: [], ip: "9.9.9.9" });
  if (rr.reply.includes("quite fast")) limited = true;
}
check("same IP exceeding the per-minute limit is throttled", limited);

console.log("\n10. KEY SAFETY \u2014 nothing secret reaches the browser");
const chatHtml = fs.readFileSync(path.join(here, "..", "chat.html"), "utf8");
check("chat.html contains no API key / OpenRouter endpoint / env reference",
  !/sk-or-|gsk_[a-z0-9]|openrouter\.ai\/api|groq\.com\/openai|process\.env/i.test(chatHtml));
check("chat.html no longer references the deleted old engine",
  !/chat-engine\.js|chat-ui\.js/.test(chatHtml));
check("chat.html calls the local /api/chat endpoint", chatHtml.includes('"/api/chat"'));

console.log("\n11. NO UNNECESSARY FILES");
const files = fs.readdirSync(here).filter(f => fs.statSync(path.join(here, f)).isFile());
check("chat-ai/ contains only the required files",
  files.every(f => ["ai-config.js", "ai-assistant.js", "test.mjs", "README.md"].includes(f)),
  files.join(", "));
check("no leftover Cloudflare / multi-provider sub-folders",
  !fs.existsSync(path.join(here, "server")) && !fs.existsSync(path.join(here, "client")) && !fs.existsSync(path.join(here, "data")));

console.log("\n12. FREE-ONLY GUARANTEE + LIVE FREE-MODEL LIST");
{
  const saved = JSON.stringify(CFG.tiers);
  CFG.tiers.light = ["openai/gpt-oss-20b", "google/gemini-2.5-flash-lite"];       // paid slugs on purpose
  CFG.tiers.standard = ["openai/gpt-oss-120b"];
  stub({ okOn: "any" });
  let rp = await handleChat({ message: "how much is pro?", history: [], ip: "12.0.0.1" });
  check("paid model slugs in the config are NEVER sent to OpenRouter", calls.length === 0, calls.join(","));
  check("...and the visitor just sees the safe fallback", rp.ok === false && rp.reply.includes("currently unavailable"));
  Object.assign(CFG.tiers, JSON.parse(saved));
}
stub({ liveIds: ALL_STATIC().filter(m => m !== CFG.tiers.light[0]) });
let r12 = await handleChat({ message: "how much is pro?", history: [], ip: "12.0.0.2" });
check("a model that no longer exists on OpenRouter is skipped (no wasted request)",
  calls[0] === CFG.tiers.light[1] && !calls.includes(CFG.tiers.light[0]), calls.join(","));
stub({ liveIds: [...ALL_STATIC(), "newlab/brand-new-chat:free"], failModels: ALL_STATIC() });
r12 = await handleChat({ message: "how much is pro?", history: [], ip: "12.0.0.3" });
check("a newly-free model from the live list is used as a backup when the configured ones fail",
  r12.ok === true && calls[calls.length - 1] === "newlab/brand-new-chat:free", calls.join(","));
stub({ liveRows: [...ALL_STATIC().map(id => modelRow(id)),
  modelRow("nvidia/nemotron-3.5-content-safety:free"), modelRow("cohere/north-mini-code:free"),
  modelRow("poolside/laguna-s-2.1:free"), modelRow("somebody/not-really-free:free", "0.0005")], failModels: ALL_STATIC() });
r12 = await handleChat({ message: "how much is pro?", history: [], ip: "12.0.0.4" });
check("safety-classifier, code, training-risk and not-actually-free models are never used as backups",
  !calls.some(m => /content-safety|north-mini-code|poolside|not-really-free/.test(m)), calls.join(","));
stub({ liveFail: true });
r12 = await handleChat({ message: "how much is pro?", history: [], ip: "12.0.0.5" });
check("if OpenRouter's model list can't be read, the configured list is used (chat still works)",
  r12.ok === true && calls[0] === CFG.tiers.light[0]);

console.log("\n12b. PRIVACY RESTRICTION + AUTO-RELAX");
stub({ okOn: "any" });
await handleChat({ message: "how much is pro?", history: [], ip: "12.1.0.1" });
check("requests ask OpenRouter for providers that don't store/train on prompts",
  lastBody.provider && lastBody.provider.data_collection === "deny");
check("requests ask for short reasoning (keeps the token budget for the visible reply)", lastBody.reasoning && lastBody.reasoning.effort === "low");
stub({ policy404: true });
r12 = await handleChat({ message: "how much is pro?", history: [], ip: "12.1.0.2" });
check("if the privacy restriction leaves NO model available, it relaxes itself and the chat still answers",
  r12.ok === true && !lastBody.provider, `ok=${r12.ok} provider=${JSON.stringify(lastBody.provider)}`);
await handleChat({ message: "and business?", history: [], ip: "12.1.0.3" });
check("...and stays relaxed for the next visitors instead of failing 4 times each", !lastBody.provider);

console.log("\n12c. FREE-TIER QUOTA GUARDS (50/day, 20/min are account-wide)");
{
  CFG.dailyLimit = 3;
  stub({ okOn: "any" });
  let ok3 = 0;
  for (let i = 0; i < 3; i++) { const x = await handleChat({ message: "how much is pro?", history: [], ip: "12.2.0." + i }); if (x.ok) ok3++; }
  const before = calls.length;
  const x4 = await handleChat({ message: "how much is pro?", history: [], ip: "12.2.0.9" });
  check("first 3 messages answered normally", ok3 === 3);
  check("message 4 is stopped BEFORE calling OpenRouter (no wasted/failed request)", calls.length === before, `${calls.length - before} extra calls`);
  check("visitor gets a polite limit message with a WhatsApp button, not an error",
    x4.ok === false && /limit/i.test(x4.reply) && x4.ctas[0] && /wa\.me/.test(x4.ctas[0].href));
  check("limit message does not name any provider or model", !/openrouter|gemma|nemotron|qwen/i.test(x4.reply));

  CFG.dailyLimit = 4;                                  // failed attempts must be counted too
  stub({ okOn: "none" });
  await handleChat({ message: "how much is pro?", history: [], ip: "12.2.1.1" });
  check("failed attempts count toward the daily guard (4 attempts, then it stops)", calls.length === 4, `${calls.length}`);
  const c0 = calls.length;
  await handleChat({ message: "how much is pro?", history: [], ip: "12.2.1.2" });
  check("once the guard is hit, further messages make zero calls", calls.length === c0);
  CFG.dailyLimit = 1e9;

  stub({ failModels: ALL_STATIC(), failStatus: 429, failMessage: "Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day" });
  const xd = await handleChat({ message: "how much is pro?", history: [], ip: "12.2.2.1" });
  check("OpenRouter says the DAILY free limit is hit → stops immediately (1 call, not 4)", calls.length === 1, `${calls.length}`);
  check("...and shows the polite limit message", /limit/i.test(xd.reply) && xd.ctas.length === 1);
  const c1 = calls.length;
  await handleChat({ message: "how much is pro?", history: [], ip: "12.2.2.2" });
  check("...and doesn't keep hammering OpenRouter for the next visitors", calls.length === c1);

  stub({ failModels: ALL_STATIC(), failStatus: 429, failMessage: "Provider returned error: rate-limited upstream" });
  const xp = await handleChat({ message: "how much is pro?", history: [], ip: "12.2.3.1" });
  check("a single provider being busy (429) is NOT mistaken for the daily limit (tries the next model)", calls.length > 1, `${calls.length}`);

  CFG.accountPerMinute = 2;
  stub({ okOn: "any" });
  await handleChat({ message: "how much is pro?", history: [], ip: "12.2.4.1" });
  await handleChat({ message: "how much is pro?", history: [], ip: "12.2.4.2" });
  const c2 = calls.length;
  const xm = await handleChat({ message: "how much is pro?", history: [], ip: "12.2.4.3" });
  check("account-wide per-minute guard holds extra messages instead of burning the 20/min cap",
    calls.length === c2 && /try again in a minute/i.test(xm.reply), xm.reply);
  CFG.accountPerMinute = 1e9;
}

console.log("\n12d. TRY BUDGET + REPLY CLEAN-UP");
CFG.maxTries = 2;
stub({ okOn: "none" });
await handleChat({ message: "how much is pro?", history: [], ip: "12.3.0.1" });
check("never makes more tries than maxTries per message (each try can use free quota)", calls.length === 2, `${calls.length}`);
CFG.maxTries = 8;
stub({ replyText: "<think>the user wants a price</think>Pro is the recommended start." });
r12 = await handleChat({ message: "how much is pro?", history: [], ip: "12.3.0.2" });
check("inline <think>…</think> reasoning is stripped before the visitor sees it", r12.reply === "Pro is the recommended start.", r12.reply);

console.log("\n13. MULTIPLE API KEYS (main + fallbacks)");
{
  // --- how the keys are read from the environment (fresh process, real config file) ---
  const readKeys = env => JSON.parse(execFileSync(process.execPath, ["-e",
    "console.log(JSON.stringify(require(process.argv[1]).apiKeys))", path.join(here, "ai-config.js")],
    { env: { PATH: process.env.PATH, ...env } }).toString());
  const k0 = readKeys({ OPENROUTER_API_KEY: "main", OPENROUTER_API_KEY_2: "f1", OPENROUTER_API_KEY_3: "f2" });
  check("main key first, then _2, _3 in order", JSON.stringify(k0) === '["main","f1","f2"]', JSON.stringify(k0));
  check("blank / whitespace / duplicate keys are ignored",
    JSON.stringify(readKeys({ OPENROUTER_API_KEY: " main ", OPENROUTER_API_KEY_2: "", OPENROUTER_API_KEY_3: "main", OPENROUTER_API_KEY_4: "f4" })) === '["main","f4"]');
  check("up to 10 keys supported, an 11th is ignored",
    readKeys(Object.fromEntries([["OPENROUTER_API_KEY", "m"], ...Array.from({ length: 12 }, (_, i) => ["OPENROUTER_API_KEY_" + (i + 2), "x" + (i + 2)])])).length === 10);
  check("comma-separated OPENROUTER_API_KEYS also works (first one is the main key)",
    JSON.stringify(readKeys({ OPENROUTER_API_KEYS: "a, b ,c" })) === '["a","b","c"]');
  check("no keys at all → empty list", readKeys({}).length === 0);

  // --- behaviour with 3 keys ---
  const saved = CFG.apiKeys;
  CFG.apiKeys = ["k1", "k2", "k3"];
  const DAY = { status: 429, message: "Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day" };

  stub({ okOn: "any" });
  let m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.0.1" });
  check("main key is used first", m.ok && keysUsed[0] === "k1" && keysUsed.length === 1, keysUsed.join(","));

  stub({ failKeys: { k1: DAY } });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.0.2" });
  check("main key hits its daily limit → SAME model retried on the fallback key, visitor gets an answer",
    m.ok && keysUsed.join(",") === "k1,k2" && calls[0] === calls[1], keysUsed.join(",") + " | " + calls.join(","));
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.0.3" });
  check("next visitor goes straight to the fallback key (no wasted call on the exhausted one)",
    m.ok && keysUsed.join(",") === "k1,k2,k2", keysUsed.join(","));

  stub({ failKeys: { k1: DAY, k2: DAY } });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.0.4" });
  check("two keys exhausted → third key answers", m.ok && keysUsed.join(",") === "k1,k2,k3", keysUsed.join(","));

  stub({ failKeys: { k1: DAY, k2: DAY, k3: DAY } });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.0.5" });
  check("ALL keys exhausted → polite limit message with the WhatsApp button (not an error)",
    m.ok === false && /limit/i.test(m.reply) && m.ctas[0] && /wa\.me/.test(m.ctas[0].href), m.reply);
  check("...it tried each key once, then stopped", keysUsed.join(",") === "k1,k2,k3", keysUsed.join(","));
  const c = calls.length;
  await handleChat({ message: "how much is pro?", history: [], ip: "13.0.0.6" });
  check("...and makes zero calls for the next visitors until the keys recover", calls.length === c);

  stub({ failKeys: { k1: { status: 401, message: "No auth credentials found" } } });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.1.1" });
  check("main key rejected (401) → falls back to the next key and still answers", m.ok && keysUsed.join(",") === "k1,k2", keysUsed.join(","));
  await handleChat({ message: "how much is pro?", history: [], ip: "13.0.1.2" });
  check("...and doesn't keep retrying the rejected key", keysUsed.join(",") === "k1,k2,k2", keysUsed.join(","));

  stub({ failKeys: { k1: { status: 401 }, k2: { status: 401 }, k3: { status: 401 } } });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.1.3" });
  check("every key rejected → generic 'unavailable' message (a broken key is not the visitor's 'limit')",
    m.ok === false && m.reply.includes("currently unavailable") && !/limit/i.test(m.reply), m.reply);
  check("...and it doesn't hammer: one try per key", keysUsed.length === 3, keysUsed.join(","));

  stub({ failModels: [CFG.tiers.light[0]], failStatus: 429, failMessage: "Provider returned error: rate-limited upstream" });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.2.1" });
  check("a busy PROVIDER (429) tries the next model on the SAME key, doesn't burn the fallback key",
    m.ok && keysUsed.every(k => k === "k1") && calls.length === 2, keysUsed.join(","));
  stub({ failModels: [CFG.tiers.light[0], CFG.tiers.light[1]], failStatus: 503 });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.2.2" });
  check("a model outage (503) never switches keys", m.ok && keysUsed.every(k => k === "k1"), keysUsed.join(","));

  CFG.dailyLimit = 2;
  stub({ okOn: "any" });
  for (let i = 0; i < 2; i++) await handleChat({ message: "how much is pro?", history: [], ip: "13.0.3." + i });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.3.9" });
  check("per-key daily guard: after the main key's budget is spent, the fallback key takes over BEFORE any failed call",
    keysUsed.join(",") === "k1,k1,k2" && m.ok, keysUsed.join(","));
  CFG.dailyLimit = 1e9;

  CFG.accountPerMinute = 1;
  stub({ okOn: "any" });
  await handleChat({ message: "how much is pro?", history: [], ip: "13.0.4.1" });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.4.2" });
  check("per-key per-minute guard: a second key absorbs the burst", keysUsed.join(",") === "k1,k2" && m.ok, keysUsed.join(","));
  CFG.accountPerMinute = 1e9;

  const savedTries = CFG.maxTries; CFG.maxTries = 1;
  stub({ failKeys: { k1: DAY, k2: DAY } });
  m = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.5.1" });
  check("key switches get their own try budget (maxTries 1 + 2 extra keys still reaches key 3)", m.ok && keysUsed.join(",") === "k1,k2,k3", keysUsed.join(","));
  CFG.maxTries = savedTries;

  // --- keys never leak ---
  CFG.apiKeys = ["sk-or-v1-SECRETAAAA", "sk-or-v1-SECRETBBBB"];
  const logs = [], oLog = console.log, oErr = console.error;
  console.log = (...a) => logs.push(a.join(" ")); console.error = (...a) => logs.push(a.join(" "));
  stub({ failKeys: { "sk-or-v1-SECRETAAAA": { status: 429, message: "free-models-per-day" } }, failModels: [] });
  const leak1 = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.6.1" });
  stub({ failKeys: { "sk-or-v1-SECRETAAAA": { status: 401 }, "sk-or-v1-SECRETBBBB": { status: 401 } } });
  const leak2 = await handleChat({ message: "how much is pro?", history: [], ip: "13.0.6.2" });
  console.log = oLog; console.error = oErr;
  check("no API key appears in any reply sent to the visitor", !/SECRET/.test(JSON.stringify([leak1, leak2])));
  check("no API key appears in the server logs either", !/SECRET/.test(logs.join("\n")), logs.filter(l => /SECRET/.test(l))[0]);
  CFG.apiKeys = saved;
}

globalThis.fetch = realFetch;
console.log(`\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nPASS ${pass}   FAIL ${fail}\n`);
process.exit(fail ? 1 : 0);
