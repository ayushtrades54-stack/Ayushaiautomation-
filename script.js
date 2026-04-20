/* ============================================================
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v3.0
   Pure client-side NLP engine. No external APIs.
   Exports: window.CHATBOT  (consumed by chat.html inline script)
   ============================================================ */

(function (global) {
  "use strict";

  /* ──────────────────────────────────────────────────────────
     0.  AGENCY DATA  (single source of truth)
  ────────────────────────────────────────────────────────── */
  const D = global.AGENCY_DATA || {};

  /* ──────────────────────────────────────────────────────────
     1.  TEXT UTILITIES
  ────────────────────────────────────────────────────────── */
  const TU = {
    clean(str) {
      return String(str)
        .toLowerCase()
        .replace(/[^\w\s₹@.+]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    },

    tokenize(str) {
      return TU.clean(str).split(/\s+/).filter(Boolean);
    },

    ngrams(tokens, n) {
      const out = [];
      for (let i = 0; i <= tokens.length - n; i++) {
        out.push(tokens.slice(i, i + n).join(" "));
      }
      return out;
    },

    allGrams(tokens) {
      const set = new Set(tokens);
      TU.ngrams(tokens, 2).forEach(g => set.add(g));
      TU.ngrams(tokens, 3).forEach(g => set.add(g));
      return set;
    },

    overlap(setA, arrB) {
      let count = 0;
      arrB.forEach(b => { if (setA.has(b)) count++; });
      return count;
    },

    pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    titleCase(s) {
      return s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
    }
  };

  /* ──────────────────────────────────────────────────────────
     2.  HINGLISH / SYNONYM NORMALISER
         Translates common Hinglish & Indian-English slang
         into standard English tokens before NLP runs.
  ────────────────────────────────────────────────────────── */
  const HINGLISH_MAP = {
    // Greetings
    "bhai": "hey", "yaar": "hey", "bro": "hey", "dost": "hey",
    "namaste": "hello", "namaskar": "hello", "salam": "hello",
    "kya haal": "how are you", "kaise ho": "how are you",

    // Price / money
    "kitna": "how much", "paisa": "price", "paise": "price",
    "rupees": "price", "rupee": "price", "inr": "price",
    "lagega": "cost", "lagenge": "cost", "lagti": "cost",
    "kitna banta": "how much", "kitna padega": "how much cost",
    "mahina": "monthly", "mahine": "monthly",
    "sasta": "cheap", "mehenga": "expensive", "sasta wala": "cheapest",
    "sabse sasta": "cheapest", "sabse acha": "best",

    // Plans
    "kaunsa plan": "which plan", "konsa plan": "which plan",
    "kaun sa": "which", "konsa": "which",
    "starter mein kya": "starter plan features",
    "growth mein kya": "growth plan features",
    "free mein kya": "free plan features",
    "free wala": "free plan", "paid wala": "paid plan",
    "best wala": "best plan",

    // Actions
    "shuru": "start", "karna hai": "want to", "lena hai": "want to buy",
    "kaise shuru": "how to start", "aage": "next",
    "batao": "explain", "samjhao": "explain", "bolo": "tell me",
    "dikhao": "show me", "dekh": "see", "dekhna": "see",

    // Safety / trust
    "safe hai kya": "is it safe", "ban hoga kya": "will account be banned",
    "scam toh nahi": "is it legit", "dhoka": "fraud", "dhokha": "fraud",
    "bharosa": "trust", "sach": "real",

    // Support / cancel
    "band karna": "cancel", "rokna": "stop", "cancel karna": "cancel",
    "support chahiye": "need support",

    // Generic
    "kya hai": "what is", "kya hota": "what is",
    "kaise kaam": "how does it work", "kaise": "how",
    "kab": "when", "kitne din": "how many days",
    "nahi chahiye": "not interested", "theek hai": "ok",
    "acha": "ok", "achha": "ok", "samajh gaya": "understood",

    // Telegu / Tamil shortcuts
    "ela": "how", "enti": "what", "entha": "how much",
    "vanakkam": "hello", "enna": "what", "epdi": "how",
    "ethanai": "how much",
  };

  function normaliseInput(raw) {
    let s = raw.toLowerCase().trim();
    Object.entries(HINGLISH_MAP).forEach(([k, v]) => {
      s = s.replace(new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi"), v);
    });
    return s;
  }

  /* ──────────────────────────────────────────────────────────
     3.  INTENT CATALOGUE
         Each intent has: id, weight, keywords[], phrases[],
         and optional planHint.
  ────────────────────────────────────────────────────────── */
  const INTENTS = [
    /* ── GREETING ── */
    {
      id: "greeting",
      keywords: ["hello", "hi", "hey", "good morning", "good evening",
        "good afternoon", "greetings", "howdy", "start", "help me",
        "anyone there", "are you there", "hlo", "hlw"],
      phrases: ["hi there", "hey there", "good to see you", "i need help",
        "need help", "talk to someone"],
      planHint: null
    },

    /* ── PRICING OVERVIEW ── */
    {
      id: "pricing",
      keywords: ["price", "pricing", "cost", "charges", "fee", "fees", "rate",
        "rates", "payment", "pay", "budget", "subscription", "monthly",
        "investment", "spend", "how much", "affordable", "cheap", "expensive",
        "money", "amount", "total", "rupees", "inr", "rs"],
      phrases: ["how much does it cost", "what is the price", "what are the charges",
        "monthly charge", "total cost", "pricing kya hai", "charge kitna",
        "kitna lagega"],
      planHint: null
    },

    /* ── FREE PLAN ── */
    {
      id: "plan_free",
      keywords: ["free", "zero", "no cost", "without paying", "free version",
        "freemium", "basic plan", "zero investment", "try", "test",
        "no charge", "no payment", "nothing to pay", "free try", "₹0"],
      phrases: ["is it free", "free mein milega", "start free",
        "free plan features", "what does free include", "free plan kya hai"],
      planHint: "free"
    },

    /* ── STARTER PLAN ── */
    {
      id: "plan_starter",
      keywords: ["starter", "999", "rs 999", "basic paid", "entry level",
        "first plan", "cheapest plan", "lowest plan", "beginner plan",
        "pehla paid", "entry plan", "small plan", "nine nine nine"],
      phrases: ["starter plan features", "starter mein kya milega",
        "999 wala plan", "cheapest paid plan", "entry level plan"],
      planHint: "starter"
    },

    /* ── GROWTH PLAN ── */
    {
      id: "plan_growth",
      keywords: ["growth", "1499", "rs 1499", "advanced plan", "premium",
        "best plan", "top plan", "full plan", "complete plan",
        "max plan", "pro plan", "top tier", "most features", "ultimate"],
      phrases: ["growth plan features", "growth mein kya milega",
        "1499 wala plan", "best plan kaunsa", "full automation plan"],
      planHint: "growth"
    },

    /* ── WHATSAPP PLAN ── */
    {
      id: "plan_whatsapp",
      keywords: ["whatsapp plan", "whatsapp automation", "whatsapp setup",
        "wa plan", "wp plan", "2499", "whatsapp system", "whatsapp bot",
        "whatsapp leads", "whatsapp qualification"],
      phrases: ["whatsapp automation price", "whatsapp setup cost",
        "wa automation kya hai", "whatsapp lead system"],
      planHint: "whatsapp"
    },

    /* ── COMBO PLAN ── */
    {
      id: "plan_combo",
      keywords: ["combo", "both platforms", "instagram whatsapp", "combined",
        "full funnel", "2498", "ig and wa", "dual platform",
        "combo plan", "acquisition funnel", "together"],
      phrases: ["combo plan features", "both instagram and whatsapp",
        "combined setup", "dono platform", "full system"],
      planHint: "combo"
    },

    /* ── PLAN COMPARISON ── */
    {
      id: "compare_plans",
      keywords: ["compare", "comparison", "difference", "which plan", "options",
        "packages", "tiers", "better", "suggest", "recommend",
        "which one", "which is best", "what to choose", "right plan"],
      phrases: ["which plan is best", "difference between plans",
        "free vs starter", "starter vs growth", "plans comparison",
        "plan suggest karo", "best plan for me"],
      planHint: null
    },

    /* ── SERVICES / FEATURES ── */
    {
      id: "services",
      keywords: ["service", "services", "feature", "features", "what do you do",
        "what you offer", "what is included", "what you build",
        "instagram dm", "comment to dm", "story reply", "hot lead",
        "follow up", "reengagement", "re-engagement", "qualification",
        "booking funnel", "lead capture"],
      phrases: ["what services do you offer", "features kya hain",
        "what does it include", "all features", "complete system",
        "what is comment to dm", "what is story automation"],
      planHint: null
    },

    /* ── HOW IT WORKS / PROCESS ── */
    {
      id: "process",
      keywords: ["how", "works", "process", "flow", "explain", "working",
        "step", "steps", "understand", "mechanism", "procedure",
        "system explain", "inside", "logic", "how does"],
      phrases: ["how it works", "how does it work", "kaise kaam karta",
        "step by step", "process kya hai", "explain the system",
        "how does automation work"],
      planHint: null
    },

    /* ── RESULTS / ROI ── */
    {
      id: "results",
      keywords: ["results", "clients", "booked", "calls", "conversion",
        "outcome", "success", "proof", "testimonials", "reviews",
        "guarantee", "will i get", "does it work", "performance",
        "effective", "roi", "return", "worth it", "leads"],
      phrases: ["will i get clients", "does it really work",
        "what results can i expect", "proof of results",
        "case study", "guarantee kya hai", "real results"],
      planHint: null
    },

    /* ── SAFETY / TRUST ── */
    {
      id: "safety",
      keywords: ["safe", "safety", "scam", "fraud", "fake", "real", "legit",
        "trust", "trustworthy", "legitimate", "genuine", "authentic",
        "secure", "ban", "account ban", "suspend", "risk", "danger",
        "spam", "bulk", "password"],
      phrases: ["is it safe", "account ban hoga", "is this legit",
        "can i trust", "account safe rahega", "will it spam",
        "is it a scam", "no spam", "safe for instagram"],
      planHint: null
    },

    /* ── SETUP / TIMELINE ── */
    {
      id: "setup",
      keywords: ["setup", "time", "days", "hours", "delivery", "when",
        "ready", "start", "live", "deploy", "launch", "install",
        "how long", "fast", "quick", "implementation", "going live"],
      phrases: ["setup time kitna", "how long does setup take",
        "when will it go live", "how fast", "delivery time",
        "setup kab hoga", "kitne din mein ready"],
      planHint: null
    },

    /* ── DEMO ── */
    {
      id: "demo",
      keywords: ["demo", "show", "example", "proof", "live", "sample",
        "preview", "experience", "see", "watch", "try it",
        "see it live", "demonstration", "test it"],
      phrases: ["show me demo", "can i see demo", "demo available hai",
        "see how it works", "live demo dekh sakta hun",
        "want to see a demo", "show me how it works"],
      planHint: null
    },

    /* ── CONTACT / BOOKING ── */
    {
      id: "contact",
      keywords: ["contact", "reach", "talk", "human", "real person",
        "phone", "email", "whatsapp", "directly", "personal",
        "booking", "book", "call", "schedule", "appointment",
        "consultation", "get started", "sign up", "start now",
        "how to start", "begin", "join"],
      phrases: ["how do i contact", "book a call", "get started",
        "how to get started", "book free call", "contact kaise",
        "talk to someone", "whatsapp number", "email address"],
      planHint: null
    },

    /* ── TOOLS / TECH ── */
    {
      id: "tools",
      keywords: ["manychat", "tool", "tools", "software", "technology",
        "platform", "app", "tech stack", "google sheets",
        "what software", "which app", "backend"],
      phrases: ["which tools are used", "what software do you use",
        "manychat kya hai", "technology kya hai", "tech stack"],
      planHint: null
    },

    /* ── OBJECTIONS ── */
    {
      id: "objection_expensive",
      keywords: ["expensive", "costly", "too much", "not affordable",
        "cant afford", "afford nahi", "budget low", "no money",
        "discount", "offer", "negotiate", "cheaper", "reduce price"],
      phrases: ["price bahut mehenga", "cant afford this",
        "too expensive for me", "can you reduce price",
        "discount milega", "budget nahi hai"],
      planHint: null
    },
    {
      id: "objection_time",
      keywords: ["no time", "time waste", "time consuming", "maintenance",
        "manage karna", "busy", "daily manage", "takes too long"],
      phrases: ["bahut time lagega", "dont have time",
        "too much maintenance", "time consuming hai"],
      planHint: null
    },
    {
      id: "objection_va",
      keywords: ["virtual assistant", "va", "hire someone", "manual reply",
        "employee", "staff", "person", "human", "manually"],
      phrases: ["why not hire a va", "va rakhna better hai",
        "manual reply better hai", "why automation not va",
        "vs virtual assistant"],
      planHint: null
    },
    {
      id: "objection_unsure",
      keywords: ["not sure", "unsure", "thinking", "confused", "doubt",
        "maybe", "overthinking", "decide nahi", "pata nahi",
        "should i", "maybe later", "not decided"],
      phrases: ["not sure if i should", "soch raha hun",
        "doubt hai", "let me think", "not confident",
        "not sure it will work"],
      planHint: null
    },

    /* ── CANCELLATION / STOP ── */
    {
      id: "cancel",
      keywords: ["cancel", "stop", "discontinue", "exit", "quit",
        "leave", "not continue", "band karna", "contract",
        "lock in", "commitment", "locked"],
      phrases: ["can i cancel", "how to stop service",
        "no contract right", "can i leave", "cancel subscription",
        "exit plan"],
      planHint: null
    },

    /* ── REVISIONS ── */
    {
      id: "revisions",
      keywords: ["revision", "revisions", "changes", "edit", "modify",
        "update", "customize", "customization", "adjust", "tweak",
        "alter", "flow change", "update flow"],
      phrases: ["can i request changes", "revision milega",
        "can i modify", "edit the flows", "update the system"],
      planHint: null
    },

    /* ── REQUIREMENTS ── */
    {
      id: "requirements",
      keywords: ["requirements", "need from me", "access", "prerequisites",
        "provide", "share", "credentials", "what to give",
        "account access", "password", "login"],
      phrases: ["what do you need from me", "setup ke liye kya chahiye",
        "what access do you need", "what to provide"],
      planHint: null
    },

    /* ── ABOUT / FOUNDER ── */
    {
      id: "about",
      keywords: ["about", "who", "founder", "background", "experience",
        "company", "agency", "ayush", "who is ayush", "about you",
        "who are you", "who built", "who made", "story", "history"],
      phrases: ["about ayush ai automation", "who is behind this",
        "founder kaun hai", "company ke baare mein", "tell me about you"],
      planHint: null
    },

    /* ── THANKS / BYE ── */
    {
      id: "thanks",
      keywords: ["thanks", "thank you", "great", "awesome", "perfect",
        "cool", "nice", "ok", "okay", "fine", "understood", "got it",
        "clear", "appreciate", "badhiya", "shukriya", "helpful",
        "bye", "goodbye", "see you", "later", "done"],
      phrases: ["thanks for that", "that was helpful", "got it thank you",
        "okay understood", "perfect thanks"],
      planHint: null
    }
  ];

  /* ──────────────────────────────────────────────────────────
     4.  FAQ REGISTRY
         Maps FAQ keys (used by the chip UI) to response objects.
  ────────────────────────────────────────────────────────── */
  const FAQ_REGISTRY = {
    faq_dm_setup: {
      text: "DM Automation Setup means we build automatic replies inside your Instagram DMs — so when someone sends you the same questions about pricing, programs, or availability, the system answers for you automatically.\n\nYou don't type the same thing 50 times a day anymore.\n\n→ You only respond to people who are genuinely ready to work with you.",
      link: "https://ayushaiautomation.in/process.html",
      cta: "See Setup Process"
    },
    faq_lead_qualification: {
      text: "Lead Qualification is the system that asks smart questions to understand if someone is serious.\n\nIt asks:\n• What's your fitness goal?\n• When do you want to start?\n• Are you ready to invest in coaching?\n\nBased on their answers, the system automatically tags them:\n🟢 Serious buyer → pushed towards booking\n🔴 Just browsing → put in nurture sequence\n\nResult: Only real, ready buyers reach you.",
      link: "https://ayushaiautomation.in/process.html",
      cta: "See Lead Qualification"
    },
    faq_tagging: {
      text: "The Tagging System automatically labels your leads based on their answers.\n\nExample tags:\n🏷️ Fat Loss, Muscle Gain, Beginner, Advanced\n🏷️ Serious Buyer, Just Browsing, Follow-Up Needed\n\nInstead of reading every conversation, you instantly know who to focus on, what stage they're at, and what to say next.\n\nEverything organised automatically — zero manual sorting.",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View Tagging Feature"
    },
    faq_followup_auto: {
      text: "Follow-up Automation means if someone stops replying, the system sends timed reminders automatically.\n\nSequence:\n• Reminder after 1 hour\n• Another after 24 hours\n• Final nudge after 3 days\n\nThis recovers leads that would have been lost otherwise.\n\n💡 Most coaches lose 40–60% of potential clients simply because there was no follow-up. This system eliminates that entirely.",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View Follow-up Feature"
    },
    faq_comment_dm: {
      text: "Comment-to-DM Automation: when someone comments on your post or reel, they automatically receive a DM from you — and a qualifying conversation begins.\n\nWhy it's powerful:\n• Your content becomes a 24/7 lead generator\n• Captures every interested person without lifting a finger\n• Works for reels, posts, and ads",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View Comment Automation"
    },
    faq_story_reply: {
      text: "Story Reply Automation: when someone reacts or replies to your Instagram story, the system starts a conversation automatically.\n\nInstead of that interaction disappearing, it becomes a lead:\n• Bot engages them\n• Qualifies their interest\n• Moves them towards booking\n\n💡 Most coaches ignore story replies. This captures every single one.",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View Story Feature"
    },
    faq_booking_funnel: {
      text: "The Call Booking Funnel guides interested people step-by-step and sends only ready clients to book a call.\n\nFlow:\n1️⃣ Lead comes in\n2️⃣ System qualifies them\n3️⃣ If serious → booking link sent automatically\n4️⃣ They book directly on your calendar\n5️⃣ You show up to a pre-qualified call\n\nEvery call on your calendar is with someone already interested.",
      link: "https://ayushaiautomation.in/book.html",
      cta: "Book Free Call"
    },
    faq_whatsapp_qualification: {
      text: "WhatsApp Qualification moves serious leads from Instagram to WhatsApp for deeper filtering.\n\nWhy move to WhatsApp?\n• Higher response rates\n• More personal and direct\n• Better for closing high-ticket coaching clients\n\nThe handover is fully automatic — only the most interested people end up in your WhatsApp inbox.",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View WhatsApp Automation"
    },
    faq_reengagement: {
      text: "Re-engagement automatically contacts old or inactive leads who went silent.\n\nInstead of those conversations dying permanently, the system:\n• Sends a fresh, value-driven message\n• Re-ignites their interest\n• Brings them back into the active funnel\n\n💰 Old leads = hidden revenue sitting unused in your DMs right now.",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View Re-engagement"
    },
    faq_hot_lead: {
      text: "Hot Lead Notification means you get alerted instantly when a highly interested prospect appears.\n\nThe system detects their intent based on answers and tags them as HOT LEAD — then pings you immediately.\n\nWhy it matters:\n• First response = the biggest conversion factor\n• Hot leads go cold within hours\n• You never miss a ready buyer again",
      link: "https://ayushaiautomation.in/process.html",
      cta: "See Hot Lead Feature"
    },
    faq_no_daily_manage: {
      text: "No — you don't need to manage the automation daily.\n\nAfter setup, it runs completely automatically:\n• Replies on its own\n• Qualifies leads on its own\n• Sends follow-ups on its own\n\nYour only job: respond to the serious, pre-qualified leads the system sends your way.\n\n💡 You coach clients. The system handles the conversations.",
      link: "https://ayushaiautomation.in/process.html",
      cta: "See Full Process"
    },
    faq_spam: {
      text: "No — the system never sends spam. 🚫\n\nIt only replies to people who message or interact with YOU first.\n\n• No bulk messaging\n• No random outreach\n• No unsolicited messages\n• 100% within platform guidelines\n\nThe system only starts a conversation when someone knocks on your door first. You never reach out — they come to you.",
      link: null,
      cta: null
    },
    faq_technical_knowledge: {
      text: "Zero technical knowledge required. 👍\n\nThis system is built for fitness coaches — not developers.\n\nYou don't need to:\n• Know how to code\n• Understand automation software\n• Manage any technical settings\n\nWe handle the entire setup. You just approve the conversation flows and go live.\n\nEven if you barely use apps — you can use this without any problem.",
      link: null,
      cta: null
    },
    faq_organic_ads: {
      text: "Works for both — organic content AND paid ads. ✅\n\nIt captures leads from:\n• Reel comments\n• Story replies\n• Direct DMs\n• Post comments\n• Anyone who clicks a paid ad and messages you\n\nWhether your audience finds you organically or through ads — every conversation is handled automatically.",
      link: "https://ayushaiautomation.in/services.html",
      cta: "View All Features"
    },
    faq_manychat_subscription: {
      text: "Yes — paid plans require a separate ManyChat subscription.\n\nHere's why they're separate:\n• My fee = building & setting up your entire system\n• ManyChat fee = the software that keeps automation running 24/7\n\nThink of it like this:\n🏗️ I'm the builder who sets up your shop\n💡 ManyChat is the electricity that keeps it running\n\nBoth are needed for paid plans. The Free Plan does NOT require ManyChat paid.",
      link: "https://ayushaiautomation.in/pricing.html",
      cta: "View Pricing"
    },
    faq_support: {
      text: "Yes — support is available via WhatsApp and email anytime.\n\n📱 WhatsApp: +91 94772 93867\n📧 Email: ayushtrades54@gmail.com\n\nPaid plans also include monthly review and optimisation calls — so your system continuously improves.\n\nFlow changes and revisions are included in all active paid plans.",
      link: "https://ayushaiautomation.in/book.html",
      cta: "Book Free Call"
    },
    faq_stop_service: {
      text: "No long-term commitment — cancel anytime after your monthly plan.\n\n• Monthly plans — simply don't renew\n• No contracts, no hidden cancellation fees\n• One-time setup fees are non-refundable\n\nYou stay because it's working — not because you're locked in.",
      link: "https://ayushaiautomation.in/terms.html",
      cta: "Read Terms"
    }
  };

  /* ──────────────────────────────────────────────────────────
     5.  SHORT-TERM MEMORY (Context Store)
  ────────────────────────────────────────────────────────── */
  const MEM = {
    lastIntent: null,
    lastPlan: null,  // "free" | "starter" | "growth" | "whatsapp" | "combo"
    turnCount: 0,
    usedResponses: new Set(),

    set(intent, plan) {
      this.lastIntent = intent;
      if (plan) this.lastPlan = plan;
      this.turnCount++;
    },

    contextualPlan(detectedPlan) {
      return detectedPlan || this.lastPlan || null;
    },

    markUsed(key) { this.usedResponses.add(key); },
    wasUsed(key)  { return this.usedResponses.has(key); }
  };

  /* ──────────────────────────────────────────────────────────
     6.  INTENT SCORER
         Returns an array of { id, score, planHint } sorted desc.
  ────────────────────────────────────────────────────────── */
  function scoreIntents(normInput) {
    const tokens = TU.tokenize(normInput);
    const grams  = TU.allGrams(tokens);

    return INTENTS
      .map(intent => {
        let score = 0;

        // keyword overlap (1 pt each)
        score += TU.overlap(grams, intent.keywords);

        // phrase match (3 pts each — higher weight)
        intent.phrases.forEach(ph => {
          if (normInput.includes(ph)) score += 3;
        });

        return { id: intent.id, score, planHint: intent.planHint };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    }

  /* ──────────────────────────────────────────────────────────
     7.  PLAN RESOLVER
         Resolves a canonical plan key from scored intents
         or context memory.
  ────────────────────────────────────────────────────────── */
  const PLAN_KEY_MAP = {
    free:      0,
    starter:   1,
    growth:    2,
    whatsapp:  3,
    combo:     4
  };

  function resolvePlan(topIntents) {
    for (const i of topIntents) {
      if (i.planHint) return i.planHint;
    }
    return null;
  }

  function getPlanData(key) {
    const idx = PLAN_KEY_MAP[key];
    return (idx !== undefined && D.plans) ? D.plans[idx] : null;
  }

  /* ──────────────────────────────────────────────────────────
     8.  RESPONSE BUILDERS
         Each builder returns { text, link, cta }
  ────────────────────────────────────────────────────────── */

  function R(text, link = null, cta = null) {
    return { text, link, cta };
  }

  /* --- 8a. GREETING --- */
  const GREETING_VARIANTS = [
    "Hey! 👋 Great to have you here.\n\nI'm the AI assistant for Ayush AI Automation. Ask me anything about Instagram & WhatsApp DM automation for fitness coaches — pricing, features, how it works, or how to get started.\n\nWhat's on your mind?",
    "Hi there! 👋 Welcome.\n\nI can answer any questions you have about our DM automation system — whether that's pricing, features, the setup process, or whether it's the right fit for you.\n\nWhat would you like to know?",
    "Hello! 🙌 Glad you're here.\n\nI'm your guide to Ayush AI Automation — a done-for-you Instagram & WhatsApp system built exclusively for fitness coaches.\n\nAsk me about pricing, services, how it works, or how to get started. What's your question?"
  ];

  function buildGreeting() {
    return R(TU.pick(GREETING_VARIANTS), null, null);
  }

  /* --- 8b. PRICING OVERVIEW --- */
  function buildPricingOverview() {
    const plans = D.plans;
    if (!plans) return buildFallback("pricing");

    const lines = [
      "Here's a clear breakdown of all pricing plans:\n",
      `💚 ${plans[0].name}`,
      `   ${plans[0].price} · ${plans[0].price_alt}`,
      `   Best for: ${plans[0].best_for}\n`,
      `🔵 ${plans[1].name}`,
      `   ${plans[1].price} · Setup: ${plans[1].price_alt}`,
      `   Best for: ${plans[1].best_for}\n`,
      `🚀 ${plans[2].name} ⭐ Most Popular`,
      `   ${plans[2].price} · Setup: ${plans[2].price_alt}`,
      `   Best for: ${plans[2].best_for}\n`,
      `💬 ${plans[3].name}`,
      `   ${plans[3].price} · Setup: ${plans[3].price_alt}\n`,
      `⚡ ${plans[4].name}`,
      `   ${plans[4].price} · Setup: ${plans[4].price_alt}\n`,
      "💡 Tip: Most coaches start with the Free Plan, see real results, and then upgrade.",
      "\nNote: Paid plans require a ManyChat subscription to keep automation running 24/7."
    ];

    return R(
      lines.join("\n"),
      "https://ayushaiautomation.in/pricing.html",
      "View Full Pricing"
    );
  }

  /* --- 8c. SPECIFIC PLAN DETAIL --- */
  const PLAN_INTROS = {
    free: ["Here's everything the Free Plan includes — yes, it's genuinely ₹0:", "The Free Plan is a great starting point. Here's exactly what you get:"],
    starter: ["Here's what the Starter Plan gives you:", "The Starter Plan is designed to organise your lead inbox. Here's the breakdown:"],
    growth: ["The Growth Plan is our most popular — and for good reason. Here's what's inside:", "Here's everything inside the Growth Plan:"],
    whatsapp: ["Here's the WhatsApp Lead Qualification System in full:", "The WhatsApp plan is built to stop time-wasting chats. Here's what you get:"],
    combo: ["The Combo Plan is the full sales machine — Instagram + WhatsApp. Here's everything included:", "If you want end-to-end automation, the Combo Plan covers it all:"]
  };

  function buildPlanDetail(key) {
    const plan = getPlanData(key);
    if (!plan) return buildPricingOverview();

    const intro   = TU.pick(PLAN_INTROS[key] || ["Here are the plan details:"]);
    const featList = plan.features.map(f => `• ${f}`).join("\n");
    const limList  = plan.limitations.length
      ? "\n\n❌ Not included:\n" + plan.limitations.map(l => `• ${l}`).join("\n")
      : "";
    const note     = plan.note ? `\n\n💡 ${plan.note}` : "";

    const text = `${intro}\n\n📋 ${plan.name}\n💰 ${plan.price} · Setup: ${plan.price_alt}\n\n✅ Included:\n${featList}${limList}${note}`;

    return R(text, "https://ayushaiautomation.in/pricing.html", "See Full Plan Details");
  }

  /* --- 8d. PLAN COMPARISON --- */
  function buildPlanComparison() {
    return R(
      "3 tiers — here's how to pick yours:\n\n📌 FREE (₹0) — Basic auto-replies, zero cost to start\n   → Just testing automation? Start here.\n\n📌 STARTER (₹999/mo) — Organise and filter your leads\n   → Getting DMs but spending too much time sorting them? This one.\n\n📌 GROWTH (₹1,499/mo) — Full follow-up + booking funnel\n   → Want DMs to run on full autopilot? This is it.\n\n📌 WHATSAPP (₹1,499/mo) — Qualification on WhatsApp\n   → Prefer WhatsApp as your primary platform.\n\n📌 COMBO (₹2,498/mo) — Instagram + WhatsApp combined\n   → Full end-to-end sales machine.\n\n🎯 Simple rule: Start FREE → see results → upgrade when ready.",
      "https://ayushaiautomation.in/pricing.html",
      "Compare All Plans"
    );
  }

  /* --- 8e. SERVICES --- */
  const SERVICE_OPENERS = [
    "Here's the complete system we build for fitness coaches:\n",
    "These are all the services included — end to end:\n",
    "Here's exactly what gets built and how each piece works:\n"
  ];

  function buildServices() {
    const svcs = D.services || [];
    const opener = TU.pick(SERVICE_OPENERS);
    const list = svcs.map(s => `⚡ ${s.name}\n   ${s.short}\n   Result: ${s.result}`).join("\n\n");
    return R(
      opener + list + "\n\nEvery piece works together to turn DMs into booked calls — automatically.",
      "https://ayushaiautomation.in/services.html",
      "Explore All Services"
    );
  }

  /* --- 8f. PROCESS --- */
  function buildProcess() {
    const steps = D.process || [];
    const lines = steps.map(s => `${s.step}️⃣ ${s.title}\n   ${s.desc}`).join("\n\n");
    return R(
      "Here's exactly how the setup works, start to finish:\n\n" + lines + "\n\n⏱️ Total time to go live: 24–72 hours.\nYou focus on coaching — we handle everything technical.",
      "https://ayushaiautomation.in/process.html",
      "See Full Process"
    );
  }

  /* --- 8g. HOW IT WORKS (conversational) --- */
  function buildHowItWorks() {
    return R(
      "Here's how the system works step by step:\n\n1️⃣ Someone messages you on Instagram or WhatsApp\n2️⃣ Bot instantly replies — within seconds, 24/7\n3️⃣ Asks smart qualifying questions (goal, timeline, budget)\n4️⃣ Analyses answers — tags them serious or time-waster\n5️⃣ Serious leads get pushed towards booking\n6️⃣ You only talk to ready, qualified people\n\n🎯 Zero random chats wasted — only real conversations reach you.",
      "https://ayushaiautomation.in/process.html",
      "See Full Process"
    );
  }

  /* --- 8h. RESULTS / GUARANTEE --- */
  function buildResults() {
    return R(
      "The system is engineered for maximum conversions. Here's what you can realistically expect:\n\n• Drastically reduced ghosting\n• Only serious leads reach you\n• Consistent call bookings — even while you sleep\n• Hours saved daily on manual DM replies\n\n🛡️ 14-Day Guarantee: If you have traffic but zero qualified leads come in — we rebuild the entire system from scratch, free. No questions asked.\n\nReal result: Within 7 days, coaches start seeing qualified leads directly from DMs.",
      "https://ayushaiautomation.in/demo.html",
      "See Proof & Results"
    );
  }

  /* --- 8i. SAFETY --- */
  function buildSafety() {
    return R(
      "100% safe — here's exactly why you can trust this:\n\n✅ Uses ManyChat — official Instagram and Meta partner\n✅ Used by 1M+ businesses worldwide\n✅ Only replies when someone messages YOU first — no spam, ever\n✅ Fully within Instagram's official guidelines\n✅ Zero ban risk — no aggressive or bulk outreach\n✅ No password sharing — secure OAuth access only\n\nYou see the system live before committing. Zero risk.",
      "https://ayushaiautomation.in/demo.html",
      "See Live Demo"
    );
  }

  /* --- 8j. SETUP TIMELINE --- */
  function buildSetup() {
    return R(
      "Setup is fast — here's the exact timeline:\n\n📱 Instagram Automation: 24–72 hours\n💬 WhatsApp or Full Combo: 48–72 hours\n\nWhat happens during setup:\n1. You connect your account (secure OAuth — no password sharing)\n2. We build and customise your conversation flows\n3. You review and approve\n4. System goes live ✅\n\nOnce live — fully automatic. You don't touch anything.",
      "https://ayushaiautomation.in/process.html",
      "See Setup Process"
    );
  }

  /* --- 8k. DEMO --- */
  function buildDemo() {
    return R(
      "Yes! You can experience the live demo before making any decision. 🎯\n\nWhat the demo shows you:\n• Exactly how the bot replies in real conversations\n• The smart qualifying questions it asks\n• How it filters serious people from time-wasters\n• How it moves leads towards booking\n\nYou experience it as a real client would — not just screenshots.\n\nThe demo takes 10–15 minutes. Zero sales pressure.",
      "https://ayushaiautomation.in/demo.html",
      "Request Live Demo"
    );
  }

  /* --- 8l. CONTACT / GET STARTED --- */
  function buildContact() {
    const c = D.contact || {};
    return R(
      `Ready to move forward? Here's how to reach us:\n\n📱 WhatsApp: ${c.whatsapp || "+91 94772 93867"}\n📧 Email: ${c.email || "ayushtrades54@gmail.com"}\n📅 Book a free strategy call — 15 minutes, no pressure.\n\nThe call covers:\n• Your current DM situation\n• Which plan fits best\n• What results to expect\n• How quickly you can be live\n\n⏱️ From booking to live system: 24–72 hours.`,
      c.booking || "https://ayushaiautomation.in/book.html",
      "Book Free Call"
    );
  }

  /* --- 8m. TOOLS --- */
  function buildTools() {
    return R(
      "We use industry-standard, proven tools:\n\n🔧 ManyChat — the automation engine\n   • Official Instagram & WhatsApp partner\n   • Used by 1M+ businesses worldwide\n   • Reliable, scalable, proven\n\n📊 Google Sheets — lead tracking & reporting\n   • All leads organised in real-time\n   • Easy to review and export\n\n⚠️ Note: Paid plans need a separate ManyChat subscription — it's the software that keeps your automation running 24/7.",
      "https://ayushaiautomation.in/faq.html",
      "Read Full FAQ"
    );
  }

  /* --- 8n. ABOUT --- */
  function buildAbout() {
    const a = D.agency || {};
    return R(
      `${a.name || "Ayush AI Automation"} — DM automation built exclusively for fitness coaches.\n\n🎯 Mission: Turn your Instagram & WhatsApp DMs into a predictable client booking machine — while you focus on actually coaching.\n\nFounded by Ayush — who has deep expertise in AI automation and lead systems — the agency has one focus: help fitness coaches scale without hiring, without manual effort, and without burning out.\n\n${a.about || ""}`,
      "https://ayushaiautomation.in/about.html",
      "Read About Us"
    );
  }

  /* --- 8o. OBJECTIONS --- */
  function buildObjection(type) {
    switch (type) {
      case "objection_expensive":
        return R(
          "I hear you — let me reframe this:\n\nRight now, WITHOUT automation, every day you're losing:\n⏰ 2–4 hours manually replying to DMs\n💸 Clients from slow or missed follow-ups\n😤 Energy on people who were never serious\n\nIf your coaching is ₹5,000–15,000/client:\n→ Just 1 extra client per month from automation = cost recovered 10x over\n\n💡 That's why we have a FREE plan. Start at ₹0, see the results, then upgrade when it financially makes sense.\n\nZero pressure. Zero commitment.",
          "https://ayushaiautomation.in/pricing.html",
          "Start Free First"
        );
      case "objection_time":
        return R(
          "You're losing MORE time without this system — here's the reality:\n\nRight now every day:\n• Same questions answered again and again ♻️\n• Hours spent with non-serious people ⏰\n• Manually tracking who to follow up ❌\n\nWith this system:\n• Your setup time: 1–2 hours (one time only)\n• Daily maintenance: Zero\n• System runs 24/7 without you\n\n💡 One-time time investment = permanent time savings every single day.",
          null, null
        );
      case "objection_va":
        return R(
          "VA vs Automation — honest comparison:\n\n👤 Virtual Assistant:\n• Can miss messages (sick days, off hours, human error)\n• Costs ₹8,000–15,000/month minimum\n• Can't handle 100+ DMs simultaneously\n• Needs training, management, oversight\n\n🤖 Automation:\n• Replies in under 30 seconds — 24/7/365\n• Never forgets a follow-up\n• Handles unlimited chats simultaneously\n• Set up once → works forever\n• Costs less than one client's coaching fee\n\n💡 A VA is one person. Automation is a system. Systems don't take sick days.",
          "https://ayushaiautomation.in/coaches.html",
          "Why Coaches Choose Automation"
        );
      case "objection_unsure":
        return R(
          "Totally understand — big decisions need clarity, not pressure.\n\nHere's what I'd suggest: Don't decide based on words. Experience it.\n\n👉 Take the FREE demo — just 10 minutes:\n• See the actual system running live\n• Experience it exactly as your clients would\n• Then decide with full information\n\nNo commitment. No payment. No pressure.\n\n9 out of 10 coaches who see the demo say the decision becomes obvious once they see it working.",
          "https://ayushaiautomation.in/demo.html",
          "Try Demo First — Free"
        );
      default:
        return buildContact();
    }
  }

  /* --- 8p. CANCEL --- */
  function buildCancel() {
    return R(
      "No long-term lock-in — you can stop anytime:\n\n• Monthly plans — simply don't renew\n• No contracts, no hidden cancellation fees\n• One-time setup fees are non-refundable per our terms\n\nYou stay because the system is working — not because you're stuck.\n\nMost coaches who consider stopping end up staying once they see the monthly reports.",
      "https://ayushaiautomation.in/terms.html",
      "Read Full Terms"
    );
  }

  /* --- 8q. REVISIONS --- */
  function buildRevisions() {
    return R(
      "Yes — revisions and updates are included in all active paid plans. 🔄\n\nWhat you can request:\n• Flow logic changes\n• Message tone and style updates\n• New question sequences\n• New triggers or keywords\n\nProcess: you request → we implement → you approve → goes live.\n\nNo extra charges for reasonable revision requests. Your automation evolves as your business does.",
      "https://ayushaiautomation.in/services.html",
      "View Plan Details"
    );
  }

  /* --- 8r. REQUIREMENTS --- */
  function buildRequirements() {
    return R(
      "Here's all you need to provide to get started:\n\n✅ Instagram account access (via ManyChat OAuth — never your password)\n✅ Your approval on the conversation flows we build\n✅ Payment confirmation\n\nThat's it. We handle everything else.\n\n🔒 Security note: You never share your password. Access is via secure OAuth — same method as any trusted third-party app connecting to Instagram.",
      "https://ayushaiautomation.in/process.html",
      "See Setup Steps"
    );
  }

  /* --- 8s. THANKS / POSITIVE RESPONSE --- */
  const THANKS_VARIANTS = [
    "Glad that helped! 👍\n\nAnything else you'd like to know? I'm here for any questions about automation, pricing, or getting started.",
    "Of course! 😊 Happy to help.\n\nFeel free to ask about any other part of the system — pricing, features, setup, or anything else.",
    "Great! If anything else comes up, just ask. 🚀\n\nWhenever you're ready — a free demo is available anytime."
  ];

  function buildThanks() {
    return R(TU.pick(THANKS_VARIANTS), "https://ayushaiautomation.in/demo.html", "See Demo");
  }

  /* --- 8t. FALLBACK --- */
  function buildFallback(hint) {
    const suggestions = hint
      ? `Are you asking about ${hint}? Try being a bit more specific or choose from below.`
      : "Are you asking about one of these?";

    return R(
      `${suggestions}\n\n💰 Pricing & Plans\n⚙️ How the system works\n📈 Services & Features\n🛡️ Safety & Trust\n🚀 How to get started\n📞 Contact & Booking\n🎥 See a Demo\n\nJust type your question — I'll find the answer!`,
      null, null
    );
  }

  /* ──────────────────────────────────────────────────────────
     9.  CONTEXT-AWARE INTENT RESOLVER
         Merges current intents with memory for follow-up handling.
  ────────────────────────────────────────────────────────── */
  function resolveWithContext(topIntents, normInput) {
    const topId = topIntents[0]?.id;

    // Follow-up: "what about price?" after a plan discussion
    if (
      topId === "pricing" &&
      MEM.lastPlan &&
      (normInput.includes("price") || normInput.includes("cost") || normInput.includes("how much"))
    ) {
      return { intent: "plan_" + MEM.lastPlan, plan: MEM.lastPlan };
    }

    // Follow-up: "what about features?" after plan discussion
    if (
      (topId === "services" || topId === "process") &&
      MEM.lastPlan &&
      (normInput.includes("feature") || normInput.includes("include") || normInput.includes("what"))
    ) {
      return { intent: "plan_" + MEM.lastPlan, plan: MEM.lastPlan };
    }

    // Bare follow-up like "and the starter?" when last was a plan
    if (!topId && MEM.lastIntent && MEM.lastIntent.startsWith("plan_")) {
      return { intent: MEM.lastIntent, plan: MEM.lastPlan };
    }

    const plan = resolvePlan(topIntents);
    return { intent: topId || null, plan };
  }

  /* ──────────────────────────────────────────────────────────
     10.  FAQ INTENT MATCHER
          Scores AGENCY_DATA.faqs against user input.
  ────────────────────────────────────────────────────────── */
  function matchFaq(normInput) {
    if (!D.faqs) return null;
    const tokens = TU.tokenize(normInput);
    const grams  = TU.allGrams(tokens);

    let best = null, bestScore = 0;

    D.faqs.forEach((faq, idx) => {
      const kwScore = TU.overlap(grams, faq.keywords.map(k => k.toLowerCase()));
      if (kwScore > bestScore) {
        bestScore = kwScore;
        best      = { idx, faq, score: kwScore };
      }
    });

    return bestScore >= 2 ? best : null;
  }

  /* ──────────────────────────────────────────────────────────
     11.  MAIN RESPONSE ROUTER
  ────────────────────────────────────────────────────────── */
  function route(intent, plan, normInput) {
    switch (intent) {
      case "greeting":           return buildGreeting();
      case "thanks":             return buildThanks();
      case "pricing":            return plan ? buildPlanDetail(plan) : buildPricingOverview();
      case "plan_free":          return buildPlanDetail("free");
      case "plan_starter":       return buildPlanDetail("starter");
      case "plan_growth":        return buildPlanDetail("growth");
      case "plan_whatsapp":      return buildPlanDetail("whatsapp");
      case "plan_combo":         return buildPlanDetail("combo");
      case "compare_plans":      return buildPlanComparison();
      case "services":           return buildServices();
      case "process":            return buildHowItWorks();
      case "results":            return buildResults();
      case "safety":             return buildSafety();
      case "setup":              return buildSetup();
      case "demo":               return buildDemo();
      case "contact":            return buildContact();
      case "tools":              return buildTools();
      case "about":              return buildAbout();
      case "objection_expensive":return buildObjection("objection_expensive");
      case "objection_time":     return buildObjection("objection_time");
      case "objection_va":       return buildObjection("objection_va");
      case "objection_unsure":   return buildObjection("objection_unsure");
      case "cancel":             return buildCancel();
      case "revisions":          return buildRevisions();
      case "requirements":       return buildRequirements();
      default:                   return null;
    }
  }

  /* ──────────────────────────────────────────────────────────
     12.  MULTI-INTENT BLENDING
          If two strong intents are detected together (e.g.
          "pricing" + "safety"), build a blended response.
  ────────────────────────────────────────────────────────── */
  function blendIntents(topIntents, plan) {
    if (topIntents.length < 2) return null;
    const ids  = topIntents.slice(0, 2).map(i => i.id);

    // pricing + safety
    if (ids.includes("pricing") && ids.includes("safety")) {
      const p = buildPricingOverview();
      const s = buildSafety();
      return R(
        p.text + "\n\n---\n\n🔒 On Safety:\n" + s.text,
        p.link,
        p.cta
      );
    }

    // demo + pricing
    if (ids.includes("demo") && ids.includes("pricing")) {
      const d = buildDemo();
      const pr = plan ? buildPlanDetail(plan) : buildPricingOverview();
      return R(
        d.text + "\n\n---\n\n" + pr.text,
        d.link,
        d.cta
      );
    }

    return null;
  }

  /* ──────────────────────────────────────────────────────────
     13.  CORE PROCESS FUNCTION (exposed as CHATBOT.process)
  ────────────────────────────────────────────────────────── */
  function process(rawInput, mode) {
    if (!rawInput || !rawInput.trim()) {
      return R("I didn't catch that — could you type your question? I'm here to help! 😊", null, null);
    }

    const normInput = normaliseInput(rawInput);
    const topIntents = scoreIntents(normInput);
    const { intent, plan } = resolveWithContext(topIntents, normInput);

    // Update context memory
    MEM.set(intent, plan);

    // 1. Try multi-intent blend if 2+ strong signals
    if (topIntents.length >= 2 &&
        topIntents[0].score >= 3 &&
        topIntents[1].score >= 2) {
      const blended = blendIntents(topIntents, plan);
      if (blended) return blended;
    }

    // 2. Route primary intent
    if (intent) {
      const resp = route(intent, plan, normInput);
      if (resp) return resp;
    }

    // 3. Try FAQ match as fallback
    const faqMatch = matchFaq(normInput);
    if (faqMatch) {
      const faq = faqMatch.faq;
      return R(faq.answer, null, null);
    }

    // 4. Partial keyword salvage — single strong keyword
    if (topIntents.length > 0 && topIntents[0].score >= 1) {
      const salvage = route(topIntents[0].id, plan, normInput);
      if (salvage) return salvage;
    }

    // 5. True fallback
    return buildFallback(null);
  }

  /* ──────────────────────────────────────────────────────────
     14.  FAQ CHIP HELPERS (consumed by chat.html)
  ────────────────────────────────────────────────────────── */
  function getFaq(key) {
    return FAQ_REGISTRY[key] || null;
  }

  function getTopFaqs(n) {
    return Object.keys(FAQ_REGISTRY).slice(0, n || 10);
  }

  /* ──────────────────────────────────────────────────────────
     15.  INIT
  ────────────────────────────────────────────────────────── */
  function init() {
    // Synchronous setup — wrapped in Promise for async compatibility with chat.html
    return Promise.resolve();
  }

  /* ──────────────────────────────────────────────────────────
     16.  PUBLIC API
  ────────────────────────────────────────────────────────── */
  global.CHATBOT = {
    init,
    process,
    getFaq,
    getTopFaqs
  };

})(window);
