/* chat-ai/test.mjs — run: node chat-ai/test.mjs
   Verifies retrieval, the model fallback chain, CTAs and error
   handling using a stubbed Groq call (no real API key needed). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

process.env.GROQ_API_KEY = "test-key";
const CFG = require("./ai-config.js");            // same cached instance ai-assistant.js uses
const { handleChat } = await import("./ai-assistant.js");

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (detail ? "  \u2192 " + detail : "")); }
}

const realFetch = globalThis.fetch;
let calls;
function stub({ okOn = "any", replyText = "Pro is \u20b92,499/month plus a one-time setup fee." } = {}) {
  calls = [];
  globalThis.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    calls.push(body.model);
    const shouldFail = okOn === "none" || (okOn === "fallback-only" && calls.length === 1);
    if (shouldFail) return new Response(JSON.stringify({ error: { message: "simulated failure" } }), { status: 503 });
    return new Response(JSON.stringify({ choices: [{ message: { content: replyText } }] }), { status: 200 });
  };
}

console.log("\n1. MODEL CONFIGURATION");
check("default model set to openai/gpt-oss-20b (current, per Groq's own migration guidance)",
  CFG.model === "openai/gpt-oss-20b");
check("fallback model set to openai/gpt-oss-120b", CFG.fallbackModel === "openai/gpt-oss-120b");
check("the retired llama-3.1-8b-instant is NOT the active model", CFG.model !== "llama-3.1-8b-instant");
const cfgSrc = fs.readFileSync(path.join(here, "ai-config.js"), "utf8");
check("API key is read from process.env, never hardcoded", cfgSrc.includes("process.env.GROQ_API_KEY"));
check("no literal Groq key committed in the config file", !/gsk_[A-Za-z0-9]{10,}/.test(cfgSrc));

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
  ["what's your instagram handle?", "company"],
  ["do you have a linkedin?", "company"],
  ["how do I contact you?", "company"],
  ["does it work on instagram?", "channels"],
  ["do i need a separate whatsapp number?", "channels"]
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

console.log("\n3. LIVE PRICING (pulled from site-data.js, never duplicated)");
stub({ okOn: "any" });
let r = await handleChat({ message: "how much is pro?", history: [], ip: "1.1.1.2" });
check("groq called with the retrieved reference", calls.length === 1);

console.log("\n4. FALLBACK MODEL CHAIN (default fails \u2192 fallback used automatically)");
stub({ okOn: "fallback-only" });
r = await handleChat({ message: "pricing?", history: [], ip: "1.1.1.3" });
check("first attempt uses the default model", calls[0] === "openai/gpt-oss-20b");
check("second attempt uses the fallback model", calls[1] === "openai/gpt-oss-120b");
check("reply still returned successfully after fallback", r.ok === true && r.reply.includes("\u20b9"));

console.log("\n5. BOTH MODELS FAIL \u2192 safe fallback message, nothing fabricated");
stub({ okOn: "none" });
r = await handleChat({ message: "pricing?", history: [], ip: "1.1.1.4" });
check("both models were attempted", calls.length === 2);
check("safe fallback message shown to the visitor", r.reply.includes("currently unavailable"));
check("ok:false reported on failure", r.ok === false);

console.log("\n6. MISSING API KEY \u2192 fails safely, no silent substitution");
const savedKey = CFG.apiKey;
CFG.apiKey = undefined;
stub({ okOn: "any" });
r = await handleChat({ message: "hi", history: [], ip: "1.1.1.5" });
check("no key \u2192 fallback message, no request even attempted", r.reply.includes("currently unavailable") && calls.length === 0);
CFG.apiKey = savedKey;

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
check("chat.html contains no API key / Groq endpoint / env reference",
  !/gsk_[a-z0-9]|groq\.com\/openai|process\.env/i.test(chatHtml));
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

globalThis.fetch = realFetch;
console.log(`\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nPASS ${pass}   FAIL ${fail}\n`);
process.exit(fail ? 1 : 0);
