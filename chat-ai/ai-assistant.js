/* ═══════════════════════════════════════════════════════════════
   chat-ai/ai-assistant.js
   Everything the assistant needs to answer one message:
   exact-reply rules → retrieval → OpenRouter call (tiered model
   chain, automatic fail-over) → reply filter → CTA buttons → errors.
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
  lab:      { label: "See free resources",      href: "/lab/index.html" },
  services: { label: "Our services",            href: "/services.html" },
  faq:      { label: "Read the FAQ",            href: "/faq.html" },
  about:    { label: "About Ayush",             href: "/about.html" },
  process:  { label: "Our process",             href: "/process.html" },
  coaches:  { label: "For fitness coaches",     href: "/coaches.html" },
  privacy:  { label: "Privacy Policy",          href: "/privacy.html" },
  terms:    { label: "Terms & Conditions",      href: "/terms.html" },
  comparisons: { label: "See comparisons",      href: "/resources/comparisons.html" },
  learn:    { label: "Learn more",              href: "/resources/learn.html" },
  home:     { label: "Go to the homepage",      href: "/" },
  whatsapp: { label: "Message Ayush on WhatsApp", href: "https://wa.me/919477293867" }
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
    keywords: ["booking", "booking link", "calendar", "book a call", "schedule", "appointment", "availability",
      "slot", "time slot", "meeting", "strategy call", "free call", "book me", "booking form", "booking page"],
    text: "How a visitor books: the free 20-minute strategy call is booked on the website's booking page, using a short form that asks for full name, WhatsApp number, email, Instagram handle, role, which product they're interested in, roughly how many enquiries they get per week, monthly budget range, preferred call time (a few time windows or flexible) and optional notes. Ayush then confirms the call time with them on WhatsApp \u2014 the details are only used to arrange the call. No pitch, no obligation, and the honest recommendation can be a cheaper plan or nothing yet. This chat assistant cannot book, hold or check a time, send forms, links or emails, or take contact details \u2014 the booking form is the only way. For a client's own DM agent (a different thing): on Pro and above the coach's booking link is sent once, only after qualification, never twice; there is NO calendar integration on any product, and on Fusion/Fusion Max a qualified Instagram lead can be moved to WhatsApp to finish booking." },

  { id: "demo", cta: "demo",
    keywords: ["demo", "example", "see it", "show me", "video", "walkthrough", "screenshot"],
    text: "The Demo page shows each AI product handling a real conversation start to finish, plus recorded Managed-plan walkthroughs and real screenshots. A live walkthrough can also be arranged on the free strategy call." },

  { id: "setup", cta: "how",
    keywords: ["setup", "onboarding", "get started", "how long", "timeline", "go live", "requirements"],
    text: "The coach's involvement: a 20-minute call, one onboarding form (separate from the booking form), and a guided pass through Meta's access screens (plus a dedicated WhatsApp number where relevant). Around 48\u201372 hours for most builds; Fusion/Fusion Max around 72 hours or more \u2014 targets, not guaranteed dates. Meta access is a revocable, scoped credential, never a password." },

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
    text: "Ayush AI Automation does not publish build tutorials or setup walkthroughs — designing, building, connecting and running the system IS the paid service, not something handed over as instructions. What the coach actually gets: the agent configured around their business, their knowledge base built out (programs, pricing, policies, tone), qualification questions and the conversion path set up, every account connected and tested before launch, then ongoing monitoring, maintenance and fixes as platforms change. That last part matters — Meta's setup screens and platform behaviour change from time to time, which is exactly the maintenance burden coaches hand over rather than carry themselves. The coach's own involvement is a 20-minute call, one onboarding form (separate from the booking form) and a guided pass through Meta's access screens." },

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
    text: "Anchal Mishra (fat loss/rehab coach) \u2014 a Managed Automation case study moving from Growth to an Instagram+WhatsApp Combo system. Two Managed Automation testimonials (Fabby, Haider). No AI Agent case studies published yet \u2014 none will be invented." },

  /* On-demand website sections. They only load when the visitor asks for
     them (footer, page list, free resources) — never sent with other answers. */
  { id: "footer", cta: "privacy",
    keywords: ["footer", "the footer", "your footer", "website footer", "site footer", "footer links", "bottom of the page", "bottom of the site",
      "bottom of the website", "bottom of your website", "copyright"],
    text: "The website footer shows: the heading 'Ayush AI Automation', the tagline 'AI Agents & DM Automation for Fitness Coaches' and the line 'We design, build and manage Instagram and WhatsApp DM conversation systems for fitness coaches, built on the F.I.T. DM Funnel Framework \u2014 the first DM automation framework designed specifically for fitness coaches.' Link columns: Compare (vs ManyChat, vs Cheap AI Reply Tools, vs Instant DM Tools, vs Rule-Based Automation, vs Human Setter/VA, Managed vs AI Agent, Why AI Automation Fits Your Business); How It Works (AI DM Automation, Lead Qualification, Lead Management, Voice Notes, AI Follow-Ups, Human Handoff, Hot Lead Alerts, Comment \u2192 DM); Channels (Instagram DM Automation, WhatsApp AI Automation, Instagram + WhatsApp); Products (Basic, Pro, Business, WhatsApp Personal Assistant, Fusion, Fusion Max); Learn (F.I.T. Framework, AI Agent vs Managed Automation, Glossary, DM Handling Guide, When Automation Makes Sense); Proof (Case Studies, Client Stories). Contact: email ayushaiautomation.in@gmail.com, phone +91 94772 93867, plus WhatsApp, Instagram (@ayush.automation) and LinkedIn links. Bottom row: Home, Services, Pricing, FAQ, About, Book a Call, Privacy Policy, Terms & Conditions; the line 'The #1 and only agency providing fitness coaches with the F.I.T. Framework.'; and '\u00a9 2026 Ayush AI Automation. All rights reserved.'" },

  { id: "pages", cta: "services", cta2: "faq",
    keywords: ["sitemap", "site map", "website pages", "which pages", "what pages", "pages do you have", "pages on your site",
      "navigation", "menu", "where can i find", "where do i find", "faq", "faqs", "about page", "about us",
      "services page", "process page", "home page", "terms and conditions", "terms conditions", "terms of service", "privacy policy"],
    text: "Pages on the website: Home; Services; Pricing; Demo (conversation demos, recorded walkthroughs, real screenshots); FAQ; About; Process; Coaches (free resources for coaches, including the free DM & Profile Audit request); Book a Call (the free strategy-call form); Lab (free resources); Privacy Policy; Terms & Conditions. Resource pages: Comparisons, How It Works, Channels, Products, Learn (F.I.T. Framework, glossary and more) and Case Studies. A button under the reply opens the most relevant one." },

  { id: "lab", cta: "lab",
    keywords: ["lab", "free resources", "free resource", "resource library", "roi calculator", "calculator", "health score",
      "quiz", "free tools", "free tool", "free stuff", "free download", "free downloads"],
    text: "The Lab page collects Ayush AI Automation's free resources for coaches: the free DM Handling Guide (a downloadable PDF), a resource library, an ROI calculator and a DM health-score quiz. A free DM & Profile Audit (a personal review by Ayush) can be requested via WhatsApp or the Coaches page. All free; the guide needs no signup beyond the download." }
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
    PRICING_CACHE = "Pricing could not be loaded right now \u2014 tell the visitor to use the pricing button below or message Ayush on WhatsApp for current prices.";
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
    return { chunks: fallback, primary: null, best: 0, scores: [] };
  }
  const top = scored.slice(0, 3).filter(function (x, i) { return i === 0 || x.score >= scored[0].score * 0.45; });
  return {
    chunks: top.map(function (x) { return x.topic; }), primary: top[0].topic,
    best: scored[0].score, scores: scored.slice(0, 4).map(function (x) { return { id: x.topic.id, score: x.score }; })
  };
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

/* What the visitor sees when the free-tier quota is used up. Honest, polite,
   and gives them a way forward instead of a dead end. */
const WHATSAPP = CTAS.whatsapp;
function limitReply(kind) {
  if (kind === "day") {
    return { reply: "I've reached my chat limit for today, sorry about that. You can message Ayush directly on WhatsApp and he'll help you from there — or try me again tomorrow.",
      ctas: [WHATSAPP, CTAS.book], ok: false };
  }
  return { reply: "I'm getting a lot of messages right now — please try again in a minute.", ctas: [], ok: false };
}

/* ═══════════════════════════════════════════════════════════════
   EXACT-REPLY RULES
   A few situations are too risky (or too simple) to leave to a small
   model: booking, contact details, broken links, tutorial requests,
   prompt-probing, greetings, thanks. These get a fixed, approved reply
   instantly — no model call, so: no free-tier quota used, nothing the
   visitor typed (email, phone) is ever sent to an AI provider, and the
   model cannot invent a booking, a time or a link. Everything else goes
   through retrieval + the model + the reply filter below.
   ═══════════════════════════════════════════════════════════════ */
const OWN_EMAIL = "ayushaiautomation.in@gmail.com";
const EMAIL_RE = /[a-z0-9._%+\-]+@[a-z0-9\-]+(?:\.[a-z0-9\-]+)+/gi;
const wordCount = function (s) { return String(s).trim().split(/\s+/).filter(Boolean).length; };
const digitCount = function (s) { return (String(s).match(/\d/g) || []).length; };

/* Strip contact details out of text before it can reach a model or a log. */
function redact(text) {
  return String(text)
    .replace(EMAIL_RE, "[email]")
    .replace(OWN_PHONE_RE, "\u0002")
    .replace(/\+?\d[\d\s\-().]{7,}\d/g, function (m) { return looksLikePhone(m) ? "[number]" : m; })
    .replace(/\u0002/g, "+91 94772 93867");
}
const OWN_PHONE_RE = /\+?91[\s\-]*9477[\s\-]*293[\s\-]*867|\b9477[\s\-]*293[\s\-]*867\b|\b94772[\s\-]*93867\b/g;
/* A real phone number: 9–15 digits, and not just three+ short plain groups ("1000 2000 3000"). */
function looksLikePhone(m) {
  const d = digitCount(m);
  return d >= 9 && d <= 15 && !/^\d{1,4}(?:\s\d{1,4}){2,}$/.test(m.trim());
}
function hasContactData(text) {
  const t = String(text).replace(OWN_PHONE_RE, " ").replace(new RegExp(OWN_EMAIL.replace(/[.]/g, "\\."), "gi"), "");
  return /[a-z0-9._%+\-]+@[a-z0-9\-]+(?:\.[a-z0-9\-]+)+/i.test(t) ||
    (String(t).match(/\+?\d[\d\s\-().]{7,}\d/g) || []).some(looksLikePhone);
}

const RULE_TEXT = {
  booking:
    "You can book a free 20-minute strategy call on the booking page. It's one short form: your name, WhatsApp number, email, Instagram handle, what you're interested in, roughly how many enquiries you get and your budget, and your preferred call time. Ayush then confirms the time with you on WhatsApp — no pitch, no obligation.\n\nI can't book or hold a slot from this chat, so the form is the only way.",
  contactData:
    "Thanks — but I can't save contact details, book a time or pass messages on from this chat. To book the free 20-minute call, please enter your details in the booking form (button below); Ayush confirms the time with you on WhatsApp. You can also message him directly.",
  bookingTime:
    "I can't schedule or hold a time from this chat. When you fill in the booking form, pick your preferred call time there — Ayush then confirms the slot with you on WhatsApp.",
  linkBroken:
    "Sorry about that. Please try the button below once more — if it still doesn't work, message Ayush directly on WhatsApp and he'll help you from there.",
  secrets:
    "I can't share that. I'm the assistant for Ayush AI Automation — I can help with plans, pricing, how it works, demos or booking a free call.",
  diy:
    "Building and running this system is the paid service itself, so I don't share build steps, tutorials or tips. Coaches hand it over because platform setup screens change and keeping it running is ongoing work. What does your DM situation look like right now — mostly repeat questions, or a mix?",
  greeting:
    "Hi! I'm the Ayush AI Automation assistant. I can help with plans and pricing, how the DM automation works, demos, or booking a free call. What would you like to know?",
  thanks:
    "You're welcome! If anything else comes up, just ask.",
  ack:
    "Got it. Anything else you'd like to know \u2014 plans, pricing or how it works?"
};

const SECRETS_RE = new RegExp([
  "\\b(?:ignore|disregard|forget|override|bypass)\\b.{0,30}\\b(?:instructions?|prompts?|rules?|above|previous|guidelines)\\b",
  "\\b(?:system|hidden|initial|original|secret) (?:prompt|instructions?|message)\\b",
  "\\b(?:reveal|show|print|repeat|leak|tell me)\\b.{0,25}\\byour (?:system |initial |hidden |secret )?(?:prompt|instructions|rules)\\b",
  "\\b(?:api|secret)[ -]?keys?\\b", "\\bopenrouter\\b", "\\bjailbreak\\b", "\\bdeveloper mode\\b", "\\bdan mode\\b",
  "\\b(?:which|what) (?:ai |llm |language )?model (?:are you|do you|is this|powers|runs)\\b",
  "\\b(?:what|which) (?:llm|language model)\\b", "\\bwho (?:made|built|trained|created) you\\b",
  "\\bare you (?:chatgpt|gpt|claude|gemini|llama|grok|openai|deepseek|qwen|gemma)\\b",
  "\\bpretend (?:you are|you're|to be)\\b", "\\byou are now\\b", "\\brole-?play\\b"
].join("|"), "i");

const BOOK_INTENT_RE = new RegExp([
  "\\b(?:book|schedule|arrange|reserve)\\b.{0,25}\\b(?:call|meeting|slot|appointment|session|demo|time)\\b",
  "\\b(?:i|we)\\s*(?:want|wanna|would like|need|'d like|d like)\\s+to\\s+(?:book|schedule)\\b",
  "\\b(?:can|could|may) (?:i|we) (?:book|schedule|get a call(?!\\s*(?:recording|record|log|transcript|notification|alert))|have a call|get on a call)\\b",
  "\\bhow (?:do|can|to|should) (?:i |we )?(?:book|schedule)\\b",
  "^\\W*(?:please )?(?:book(?: it| now| me| us| a call)?|schedule(?: a call| it)?|let'?s book|lets book|book a call)\\W*$"
].join("|"), "i");
/* "Can the bot book calls for my clients?" is a question about the product (answered from the facts), not a visitor asking to book. */
const ABOUT_PRODUCT_BOOKING_RE = /\b(?:it|the bot|the ai|ai|agent|assistant|system|automation|they|he|she)\s+(?:can |could |will |does |do |also |automatically )*(?:book|schedule)|\b(?:my|their|your) (?:clients?|leads?|customers?|followers?|prospects?)\b|\bautomatically\b|\b(?:the|your|a) (?:\w+ ){0,2}(?:bot|ai|agent)\b.{0,20}\b(?:book|schedule)/i;
const INFO_QUESTION_RE = /\b(what happens|what do|how long|how much|price|pricing|cost|include|included|before|after|cancel|refund|difference|compare)\b/i;
const LINK_BROKEN_RE = /\b(?:link|button|page|form|url)\b.{0,40}\b(?:not working|doesn'?t work|didn'?t work|isn'?t working|won'?t (?:open|load)|broken|error|404|fake|wrong|invalid|dead)\b|\b(?:not working|doesn'?t work|didn'?t work|broken|fake)\b.{0,30}\b(?:link|button|page|form|url)\b/i;
const TIME_RE = /\b(?:\d{1,2}(?::\d{2})?\s?(?:am|pm)|\d{1,2}\s?o'?clock|tomorrow|tonight|today|day after tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|morning|afternoon|evening|noon)\b/i;
const ABOUT_BUSINESS_RE = /\b(dms?|messages?|enquir\w*|leads?|posts?|reels?|clients?|customers?|followers?|reach|comments?|orders?|sales?)\b/i;
const BOOK_WORD_RE = /\b(?:book|booking|booked|schedule|scheduled|slot|appointment|meeting|call|available|availability)\b/i;
const DIY_RE = new RegExp([
  "\\bteach me\\b", "\\btutorials?\\b", "\\bdiy\\b",
  "\\bhow (?:do|can|to|would|could) (?:i |we )?(?:build|make|create|code|program) (?:it|this|one|my|a|an|the|your)\\b",
  "\\b(?:build|make|create|do|set it up|setup) (?:it|this|one|my own|a bot|a chatbot) (?:myself|by myself|on my own)\\b",
  "\\b(?:myself|on my own|by myself)\\b.{0,30}\\b(?:build|make|create|set ?up|automate)\\b",
  "\\bbuild my own\\b",
  "\\b(?:tips|resources|best practices|pointers|tricks)\\b.{0,40}\\b(?:automat|manychat|chatbot|dm flow|flows?|build|set ?up)\\b",
  "\\b(?:automat|manychat|chatbot|dm flow|flows?)\\b.{0,40}\\b(?:tips|resources|best practices|pointers|tricks)\\b",
  "\\bwithout (?:paying|hiring|you)\\b.{0,25}\\b(?:build|set ?up|automate|do)\\b"
].join("|"), "i");
const GREETING_RE = /^\W*(?:hi+|hello+|hey+|hii+|heya|hlo|helo|yo|sup|namaste|hola|good (?:morning|afternoon|evening))(?:\s+(?:there|ayush|bro|sir|team|guys|all))?\W*$/i;

/* "thanks" / "ok" on their own end a chat; "thanks, how much is pro?" does not. */
function isJustThanks(m) {
  return !/\?/.test(m) && m.toLowerCase().replace(/\b(thanks|thank you|thx|ok|okay|cool|great|alright|got it)\b/g, "").replace(/[^a-z0-9]/g, "").length === 0;
}
function isThanksWord(m) { return /\b(thanks|thank you|thx)\b/i.test(m); }
function isDeclining(m) {
  return /\b(no thanks|not interested|don'?t need|dont need|no need|nevermind|never mind|bye|goodbye|that'?s all|thats all|i'?m good|im good)\b/i.test(m) && m.length < 90;
}

function matchRule(message, history) {
  const m = String(message).trim();
  const hist = (history || []).slice(-2);
  const histText = hist.map(function (h) { return String(h.content || ""); }).join(" ");
  const lastBot = (hist.filter(function (h) { return h.role === "assistant"; }).pop() || {}).content || "";

  if (SECRETS_RE.test(m)) return { name: "secrets", reply: RULE_TEXT.secrets, ctas: [CTAS.products, CTAS.book] };

  if (hasContactData(m)) {
    // Only intercept when the visitor is essentially just handing over details.
    const rest = redact(m).replace(/\[(?:email|number)\]/g, " ")
      .replace(/\b(my|is|are|it|its|it's|the|here|email|e-mail|mail|number|phone|mobile|whatsapp|contact|details|detail|name|id|mine|and|you|can|reach|me|at|on|please|pls|thanks|thank|call|ok|okay|yes|this)\b/gi, " ")
      .replace(/[^a-z0-9\s]/gi, " ");
    if (wordCount(rest) <= 4) return { name: "contact-data", reply: RULE_TEXT.contactData, ctas: [CTAS.book, CTAS.whatsapp] };
  }

  if (LINK_BROKEN_RE.test(m)) return { name: "link-broken", reply: RULE_TEXT.linkBroken, ctas: [CTAS.book, CTAS.whatsapp] };

  // A time/date offered while booking is being discussed: never accept it as booked.
  if (TIME_RE.test(m) && !INFO_QUESTION_RE.test(m) && !/\?\s*$/.test(m) && !ABOUT_BUSINESS_RE.test(m) &&
      (BOOK_WORD_RE.test(m) || (wordCount(m) <= 8 && (/\b(preferred|time|slot|when|schedule|book|booking|which)\b/i.test(lastBot) || /\b(book|schedule|slot|booking)\b/i.test(histText))))) {
    return { name: "booking-time", reply: RULE_TEXT.bookingTime, ctas: [CTAS.book, CTAS.whatsapp] };
  }

  if (BOOK_INTENT_RE.test(m) && !INFO_QUESTION_RE.test(m) && !ABOUT_PRODUCT_BOOKING_RE.test(m)) {
    return { name: "booking", reply: RULE_TEXT.booking, ctas: [CTAS.book, CTAS.whatsapp] };
  }

  if (DIY_RE.test(m) && !/\b(?:free (?:resources?|guide|tools?|downloads?)|lab|calculator|quiz|audit|guide|pdf)\b/i.test(m)) return { name: "diy", reply: RULE_TEXT.diy, ctas: [CTAS.how, CTAS.book] };

  if (GREETING_RE.test(m)) return { name: "greeting", reply: RULE_TEXT.greeting, ctas: [CTAS.products, CTAS.book] };

  if (isJustThanks(m)) {
    return isThanksWord(m) ? { name: "thanks", reply: RULE_TEXT.thanks, ctas: [] }
                           : { name: "ack", reply: RULE_TEXT.ack, ctas: [CTAS.products] };   // a bare "ok" mid-chat is not a goodbye
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   REPLY FILTER — runs on every model reply before the visitor sees it.
   Removes anything the assistant has no way to do or know: links and
   domains, promises to book/send/save, requests for contact details or
   times, internal labels, tutorial-style steps. Small models sometimes
   ignore prompt rules; this is the layer that doesn't.
   ═══════════════════════════════════════════════════════════════ */
const ALLOWED_LITERALS = [OWN_EMAIL, "linkedin.com/in/ayush-ai-automation-333a123a1", "@ayush.automation"];
const esc = function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };

const URLISH_RE = new RegExp([
  "https?:\\/\\/\\S+", "\\bwww\\.\\S+",
  "[a-z0-9._%+\\-]+@[a-z0-9\\-]+(?:\\.[a-z0-9\\-]+)+",
  "\\b[a-z0-9\\-]+(?:\\.[a-z0-9\\-]+)*\\.(?:com|in|io|ai|net|org|app|dev|link|ly|me|co)(?:\\/\\S*)?\\b",
  "\\b[\\w\\-]+\\.html?\\b",
  "(?:^|[\\s(])\\/(?:pricing|book|demo|faq|about|services|process|coaches|lab|privacy|terms|resources|chat)[\\w\\-\\/.#]*"
].join("|"), "i");

/* Negation only excuses the "soft" patterns, and only inside the same clause
   ("No calendar invite is sent" is fine; "No worries! I'll book it" is not).
   First-person action promises (I'll / I can / I've / let me / see you / Hinglish) are never excused. */
const NEG_RE = /\b(?:can'?t|cannot|can not|won'?t|will not|unable|not able|don'?t|do not|doesn'?t|isn'?t|aren'?t|never|no|not|without)\b/i;
const HARD_PROMISE = new Set([0, 1, 2, 3, 4, 5, 6, 9, 10]);
const PROMISE_RES = [
  /\bi(?:'ll| will| shall)\s+(?:go ahead and |now |also |just |quickly |gladly |happily )?(?:book|schedule|reserve|hold|block|add|put|send|email|forward|arrange|confirm|save|record|lock|notify|inform|ping|text|message|call|contact|connect|pass|share your|set (?:it|that|this|up)|get (?:you|that|this|it|ayush)|note|make a note|take)\b/i,
  /\bi(?:'ll| will| can)\s+confirm\s+(?:the |your |a )?(?:time|slot|call|booking|appointment|meeting|date)\b/i,
  /\b(?:book|schedule|confirm|send|bhej|save|note|arrange)\s+(?:kar\s+)?(?:dunga|dungi|denge|deta\s?hu|deti\s?hu|diya|kar\s?diya|kar\s?liya|lunga|lungi)\b/i,
  /\bi(?:'m| am) going to\s+(?:book|schedule|reserve|hold|send|email|forward|arrange|confirm|save|notify|contact|connect|pass)\b/i,
  /\blet me\s+(?:go ahead and |just |quickly )?(?:book|schedule|reserve|hold|send|email|forward|arrange|confirm|save|notify|contact|connect|pass|check (?:the )?(?:calendar|availability|schedule|slots?))\b/i,
  /\bi can\s+(?:go ahead and |also |easily )?(?:book|schedule|reserve|hold|block|send|email|forward|arrange|save|record|lock|notify|inform|ping|text|message|call|contact|connect you|put you|pass (?:you|your|this|that|it)|check (?:the )?(?:calendar|availability|slots?))\b/i,
  /\bi(?:'ve| have)\s+(?:already |just |now )?(?:booked|scheduled|reserved|noted|saved|recorded|sent|emailed|forwarded|logged|added|passed|confirmed|arranged|got your|received your|taken your|put you)\b/i,
  /\byou(?:'ll| will)\s+(?:shortly |soon |also |then |now )?(?:receive|get|be sent)\s+(?:an? |the |your |a short )?(?:email|e-mail|link|invite|confirmation|message|call|reminder|whatsapp|text|form|notification)\b/i,
  /\b(?:calendar invite|meeting invite|confirmation (?:email|link|message)|google meet|zoom|calendly|cal\.com|calendar\.com)\b/i,
  /\b(?:looking forward to|can'?t wait to)\s+(?:speak|talk|chat|meet|see|hear)/i,
  /\bsee you\b|\btalk (?:to you )?(?:soon|tomorrow)\b|\bspeak (?:to you )?(?:soon|tomorrow)\b/i,
  /\byour\s+(?:call|slot|booking|appointment|meeting|session)\s+(?:is|has been|was|will be)\s+(?:now\s+)?(?:booked|confirmed|scheduled|set|reserved|locked)\b/i,
  /\b(?:please\s+)?(?:share|send|give|provide|drop|tell me|let me know|type|enter)\s+(?:me\s+)?(?:your|ur)\s+(?:email|e-mail|phone|number|contact|whatsapp|availability|preferred (?:time|date|day)|name and)\b/i,
  /\bwhat(?:'s| is)\s+your\s+(?:email|e-mail|phone|number|whatsapp|availability|preferred (?:time|date|day))\b/i,
  /\bwhat (?:time|day|date)s? (?:works?|suits?|is (?:best|good|convenient))\b|\bwhen (?:are|would|will) you (?:be )?(?:free|available)\b/i,
  /\bwhich (?:time|day|date|slot)\b.{0,25}\b(?:prefer|works|suits)\b/i
];
const LEAK_RES = [/\bREFERENCE\b/, /\b(?:in|from|per|according to|based on) (?:the |my )?reference\b/i, /\bsystem prompt\b/i, /\bapproved website information\b/i, /\[(?:company|contact|audience|objections|buying|glossary|assistant-identity|products|pricing|how-it-works|fit|channels|voice|leads-data|follow-ups|booking|demo|setup|managed|diy|vs-chatbot|managed-vs-ai|guide|audit|fees|guarantee|privacy|limits|proof|footer|pages|lab)\]/i];
const TUTORIAL_RE = new RegExp([
  "\\bstep\\s*[1-9]\\b",
  "\\b(?:go to|open|log ?in to|navigate to|click (?:on|the)|install|download|connect to|sign (?:in|up) (?:to|for)) (?:meta|facebook|instagram settings|manychat|zapier|n8n|make\\.com|business suite|developers?|the developer)\\b",
  "(?:^|\\n)\\s*[1-3][.)]\\s+(?:go|open|click|create|connect|install|add|set|select|navigate|log|enable|choose|copy|paste|use|download)\\b"
].join("|"), "i");
/* Tool names alone are not a tutorial (a refusal can say "no Zapier"); two or more together are. */
const TOOL_WORD_RE = /\b(?:webhooks?|api keys?|access tokens?|zapier|n8n|make\.com|json|python|javascript|curl|node\.?js)\b/gi;
function looksLikeTutorial(t) {
  if (TUTORIAL_RE.test(t)) return true;
  const hits = new Set((t.match(TOOL_WORD_RE) || []).map(function (x) { return x.toLowerCase(); }));
  return hits.size >= 2 && !NEG_RE.test(t);
}

function splitSentences(line) {
  return line.split(/(?<=[.!?])\s+(?=[A-Z₹"'(])/);
}

/* Returns { text, changed, tutorial } — never throws. */
function sanitizeReply(input) {
  let t = String(input == null ? "" : input);
  const original = t;
  t = t.replace(/\r/g, "").replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Markdown links → just the label. Real links come from the buttons only.
  t = t.replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1");

  // Protect Ayush's own listed contact details so they survive the link strip.
  const keep = [];
  ALLOWED_LITERALS.forEach(function (lit) {
    t = t.replace(new RegExp("(?:https?:\\/\\/)?(?:www\\.)?" + esc(lit), "gi"), function (m) { keep.push(m.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")); return "\u0001" + (keep.length - 1) + "\u0001"; });
  });

  const dropped = [];
  const lines = t.split("\n").map(function (line) {
    if (!line.trim()) return line;
    const bullet = (line.match(/^\s*(?:[•\-*]|\d+[.)])\s+/) || [""])[0];
    const body = line.slice(bullet.length);
    const kept = splitSentences(body).filter(function (sent) {
      if (URLISH_RE.test(sent)) { dropped.push("link"); return false; }
      if (LEAK_RES.some(function (re) { return re.test(sent); })) { dropped.push("leak"); return false; }
      for (let i = 0; i < PROMISE_RES.length; i++) {
        const mt = PROMISE_RES[i].exec(sent);
        if (!mt) continue;
        const clause = sent.slice(0, mt.index).split(/[,;:\u2014\u2013.!?]/).pop().slice(-45);
        const negated = !HARD_PROMISE.has(i) && NEG_RE.test(clause);
        if (!negated) { dropped.push("promise"); return false; }
      }
      return true;
    });
    return kept.length ? bullet + kept.join(" ") : "";
  });
  t = lines.join("\n");

  t = t.replace(/\u0001(\d+)\u0001/g, function (_, i) { return keep[+i]; });
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/:\s*$/, ".").trim();

  let tutorial = false;
  if (looksLikeTutorial(t)) { tutorial = true; }

  // Keep it short: cut at the last full sentence under the cap.
  const cap = 1800;
  if (t.length > cap) {
    const cut = t.slice(0, cap);
    const at = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("\n"), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
    t = (at > 400 ? cut.slice(0, at + 1) : cut).trim();
  }
  return { text: t, changed: t !== original.trim(), dropped: dropped, tutorial: tutorial };
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS — every normal reply gets 1–2 relevant buttons.
   Order: page the visitor named → the topic's own button → a
   second one only when it clearly belongs. Never on a sign-off.
   ═══════════════════════════════════════════════════════════════ */
const CTA2 = {   // optional second button per topic
  contact: "whatsapp", booking: "whatsapp", buying: "whatsapp", "assistant-identity": "whatsapp",
  footer: "terms", pages: "faq", diy: "book", objections: "book", guarantee: "book", fees: "book"
};
const PAGE_HINTS = [
  [/\bfaqs?\b|frequently asked/i, "faq"],
  [/\bprivacy policy\b/i, "privacy"],
  [/\bterms (?:and|&)? ?conditions?\b|\bterms of (?:service|use)\b|\bt&c\b|\bterms page\b/i, "terms"],
  [/\babout (?:us|page|ayush)\b|\bwho is ayush\b|\bwho runs\b|\bwho'?s the founder\b/i, "about"],
  [/\b(?:services? page|your services|what services)\b/i, "services"],
  [/\b(?:process page|your process|our process)\b/i, "process"],
  [/\bglossary\b|\bterminology\b/i, "learn"],
  [/(?:\bvs\b|\bversus\b|compared? (?:to|with))\s*(?:many ?chat|cheap|instant|rule|human|setter|va\b|chatbot)|\bcomparison page\b/i, "comparisons"],
  [/\b(?:coaches page|for coaches)\b/i, "coaches"],
  [/\b(?:free resources?|resource library|roi calculator|health score|quiz)\b|\blab\b/i, "lab"]
];
const BUY_INTENT_RE = /\b(book|call|demo|start|buy|sign up|interested|get started|ready)\b/i;

function pickCtas(userMessage, primary, sticky) {
  const out = [];
  const add = function (key) { const c = CTAS[key]; if (c && !out.some(function (o) { return o.href === c.href; })) out.push(c); };
  PAGE_HINTS.forEach(function (h) { if (h[0].test(userMessage)) add(h[1]); });
  if (primary) {
    add(primary.cta);
    if (CTA2[primary.id]) add(CTA2[primary.id]);
    else if (primary.cta2) add(primary.cta2);
    else if (primary.cta !== "book" && BUY_INTENT_RE.test(userMessage)) add("book");
  } else if (!out.length) {
    add("products"); add("book");          // nothing matched: still give a useful next step
  }
  return out.slice(0, 2);
}

/* ═══════════════════════════════════════════════════════════════
   TOPIC CHOICE WITH MEMORY
   Retrieval is keyword-based per message, so a short follow-up
   ("ok", "yes please", "what about that?") matches nothing. In that
   case the topic of the visitor's last few messages is reused, so
   the model always has the right reference and never has to guess.
   ═══════════════════════════════════════════════════════════════ */
function isFollowUp(m) {
  const t = String(m).trim();
  return wordCount(t) <= 5 || /^(?:yes|yeah|yep|ok|okay|sure|and|what about|how about|then|so|why|how|tell me more|more|elaborate|explain)\b/i.test(t);
}
function retrieveWithMemory(userMessage, history, recentText) {
  const r = retrieve(userMessage, recentText);
  if ((r.primary && r.best >= 3) || !isFollowUp(userMessage)) return r;
  const users = (history || []).filter(function (h) { return h.role === "user"; }).slice(-3).reverse();
  for (let i = 0; i < users.length; i++) {
    const prev = retrieve(redact(users[i].content), "");
    if (prev.primary) {
      const merged = [prev.primary].concat(r.primary ? r.chunks.filter(function (c) { return c.id !== prev.primary.id; }) : []);
      return { chunks: merged.slice(0, 3), primary: r.primary || prev.primary, best: r.best, scores: r.scores, sticky: true };
    }
  }
  return r;
}

/* Website text for this message only, capped. Drops the weakest topic first. */
function buildReference(chunks) {
  const max = CFG.referenceMaxChars || 3600;
  const parts = chunks.slice();
  const render = function (list) { return list.map(function (c) { return "[" + c.id + "]\n" + textOf(c); }).join("\n\n"); };
  let out = render(parts);
  while (out.length > max && parts.length > 1) { parts.pop(); out = render(parts); }
  if (out.length > max) out = out.slice(0, max);
  return { text: out, used: parts };
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

/* A safe answer used when the filter removes everything the model said. */
function safeFallback(userMessage, primary) {
  if (primary && (primary.id === "booking" || primary.id === "buying") || /\b(book|call|schedule|slot)\b/i.test(userMessage)) {
    return { reply: RULE_TEXT.booking, ctas: [CTAS.book, CTAS.whatsapp] };
  }
  return { reply: "I can only answer from what's on the Ayush AI Automation website. Ask me about plans, pricing, how it works, demos or booking a free call — or message Ayush directly.",
    ctas: [CTAS.products, CTAS.whatsapp] };
}

/* ── the one function /api/chat.js calls ── */
async function handleChat(input) {
  const message = input.message, history = input.history, ip = input.ip;

  if (ip && rateLimited(ip)) {
    return { reply: "You're sending messages quite fast — give it a few seconds and try again.", ctas: [], ok: false };
  }

  const userMessage = String(message || "").slice(0, 1000).trim();
  if (!userMessage) return { reply: FALLBACK_MESSAGE, ctas: [], ok: false };

  const hist = (history || []).filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"; })
    .slice(-8).map(function (m) { return { role: m.role, content: m.content.slice(0, 2000) }; });   // bound work per request

  // 1. Exact-reply rules: instant, free, and cannot go wrong.
  const rule = matchRule(userMessage, hist);
  if (rule) {
    console.log("[chat-ai] rule=" + rule.name);
    return { reply: rule.reply, ctas: rule.ctas, ok: true, source: "rule", topics: [rule.name] };
  }

  if (!CFG.apiKeys || !CFG.apiKeys.length) return { reply: FALLBACK_MESSAGE, ctas: [CTAS.whatsapp], ok: false };

  // 2. Topic choice (with memory of the last few messages), capped reference.
  const recentText = hist.filter(function (m) { return m.role === "user"; }).slice(-2).map(function (m) { return redact(m.content); }).join(" ");
  const retrieved = retrieveWithMemory(redact(userMessage), hist, recentText);
  const ref = buildReference(retrieved.chunks);
  const chunks = ref.used, primary = retrieved.primary;

  const hc = CFG.historyChars || { user: 400, assistant: 280 };
  const turns = hist.slice(-(CFG.historyTurns || 4)).map(function (m) {
    return m.role === "assistant"
      ? { role: "assistant", content: sanitizeReply(m.content).text.slice(0, hc.assistant) }   // never re-feed an old fake link/promise
      : { role: "user", content: redact(m.content).slice(0, hc.user) };                         // never re-send an old email/phone
  }).filter(function (m) { return m.content; });

  const messages = [
    { role: "system", content: CFG.systemPrompt },
    { role: "system", content: "REFERENCE (approved website information — the only source of facts):\n\n" + ref.text + (CFG.reminder ? "\n\n" + CFG.reminder : "") }
  ].concat(turns, [{ role: "user", content: redact(userMessage) }]);

  const closing = isDeclining(userMessage);
  const failCtas = function () { return closing ? [] : [primary ? CTAS[primary.cta] : CTAS.products, CTAS.whatsapp].filter(Boolean); };

  // Free-tier quota guard first: don't even call OpenRouter if we're at the cap.
  const gate = pickKey();
  if (gate.none) return gate.kind === "bad" ? { reply: FALLBACK_MESSAGE, ctas: failCtas(), ok: false } : limitReply(gate.kind);

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
    if (e.limit === "bad") { console.error("[chat-ai] every API key was rejected — check OPENROUTER_API_KEY in Vercel:", e.message); return { reply: FALLBACK_MESSAGE, ctas: failCtas(), ok: false }; }
    if (e.limit) { console.error("[chat-ai] free-tier " + e.limit + " limit on every key:", e.message); return limitReply(e.limit); }
    console.error("[chat-ai] all models failed (tier=" + tier + "):", e.message);
    return { reply: FALLBACK_MESSAGE, ctas: failCtas(), ok: false };
  }

  // 3. Reply filter, then buttons.
  const clean = sanitizeReply(reply);
  let finalReply = clean.text, ctas;
  const tutorialAllowed = primary && primary.id === "diy";
  if (clean.tutorial && !tutorialAllowed) {
    console.log("[chat-ai] filter: tutorial-style reply replaced");
    return { reply: RULE_TEXT.diy, ctas: [CTAS.how, CTAS.book], ok: true, source: "filter", topics: chunks.map(function (c) { return c.id; }) };
  }
  if (finalReply.replace(/[^a-z0-9]/gi, "").length < 12) {
    console.log("[chat-ai] filter: reply emptied (" + clean.dropped.join(",") + ") — safe fallback used");
    const f = safeFallback(userMessage, primary);
    return { reply: f.reply, ctas: f.ctas, ok: true, source: "filter", topics: chunks.map(function (c) { return c.id; }) };
  }
  if (clean.dropped.length) console.log("[chat-ai] filter: removed " + clean.dropped.join(","));

  // No button under a sign-off: pushing a plan under "no thanks" reads as not listening.
  ctas = closing ? [] : pickCtas(userMessage, primary, retrieved.sticky);
  return { reply: finalReply, ctas: ctas, ok: true, source: "model", topics: chunks.map(function (c) { return c.id; }) };
}

module.exports = {
  handleChat: handleChat, retrieve: retrieve, pickTier: pickTier, sanitizeReply: sanitizeReply, matchRule: matchRule, redact: redact,
  resetHealth: function () { DOWN.clear(); LIVE.ids = null; LIVE.at = 0; LIVE.retryAt = 0; POLICY.relaxedUntil = 0; KEYS.length = 0; },
  TOPICS: TOPICS, CTAS: CTAS, FALLBACK_MESSAGE: FALLBACK_MESSAGE
};
