/* ═══════════════════════════════════════════════════════════════
   chat-ai/ai-assistant.js
   Everything the assistant needs to answer one message:
   retrieval → OpenRouter call (tiered model chain, automatic
   fail-over) → CTA → errors.
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
  cases:    { label: "Case studies",            href: "/resources/case-studies.html" },
  guide:    { label: "Download the free guide", href: "/GUIDE_AYUSHAIAUTOMATION.pdf" },
  audit:    { label: "Get my free audit",       href: "/coaches.html#free-resources" },
  lab:      { label: "See free resources",      href: "/lab/index.html" }
};

/* ── Approved website knowledge, split into small topics so only
   the relevant one is ever sent — never the whole website.
   Pricing text is filled in at request time from site-data.js
   below, so prices are never duplicated or out of date. ── */
const TOPICS = [
  { id: "company", cta: "book",
    keywords: ["who are you", "about", "ayush", "company", "agency", "what do you do", "what do you guys do",
      "what do you sell", "what do you offer", "what is this", "you guys", "founder", "team", "based", "speak to ayush"],
    text: "Ayush AI Automation designs, builds and manages Instagram and WhatsApp DM automation and AI agents for fitness coaches only (online coaches, PTs, gym owners, nutrition/wellness coaches). Run by Ayush (founder), who personally handles the strategy call, configuration, testing and ongoing management \u2014 no account-manager layer. Two categories: AI Agent Automation (six products) and Managed Automation (rule-based, lower cost)." },

  /* Kept separate from "company" on purpose: contact-ish words (email,
     phone, contact) are common and were bleeding into unrelated topics
     (a pricing question would sometimes pull this in and the model would
     paste the LinkedIn link into a pricing answer). Narrow topic, narrow
     keywords, fixes that. */
  { id: "contact", cta: "book",
    keywords: ["contact", "email address", "phone number", "your whatsapp number", "get in touch", "reach you",
      "reach out", "linkedin", "instagram handle", "instagram id", "your instagram", "follow you", "social media",
      "talk to ayush", "talk to a person"],
    text: "Direct contact: WhatsApp/phone +91 94772 93867, email ayushaiautomation.in@gmail.com, Instagram @ayush.automation, LinkedIn linkedin.com/in/ayush-ai-automation-333a123a1." },

  { id: "audience", cta: "book",
    keywords: ["gym owner", "nutritionist", "personal trainer", "trainer", "dietitian", "coaches", "fitness coaches",
      "only for", "is this for me", "right for me", "suitable", "would this work", "work for me", "too early",
      "just starting", "starting out", "new coach", "small account", "worth it for me"],
    text: "Built for fitness coaches only — online coaches, personal trainers, gym owners, and nutrition/wellness coaches. It makes sense when: enquiry volume is consistent enough to be hard to answer well by hand (especially late at night), the offer is defined so there's real knowledge to answer from, the same questions repeat ('how much?' for the fortieth time), leads go cold because follow-ups don't happen, or unqualified calls are eating the week. A voice-heavy audience suits Business or Fusion Max; an Instagram-to-WhatsApp funnel suits Fusion. It is NOT the right time yet when: volume is negligible (automation manages existing demand, it does not create it — if only a few people message, wait), cold outreach is wanted (these only respond to people who message first), calendar control is wanted (the system sends the booking link, it doesn't manage the calendar), guaranteed clients are expected, or a dedicated WhatsApp number can't be provided for a WhatsApp product." },

  { id: "objections", cta: "managed",
    keywords: ["expensive", "too much", "afford", "can't afford", "cant afford", "costly", "waste of money",
      "what if it doesn't work", "what if it doesnt work", "doesn't work for me", "risky", "risk", "hesitant",
      "not convinced", "why should i", "is it worth"],
    text: "Ways the risk is kept low, all from the site's own terms: Managed Automation is the lower-cost, rule-based entry point, and the Free Trial Assistant is free (₹0 setup, ₹0 monthly) so automation can be seen working before paying anything. There is no long-term lock-in — cancel after any monthly cycle, and the service runs to the end of the cycle already paid for. Pro (and Managed Growth) carry a 14-day performance guarantee: if the agreed outcome doesn't happen within 14 days under normal conditions, Ayush reviews, adjusts or rebuilds free — a rebuild, not a refund. The setup fee is non-refundable once the build is completed and delivered, because the work has been carried out. None of it is a guarantee of revenue, clients or sales — results also depend on traffic, offer and content activity, which sit outside the automation." },

  { id: "buying", cta: "book",
    keywords: ["i want to buy", "want to buy", "ready to start", "how do i sign up", "sign up", "how do i start",
      "how do i get started", "what now", "next step", "do i pay", "pay before", "pay after", "payment",
      "what happens on the call", "on the strategy call", "how do i book", "purchase", "onboard me"],
    text: "The next step is always the same: a free 20-minute strategy call — no pitch, no slides. It covers the coach's offer and enquiry volume, where leads currently drop off, which product actually fits, pricing, and the WhatsApp number situation if a WhatsApp product is involved. The booking form asks for name, WhatsApp number, email, Instagram handle, role, which product they're interested in, weekly enquiry volume, budget range and preferred call time; Ayush then confirms the call time on WhatsApp. There is no pressure to decide on the call and no obligation to buy. On payment: prices are shown excluding GST, any applicable taxes are added on top and confirmed before payment, and payment details are arranged directly on the strategy call. Managed Automation plans also have their own plan setup form once the plan is chosen." },

  { id: "glossary", cta: "fit",
    keywords: ["glossary", "terminology", "jargon", "what does that mean", "what do you mean by",
      "answer locking", "knowledge base", "lead record", "structured lead record", "conversation context",
      "multi message", "cross channel linking", "define"],
    text: "Key terms as the site defines them. Knowledge base: the coach's programs, pricing, policies, FAQs and objection answers, structured so the agent answers as their business and defers when something falls outside it. Lead qualification: asking the coach's own questions — goal, timeline, readiness — one at a time, to separate serious buyers from browsers. Answer locking: once a lead answers a qualification question, the answer is stored and never asked again. Conversation context: the relevant recent history the agent keeps so it doesn't repeat itself or re-ask what's known. Structured lead record: a per-lead record of identity, qualification answers, status and context. Booking link: the coach's static booking destination, sent once after qualification — not a calendar integration. Hot lead alert: an email to the coach once a lead qualifies and receives the booking link. Human handoff: when a lead asks for a person, the agent stops replying and cancels queued follow-ups. Multi-message combining: several rapid messages answered as one clear reply. Cross-channel linking: recognising a lead who moves from Instagram to WhatsApp so answers carry over." },

  { id: "assistant-identity", cta: "book",
    keywords: ["are you a bot", "are you real", "are you a real person", "are you human", "am i talking to ayush",
      "is this a bot", "is this ai", "who am i talking to", "robot"],
    text: "This is the AI assistant on the Ayush AI Automation website — not a human, and not the product being sold (the products are the DM agents that run on a coach's own Instagram and WhatsApp). Ayush himself handles the strategy call, configuration and ongoing management personally. Anyone who wants to speak to a person directly can reach Ayush on WhatsApp at +91 94772 93867." },

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
    keywords: ["managed", "manychat", "rule based", "starter", "growth", "combo", "free trial",
      "hinglish", "language", "english"],
    text: "Managed Automation is the rule-based option (Free Trial, Starter, Growth, WhatsApp Lead Qualification, Combo) built on established platforms such as ManyChat. The platform subscription is paid directly to that platform and is separate from the service fee \u2014 typically around $25\u2013$30 per month depending on the plan and contact volume, confirmed before setup. Suits coaches whose DMs are mostly the same few questions, at lower cost. Not a ManyChat resale \u2014 the fee is for designing and managing the system. The Combo plan includes language selection (English / Hinglish)." },

  /* Guardrail topic. Without this, "teach me how to build a DM flow" matched
     nothing, and the model happily wrote a ManyChat tutorial from its own
     general knowledge — unsourced, and it talks the lead out of buying. */
  { id: "diy", cta: "how",
    keywords: ["teach me", "teach", "tutorial", "how to build", "how do i build", "how do i make", "how to make",
      "build it myself", "do it myself", "set it up myself", "setup myself", "myself", "step by step", "diy",
      "guide me through", "walk me through", "on my own", "build my own"],
    text: "Ayush AI Automation does not publish build tutorials or setup walkthroughs — designing, building, connecting and running the system IS the paid service, not something handed over as instructions. What the coach actually gets: the agent configured around their business, their knowledge base built out (programs, pricing, policies, tone), qualification questions and the conversion path set up, every account connected and tested before launch, then ongoing monitoring, maintenance and fixes as platforms change. That last part matters — Meta's setup screens and platform behaviour change from time to time, which is exactly the maintenance burden coaches hand over rather than carry themselves. The coach's own involvement is a 20-minute call, one onboarding form and a guided pass through Meta's access screens." },

  { id: "vs-chatbot", cta: "how",
    keywords: ["different from a chatbot", "normal chatbot", "chatbot", "chat bot", "chatgpt", "just an ai",
      "why not just", "how is this different", "different from a bot", "auto reply", "autoresponder"],
    text: "Generating a reply is only a small part of a DM system. A full system also has to: answer only from the coach's business knowledge and defer when it doesn't know; keep context so leads aren't asked the same thing twice; run a qualification sequence and lock the answers; decide when the booking link is released and never send it twice; follow up with quiet leads and stop the moment they reply; hand over cleanly when someone asks for a person; record every lead in a usable form and alert the coach to hot ones; and keep running as platforms change — which is what the monthly service covers. A generic chatbot or an AI that just writes replies does none of that end-to-end; this is a managed conversation system, not a reply generator." },

  { id: "managed-vs-ai", cta: "managed",
    keywords: ["managed vs ai", "ai vs managed", "difference between managed and ai", "manychat vs ai", "which is better managed or ai", "rule based vs ai", "how are they different"],
    text: "Managed Automation and AI Agent Automation are genuinely different systems, not tiers of the same thing. Managed follows predefined paths \u2014 keywords, buttons and rules decide what happens next; given a message it recognises, it responds perfectly and consistently, and falls back to a catch-all for anything unexpected. AI Agent Automation reads what the person actually wrote and responds from the coach's own knowledge, tracks what's been covered, and adapts when a conversation doesn't follow a script. Neither is universally better: mostly-repeat questions suit Managed at a lower cost; messier, fuller-sentence leads suit an AI agent." },

  { id: "guide", cta: "guide",
    keywords: ["free guide", "guide", "pdf guide", "dm handling guide", "handling guide", "download guide", "manual", "lead handling guide"],
    text: "Free DM Handling Guide: a short downloadable PDF on responding fast, qualifying leads by hand and following up consistently \u2014 for handling enquiries manually, before automating anything. Free, no signup beyond the download itself. Available from the Lab page." },

  { id: "audit", cta: "audit",
    keywords: ["free audit", "audit", "profile audit", "profile review", "review my profile", "review my dms", "bio review", "assessment", "dm audit"],
    text: "Free DM & Profile Audit: a short, personal review of the coach's Instagram profile and DM approach \u2014 bio, highlights and where conversations are leaking \u2014 done by Ayush directly. Free, requested via WhatsApp or the Coaches page. Separate from the Free Trial Assistant (a live automation trial) and from the AI Agent products themselves \u2014 the audit is manual feedback, not a system." },

  { id: "fees", cta: "pricing",
    keywords: ["cover", "covers", "covered", "paying", "what you get", "what do you get", "worth it"],
    text: "The one-time setup fee covers: configuring the agent around the coach's business, building the knowledge base (programs, pricing, policies, tone), setting up qualification questions and the conversion path, connecting and testing every account before launch, and launch handover. The monthly fee covers: AI usage, hosting, monitoring and maintenance, fixes when platforms change, and ongoing optimisation. It's a continuously managed service, not a one-off build — if the monthly service ends, the managed system stops running." },

  { id: "guarantee", cta: "pricing",
    keywords: ["guarantee", "refund", "cancel", "lock in", "risk", "money back"],
    text: "14-day performance guarantee on Pro (and Managed Growth): if the agreed outcome doesn't happen within 14 days under normal conditions, Ayush reviews/adjusts/rebuilds free \u2014 a rebuild, not a refund, not a revenue guarantee. No lock-in; cancel after any cycle; setup fee non-refundable once built." },

  { id: "privacy", cta: "how",
    keywords: ["privacy", "data", "gdpr", "store", "retention", "delete", "secure", "password", "banned"],
    text: "Meta access is a scoped, revocable credential \u2014 never a password. Lead conversations pass through the system to respond/qualify/follow up; AI products send content to third-party AI services under those providers' terms; never used to train models or shared between clients. Lead records/chats are cleared every 7\u201314 days after being delivered to the coach; an archived backup copy can be deleted on request." },

  { id: "limits", cta: "how",
    keywords: ["limitation", "can't", "cannot", "doesn't do", "not included", "integration", "cold outreach",
      "do you build websites", "websites", "run ads", "seo", "other services", "do you also do", "anything else"],
    text: "Does NOT: connect to a calendar, do cold outreach, send voice replies, work outside Instagram/WhatsApp, or include third-party CRM integrations. No guaranteed clients/revenue, no promise of error-free uninterrupted operation. Doesn't replace a human sales call \u2014 that's what handoff is for. The agency itself only does Instagram and WhatsApp DM automation and AI agents for fitness coaches \u2014 no websites, ads, SEO or other marketing services." },

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
    // Built from livePrice() + inr(), which are what site-data.js actually
    // exports. (This previously called D.priceText(), which does not exist \u2014
    // every pricing question silently fell into the catch below and the
    // assistant could never quote a real price.)
    if (typeof D.livePrice !== "function" || typeof D.inr !== "function") {
      throw new Error("site-data.js is missing livePrice/inr");
    }
    const line = plan => {
      if (!plan || !plan.price) return null;
      if (plan.price.monthly === 0 && plan.price.setup === 0)
        return "\u2022 " + plan.name + ": free (trial only, not production)";
      const live = D.livePrice(plan);
      let s = "\u2022 " + plan.name + ": " + D.inr(live.monthly) + "/month + " + D.inr(live.setup) + " one-time setup";
      if (live.setupWas) s += " (limited-time offer on setup; regular setup " + D.inr(live.setupWas) + ")";
      if (live.monthlyWas) s += " (regular monthly " + D.inr(live.monthlyWas) + ")";
      return s;
    };
    const ai = D.AI_PRODUCTS.map(line).filter(Boolean).join("\n");
    const managed = D.MANAGED_PLANS.map(line).filter(Boolean).join("\n");
    PRICING_CACHE =
      "All AI Agent prices are one-time setup + monthly, EXCLUDING GST. Monthly covers AI usage, hosting, monitoring, maintenance.\n" +
      "AI Agent Automation:\n" + ai + "\n" +
      "Managed Automation (platform subscription paid by the coach directly):\n" + managed + "\n" +
      "Figures above are the prices to quote. Where a 'regular' figure is shown, the lower number is current limited-time launch pricing and the regular figure is what it would otherwise be. Never quote a price not listed here.";
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

/* Small edit-distance, capped early so it stays cheap. Used only to
   catch misspellings of real keywords ("manychys" -> "manychat"), which
   previously scored zero and dumped the visitor into a generic reply. */
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = [], cur = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;      // whole row already too far
    prev = cur.slice();
  }
  return prev[b.length];
}
/* How wrong a word may be and still count as the keyword. Short words
   stay strict so "fit"/"fee"/"free" never blur into each other. */
function fuzzyEq(word, keyword) {
  const len = Math.min(word.length, keyword.length);
  if (len < 5) return false;
  const allowed = len >= 8 ? 2 : 1;
  return editDistance(word, keyword, allowed) <= allowed;
}

function retrieve(message, recentText) {
  const norm = function (s) {
    return " " + String(s).toLowerCase()
      .replace(/\bf\.?\s*i\.?\s*t\.?\b/g, "fit")
      .replace(/[^a-z0-9₹\s]/g, " ").replace(/\s+/g, " ") + " ";
  };
  const q = norm(message);
  const qWords = q.split(" ").filter(function (w) { return w && !STOP.has(w); });
  const ctxWords = norm(recentText || "").split(" ").filter(function (w) { return w && !STOP.has(w); });

  // Also test adjacent words glued together, so a name typed as two words
  // ("manu chat") still reaches the keyword it was meant to be.
  const qJoined = [];
  for (let i = 0; i + 1 < qWords.length; i++) qJoined.push(qWords[i] + qWords[i + 1]);

  const scored = TOPICS.map(function (t) {
    let score = 0;
    for (const kw of t.keywords) {
      const k = kw.toLowerCase();
      if (k.includes(" ")) { if (q.includes(k)) score += 5; }
      else {
        if (qWords.includes(k)) score += 3;
        // Prefix/stem match, but only between words of similar length —
        // otherwise a short keyword swallows long unrelated words
        // ("fitness" was matching the "fit" framework keyword on every
        // mention of fitness coaching).
        else if (qWords.some(function (w) {
          return w.length > 4 && Math.abs(w.length - k.length) <= 3 && (w.startsWith(k) || k.startsWith(w));
        })) score += 1.5;
        else if (qWords.some(function (w) { return fuzzyEq(w, k); })) score += 2.5;
        else if (qJoined.some(function (w) { return w === k || fuzzyEq(w, k); })) score += 2.5;
        if (ctxWords.includes(k)) score += 0.5;
      }
    }
    return { topic: t, score: score };
  }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; });

  if (!scored.length) {
    // Nothing matched at all. Give the model who-we-are + what-we-sell so it
    // can still steer, but primary stays null: no CTA button is attached to a
    // reply that is really just "could you clarify?".
    const ids = ["company", "products"];
    const fallback = TOPICS.filter(function (t) { return ids.indexOf(t.id) !== -1; });
    return { chunks: fallback, primary: null };
  }
  const top = scored.slice(0, 3).filter(function (x, i) { return i === 0 || x.score >= scored[0].score * 0.45; });
  return { chunks: top.map(function (x) { return x.topic; }), primary: top[0].topic };
}

function textOf(topic) { return topic.id === "pricing" ? loadPricingText() : topic.text; }

/* ── Model choice: which tier fits this message? ──────────────────
   "light"    = short/simple question → smaller, faster models first
   "standard" = larger or comparison-style question → a stronger model first
   Thresholds live in ai-config.js (standardWhen). */
function approxTokens(messages) {
  return Math.round(messages.reduce(function (n, m) { return n + String(m.content).length; }, 0) / 4);
}
function pickTier(userMessage, chunkCount, messages) {
  const T = CFG.standardWhen || {};
  const compare = /\b(compare|comparison|difference|differences|versus|vs|pros and cons|which (one )?(is )?(best|better|right)|explain)\b/i.test(userMessage);
  if (compare) return "standard";
  if (chunkCount >= (T.chunks || 3)) return "standard";
  if (userMessage.length > (T.messageChars || 280)) return "standard";
  if (approxTokens(messages) > (T.approxTokens || 1500)) return "standard";
  return "light";
}

/* ── FREE-ONLY GUARD ───────────────────────────────────────────────
   Only slugs ending in ":free" are ever sent to OpenRouter. Anything
   else (a typo, a paid model pasted into the config) is refused here,
   so this code path cannot spend money. */
function isFreeId(model) { return /:free$/.test(String(model)); }

/* ── Live list of currently-free models (public endpoint, no key).
   Free models are added/removed constantly; reading the live list means
   a dead slug is skipped instead of wasting a request, and new free
   models can serve as backups. Cached; if it can't be read, the static
   list from ai-config.js is used as-is. ── */
const SKIP_IDS = /content-safety|safeguard|guard|embed|rerank|lyria|code|coder|ocr|moderation|audio|tts|image|stealth\/|poolside\//i;
const LIVE = { ids: null, at: 0, retryAt: 0 };
async function loadLiveFree() {
  const now = Date.now();
  if (LIVE.ids && now - LIVE.at < CFG.liveRefreshMs) return LIVE.ids;
  if (now < LIVE.retryAt) return LIVE.ids;                       // recently failed; don't retry on every message
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, CFG.liveTimeoutMs);
  try {
    const res = await fetch(CFG.modelsEndpoint, { signal: controller.signal });
    const data = await res.json().catch(function () { return null; });
    if (!res.ok || !data || !Array.isArray(data.data)) throw new Error("bad model list (" + res.status + ")");
    const ids = new Map();
    data.data.forEach(function (m) {
      const p = m.pricing || {};
      const out = m.architecture && Array.isArray(m.architecture.output_modalities) ? m.architecture.output_modalities : ["text"];
      if (m && isFreeId(m.id) && Number(p.prompt) === 0 && Number(p.completion) === 0 &&
          out.indexOf("text") !== -1 && (m.context_length || 0) >= 8000 && !SKIP_IDS.test(m.id)) ids.set(m.id, m.context_length);
    });
    if (!ids.size) throw new Error("model list had no usable free models");
    LIVE.ids = ids; LIVE.at = now; LIVE.retryAt = 0;
  } catch (e) {
    LIVE.retryAt = now + 60000;
    console.error("[chat-ai] live free-model list unavailable, using the configured list:", e.message);
  } finally {
    clearTimeout(timer);
  }
  return LIVE.ids;
}

/* The ordered list of models to try for this message. */
function buildChain(tier, live) {
  const preferred = (CFG.tiers[tier] || []).filter(isFreeId);
  let chain = live ? preferred.filter(function (m) { return live.has(m); }) : preferred.slice();
  if (live) {
    const extras = Array.from(live.keys()).filter(function (m) { return chain.indexOf(m) === -1; }).slice(0, CFG.liveExtras || 0);
    chain = chain.concat(extras);
  }
  if (!chain.length) chain = preferred.slice();                  // list said none of ours exist: still try them
  return orderChain(chain);
}

/* ── Fail-over memory: a model that just failed is skipped for a short
   while so the next visitors don't wait on it again. In-memory and
   per-instance (resets on cold start) — best-effort, never required. ── */
const DOWN = new Map();
function markDown(model, ms) { DOWN.set(model, Date.now() + ms); }
function orderChain(models) {
  const now = Date.now();
  const healthy = models.filter(function (m) { return !(DOWN.get(m) > now); });
  const resting = models.filter(function (m) { return DOWN.get(m) > now; });
  // Resting models stay at the END of the list (not removed): if
  // everything is resting, the chat still tries them rather than going dead.
  return healthy.concat(resting);
}

/* ── API-key pool + free-tier quota guard ─────────────────────────
   Keys are used in order (main first, then fallbacks). Each key has its
   own counters, because OpenRouter's free limits belong to an ACCOUNT:
   keys from different accounts add capacity, keys inside one account
   share it. If a key hits a limit it is rested and the next key is used;
   if every key is resting the visitor gets the polite limit message. */
const KEYS = [];                                     // per-key state, same order as CFG.apiKeys
function keyState(i) {
  if (!KEYS[i]) KEYS[i] = { minute: 0, minuteWin: 0, day: 0, dayKey: "", pausedUntil: 0, dayBlockedUntil: 0, badUntil: 0 };
  return KEYS[i];
}
function rollWindows(k) {
  const now = Date.now(), win = Math.floor(now / 60000), day = new Date(now).toISOString().slice(0, 10);
  if (k.minuteWin !== win) { k.minuteWin = win; k.minute = 0; }
  if (k.dayKey !== day) { k.dayKey = day; k.day = 0; k.dayBlockedUntil = 0; }
}
/* First usable key in order, or { none:true, kind } saying why none is. */
function pickKey() {
  const now = Date.now(), n = (CFG.apiKeys || []).length;
  let dayBlocked = 0, minuteBlocked = 0, bad = 0;
  for (let i = 0; i < n; i++) {
    const k = keyState(i); rollWindows(k);
    if (now < k.badUntil) { bad++; continue; }
    if (now < k.dayBlockedUntil || k.day >= CFG.dailyLimit) { dayBlocked++; continue; }
    if (now < k.pausedUntil || k.minute >= CFG.accountPerMinute) { minuteBlocked++; continue; }
    return { idx: i };
  }
  return { none: true, kind: minuteBlocked ? "minute" : dayBlocked ? "day" : "bad" };
}
function spendOne(i) { const k = keyState(i); rollWindows(k); k.minute++; k.day++; }
function keysSummary() { return (CFG.apiKeys || []).map(function (_, i) { const k = keyState(i); return "k" + (i + 1) + ":" + k.day; }).join(" "); }

/* Privacy restriction can be dropped temporarily if it leaves no model usable. */
const POLICY = { relaxedUntil: 0 };

/* ── One OpenRouter call (OpenAI-compatible endpoint) ── */
async function callModel(messages, model, timeoutMs, keyIdx) {
  if (!isFreeId(model)) { const e = new Error("refused non-free model: " + model); e.status = "refused"; throw e; }
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, timeoutMs);
  try {
    const body = { model: model, messages: messages, max_tokens: CFG.maxTokens, temperature: CFG.temperature };
    if (CFG.reasoning) body.reasoning = CFG.reasoning;      // keep "thinking" short; models that don't support it ignore it
    if (CFG.dataCollection && Date.now() >= POLICY.relaxedUntil) body.provider = { data_collection: CFG.dataCollection };

    spendOne(keyIdx);
    const res = await fetch(CFG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + CFG.apiKeys[keyIdx],
        "HTTP-Referer": CFG.siteUrl,
        "X-Title": CFG.siteName
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const data = await res.json().catch(function () { return null; });
    const apiMsg = (data && data.error && data.error.message) || "request failed";
    if (!res.ok) {
      const err = new Error("openrouter " + res.status + " (" + model + "): " + apiMsg);
      err.status = res.status;
      if (res.status === 429) {
        // Account-wide free limits (shared by every free model) vs. one provider being busy.
        if (/per-?day|daily/i.test(apiMsg)) err.limit = "day";
        else if (/free-models-per-min|per-?min/i.test(apiMsg)) err.limit = "minute";
      }
      throw err;
    }
    // OpenRouter can answer HTTP 200 with an error object inside.
    if (data && data.error) {
      const err = new Error("openrouter error (" + model + "): " + apiMsg);
      err.status = data.error.code || 502;
      throw err;
    }
    let text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof text === "string") text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();   // some models inline their reasoning
    if (typeof text !== "string" || !text) {
      const err = new Error("openrouter (" + model + "): empty response");
      err.status = "empty";
      throw err;
    }
    return text;
  } catch (e) {
    if (e && e.name === "AbortError") { e.status = "timeout"; e.message = "openrouter (" + model + "): timed out"; }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/* Walk the chain until one model answers. Returns { reply, model, key }.
   For each model it uses the first usable key; if that key hits a limit or
   is rejected, the SAME model is retried on the next key before moving on.
   Throws after every allowed try failed / the time budget ran out; the
   error carries .limit = "day" | "minute" when every key is at its quota,
   or .limit = "bad" when no key is accepted. */
async function answerWithChain(messages, models, isRetry) {
  const deadline = Date.now() + CFG.totalMs;
  const failures = [], statuses = [];
  const maxTries = CFG.maxTries + Math.max(0, (CFG.apiKeys || []).length - 1);   // one extra try per fallback key
  let tries = 0, stop = false;
  for (const model of models) {
    if (stop) break;
    let modelDone = false;
    while (!modelDone) {
      const remaining = deadline - Date.now();
      if (remaining < 1500 || tries >= maxTries) { stop = true; break; }     // out of time / tries (each try can use free quota)
      const pick = pickKey();
      if (pick.none) {
        const e = new Error("no usable API key (" + pick.kind + ")"); e.limit = pick.kind; throw e;
      }
      tries++;
      try {
        const reply = await callModel(messages, model, Math.min(CFG.perTryMs, remaining), pick.idx);
        return { reply: reply, model: model, key: pick.idx };
      } catch (e) {
        failures.push("k" + (pick.idx + 1) + " " + e.message); statuses.push(e.status);
        const ks = keyState(pick.idx);
        if (e.limit === "day") { ks.dayBlockedUntil = Date.now() + CFG.dailyRecheckMs; continue; }   // same model, next key
        if (e.limit === "minute") { ks.pausedUntil = Date.now() + 60000; continue; }
        if (e.status === 401 || e.status === 403) { ks.badUntil = Date.now() + 60 * 60000; continue; } // this key rejected: next key
        modelDone = true;                                                   // problem is the model, not the key
        if (e.status === 404 || e.status === 400) markDown(model, 5 * 60000);        // model removed / not offered to this policy
        else if (e.status !== "empty") markDown(model, CFG.coolDownMs);              // 429 (provider), 5xx, timeout, 402
      }
    }
  }
  // If the privacy restriction left NO model available (all 404), relax it once and retry.
  if (!isRetry && CFG.dataCollection && statuses.length && statuses.every(function (s) { return s === 404; }) &&
      Date.now() >= POLICY.relaxedUntil) {
    POLICY.relaxedUntil = Date.now() + CFG.privacyRelaxMs;
    console.error("[chat-ai] no model available under the privacy restriction — relaxing it for " + Math.round(CFG.privacyRelaxMs / 60000) + " min so the chat stays up");
    DOWN.clear();
    return answerWithChain(messages, models, true);
  }
  const err = new Error(failures.join(" | ") || "no model attempted");
  err.failures = failures;
  throw err;
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

/* What the visitor sees when the free-tier quota is used up. Honest, polite,
   and gives them a way forward instead of a dead end. */
const WHATSAPP = { label: "Message Ayush on WhatsApp", href: "https://wa.me/919477293867" };
function limitReply(kind) {
  if (kind === "day") {
    return { reply: "I've reached my chat limit for today, sorry about that. You can message Ayush directly on WhatsApp and he'll help you from there \u2014 or try me again tomorrow.",
      ctas: [WHATSAPP], ok: false };
  }
  return { reply: "I'm getting a lot of messages right now \u2014 please try again in a minute.", ctas: [], ok: false };
}

/* ── the one function /api/chat.js calls ── */
async function handleChat(input) {
  const message = input.message, history = input.history, ip = input.ip;

  if (!CFG.apiKeys || !CFG.apiKeys.length) return { reply: FALLBACK_MESSAGE, ctas: [], ok: false };
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
    // Last 6 turns only, trimmed short. This is the main token cost lever:
    // a full 500-token reply can run ~2000 chars, and 10 of those every
    // single request is how a conversation quietly grows past 8k tokens.
    // 6 turns @ 500 chars keeps real short-term memory ("what we just
    // talked about") without re-billing the whole conversation each time.
    (history || []).filter(function (m) { return m.role === "user" || m.role === "assistant"; })
      .slice(-6).map(function (m) { return { role: m.role, content: String(m.content).slice(0, 500) }; }),
    [{ role: "user", content: userMessage }]
  );

  // Free-tier quota guard first: don't even call OpenRouter if we're at the cap.
  const gate = pickKey();
  if (gate.none) return gate.kind === "bad" ? { reply: FALLBACK_MESSAGE, ctas: [], ok: false } : limitReply(gate.kind);

  const tier = pickTier(userMessage, chunks.length, messages);
  const live = await loadLiveFree();
  const started = Date.now();
  let reply;
  try {
    const out = await answerWithChain(messages, buildChain(tier, live));
    reply = out.reply;
    // Server log only (Vercel → Logs). Never sent to the visitor.
    console.log("[chat-ai] tier=" + tier + " model=" + out.model + " key=" + (out.key + 1) + "/" + CFG.apiKeys.length + " ms=" + (Date.now() - started) + " day[" + keysSummary() + "]/" + CFG.dailyLimit);
  } catch (e) {
    if (e.limit === "bad") { console.error("[chat-ai] every API key was rejected — check OPENROUTER_API_KEY in Vercel:", e.message); return { reply: FALLBACK_MESSAGE, ctas: [], ok: false }; }
    if (e.limit) { console.error("[chat-ai] free-tier " + e.limit + " limit on every key:", e.message); return limitReply(e.limit); }
    console.error("[chat-ai] all models failed (tier=" + tier + "):", e.message);
    return { reply: FALLBACK_MESSAGE, ctas: [], ok: false };
  }

  const ctas = [];
  // No button when the visitor is closing the conversation or declining —
  // pushing "Managed plans" under "thanks, I don't need your service" reads
  // as not listening. Let the reply be a clean, polite sign-off.
  const declining = /\b(no thanks|not interested|don'?t need|dont need|no need|nevermind|never mind|bye|goodbye|that'?s all|thats all|i'?m good|im good)\b/i.test(userMessage)
    && userMessage.length < 90;
  // A bare "thanks" ends things; "thanks, how much is pro?" does not.
  const justThanks = !/\?/.test(userMessage) &&
    userMessage.toLowerCase().replace(/\b(thanks|thank you|thx|ok|okay|cool|great|alright|got it)\b/g, "")
      .replace(/[^a-z0-9]/g, "").length === 0;
  const closing = declining || justThanks;
  if (!closing && primary && CTAS[primary.cta]) {
    ctas.push(CTAS[primary.cta]);
    if (primary.cta !== "book" && /\b(book|call|demo|start|buy|sign up|interested)\b/i.test(userMessage)) {
      ctas.push(CTAS.book);
    }
  }

  return { reply: reply, ctas: ctas, ok: true, topics: chunks.map(function (c) { return c.id; }) };
}

module.exports = { handleChat: handleChat, retrieve: retrieve, pickTier: pickTier, resetHealth: function () { DOWN.clear(); LIVE.ids = null; LIVE.at = 0; LIVE.retryAt = 0; POLICY.relaxedUntil = 0; KEYS.length = 0; }, TOPICS: TOPICS, FALLBACK_MESSAGE: FALLBACK_MESSAGE };
