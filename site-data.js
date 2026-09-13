/* ════════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — SITE DATA  v3.0
   SINGLE SOURCE OF TRUTH for products, pricing, offers, links, policy.

   HOW TO EDIT LATER
   -----------------
   • Prices .............. AI_PRODUCTS[x].price  and  .offer
   • Turn offer off ...... OFFER.active = false
   • Badges .............. AI_PRODUCTS[x].badge  ("" = no badge)
   • Demo links .......... AI_PRODUCTS[x].demoUrl  (paste URL when ready)
   • Side ad ............. SIDE_AD (.enabled / .pages / .text / .ctaLabel
   •                        / .url / .idleSeconds)
   • Button labels ....... BUTTONS (.demoLabel / .auditLabel)
   • Email / phone ....... CONTACT
   • Policy wording ...... POLICY   (guarantee, refunds, cancellation,
                                     confirmed business policy)

   Every page and the chatbot read from THIS file. Do not duplicate
   prices or feature lists anywhere else in the codebase.
   ════════════════════════════════════════════════════════════════ */

var SITE_DATA = (function () {

  /* ─────────────────────────────────────────────────────────────
     CONTACT
     ───────────────────────────────────────────────────────────── */
  /* ─────────────────────────────────────────────────────────────
     WHATSAPP MESSAGE PREFIX
     Every WhatsApp button site-wide opens with this same opening
     line, so a visitor always knows why they're chatting. Edit
     WA_PREFIX once and every button below updates. Edit the
     individual messages in WA_MESSAGES.
     ───────────────────────────────────────────────────────────── */
  var WA_PREFIX = "Hey, I came from your website! ";

  var WA_MESSAGES = {
    general:   "I have a question.",
    question:  "I have a question I found on your website.",
    strategy:  "I'd like to book a free strategy call.",
    demo:      "I want to see a live demo.",
    freeTrial: "I want to take the Free Trial Assistant.",
    audit:     "I want the Free DM Lead Audit.",
    aiSetup:   "I've submitted my AI setup form.",
    booked:    "I just booked a strategy call.",
    privacy:   "I have a question about the Privacy Policy.",
    terms:     "I have a question about the Terms & Conditions.",
    faq:       "I have a question that wasn't answered in the FAQ."
  };

  /* Builds a wa.me link with the prefixed message. Pass a key from
     WA_MESSAGES, or your own text as the second argument. */
  function waLink(key, customText) {
    var msg = customText || WA_MESSAGES[key] || WA_MESSAGES.general;
    return "https://wa.me/919477293867?text=" + encodeURIComponent(WA_PREFIX + msg);
  }

  var CONTACT = {
    brand:        "Ayush AI Automation",
    founder:      "Ayush",
    email:        "ayushaiautomation.in@gmail.com",
    phoneDisplay: "+91 94772 93867",
    phoneRaw:     "919477293867",
    whatsapp:     "https://wa.me/919477293867",
    instagram:    "https://instagram.com/ayush.automation",
    linkedin:     "https://www.linkedin.com/in/ayush-ai-automation-333a123a1",
    website:      "https://www.ayushaiautomation.in",
    tagline:      "AI Agents and DM Automation for fitness coaches. " +
                  "Built on the F.I.T. DM Funnel Framework."
  };

  /* ─────────────────────────────────────────────────────────────
     LINKS  — change a destination once, it changes site-wide
     ───────────────────────────────────────────────────────────── */
  var BUTTONS = {
    demoLabel:      "See Demo",         // label on every AI demo button
    demoFallback:   "book.html",        // used when a demoUrl is still empty
    auditLabel:     "Get Audit"
  };

  var LINKS = {
    book:          "book.html",
    pricing:       "pricing.html",
    demo:          "demo.html",
    faq:           "faq.html",
    process:       "process.html",
    services:      "services.html",
    coaches:       "coaches.html",
    about:         "about.html",
    chat:          "chat.html",
    lab:           "lab/index.html",
    privacy:       "privacy.html",
    terms:         "terms.html",

    // Onboarding forms
    aiSetupForm:   "ai-setup.html",           // unified AI onboarding (unlisted)
    managedForms: {
      free:    "FreePlanSetupForm.html",
      starter: "StarterPlanSetupForm.html",
      growth:  "GrowthPlanSetupForm.html",
      combo:   "ComboPlanSetupForm.html"
    },

    guidePdf:      "GUIDE_AYUSHAIAUTOMATION.pdf",

    // Pre-filled WhatsApp intents — all share the WA_PREFIX opening line
    waGeneral:   waLink("general"),
    waStrategy:  waLink("strategy"),
    waQuestion:  waLink("question"),
    waDemo:      waLink("demo"),
    waFreeTrial: waLink("freeTrial"),
    waAudit:     waLink("audit")
  };

  /* ─────────────────────────────────────────────────────────────
     LIMITED-TIME OFFER
     Set active:false to revert the whole site to standard pricing.
     No countdown timer. No invented deadline.
     ───────────────────────────────────────────────────────────── */
  var OFFER = {
    active: true,                     // false = standard pricing everywhere
    badge:  "Limited Offer",          // glowing badge text on pricing cards
    note:   "Limited-time launch pricing on all AI Agent Automation products.",
    short:  "Limited Offer — launch pricing"
  };

  /* ─────────────────────────────────────────────────────────────
     FLOATING SIDE TAG
     Set enabled:false to remove it site-wide.
     ───────────────────────────────────────────────────────────── */
  var SIDE_AD = {
    enabled:     true,                  // false = remove it site-wide
    pages:       ["index.html", ""],    // which pages it may appear on
                                        // ("" covers the domain root)
    text:        "Free DM Lead Audit",  // longer text is supported
    ctaLabel:    "Get Audit",           // underlined link under the text
    url:         "coaches.html?free=resource",
    idleSeconds: 4                      // seconds of no scroll/interaction
                                        // before it slides in
  };

  /* ─────────────────────────────────────────────────────────────
     AI AGENT AUTOMATION — the six products
     Capability lists are written from the verified workflow
     behaviour only. Do not add features here without a workflow
     that supports them.
     ───────────────────────────────────────────────────────────── */
  var AI_PRODUCTS = [
    {
      id: "basic",
      name: "Basic",
      descriptor: "Instagram inbox & FAQ assistant",
      platform: "instagram",              // instagram | whatsapp | both
      aiLevel: 1,                          // 1–5, drives the capability meter
      aiLevelLabel: "Conversational",
      badge: "",
      summary:
        "Answers the questions your Instagram DMs get every day — pricing, " +
        "programs, how coaching works — using your own answers, in your voice.",
      bestFor:
        "Coaches losing hours to repetitive DMs who don't need lead " +
        "qualification yet.",
      price:  { setup: 1999, monthly: 1999 },
      offer:  { setup: 1499, monthly: 1999 },
      demoUrl: "",                         // paste demo URL when ready
      features: [
        "Replies automatically to Instagram DMs, day or night",
        "Answers from your own knowledge base — pricing, programs, policies",
        "Never invents an answer it hasn't been given",
        "Picks up the lead's name naturally in conversation",
        "Remembers the recent conversation so leads don't repeat themselves",
        "Won't repeat information it has already shared",
        "Hands the conversation to you when a lead asks for a real person",
        "Comment → DM included",
        "Every conversation logged for you to review"
      ],
      notIncluded: [
        "Lead qualification",
        "Automated follow-ups",
        "Booking-link delivery",
        "Voice note handling"
      ],
      note:
        "Built to handle enquiries accurately — not to qualify or convert " +
        "leads. If you need qualification and follow-ups, start at Pro."
    },

    {
      id: "pro",
      name: "Pro",
      descriptor: "Instagram lead qualification AI",
      platform: "instagram",
      aiLevel: 3,
      aiLevelLabel: "Qualifying",
      badge: "Most Popular",
      summary:
        "Qualifies every Instagram lead through a conversation you define, " +
        "then sends your booking link only to the people who actually qualify.",
      bestFor:
        "Coaches with steady DM volume who want serious leads separated from " +
        "browsers before they spend time on a call.",
      price:  { setup: 3999, monthly: 2999 },
      offer:  { setup: 3499, monthly: 2499 },
      demoUrl: "",
      guarantee: true,                     // guarantee attaches to Pro only
      features: [
        "Everything in Basic",
        "Qualification questions you choose — goal, timeline, readiness, budget",
        "Asks one question at a time, in your order, never all at once",
        "Once a lead answers, that answer is locked and never asked again",
        "Understands messy, slang and out-of-order answers",
        "Asks permission once before starting qualification",
        "Sends your booking link once — only after a lead qualifies",
        "Never re-sends the link or pesters a lead who already booked",
        "Multi-step follow-ups for leads who go quiet",
        "Follow-up wording matched to where the conversation stopped",
        "Follow-ups cancel themselves the moment a lead replies or books",
        "Won't schedule a follow-up while a lead is still actively typing",
        "Hands over to you on request, and stops all follow-ups when it does",
        "Comment → DM included",
        "Full lead record: answers, status, conversation history"
      ],
      notIncluded: [
        "Voice note handling",
        "AI-written follow-up messages"
      ],
      note:
        "Follow-up messages at this level are written by you in advance and " +
        "chosen to match the lead's stage."
    },

    {
      id: "business",
      name: "Business",
      descriptor: "Advanced Instagram AI agent",
      platform: "instagram",
      aiLevel: 4,
      aiLevelLabel: "Contextual",
      badge: "Recommended",
      summary:
        "Everything Pro does, plus voice notes, follow-ups written fresh for " +
        "each lead, and layered reliability so conversations don't stall.",
      bestFor:
        "Higher-volume or higher-ticket coaches whose audience sends voice " +
        "notes and who want nurturing that reads as personal.",
      price:  { setup: 5499, monthly: 4499 },
      offer:  { setup: 4499, monthly: 3999 },
      demoUrl: "",
      features: [
        "Everything in Pro",
        "Voice notes understood and answered like typed messages",
        "Follow-ups written fresh for each lead, referencing their actual conversation",
        "Layered reliability — if one AI service is down, the conversation continues",
        "Answers checked and cleaned up before they reach your lead record",
        "Handles three rapid-fire messages as one thought, with one clear reply",
        "Flat lead view you can sort, filter and export",
        "Conversation rules adjustable without rebuilding the system",
        "Comment \u2192 DM included"
      ],
      notIncluded: [],
      note:
        "Voice note handling is a higher-tier capability — it is not included " +
        "in Basic, Pro, WhatsApp Personal Assistant or Fusion."
    },

    {
      id: "wapa",
      name: "WhatsApp Personal Assistant",
      shortName: "WhatsApp PA",
      descriptor: "WhatsApp AI assistant",
      platform: "whatsapp",
      aiLevel: 3,
      aiLevelLabel: "Qualifying",
      badge: "",
      summary:
        "A qualifying AI assistant on your WhatsApp business number — for " +
        "coaches whose enquiries land on WhatsApp, not Instagram.",
      bestFor:
        "Coaches who sell primarily over WhatsApp, or who want a WhatsApp " +
        "counterpart to an existing Instagram system.",
      price:  { setup: 3999, monthly: 2999 },
      offer:  { setup: 3499, monthly: 2499 },
      demoUrl: "",
      features: [
        "Replies automatically to WhatsApp enquiries",
        "Answers from your own knowledge base — programs, pricing, policies",
        "Qualification questions you choose, asked one at a time",
        "Answers locked once given, never re-asked",
        "Sends your booking link once, only after a lead qualifies",
        "Multi-step follow-ups for leads who go quiet",
        "Follow-ups cancel themselves when a lead replies or books",
        "Combines a lead's multiple short messages into one clear reply",
        "Layered reliability so conversations don't stall",
        "Hands over to you on request",
        "Full lead record with every answer captured"
      ],
      notIncluded: [
        "Voice note handling",
        "AI-written follow-up messages",
        "Instagram automation and Comment → DM"
      ],
      note:
        "Requires a dedicated WhatsApp business number. See the WhatsApp " +
        "section of the FAQ before ordering.",
      requiresWhatsAppNumber: true
    },

    {
      id: "fusion",
      name: "Fusion",
      descriptor: "Instagram + WhatsApp AI system",
      platform: "both",
      aiLevel: 3,
      aiLevelLabel: "Qualifying, cross-channel",
      badge: "Best Value",
      composition: "Instagram Pro + WhatsApp Personal Assistant, linked",
      toggleGroup: "fusion",
      summary:
        "Instagram Pro and the WhatsApp assistant working as one system — a " +
        "lead qualified on Instagram carries on WhatsApp without starting over.",
      bestFor:
        "Coaches whose funnel is discover on Instagram, close on WhatsApp.",
      price:  { setup: 6499, monthly: 4999 },
      offer:  { setup: 5999, monthly: 4499 },
      demoUrl: "",
      features: [
        "Everything in Pro, on Instagram",
        "Everything in WhatsApp Personal Assistant, on WhatsApp",
        "One-tap move from Instagram to WhatsApp, built into the conversation",
        "The lead is recognised on WhatsApp automatically",
        "Questions already answered on Instagram are never asked again",
        "Someone who messages WhatsApp directly is qualified normally",
        "Separate follow-up sequences running on each channel",
        "Comment → DM included on Instagram"
      ],
      notIncluded: [
        "Voice note handling",
        "AI-written follow-up messages"
      ],
      note:
        "One connected system, not two separate products.",
      requiresWhatsAppNumber: true
    },

    {
      id: "fusion-max",
      name: "Fusion Max",
      descriptor: "Advanced Instagram + WhatsApp AI system",
      platform: "both",
      aiLevel: 5,
      aiLevelLabel: "Contextual, cross-channel",
      badge: "Advanced",
      composition: "Instagram Business + WhatsApp Personal Assistant, linked",
      toggleGroup: "fusion",
      summary:
        "The full system: Business-level Instagram, WhatsApp, voice notes on " +
        "both channels, and follow-ups written fresh for every lead.",
      bestFor:
        "Established coaches who want the most capable version of the " +
        "cross-channel system.",
      price:  { setup: 6999, monthly: 5999 },
      offer:  { setup: 6499, monthly: 5499 },
      demoUrl: "",
      features: [
        "Everything in Business, on Instagram",
        "Everything in WhatsApp Personal Assistant, on WhatsApp",
        "One-tap move from Instagram to WhatsApp, built into the conversation",
        "The lead is recognised on WhatsApp automatically",
        "Questions already answered on Instagram are never asked again",
        "Voice notes understood on both Instagram and WhatsApp",
        "Follow-ups written fresh for each lead, on both channels",
        "Layered reliability across both channels",
        "Comment → DM included on Instagram"
      ],
      notIncluded: [],
      note:
        "The highest capability level available.",
      requiresWhatsAppNumber: true
    }
  ];

  /* ─────────────────────────────────────────────────────────────
     MANAGED AUTOMATION — preserved, unchanged pricing.
     Secondary to AI Agent Automation in emphasis, but a real,
     active offering. Testimonials on the site belong to THIS
     category, not to the AI products.
     ───────────────────────────────────────────────────────────── */
  var MANAGED_PLANS = [
    {
      id: "free",
      name: "Free Trial Assistant",
      legacyName: "Basic Inbox Assistant (Free Trial Setup)",
      platform: "instagram",
      price: { setup: 0, monthly: 0 },
      formUrl: "FreePlanSetupForm.html",
      trialOnly: true,
      summary:
        "A bare-bones rule-based setup so you can see automation working in " +
        "your own DMs at no cost. It is intentionally basic \u2014 for testing " +
        "the concept, not for production or serious use.",
      features: [
        "Welcome auto-reply",
        "Replies for price, diet and coaching questions",
        "Program details sent automatically",
        "Late-night message response",
        "Handover message when a lead wants you",
        "Stops as soon as you reply manually"
      ],
      notIncluded: [
        "Follow-ups",
        "Lead collection or tagging",
        "Booking system",
        "Lead qualification",
        "Production or serious business use"
      ]
    },
    {
      id: "starter",
      name: "Starter Plan — Organised Lead Inbox",
      platform: "instagram",
      price: { setup: 1999, monthly: 999 },
      formUrl: "StarterPlanSetupForm.html",
      summary:
        "Sorts and tags incoming enquiries so you know who deserves your time " +
        "before you reply.",
      features: [
        "Everything in the Free Trial Assistant",
        "Interested / not interested tagging",
        "Goal tagging — fat loss, muscle gain",
        "Short qualification questions",
        "Context-based replies",
        "Serious lead priority marking",
        "One reminder if a lead goes quiet",
        "Weekly reply improvements"
      ],
      notIncluded: [
        "Booking funnel",
        "Multi-step follow-ups",
        "Comment → DM automation",
        "Re-engagement sequences"
      ]
    },
    {
      id: "growth",
      name: "Growth Plan — Client Conversion System",
      platform: "instagram",
      price: { setup: 2999, monthly: 1499 },
      formUrl: "GrowthPlanSetupForm.html",
      badge: "Popular",
      summary:
        "Filters serious prospects, follows up consistently, and pushes them " +
        "toward booking.",
      features: [
        "Everything in Starter",
        "Lead qualification questions",
        "Serious lead filtering",
        "Booking / apply link sent automatically",
        "Multi follow-up reminders",
        "Lost lead re-engagement",
        "Comment → DM automation",
        "Monthly conversion improvements"
      ],
      notIncluded: []
    },
    {
      id: "wa-managed",
      name: "WhatsApp Lead Qualification System",
      platform: "whatsapp",
      price: { setup: 2499, monthly: 1499 },
      formUrl: "",
      summary:
        "Rule-based WhatsApp qualification that filters enquiries and routes " +
        "only ready prospects to you.",
      features: [
        "Instant welcome reply",
        "Goal-based questions",
        "Budget and readiness check",
        "Hot / warm / cold tagging",
        "Program details sent automatically",
        "Call / apply link delivery",
        "Two follow-up reminders",
        "48-hour re-engagement message",
        "Manual takeover any time"
      ],
      notIncluded: [
        "Instagram automation"
      ]
    },
    {
      id: "combo",
      name: "Client Acquisition Funnel — Combo Plan",
      platform: "both",
      price: { setup: 2999, monthly: 2498 },
      formUrl: "ComboPlanSetupForm.html",
      badge: "Best Value",
      summary:
        "Instagram and WhatsApp rule-based automation combined into one funnel.",
      features: [
        "Everything in Growth",
        "Comment → DM automation",
        "DM → WhatsApp handover flow",
        "Lead warming messages",
        "Call booking funnel",
        "Language selection (English / Hinglish)",
        "Interrupt keywords — price, results, info",
        "Fallback handling for unrecognised messages",
        "Missed lead recovery",
        "Monthly funnel improvement"
      ],
      notIncluded: []
    }
  ];

  /* Managed demos — existing, keep clearly labelled as Managed */
  var MANAGED_DEMOS = [
    { plan: "Starter Plan", url: "https://drive.google.com/file/d/1mlmoIUn3RLfFILSnpg0EOpIsPfE0Clyi/view?usp=drivesdk" },
    { plan: "Growth Plan",  url: "https://drive.google.com/file/d/1bas4jsIWr4uddSe4pq38xBagVPzOIEqv/view?usp=drivesdk" },
    { plan: "Combo Plan",   url: "https://drive.google.com/file/d/10nGsciN9y3BbOoY6JLJzgUAlssjAidYe/view?usp=drivesdk" }
  ];

  /* ─────────────────────────────────────────────────────────────
     TESTIMONIALS — Managed Automation results. Do not relabel
     these as AI Agent results, and do not add invented ones.
     ───────────────────────────────────────────────────────────── */
  /* ─────────────────────────────────────────────────────────────
     LAB RESOURCE LIBRARY
     Shown on lab/index.html. To add a card: copy one block below
     and change the values. To remove a card: delete its block.
     Search and category filtering work automatically off whatever
     is in this list — nothing else needs to change.

     icon must be one of the keys lab/script.js knows how to draw:
     "guide", "trial", "audit", "instagram". Ask before using a new
     icon key, or reuse an existing one.
     ───────────────────────────────────────────────────────────── */
  var LAB_RESOURCES = [
    {
      title: "Free DM Handling Guide",
      description:
        "A short PDF on responding fast, qualifying by hand and following " +
        "up consistently \u2014 for handling leads manually, before you automate.",
      keywords: ["guide", "pdf", "manual", "download", "free", "handling", "dm"],
      buttonText: "Download the Guide",
      buttonURL: "guidePdf",     // special value \u2014 resolved to the PDF at runtime
      category: "Getting Started",
      icon: "guide",
      featured: true
    },
    {
      title: "Free Trial Assistant",
      description:
        "A stripped-down, free Managed Automation setup so you can see " +
        "automation working in your own DMs before paying for anything.",
      keywords: ["free", "trial", "plan", "managed", "test", "zero cost"],
      buttonText: "See the Free Trial",
      buttonURL: "../pricing.html#managed",
      category: "Getting Started",
      icon: "trial",
      featured: true
    },
    {
      title: "Free DM & Profile Audit",
      description:
        "A short, personal review of your Instagram profile and DM approach " +
        "\u2014 bio, highlights and where conversations are leaking.",
      keywords: ["audit", "review", "profile", "bio", "free", "assessment"],
      buttonText: "Get My Free Audit",
      buttonURL: "../coaches.html#free-resources",
      category: "Getting Started",
      icon: "audit",
      featured: true
    },
    {
      title: "Follow on Instagram",
      description:
        "Ongoing posts on DM automation and AI Agents for fitness coaches.",
      keywords: ["instagram", "follow", "social", "updates"],
      buttonText: "Follow on Instagram",
      buttonURL: "instagram",    // special value \u2014 resolved to CONTACT.instagram
      category: "Instagram",
      icon: "instagram",
      featured: false
    }
  ];

  var TESTIMONIALS = [
    {
      quote:
        "Within 7 days of going live, I started getting qualified leads " +
        "directly from DMs. No more wasting time on random chats — only " +
        "serious enquiries and booked calls.",
      author: "Fabby",
      role: "Fitness Coach",
      category: "Managed Automation"
    },
    {
      quote:
        "Ayush built a simple, structured DM automation system that made " +
        "handling leads much easier and more professional. It feels like I " +
        "have a full-time sales team in my DMs.",
      author: "Haider",
      role: "Online Coach",
      category: "Managed Automation"
    }
  ];

  /* ─────────────────────────────────────────────────────────────
     F.I.T. FRAMEWORK — applies to the qualification-capable
     products (Pro and above, and Managed Growth/Combo).
     Basic does not run the full journey.
     ───────────────────────────────────────────────────────────── */
  var FRAMEWORK = {
    name: "F.I.T. DM Funnel Framework",
    appliesTo: ["pro", "business", "wapa", "fusion", "fusion-max"],
    steps: [
      { letter: "F", title: "Filter",
        desc: "Qualification questions you choose separate serious buyers " +
              "from browsers before either of you spends time on a call." },
      { letter: "I", title: "Influence",
        desc: "While qualifying, the conversation answers real objections " +
              "using your own words, your pricing and your programs." },
      { letter: "T", title: "Transfer",
        desc: "Your booking link goes out once, only to leads who qualified — " +
              "so the calls you take are with people already close to buying." }
    ]
  };

  /* ─────────────────────────────────────────────────────────────
     WHAT THE FEES COVER
     ───────────────────────────────────────────────────────────── */
  var FEES = {
    gstNote: "All AI Agent Automation pricing is exclusive of GST.",
    setupCovers: [
      "Configuring the agent around your coaching business",
      "Building your knowledge base — programs, pricing, policies, tone",
      "Setting up your qualification questions and conversion path",
      "Connecting your accounts and testing every path before launch",
      "Launch preparation and handover"
    ],
    monthlyCovers: [
      "AI usage for your conversations",
      "Hosting and server operation",
      "Monitoring and maintenance",
      "Fixes when platforms or services change",
      "Ongoing optimisation of how the agent performs"
    ],
    monthlyNote:
      "AI Agent Automation is a continuously managed service, not a one-off " +
      "build. If the monthly service ends, the managed system stops running, " +
      "because the infrastructure and AI behind it are no longer maintained."
  };

  /* ─────────────────────────────────────────────────────────────
     POLICY
     Confirmed business policy. Every public statement about the
     guarantee, refunds, cancellation, tax, WhatsApp and handoff on
     the site is driven from here — edit once, it changes everywhere.
     ───────────────────────────────────────────────────────────── */
  var POLICY = {
    guarantee: {
      appliesTo: ["pro"],
      managedAppliesTo: ["growth"],
      periodDays: 14,
      headline: "14-Day Performance Guarantee",
      summary:
        "If the agreed qualifying outcome does not happen within the first 14 " +
        "days after your system goes live, and the guarantee conditions are " +
        "met, Ayush reviews the system, adjusts the strategy and AI approach, " +
        "and rebuilds the relevant parts at no extra charge.",
      conditions: [
        "Accounts and access in place",
        "Onboarding information complete",
        "System live and running for the full period",
        "Real incoming enquiries during the period"
      ],
      excludes:
        "This is not a guarantee of revenue, clients or sales. Results depend " +
        "on your traffic, offer and content activity, which sit outside the " +
        "automation."
    },
    refunds: {
      setupFee:
        "The one-time setup fee covers the build itself. Once the build has " +
        "been completed it is non-refundable, because the work has already " +
        "been carried out and delivered.",
      monthly:
        "There is no long-term lock-in. You can cancel after any monthly " +
        "cycle, and the service runs to the end of the cycle you have already " +
        "paid for."
    },
    cancellation: {
      summary:
        "Cancel after any monthly cycle. The service continues until the end " +
        "of the cycle already paid for.",
      whatHappens:
        "When the monthly service ends, the managed AI system stops running, " +
        "because the infrastructure, AI usage and maintenance behind it are no " +
        "longer being provided."
    },
    gst: {
      display: "Prices are shown exclusive of GST.",
      wording:
        "Any applicable taxes are added on top and confirmed with you before " +
        "payment. Payment details are arranged directly on your strategy call."
    },
    whatsappNumber: {
      requiresDedicatedNumber: true,
      wording:
        "The WhatsApp AI products run on a dedicated WhatsApp business number. " +
        "A number connected to the WhatsApp Business Platform is used by the " +
        "system rather than through the normal WhatsApp app, so it should be a " +
        "number you are not relying on for everyday personal chats. Existing " +
        "chat history on another number is not carried over.",
      window:
        "WhatsApp allows businesses to reply freely for 24 hours after a " +
        "person's last message. Outside that window, messaging is limited by " +
        "WhatsApp's own rules, so follow-ups are timed to work within them."
    },
    manychat: {
      usedForManaged: true,
      wording:
        "Managed Automation is built on established automation platforms such " +
        "as ManyChat. It is a capable, widely used tool and the right choice " +
        "for structured, rule-based flows. The platform subscription is paid " +
        "directly to that platform and is separate from the service fee \u2014 " +
        "typically around $25\u2013$30 per month depending on the plan and your " +
        "contact volume. It is confirmed with you before setup."
    },
    humanHandoff: {
      availableOn: ["basic", "pro", "business", "wapa", "fusion", "fusion-max"],
      wording:
        "If a lead asks for a real person, the agent stops replying in that " +
        "conversation and leaves it with you, and cancels any follow-ups it " +
        "had queued for them."
    },
    booking: {
      wording:
        "A qualified lead is sent your booking destination — the link you " +
        "give us during setup.",
      doNotClaim:
        "No live calendar integration. The agent does not read or manage " +
        "your calendar or check real-time availability."
    },
    responseTime: {
      wording: "Replies automatically, usually within seconds.",
      doNotClaim:
        "No hard response-time guarantee. Platform and infrastructure " +
        "conditions affect delivery."
    },
    limitation: {
      full:
        "AI Agents depend on AI models, APIs, Instagram/Meta/WhatsApp systems, " +
        "hosting/infrastructure and other third-party services. Therefore " +
        "occasional bugs, delays, unexpected AI responses, API issues, platform " +
        "changes or temporary interruptions can occur. We make reasonable efforts " +
        "to monitor, maintain, troubleshoot, update and properly support the " +
        "system, and fix issues within our control, but continuous error-free or " +
        "uninterrupted operation cannot be guaranteed.",
      short:
        "AI Agents rely on AI models, APIs, Meta and WhatsApp systems, hosting " +
        "and other third-party services, so occasional issues, delays or platform " +
        "changes can occur. We monitor, maintain and fix what is within our " +
        "control, but uninterrupted, error-free operation cannot be guaranteed."
    },

    reliability: {
      wording:
        "Automated systems can be affected by platform changes, service " +
        "outages, network issues and unexpected input. Issues that fall " +
        "within the managed service are diagnosed and fixed as part of the " +
        "monthly fee.",
      doNotClaim: "No promise of zero bugs or uninterrupted uptime."
    }
  };

  /* ─────────────────────────────────────────────────────────────
     META / ACCESS — generic, non-brittle explanation
     ───────────────────────────────────────────────────────────── */
  var META_ONBOARDING = {
    principles: [
      "You create or use your own Meta business environment.",
      "Your Instagram or WhatsApp business assets are connected to it.",
      "You grant the access needed for the build — nothing more.",
      "You keep ownership and control of your accounts throughout.",
      "You never share your Instagram or WhatsApp password."
    ],
    note:
      "Meta's setup screens change from time to time. You'll be guided " +
      "through the current process directly during onboarding rather than " +
      "following instructions that may be out of date.",

    /* Shown on the AI setup form's success screen, conditionally, based
       on the product purchased. who: "you" | "ayush". Edit freely — this
       is the only place this wording lives. */
    instagramSteps: [
      { who: "you",
        title: "Switch to a professional account",
        desc: "Your Instagram needs to be a Business or Creator account, " +
              "linked to a Facebook Page. I'll walk you through this if " +
              "you're not already set up that way." },
      { who: "ayush",
        title: "Set up the secure connection",
        desc: "I create the Meta Developer App connection your agent uses " +
              "to read and reply to your DMs." },
      { who: "you",
        title: "Assign your Instagram as an asset",
        desc: "Inside your Meta Business settings, you assign your " +
              "Instagram account to that connection — a couple of taps, " +
              "no technical setup on your side." },
      { who: "ayush",
        title: "Generate and save the access token",
        desc: "A secure access token is generated and saved directly by " +
              "me during setup. This is not your password and cannot be " +
              "used to log in as you." },
      { who: "you",
        title: "Grant partner access",
        desc: "You add me as a partner with the access needed on the Meta " +
              "Business asset. You can see and revoke this at any time " +
              "from your own Meta settings." }
    ],
    whatsappSteps: [
      { who: "you",
        title: "Provide the dedicated number",
        desc: "The WhatsApp business number the system will run on — see " +
              "the WhatsApp section of the FAQ if you haven't settled on " +
              "one yet." },
      { who: "you",
        title: "Verify with the OTP",
        desc: "Meta sends a one-time verification code to that number. " +
              "You enter it to confirm ownership — no password involved." },
      { who: "ayush",
        title: "Connect and configure",
        desc: "I connect the verified number to the WhatsApp Business " +
              "Platform and configure it for your account." }
    ]
  };

  /* ─────────────────────────────────────────────────────────────
     TIMELINES — realistic, never guaranteed
     ───────────────────────────────────────────────────────────── */
  var TIMELINES = {
    typical: "Around 48–72 hours for most builds, once access and your " +
             "onboarding details are in.",
    complex: "Fusion and Fusion Max are larger builds and can take around " +
             "72 hours or more depending on access and customisation.",
    disclaimer: "Timelines depend on how quickly access and information " +
                "come through, and are not guaranteed delivery dates."
  };

  /* ─────────────────────────────────────────────────────────────
     HELPERS — used by pricing cards, the chatbot and the forms
     ───────────────────────────────────────────────────────────── */
  function inr(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function getProduct(id) {
    for (var i = 0; i < AI_PRODUCTS.length; i++) {
      if (AI_PRODUCTS[i].id === id) return AI_PRODUCTS[i];
    }
    return null;
  }

  function getManaged(id) {
    for (var i = 0; i < MANAGED_PLANS.length; i++) {
      if (MANAGED_PLANS[i].id === id) return MANAGED_PLANS[i];
    }
    return null;
  }

  /* Returns the prices actually shown, honouring OFFER.active */
  function livePrice(product) {
    var std = product.price;
    var off = product.offer;
    if (!OFFER.active || !off) {
      return {
        setup: std.setup, monthly: std.monthly,
        setupWas: null, monthlyWas: null, discounted: false
      };
    }
    return {
      setup:      off.setup,
      monthly:    off.monthly,
      setupWas:   off.setup   < std.setup   ? std.setup   : null,
      monthlyWas: off.monthly < std.monthly ? std.monthly : null,
      discounted: off.setup < std.setup || off.monthly < std.monthly
    };
  }

  return {
    CONTACT: CONTACT,
    LINKS: LINKS,
    BUTTONS: BUTTONS,
    OFFER: OFFER,
    SIDE_AD: SIDE_AD,
    AI_PRODUCTS: AI_PRODUCTS,
    MANAGED_PLANS: MANAGED_PLANS,
    MANAGED_DEMOS: MANAGED_DEMOS,
    TESTIMONIALS: TESTIMONIALS,
    LAB_RESOURCES: LAB_RESOURCES,
    FRAMEWORK: FRAMEWORK,
    FEES: FEES,
    POLICY: POLICY,
    META_ONBOARDING: META_ONBOARDING,
    TIMELINES: TIMELINES,
    inr: inr,
    getProduct: getProduct,
    getManaged: getManaged,
    livePrice: livePrice,
    waLink: waLink
  };
})();

if (typeof window !== "undefined") { window.SITE_DATA = SITE_DATA; }
