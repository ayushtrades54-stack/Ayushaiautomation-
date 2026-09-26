/* ═══════════════════════════════════════════════════════════════
   chat-ai/ai-assistant.js
   Everything the assistant needs to answer one message:
   retrieval → Groq call (with fallback model) → CTA → errors.
   Server-side only. Imported by /api/chat.js.
   ═══════════════════════════════════════════════════════════════ */
const fs = require("fs");
const path = require("path");
const CFG = require("./ai-config.js");

const FALLBACK_MESSAGE =
  "Hey, I'm currently unavailable. Sorry about that. Please try again shortly.";

/* ── CTAs — internal links only, never invented ── */
const CTAS = {
  pricing:  { label: "See pricing",             href: "/pricing.html" },
  products: { label: "Compare all products",    href: "/resources/products.html" },
  how:      { label: "How it works",            href: "/resources/how-it-works.html" },
  fit:      { label: "Read about F.I.T.",       href: "/resources/learn.html#fit-framework" },
  demo:     { label: "Watch the demos",         href: "/demo.html" },
  book:     { label: "Book a free strategy call", href: "/book.html" },
  channels: { label: "Instagram & WhatsApp",    href: "/resources/channels.html" },
  managed:  { label: "Managed plans",           href: "/pricing.html#managed" },
  cases:    { label: "Case studies",            href: "/resources/case-studies.html" }
};

/* ── Approved website knowledge, split into small topics so only
   the relevant one is ever sent — never the whole website.
   Pricing text is filled in at request time from site-data.js
   below, so prices are never duplicated or out of date. ── */
const TOPICS = [
  { id: "company", cta: "book",
    keywords: ["who are you", "about", "ayush", "company", "agency", "what do you do", "founder", "team", "based"],
    text: "Ayush AI Automation designs, builds and manages Instagram and WhatsApp DM automation and AI agents for fitness coaches only (online coaches, PTs, gym owners, nutrition/wellness coaches). Run by Ayush (founder), who personally handles the strategy call, configuration, testing and ongoing management \u2014 no account-manager layer. Two categories: AI Agent Automation (six products) and Managed Automation (rule-based, lower cost). Contact: WhatsApp/phone +91 94772 93867, email ayushaiautomation.in@gmail.com, Instagram @ayush.automation." },

  { id: "products", cta: "products",
    keywords: ["product", "products", "plan", "plans", "package", "tier", "basic", "pro", "business", "fusion", "fusion max", "whatsapp personal assistant", "wapa", "which one", "compare plans"],
    text: "Six AI Agent products (all answer from the coach's own knowledge, keep context, human handoff on request, record every lead, never cold outreach): Basic (Instagram) answers enquiries and captures the name \u2014 no qualification, follow-ups, booking link or voice. Pro (Instagram, recommended start) adds qualification questions one at a time with locked answers, booking link once qualified, approved follow-ups, hot lead alerts; no voice, no AI-written follow-ups; 14-day guarantee. Business (Instagram) adds voice-note understanding, follow-ups written per lead, cleaned data, multi-message handling, exportable leads. WhatsApp Personal Assistant is Pro-level qualification on WhatsApp, needs a dedicated number; no voice, no Instagram. Fusion links Instagram Pro + WhatsApp PA as one product \u2014 a lead who part-qualified on Instagram is recognised on WhatsApp. Fusion Max is Business-level on both channels with voice and AI-written follow-ups on both." },

  { id: "pricing", cta: "pricing",
    keywords: ["price", "pricing", "cost", "how much", "charge", "fee", "monthly", "setup", "cheap", "cheapest", "budget", "gst", "tax", "offer", "discount"],
    text: null },

  { id: "how-it-works", cta: "how",
    keywords: ["how does it work", "how it works", "process", "what happens when", "explain how", "what do you build", "under the hood"],
    text: "Every enquiry: lead message (DM, keyword comment, or WhatsApp) \u2192 the agent reads what they wrote \u2192 answers from the coach's knowledge \u2192 qualification where supported \u2192 stored as a lead record \u2192 a follow-up if the lead goes quiet \u2192 the booking link once qualified, plus a hot lead alert email to the coach \u2192 human handoff the moment someone asks for a person. It's a configured managed service, not software the coach sets up. If a question falls outside the supplied knowledge, the agent says the coach will confirm rather than guessing." },

  { id: "fit", cta: "fit",
    keywords: ["fit", "f i t", "fit framework", "filter influence transfer", "framework", "methodology"],
    text: "The F.I.T. DM Funnel Framework \u2014 Filter, Influence, Transfer \u2014 is the first DM automation framework designed specifically for fitness coaches, and the structure behind every qualifying conversation. Filter: the coach's questions separate serious buyers from browsers, answers locked. Influence: real objections answered in the coach's own words while qualifying. Transfer: the booking link goes out once, only to qualified leads, plus a hot lead alert. Runs on Pro, Business, WhatsApp PA, Fusion, Fusion Max (and Managed Growth/Combo). Does not guarantee conversions." },

  { id: "channels", cta: "channels",
    keywords: ["instagram", "whatsapp", "channel", "comment to dm", "comment", "both channels", "dedicated number", "24 hour", "messenger"],
    text: "Instagram and WhatsApp only. Comment \u2192 DM (free on every Instagram AI product): a keyword comment gets a public reply plus a private DM; reaches people who've never messaged before; no duplicates; different keywords can run different campaigns. WhatsApp products need a dedicated business number (existing chat history doesn't carry over) and WhatsApp's 24-hour window shapes follow-up timing. Comment \u2192 DM is Instagram-only." },

  { id: "voice", cta: "products",
    keywords: ["voice", "voice note", "voice notes", "audio", "voice message", "recording"],
    text: "Voice-note understanding is available on Business and Fusion Max only \u2014 a voice note is transcribed, understood in context, and answered, and a voice answer counts toward qualification. The agent always replies in TEXT; no product sends voice notes back. On products without voice support, a voice note gets a short reply asking for text instead." },

  { id: "leads-data", cta: "how",
    keywords: ["lead data", "crm", "lead record", "export", "hot lead", "alert", "handoff", "human", "take over"],
    text: "Every product records a structured lead record. From Pro upward: qualification answers, stage reached, booking-link status, follow-up state. Business/WhatsApp PA/Fusion Max add a sortable, exportable lead view. The coach receives the useful part (username, chat logs, a summary, contact number where available) \u2014 not raw backend access. Hot lead alerts (Pro and above): once a lead qualifies AND has received the booking link, an email with their details goes to the coach's chosen address \u2014 not a booking confirmation. Human handoff (all six): the agent stops replying and cancels queued follow-ups the moment someone asks for a person." },

  { id: "follow-ups", cta: "how",
    keywords: ["follow up", "follow-ups", "chase", "nudge", "ghost", "went quiet", "stopped replying"],
    text: "Quiet leads get a follow-up matched to where the conversation stopped. Pro, WhatsApp PA and Fusion use approved template follow-ups; Business and Fusion Max write each one fresh per lead (never both at once). Any queued follow-up cancels the moment the lead replies, books, or asks for a human. Basic sends no follow-ups." },

  { id: "booking", cta: "book",
    keywords: ["booking", "booking link", "calendar", "book a call", "schedule", "appointment", "availability"],
    text: "On Pro and above, the coach's booking link is sent once, only after qualification, never twice. There is NO calendar integration on any product \u2014 the system sends the link; the link handles availability. On Fusion/Fusion Max a qualified Instagram lead can be moved to WhatsApp to finish booking. For the visitor: the next step is a free 20-minute strategy call \u2014 no pitch, and the honest recommendation can be a cheaper plan or nothing yet." },

  { id: "demo", cta: "demo",
    keywords: ["demo", "example", "see it", "show me", "video", "walkthrough", "screenshot"],
    text: "The Demo page shows each AI product handling a real conversation start to finish, plus recorded Managed-plan walkthroughs and real screenshots. A live walkthrough can also be arranged on the free strategy call." },

  { id: "setup", cta: "how",
    keywords: ["setup", "onboarding", "get started", "how long", "timeline", "go live", "requirements"],
    text: "The coach's involvement: a 20-minute call, one onboarding form, and a guided pass through Meta's access screens (plus a dedicated WhatsApp number where relevant). Around 48\u201372 hours for most builds; Fusion/Fusion Max around 72 hours or more \u2014 targets, not guaranteed dates. Meta access is a revocable, scoped credential, never a password." },

  { id: "managed", cta: "managed",
    keywords: ["managed", "manychat", "rule based", "starter", "growth", "combo", "free trial"],
    text: "Managed Automation is the rule-based option (Free Trial, Starter, Growth, WhatsApp Lead Qualification, Combo) built on platforms such as ManyChat \u2014 the platform subscription is paid by the coach directly. Suits coaches whose DMs are mostly the same few questions, at lower cost. Not a ManyChat resale \u2014 the fee is for designing and managing the system." },

  { id: "guarantee", cta: "pricing",
    keywords: ["guarantee", "refund", "cancel", "lock in", "risk", "money back"],
    text: "14-day performance guarantee on Pro (and Managed Growth): if the agreed outcome doesn't happen within 14 days under normal conditions, Ayush reviews/adjusts/rebuilds free \u2014 a rebuild, not a refund, not a revenue guarantee. No lock-in; cancel after any cycle; setup fee non-refundable once built." },

  { id: "privacy", cta: "how",
    keywords: ["privacy", "data", "gdpr", "store", "retention", "delete", "secure", "password", "banned"],
    text: "Meta access is a scoped, revocable credential \u2014 never a password. Lead conversations pass through the system to respond/qualify/follow up; AI products send content to third-party AI services under those providers' terms; never used to train models or shared between clients. Lead records/chats are cleared every 7\u201314 days after being delivered to the coach; an archived backup copy can be deleted on request." },

  { id: "limits", cta: "how",
    keywords: ["limitation", "can't", "cannot", "doesn't do", "not included", "integration", "cold outreach"],
    text: "Does NOT: connect to a calendar, do cold outreach, send voice replies, work outside Instagram/WhatsApp, or include third-party CRM integrations. No guaranteed clients/revenue, no promise of error-free uninterrupted operation. Doesn't replace a human sales call \u2014 that's what handoff is for." },

  { id: "proof", cta: "cases",
    keywords: ["case study", "case studies", "proof", "results", "testimonial", "clients", "reviews"],
    text: "Anchal Mishra (fat loss/rehab coach) \u2014 a Managed Automation case study moving from Growth to an Instagram+WhatsApp Combo system. Two Managed Automation testimonials (Fabby, Haider). No AI Agent case studies published yet \u2014 none will be invented." }
];

/* ── live pricing, pulled from the site's own pricing source at
   request time (never duplicated, never goes stale) ── */
let PRICING_CACHE = null, PRICING_AT = 0;
function loadPricingText() {
  const now = Date.now();
  if (PRICING_CACHE && now - PRICING_AT < 60000) return PRICING_CACHE;
  try {
    const code = fs.readFileSync(path.join(__dirname, "..", "site-data.js"), "utf8");
    const sandboxWindow = {};
    // eslint-disable-next-line no-new-func
    new Function("window", code)(sandboxWindow);
    const D = sandboxWindow.SITE_DATA;
    const line = plan => {
      const t = D.priceText(plan.id);
      if (!t) return null;
      if (plan.price && plan.price.monthly === 0 && plan.price.setup === 0)
        return "\u2022 " + plan.name + ": free (trial only, not production)";
      let s = "\u2022 " + plan.name + ": " + t.monthly + "/month + " + t.setup + " one-time setup";
      if (t.discounted && t.setupWas) s += " (limited-time offer on setup; regular setup " + t.setupWas + ")";
      return s;
    };
    const ai = D.AI_PRODUCTS.map(line).filter(Boolean).join("\n");
    const managed = D.MANAGED_PLANS.map(line).filter(Boolean).join("\n");
    PRICING_CACHE =
      "All AI Agent prices are one-time setup + monthly, EXCLUDING GST. Monthly covers AI usage, hosting, monitoring, maintenance.\n" +
      "AI Agent Automation:\n" + ai + "\n" +
      "Managed Automation (platform subscription paid by the coach directly):\n" + managed + "\n" +
      "Any limited-time offer applies to the SETUP fee only \u2014 monthly is never discounted. Never quote a price not listed here.";
    PRICING_AT = now;
  } catch (e) {
    PRICING_CACHE = "Pricing could not be loaded right now \u2014 direct the visitor to /pricing.html for current prices.";
  }
  return PRICING_CACHE;
}

/* ── targeted retrieval: score topics against the message, return
   only the 1–3 that matter. Never sends the whole website. ── */
const STOP = new Set(("a an the to of for in on at by from with about as into is are was were be am do does did " +
  "i me my we our you your it its this that and or but if so what which who how when where why can could would " +
  "should will just really very please tell explain give show").split(" "));

function retrieve(message, recentText) {
  const norm = function (s) {
    return " " + String(s).toLowerCase()
      .replace(/\bf\.?\s*i\.?\s*t\.?\b/g, "fit")
      .replace(/[^a-z0-9₹\s]/g, " ").replace(/\s+/g, " ") + " ";
  };
  const q = norm(message);
  const qWords = q.split(" ").filter(function (w) { return w && !STOP.has(w); });
  const ctxWords = norm(recentText || "").split(" ").filter(function (w) { return w && !STOP.has(w); });

  const scored = TOPICS.map(function (t) {
    let score = 0;
    for (const kw of t.keywords) {
      const k = kw.toLowerCase();
      if (k.includes(" ")) { if (q.includes(k)) score += 5; }
      else {
        if (qWords.includes(k)) score += 3;
        else if (qWords.some(function (w) { return w.length > 4 && (w.startsWith(k) || k.startsWith(w)); })) score += 1.5;
        if (ctxWords.includes(k)) score += 0.5;
      }
    }
    return { topic: t, score: score };
  }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; });

  if (!scored.length) {
    const company = TOPICS.find(function (t) { return t.id === "company"; });
    return { chunks: company ? [company] : [], primary: null };
  }
  const top = scored.slice(0, 3).filter(function (x, i) { return i === 0 || x.score >= scored[0].score * 0.45; });
  return { chunks: top.map(function (x) { return x.topic; }), primary: top[0].topic };
}

function textOf(topic) { return topic.id === "pricing" ? loadPricingText() : topic.text; }

/* ── Groq call (OpenAI-compatible), with one fallback-model retry ── */
async function callGroq(messages, model) {
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, 20000);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + CFG.apiKey },
      body: JSON.stringify({ model: model, messages: messages, max_tokens: CFG.maxTokens, temperature: CFG.temperature }),
      signal: controller.signal
    });
    const data = await res.json().catch(function () { return null; });
    if (!res.ok) throw new Error("groq " + res.status + ": " + ((data && data.error && data.error.message) || "request failed"));
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text || !text.trim()) throw new Error("groq: empty response");
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

/* ── very small in-memory rate limit (best-effort; resets on cold start) ── */
const HITS = new Map();
function rateLimited(ip) {
  const win = Math.floor(Date.now() / 60000);
  const key = ip + ":" + win;
  if (HITS.size > 5000) HITS.clear();
  const n = (HITS.get(key) || 0) + 1;
  HITS.set(key, n);
  return n > CFG.ratePerMinute;
}

/* ── the one function /api/chat.js calls ── */
async function handleChat(input) {
  const message = input.message, history = input.history, ip = input.ip;

  if (!CFG.apiKey) return { reply: FALLBACK_MESSAGE, ctas: [], ok: false };
  if (ip && rateLimited(ip)) {
    return { reply: "You're sending messages quite fast \u2014 give it a few seconds and try again.", ctas: [], ok: false };
  }

  const userMessage = String(message || "").slice(0, 1000).trim();
  if (!userMessage) return { reply: FALLBACK_MESSAGE, ctas: [], ok: false };

  const recentText = (history || []).filter(function (m) { return m.role === "user"; })
    .slice(-2).map(function (m) { return m.content; }).join(" ");
  const retrieved = retrieve(userMessage, recentText);
  const chunks = retrieved.chunks, primary = retrieved.primary;
  const reference = chunks.map(function (c) { return "[" + c.id + "]\n" + textOf(c); }).join("\n\n");

  const messages = [
    { role: "system", content: CFG.systemPrompt },
    { role: "system", content: "REFERENCE (approved website information \u2014 the only source of facts):\n\n" + reference },
  ].concat(
    (history || []).filter(function (m) { return m.role === "user" || m.role === "assistant"; })
      .slice(-10).map(function (m) { return { role: m.role, content: String(m.content).slice(0, 2000) }; }),
    [{ role: "user", content: userMessage }]
  );

  let reply;
  try {
    reply = await callGroq(messages, CFG.model);
  } catch (e1) {
    try {
      reply = await callGroq(messages, CFG.fallbackModel);
    } catch (e2) {
      console.error("[chat-ai]", e1.message, "|", e2.message);
      return { reply: FALLBACK_MESSAGE, ctas: [], ok: false };
    }
  }

  const ctas = [];
  if (primary && CTAS[primary.cta]) {
    ctas.push(CTAS[primary.cta]);
    if (primary.cta !== "book" && /\b(book|call|demo|start|buy|sign up|interested)\b/i.test(userMessage)) {
      ctas.push(CTAS.book);
    }
  }

  return { reply: reply, ctas: ctas, ok: true, topics: chunks.map(function (c) { return c.id; }) };
}

module.exports = { handleChat: handleChat, retrieve: retrieve, TOPICS: TOPICS, FALLBACK_MESSAGE: FALLBACK_MESSAGE };
