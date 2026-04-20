const AGENCY_DATA = {

  agency: {
    name: "Ayush AI Automation",
    tagline: "AI-Powered DM Automation That Turns Messages Into Booked Calls — On Autopilot",
    website: "https://ayushaiautomation.in",
    founder: "Ayush",
    about: "Ayush AI Automation is a done-for-you Instagram and WhatsApp DM automation agency built exclusively for fitness coaches. Founded by Ayush — who has deep expertise in AI-driven lead systems — the agency's mission is to help fitness professionals convert DM conversations into booked calls without manual effort. The system handles lead capture, qualification, follow-ups, and booking automatically, saving coaches 15–20 hours per week while increasing client conversion rates."
  },

  plans: [
    {
      name: "Free Plan — Inbox Assistant",
      price: "₹0/month",
      price_alt: "₹0 setup fee. Available until 30th June (after which a ₹2,000 one-time setup fee applies).",
      trial: false,
      popular: false,
      best_for: "Coaches who want to test automation and stop repeating the same DM replies every day.",
      features: [
        "Welcome auto-reply",
        "Auto-replies for common questions: price, diet, coaching inquiries",
        "Auto-send program details",
        "Late-night message response",
        "Coach handover message",
        "Stops after manual reply — coach retains full control",
        "No password sharing — connected via official Instagram OAuth"
      ],
      limitations: [
        "No lead follow-ups",
        "No lead collection or tagging",
        "No booking system",
        "No marketing automation",
        "No lead qualification"
      ],
      note: "Built only to handle incoming messages faster — not for generating new clients. ManyChat paid subscription NOT required for Free Plan."
    },
    {
      name: "Starter Plan — Organised Lead Inbox",
      price: "₹999/month",
      price_alt: "₹1,999 one-time setup fee",
      trial: false,
      popular: false,
      best_for: "Coaches getting DMs but spending too much time replying manually and struggling to identify serious leads.",
      features: [
        "Everything in Free Plan",
        "Interested / Not Interested tagging",
        "Goal tagging (fat loss / muscle gain)",
        "Short qualification questions",
        "Context-based replies",
        "Serious lead priority marking",
        "1 follow-up reminder if lead goes silent",
        "Weekly reply improvements"
      ],
      limitations: [
        "No booking funnel",
        "No multi-step follow-ups",
        "No comment-to-DM automation",
        "No re-engagement sequences",
        "No conversion tracking"
      ],
      note: "Designed to organise conversations and sort leads — not to generate new leads. Requires ManyChat paid subscription to run."
    },
    {
      name: "Growth Plan — Client Conversion System",
      price: "₹1,499/month",
      price_alt: "₹2,999 one-time setup fee",
      trial: false,
      popular: true,
      best_for: "Coaches who want DMs to run on full autopilot — qualify leads, follow up automatically, and push serious prospects to booking.",
      features: [
        "Everything in Starter Plan",
        "Full lead qualification question sequence",
        "Serious lead filtering and scoring",
        "Auto-send booking / apply link to qualified leads",
        "Multi-step follow-up reminders",
        "Lost lead re-engagement",
        "Comment-to-DM automation",
        "Story reply funnel",
        "Monthly conversion improvements"
      ],
      limitations: [],
      note: "Built to turn incoming DMs into ready-to-talk prospects. Custom funnel logic built around your coaching process. Requires ManyChat paid subscription."
    },
    {
      name: "WhatsApp Lead Qualification System",
      price: "₹1,499/month",
      price_alt: "₹2,499 one-time setup fee",
      trial: false,
      popular: false,
      best_for: "Coaches who receive WhatsApp enquiries and want to automatically qualify, filter, and route only serious buyers to themselves.",
      features: [
        "Instant welcome reply",
        "Goal-based qualifying questions",
        "Budget and readiness check",
        "Hot / Warm / Cold lead tagging",
        "Auto-send program details",
        "Call / apply link delivery to qualified leads",
        "2 follow-up reminders",
        "48-hour re-engagement message",
        "Manual takeover available at any time"
      ],
      limitations: [
        "WhatsApp only — does not include Instagram automation"
      ],
      note: "Built to stop time-wasting chats and identify serious buyers. Conversation logic customised to your coaching style."
    },
    {
      name: "Client Acquisition Funnel — Combo Plan (Instagram + WhatsApp)",
      price: "₹2,498/month",
      price_alt: "₹2,999 one-time setup fee. Saves more vs buying plans separately.",
      trial: false,
      popular: false,
      best_for: "Coaches ready to build a full automated sales machine — from content viewers to booked calls, across both Instagram and WhatsApp.",
      features: [
        "Everything in Growth Plan",
        "Comment-to-DM automation",
        "Ads-to-DM automation",
        "DM-to-WhatsApp handover flow",
        "Lead warming messages",
        "Transformation proof sequence",
        "Full call booking funnel",
        "Language selection (English / Hinglish)",
        "Interrupt keywords (price / results / info)",
        "Smart fallback for unknown messages",
        "Funnel tracking (DM to booking flow)",
        "Missed lead recovery",
        "Weekly re-engagement broadcast",
        "Monthly funnel improvement"
      ],
      limitations: [],
      note: "Full funnel mapping based on your sales process and offer type. Uses official Meta connection. Requires ManyChat paid subscription."
    }
  ],

  services: [
    {
      name: "Instagram DM Automation",
      short: "Instantly reply, qualify, and push Instagram leads to booking — automatically.",
      description: "Every incoming Instagram DM receives an instant, intelligent reply within seconds. The system engages the lead, asks smart qualifying questions (goal, timeline, readiness), filters serious prospects from time-wasters, and pushes qualified leads toward your booking link — without any manual input.",
      tools: ["ManyChat", "Google Sheets"],
      result: "You only talk to pre-qualified leads who are already interested. Zero time wasted on non-serious conversations."
    },
    {
      name: "WhatsApp Automation",
      short: "Qualify and follow up with leads directly on WhatsApp, 24/7.",
      description: "Automatically handles all WhatsApp enquiries — replies instantly, checks goal and budget readiness, filters genuine interest, tags leads (Hot / Warm / Cold), and keeps conversations moving toward a booking. Only serious buyers reach you.",
      tools: ["ManyChat", "Google Sheets"],
      result: "No repeated manual replies. Only high-intent prospects get your time and attention."
    },
    {
      name: "Comment-to-DM Automation",
      short: "Turn post and reel comments into DM conversations automatically.",
      description: "When someone comments on any of your posts or reels, the system automatically sends them a DM and begins a qualifying conversation. Works for organic content and paid ads alike.",
      tools: ["ManyChat"],
      result: "Your content becomes a 24/7 lead generation engine with zero manual effort."
    },
    {
      name: "Story Reply Automation",
      short: "Capture every story reaction and reply as a potential lead.",
      description: "When someone reacts to or replies to your Instagram story, the bot instantly engages them, qualifies their interest, and moves them toward a booking. Most coaches ignore story interactions — this captures every single one.",
      tools: ["ManyChat"],
      result: "Every story you post works as an active lead capture point around the clock."
    },
    {
      name: "Follow-Up & Re-Engagement System",
      short: "Automatically follow up on silent leads and re-engage cold prospects.",
      description: "The system sends timed reminders at 1 hour, 24 hours, and 3 days when a lead goes silent. It also re-engages old or inactive leads automatically, bringing them back into the funnel before they are permanently lost.",
      tools: ["ManyChat"],
      result: "Eliminates ghosting. Recovers leads that would otherwise be lost revenue."
    },
    {
      name: "Automated Call Booking Funnel",
      short: "Only pre-qualified, serious leads receive your booking link.",
      description: "The funnel qualifies leads step-by-step and only routes serious, ready prospects to your calendar booking link. Every call you take is with someone who has already expressed interest and readiness.",
      tools: ["ManyChat", "Calendly or equivalent booking tool"],
      result: "Every call on your calendar is pre-qualified — no more wasted discovery calls."
    },
    {
      name: "Hot Lead Alert System",
      short: "Get real-time notifications the moment a high-intent prospect enters your funnel.",
      description: "When the system detects a high-intent lead based on their answers, it sends you an instant notification so you can step in personally and close them while their interest is at its peak.",
      tools: ["ManyChat"],
      result: "Never miss a ready buyer. First-response speed is the #1 conversion factor — this ensures you always act at the right moment."
    },
    {
      name: "Lead Qualification System",
      short: "Automatically ask smart questions and tag leads as serious or not ready.",
      description: "The system asks targeted questions — goal, timeline, budget — and automatically tags each lead based on their answers. Serious leads are routed to booking; non-ready leads enter a nurture sequence.",
      tools: ["ManyChat", "Google Sheets"],
      result: "You spend time only with people who are genuinely interested and ready to invest."
    }
  ],

  faqs: [
    {
      keywords: ["safe", "ban", "risk", "account", "guidelines", "manychat", "scam", "legit", "trust"],
      question: "Is DM and WhatsApp automation safe for my accounts?",
      answer: "Yes — 100% safe. The system uses ManyChat, an official Instagram and Meta partner used by over 1 million businesses worldwide. It only replies when someone messages you first — no bulk messaging, no spam, no unsolicited outreach. Zero ban risk. You also never share your password; access is via secure OAuth, the same method any trusted app uses."
    },
    {
      keywords: ["results", "guarantee", "booked calls", "leads", "proof", "14 days", "refund"],
      question: "Do you guarantee results?",
      answer: "Yes. If you have active traffic coming to your profile but receive zero qualified leads within 14 days, we rebuild the entire automation system from scratch at no charge — no questions asked. Results depend on content quality, audience size, and offer strength, but the system is engineered to maximise every conversation."
    },
    {
      keywords: ["how long", "setup time", "days", "hours", "when live", "delivery"],
      question: "How quickly can I go live after signing up?",
      answer: "Instagram automation is live within 24–72 hours. WhatsApp or combo setups take 48–72 hours. You provide account access via secure OAuth, approve the conversation flows we build, and the system launches. No technical work required from your side."
    },
    {
      keywords: ["technical", "coding", "non-technical", "beginner", "easy", "no tech"],
      question: "Do I need technical knowledge to use this?",
      answer: "Zero technical knowledge required. The system is built specifically for fitness coaches, not developers. We handle the entire setup — you simply approve the conversation flows and go live. Even coaches who barely use apps can use this system without any issues."
    },
    {
      keywords: ["manychat", "subscription", "separate fee", "why pay manychat", "extra cost"],
      question: "Why do I need to pay for ManyChat separately?",
      answer: "Our service fee covers building and customising your complete automation system. ManyChat is the underlying software that keeps your automation running 24/7. Think of it like this: we build the shop, ManyChat is the electricity that powers it. Both are required for paid plans. The Free Plan does not require a ManyChat paid subscription."
    },
    {
      keywords: ["cancel", "stop", "discontinue", "exit", "lock-in", "contract", "monthly"],
      question: "Can I stop the service anytime?",
      answer: "Yes. There are no long-term contracts or lock-in periods. Monthly plans simply don't renew if you choose not to continue. One-time setup fees are non-refundable. You stay because the system works — not because you are contractually obligated."
    },
    {
      keywords: ["free plan", "free", "zero cost", "start free", "no payment", "trial"],
      question: "Is the Free Plan really free? What does it include?",
      answer: "Yes — ₹0, no card required. The Free Plan sets up automatic replies for common DMs, sends program details automatically, and handles basic FAQs 24/7. It does not include lead filtering, follow-up sequences, or a booking funnel. It is ideal for testing the system and saving time on repetitive replies before upgrading."
    },
    {
      keywords: ["organic", "ads", "reels", "paid traffic", "both", "content"],
      question: "Does the system work for organic leads or only paid ads?",
      answer: "It works for both. The system captures leads from reel comments, story replies, direct DMs, post comments, and paid ad traffic. Whether your audience finds you organically or through ads, every conversation is handled automatically."
    },
    {
      keywords: ["virtual assistant", "VA", "hire someone", "manual reply", "why not VA"],
      question: "Why should I choose automation over hiring a virtual assistant?",
      answer: "A VA replies manually, can miss messages, and costs ₹8,000–15,000 per month at minimum. Automation replies in under 30 seconds, 24/7, handles unlimited chats simultaneously, never forgets follow-ups, and costs less than one client's coaching fee per month. A VA is one person — automation is a system that never takes a sick day."
    },
    {
      keywords: ["tools", "software", "ManyChat", "Google Sheets", "technology", "backend"],
      question: "Which tools does the system use?",
      answer: "We use ManyChat for automation (official Instagram and Meta partner, used by 1M+ businesses) and Google Sheets for lead tracking and reporting. These are proven, safe, industry-standard tools."
    },
    {
      keywords: ["support", "after setup", "issue", "help", "problem", "contact support"],
      question: "What support is available after setup?",
      answer: "Support is available via WhatsApp (+91 94772 93867) and email (ayushtrades54@gmail.com) at any time. Paid plans also include monthly optimisation sessions to continuously improve conversion rates. Revisions and flow updates are included in all active paid plans at no extra charge."
    },
    {
      keywords: ["revisions", "changes", "edit flows", "update system", "customize", "modify"],
      question: "Can I request changes to the automation after it goes live?",
      answer: "Yes — flow changes, message tone updates, new question sequences, and new triggers are all included in paid plans. Submit a request, we implement it, you approve, and it goes live. No extra charges for reasonable revision requests."
    },
    {
      keywords: ["spam", "bulk message", "unsolicited", "no spam", "cold outreach"],
      question: "Will the system send spam messages to people?",
      answer: "No. The system only ever replies to people who message or interact with you first. There is no bulk messaging, no cold outreach, and no unsolicited messages. Every conversation starts because the other person initiated contact."
    },
    {
      keywords: ["human feel", "robotic", "natural", "bot obvious", "clients notice", "automated"],
      question: "Will my leads know it's an automated bot?",
      answer: "Conversations are designed to feel natural and conversational — not robotic. Responses are personalised based on what each person says. When a lead is genuinely ready to move forward, you step in personally. The standard we build to: our systems have been mistaken for real people."
    },
    {
      keywords: ["what is required", "to start", "prerequisites", "access", "what you need from me"],
      question: "What do you need from me to set up the system?",
      answer: "Just three things: Instagram account access via secure ManyChat OAuth (no password sharing), your approval on the conversation flows we build for you, and payment confirmation. We handle everything else from start to finish."
    },
    {
      keywords: ["demo", "see it", "live demo", "preview", "experience", "try before"],
      question: "Can I see a demo before committing?",
      answer: "Yes. A full live demo is available on WhatsApp before any commitment or payment. You experience the automation exactly as your leads would — the qualifying questions, the conversation flow, the booking process. The demo takes 10–15 minutes with zero sales pressure. Request it at: https://ayushaiautomation.in/demo.html"
    },
    {
      keywords: ["daily manage", "maintenance", "manage daily", "hands free", "run itself"],
      question: "Do I need to manage the automation every day?",
      answer: "No. After setup, the system runs fully automatically — it replies, qualifies, and follows up on its own. Your only job is to respond to the serious, pre-qualified leads the system sends your way. Everything else runs without you."
    },
    {
      keywords: ["Instagram + WhatsApp", "both platforms", "combo", "together", "dual"],
      question: "Can I use Instagram and WhatsApp automation together?",
      answer: "Yes. Many coaches run both platforms together for complete coverage. Instagram captures and qualifies leads through DMs, comments, and stories. WhatsApp then closes and follows up with the most serious prospects. Combined, they form one complete automated sales machine."
    }
  ],

  contact: {
    whatsapp: "+91 94772 93867",
    whatsapp_link: "https://wa.me/919477293867",
    email: "ayushtrades54@gmail.com",
    instagram: null,
    booking: "https://ayushaiautomation.in/book.html",
    demo: "https://ayushaiautomation.in/demo.html",
    cta: "Ready to stop leaving clients in your DMs? Book a free strategy call or request a live demo — and see exactly how many calls you could be booking on autopilot."
  },

  process: [
    {
      step: 1,
      title: "Audit & Strategy",
      desc: "We analyse your Instagram and/or WhatsApp accounts, identify your target audience, and design a fully personalised automation plan based on your coaching style, offer, and goals."
    },
    {
      step: 2,
      title: "Setup & Integration",
      desc: "Our team builds your AI-powered DM bots, configures qualifying question sequences, sets up follow-up automation, and connects everything securely to your account via ManyChat OAuth. No password sharing at any stage."
    },
    {
      step: 3,
      title: "Launch & Monitor",
      desc: "Automation goes live. We monitor performance in real time, optimise engagement sequences, and ensure the system is converting DMs into booked calls at maximum efficiency."
    },
    {
      step: 4,
      title: "Report & Optimise",
      desc: "You receive detailed performance reports. We continuously refine scripts, triggers, and sequences each month to improve conversion rates and keep your system aligned with your evolving coaching offer."
    }
  ],

  objection_handling: [
    {
      objection: "It's too expensive.",
      response: "Start on the Free Plan at ₹0 — no card, no commitment. If your coaching is priced at ₹5,000–15,000 per client, just one extra client per month from automation covers the cost of any paid plan many times over. See results first, then upgrade when it makes sense financially."
    },
    {
      objection: "I don't have time to manage it.",
      response: "You invest 1–2 hours of your time once during setup approval. After that, zero daily maintenance is required. The system replies, qualifies, and follows up automatically — 24/7. You save 15–20 hours per week, not spend more."
    },
    {
      objection: "I'm not sure if it will work for my situation.",
      response: "Don't decide based on words — experience it. Request the free 10-minute live demo. You'll see the exact system running in real time, personalised to how it would work for your coaching. Then make a fully informed decision with zero pressure."
    },
    {
      objection: "What if I already have a VA?",
      response: "A VA replies manually, takes sick days, and can only handle limited conversations simultaneously. Automation replies in under 30 seconds, 24/7, handles unlimited chats, and never misses a follow-up — at a fraction of the cost of a VA."
    }
  ],

  framework: {
    name: "F.I.T. DM Funnel Framework",
    steps: [
      {
        letter: "F",
        title: "Filter",
        desc: "Remove freebie seekers and non-serious leads before they waste your time."
      },
      {
        letter: "I",
        title: "Influence",
        desc: "Build trust and position your coaching offer through smart, personalised conversation."
      },
      {
        letter: "T",
        title: "Transfer",
        desc: "Send only qualified, ready prospects to a booking call or WhatsApp conversation."
      }
    ]
  },

  meta: {
    language_support: ["English", "Hindi", "Hinglish", "Telugu", "Tamil"],
    tools_used: ["ManyChat", "Google Sheets"],
    guarantee: "14-day performance guarantee — if traffic exists but zero leads come in 14 days, the entire system is rebuilt from scratch at no charge.",
    setup_timeline: {
      instagram: "24–72 hours",
      whatsapp_or_combo: "48–72 hours"
    },
    target_audience: [
      "Online fitness coaches",
      "Personal trainers",
      "Gym owners",
      "Transformation coaches",
      "Health and nutrition coaches",
      "Yoga instructors"
    ],
    monthly_optimization_includes: [
      "DM flow improvement",
      "Trigger adjustments",
      "Message copy optimisation",
      "Drop-off point monitoring",
      "System updates",
      "Bug fixing"
    ]
  }

};
