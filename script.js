/* ══════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — CHATBOT ENGINE  v11
   Replaces the previous hardcoded engine.

   Design rule: this file contains NO prices, plan names, feature
   lists or policy text. Every fact is read from SITE_DATA
   (site-data.js). Update site-data.js and the bot updates too.

   Language: understands Hinglish input, always replies in English.
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var D = window.SITE_DATA;
  if (!D) { console.error("[chat] site-data.js not loaded"); return; }

  var inr      = D.inr;
  var products = D.AI_PRODUCTS;
  var managed  = D.MANAGED_PLANS;
  var P        = D.POLICY;

  /* ────────────────────────────────────────────────────────────
     ANSWER BUILDERS — all derived from SITE_DATA
     ──────────────────────────────────────────────────────────── */

  function priceLine(prod) {
    var live = D.livePrice(prod);
    var s = "**" + prod.name + "** — " + prod.descriptor + "\n";
    s += "· " + inr(live.monthly) + "/month";
    if (live.monthlyWas) s += " _(normally " + inr(live.monthlyWas) + ")_";
    s += "\n· " + inr(live.setup) + " one-time setup";
    if (live.setupWas) s += " _(normally " + inr(live.setupWas) + ")_";
    s += "\n· Excluding GST";
    return s;
  }

  function allAiPricing() {
    var s = "Here's the full AI Agent Automation pricing:\n\n";
    s += products.map(priceLine).join("\n\n");
    if (D.OFFER.active) s += "\n\n" + D.OFFER.note;
    return s;
  }

  function allManagedPricing() {
    var s = "Managed Automation is the lower-cost, rule-based option:\n\n";
    s += managed.map(function (m) {
      var line = "**" + m.name + "**\n";
      line += m.price.monthly === 0
        ? "· Free — no monthly, no setup fee"
        : "· " + inr(m.price.monthly) + "/month\n· " + inr(m.price.setup) + " one-time setup";
      return line;
    }).join("\n\n");
    s += "\n\n" + P.manychat.wording;
    return s;
  }

  function productDetail(prod) {
    var s = priceLine(prod) + "\n\n" + prod.summary + "\n\n**What's included**\n";
    s += prod.features.map(function (f) { return "· " + f; }).join("\n");
    if (prod.notIncluded && prod.notIncluded.length) {
      s += "\n\n**Not included at this level**\n";
      s += prod.notIncluded.map(function (f) { return "· " + f; }).join("\n");
    }
    if (prod.note) s += "\n\n" + prod.note;
    s += "\n\n**Best for:** " + prod.bestFor;
    return s;
  }

  function compareAll() {
    var s = "Quick way to think about the six AI products:\n\n";
    s += products.map(function (p) {
      return "**" + p.name + "** (" + inr(D.livePrice(p).monthly) + "/mo) — " +
             p.descriptor + ". " + p.bestFor;
    }).join("\n\n");
    s += "\n\nWant the full feature-by-feature detail on any one of them? Just name it.";
    return s;
  }

  function managedVsAi() {
    return "They're genuinely different systems, not tiers of the same thing.\n\n" +
      "**Managed Automation** follows predefined paths — keywords, buttons and rules " +
      "decide what happens next. Given a message it recognises, it responds perfectly " +
      "and consistently every time. Given something unexpected, it falls back to a catch-all.\n\n" +
      "**AI Agent Automation** reads what the person actually wrote and responds from your " +
      "business knowledge. It tracks what's been covered, understands a messy answer, and " +
      "adapts when a conversation doesn't follow a script.\n\n" +
      "Neither is universally better. If most of your enquiries are the same five questions, " +
      "Managed handles them at a fraction of the cost. If your leads write in full sentences " +
      "and ask things you can't fully anticipate, the AI agent handles that far better.";
  }

  function featureAvailability(label, ids) {
    var yes = products.filter(function (p) { return ids.indexOf(p.id) !== -1; });
    var no  = products.filter(function (p) { return ids.indexOf(p.id) === -1; });
    return label + "\n\n**Included on:** " + yes.map(function (p) { return p.name; }).join(", ") +
           "\n**Not included on:** " + no.map(function (p) { return p.name; }).join(", ");
  }

  /* ────────────────────────────────────────────────────────────
     INTENTS
     Hinglish trigger words are included so the bot understands
     them — replies are always in English.
     ──────────────────────────────────────────────────────────── */

  var INTENTS = [
    { id: "greeting",
      k: ["hi","hello","hey","namaste","yo","good morning","good evening","hii","helo"],
      a: function () {
        return "Hi — I'm the assistant for Ayush AI Automation.\n\n" +
          "We build automation for fitness coaches on Instagram and WhatsApp. There are " +
          "two categories: **AI Agent Automation** (six products, conversation-based) and " +
          "**Managed Automation** (rule-based, lower cost, includes a free plan).\n\n" +
          "What would be most useful — pricing, how the products differ, or what the setup involves?";
      }},

    { id: "pricing_all",
      k: ["price","pricing","cost","how much","kitna","kitne","charge","fees","fee","rate","paisa","budget"],
      a: function (t) {
        if (/managed|manychat|free plan|starter|growth|combo/.test(t)) return allManagedPricing();
        return allAiPricing();
      }},

    { id: "compare",
      k: ["compare","difference between","which plan","which product","recommend","suggest","best for me","konsa","kaunsa","which one"],
      a: function () { return compareAll(); }},

    { id: "managed_vs_ai",
      k: ["managed vs","ai vs","difference between managed","manychat","rule based","traditional"],
      a: function () { return managedVsAi(); }},

    { id: "comment_dm",
      k: ["comment to dm","comment dm","comment → dm","keyword comment","auto dm"],
      a: function () {
        return "Comment → DM is **included at no extra cost** with every Instagram-based AI " +
          "product: Basic, Pro, Business, Fusion and Fusion Max. It's never sold as a paid add-on.\n\n" +
          "Someone comments your keyword under a post or reel, they get a public reply that keeps " +
          "the post looking active, plus a DM that opens the conversation privately. From there the " +
          "agent behaves according to your product.\n\n" +
          "The WhatsApp Personal Assistant has no Instagram side, so it doesn't apply there.";
      }},

    { id: "voice",
      k: ["voice","voice note","audio","voice message","bolke"],
      a: function () {
        return featureAvailability(
          "Voice notes are transcribed and answered like typed messages, and count toward " +
          "qualification the same way. It's deliberately a higher-tier capability.",
          ["business","fusion-max"]);
      }},

    { id: "followups",
      k: ["follow up","followup","follow-up","reminder","nurture","chase"],
      a: function () {
        return "Follow-up behaviour differs by product, and I'd rather be precise about it.\n\n" +
          "**Template follow-ups** — Pro, WhatsApp Personal Assistant, Fusion. You write the " +
          "messages in advance; the system picks the one matching where that lead's conversation stopped.\n\n" +
          "**AI-written follow-ups** — Business, Fusion Max. Each message is composed fresh, " +
          "referencing what that specific lead said.\n\n" +
          "**Basic has no follow-ups at all.**\n\n" +
          "On every product that has them, follow-ups cancel themselves the moment a lead replies, " +
          "books, or gets handed to you. On WhatsApp, timing also has to respect the platform's " +
          "24-hour messaging window.";
      }},

    { id: "qualification",
      k: ["qualify","qualification","filter leads","screening","serious leads"],
      a: function () {
        return featureAvailability(
          "Qualification asks the questions you choose — goal, timeline, readiness, budget — " +
          "one at a time, in your order. Once a lead answers, that answer is locked and never " +
          "asked again. Messy and out-of-order replies are understood.",
          ["pro","business","wapa","fusion","fusion-max"]) +
          "\n\nBasic answers enquiries but does not qualify.";
      }},

    { id: "booking",
      k: ["booking","calendar","calendly","book a call","appointment","schedule"],
      a: function () {
        return "Being precise about this, because it's often oversold elsewhere:\n\n" +
          P.booking.wording + "\n\n" +
          "**It does not integrate with your calendar.** It doesn't read it, write to it, or " +
          "check real-time availability. What it does control is who receives the link and when — " +
          "only after a lead qualifies, and only once.\n\n" +
          "Available on Pro, Business, WhatsApp Personal Assistant, Fusion and Fusion Max.";
      }},

    { id: "whatsapp",
      k: ["whatsapp number","dedicated number","wa number","new number","24 hour","24-hour","window"],
      a: function () {
        return P.whatsappNumber.wording + "\n\n" + P.whatsappNumber.window +
          "\n\nThis applies to WhatsApp Personal Assistant, Fusion and Fusion Max. It's the thing " +
          "coaches most often haven't planned for, so it's worth settling before you buy.";
      }},

    { id: "guarantee",
      k: ["guarantee","guaranteed","refund","money back","warranty"],
      a: function () {
        var g = P.guarantee;
        return "**" + g.headline + "** — applies to **Pro** (and the Growth Plan on Managed).\n\n" +
          g.summary + "\n\n**Conditions:** " + g.conditions.join(", ").toLowerCase() + ".\n\n" +
          "**Important:** " + g.excludes + "\n\n" +
          "On refunds: " + P.refunds.setupFee;
      }},

    { id: "cancel",
      k: ["cancel","cancellation","stop","quit","leave","lock in","contract"],
      a: function () {
        return P.cancellation.summary + " " + P.refunds.monthly + "\n\n" +
          P.cancellation.whatHappens + "\n\nYour Instagram and WhatsApp accounts are unaffected " +
          "and remain entirely yours.";
      }},

    { id: "gst",
      k: ["gst","tax","invoice","bill"],
      a: function () { return P.gst.display + " " + P.gst.wording; }},

    { id: "monthly_why",
      k: ["why monthly","monthly fee","recurring","subscription","why setup fee","two fees"],
      a: function () {
        return "They pay for different things.\n\n**The one-time setup fee** covers building your " +
          "system: " + D.FEES.setupCovers.join(", ").toLowerCase() + ".\n\n" +
          "**The monthly fee** covers running it: " + D.FEES.monthlyCovers.join(", ").toLowerCase() +
          ".\n\n" + D.FEES.monthlyNote;
      }},

    { id: "setup_process",
      k: ["setup","onboarding","how long","process","get started","start","install","time lagega"],
      a: function () {
        return "The process is:\n\n" +
          "1. Free 20-minute strategy call — I recommend the product that actually fits\n" +
          "2. You complete the AI onboarding form (only the questions your product needs)\n" +
          "3. You grant Meta access, and provide a dedicated WhatsApp number if applicable\n" +
          "4. I configure your agent, test every path, and launch it\n" +
          "5. Ongoing monthly management, monitoring and tuning\n\n" +
          D.TIMELINES.typical + " " + D.TIMELINES.complex + "\n\n" + D.TIMELINES.disclaimer;
      }},

    { id: "meta_access",
      k: ["meta","facebook","password","access","permission","api","connect account","safe"],
      a: function () {
        return "**You never share your Instagram or WhatsApp password** — not with me, not with anyone " +
          "offering this kind of service.\n\n" +
          D.META_ONBOARDING.principles.map(function (p) { return "· " + p; }).join("\n") +
          "\n\n" + D.META_ONBOARDING.note;
      }},

    { id: "ban_risk",
      k: ["ban","banned","block","risky","account safe","suspend"],
      a: function () {
        return "The system connects through Meta's official APIs and responds only to people who " +
          "contact you first — which is exactly the intended use, and very different from unofficial " +
          "tools that automate a personal account.\n\n" +
          "That said, nobody can promise immunity from platform decisions. Meta enforces its own rules " +
          "and can change them. Everything is built to stay within those rules, and adapting when they " +
          "change is part of the monthly service.";
      }},

    { id: "bugs",
      k: ["bug","break","error","down","not working","issue","problem","maintenance"],
      a: function () { return P.reliability.wording + "\n\nWhat I won't claim is zero bugs or uninterrupted uptime — nobody can deliver that."; }},

    { id: "speed",
      k: ["how fast","speed","instant","seconds","reply time","response time"],
      a: function () {
        return P.responseTime.wording + " I won't put a hard number on it as a guarantee — platform " +
          "conditions and infrastructure affect delivery, and anyone promising a fixed response time " +
          "on someone else's platform is overpromising.";
      }},

    { id: "cold_dm",
      k: ["cold dm","mass dm","bulk","scrape","outreach","spam"],
      a: function () {
        return "No — and this isn't a limitation we'd remove if asked. Everything starts from someone " +
          "messaging, commenting or interacting with you first. The system doesn't send unsolicited " +
          "messages to strangers. That's against platform rules and a fast way to damage your account.";
      }},

    { id: "demo",
      k: ["demo","example","see it","show me","video","preview"],
      a: function () {
        var withUrl = products.filter(function (p) { return p.demoUrl; });
        var s = "There's a demo page covering all six AI products, plus the Managed Automation walkthroughs: " +
                "**" + D.LINKS.demo + "**\n\n";
        if (!withUrl.length) {
          s += "The AI product demos are being recorded right now. In the meantime, Ayush will happily " +
               "walk you through any product live on a free call — often more useful than a recording, " +
               "since you can ask questions as it runs.";
        }
        return s;
      }},

    { id: "free_plan",
      k: ["free","free plan","trial","free setup","no cost"],
      a: function () {
        var f = D.getManaged("free");
        return "Yes — the **" + f.name + "** is free, with no setup fee and no monthly fee.\n\n" +
          f.summary + "\n\n**Included:**\n" + f.features.map(function (x) { return "· " + x; }).join("\n") +
          "\n\n**Not included:** " + f.notIncluded.join(", ") + ".\n\n" +
          "It's Managed Automation, not an AI agent — built to handle incoming messages faster, " +
          "not to qualify or convert leads.";
      }},

    { id: "niche",
      k: ["fitness","coach","niche","only coaches","my business","gym","trainer","nutrition"],
      a: function () {
        return "We work only with fitness coaches — online coaches, personal trainers, gym owners, " +
          "nutrition and wellness coaches.\n\n" +
          "That's deliberate. Coaching leads have specific buyer psychology: they've usually failed " +
          "before, they're price-sensitive about trying again, and they delay. The qualification " +
          "questions, objection handling and conversation design are built around that rather than " +
          "generic B2B lead capture.";
      }},

    { id: "testimonials",
      k: ["testimonial","review","results","case study","proof","clients"],
      a: function () {
        return "There are two testimonials on the site, both from coaches running **Managed Automation** — " +
          "they're labelled that way everywhere.\n\n" +
          "The AI Agent products are newer, so there are no AI case studies yet. Ayush won't invent " +
          "any, which is why you'll see demos and honest capability descriptions rather than results " +
          "claims. Worth knowing before you decide.";
      }},

    { id: "contact",
      k: ["contact","email","talk to ayush","human","phone","reach","call you"],
      a: function () {
        return "Talk to Ayush directly:\n\n" +
          "· WhatsApp: " + D.CONTACT.phoneDisplay + "\n" +
          "· Email: " + D.CONTACT.email + "\n" +
          "· Book a free 20-minute call: **" + D.LINKS.book + "**\n\n" +
          "He handles every build personally — you're not filing a ticket with a support team.";
      }},

    { id: "fit_framework",
      k: ["fit framework","f.i.t","fit dm","framework","filter influence transfer","filter","influence","transfer"],
      a: function () {
        var F = D.FRAMEWORK;
        var s = "**" + F.name + "** is the structure every qualification-capable system here is built on.\n\n";
        s += F.steps.map(function (st) {
          return "**" + st.letter + " \u2014 " + st.title + "**\n" + st.desc;
        }).join("\n\n");
        s += "\n\nIt exists because coaching leads have specific buyer psychology \u2014 they've usually " +
             "failed before and are deciding whether to believe it'll be different this time.\n\n" +
             "Applies to Pro, Business, WhatsApp Personal Assistant, Fusion and Fusion Max. " +
             "Basic answers enquiries accurately but doesn't run the full journey.";
        return s;
      }},

    { id: "onboarding_form",
      k: ["form","onboarding form","what do you need from me","what do i provide","information needed","setup form"],
      a: function () {
        return "After you've chosen a product you get the AI onboarding form. You select the product " +
          "you bought and it shows only the questions that product needs.\n\nIt asks for:\n" +
          "\u00b7 Your coaching offer, programs and pricing\n" +
          "\u00b7 The questions you get most, and how you'd answer them\n" +
          "\u00b7 Your qualification questions\n" +
          "\u00b7 How you want the agent to sound\n" +
          "\u00b7 Your booking destination\n" +
          "\u00b7 Instagram handle, and WhatsApp number where the product needs one\n\n" +
          "It never asks for a password. Account access is granted separately through Meta's official process.";
      }},

    { id: "channels",
      k: ["instagram","insta","ig","whatsapp only","which platform","both platforms","channel"],
      a: function () {
        return "Instagram and WhatsApp are the two channels.\n\n" +
          "**Instagram only** \u2014 Basic, Pro, Business. All include Comment \u2192 DM.\n" +
          "**WhatsApp only** \u2014 WhatsApp Personal Assistant.\n" +
          "**Both, linked** \u2014 Fusion and Fusion Max. A lead qualified on Instagram carries on " +
          "WhatsApp without answering the same questions twice.\n\n" +
          "Tell me which channel your enquiries actually arrive on and I'll point you at the right one.";
      }},

    { id: "thanks",
      k: ["thanks","thank you","thx","shukriya","dhanyavad","ok cool","got it"],
      a: function () {
        return "Happy to help. If you want a straight recommendation for your situation, the free " +
          "20-minute call is the fastest way — Ayush will tell you honestly which product fits, " +
          "including when the answer is a cheaper plan or nothing yet.";
      }}
  ];

  /* Per-product intents, generated from SITE_DATA */
  products.forEach(function (prod) {
    var keys = [prod.name.toLowerCase()];
    if (prod.shortName) keys.push(prod.shortName.toLowerCase());
    if (prod.id === "wapa") keys.push("whatsapp personal assistant", "whatsapp assistant", "wa pa");
    if (prod.id === "fusion-max") keys.push("fusion max", "fusionmax", "max");
    INTENTS.unshift({
      id: "product_" + prod.id,
      k: keys,
      a: function () { return productDetail(prod); }
    });
  });

  /* ────────────────────────────────────────────────────────────
     MATCHING
     ──────────────────────────────────────────────────────────── */

  function normalise(t) {
    return " " + String(t).toLowerCase()
      .replace(/[^\w\s→+]/g, " ")
      .replace(/\s+/g, " ")
      .trim() + " ";
  }

  function score(text, intent) {
    var s = 0;
    for (var i = 0; i < intent.k.length; i++) {
      var kw = intent.k[i];
      if (text.indexOf(" " + kw + " ") !== -1) s += kw.split(" ").length * 3;
      else if (text.indexOf(kw) !== -1) s += kw.split(" ").length * 2;
    }
    return s;
  }

  function respond(input) {
    var t = normalise(input);
    var best = null, bestScore = 0;

    for (var i = 0; i < INTENTS.length; i++) {
      var sc = score(t, INTENTS[i]);
      if (sc > bestScore) { bestScore = sc; best = INTENTS[i]; }
    }

    if (best && bestScore >= 2) return best.a(t);

    return "I'm not certain I've understood that one, and I'd rather say so than guess.\n\n" +
      "I can help with:\n" +
      "· Pricing for the AI products or Managed Automation\n" +
      "· What Basic, Pro, Business, WhatsApp Personal Assistant, Fusion or Fusion Max include\n" +
      "· Setup, Meta access and WhatsApp requirements\n" +
      "· Guarantees, cancellation and what the monthly fee covers\n\n" +
      "Or ask Ayush directly on WhatsApp: " + D.CONTACT.phoneDisplay;
  }

  /* Public API used by chat.html */
  window.AAA_CHAT = {
    respond: respond,
    suggestions: [
      "What do the AI products cost?",
      "Difference between Managed and AI?",
      "Which product should I pick?",
      "Do I need a separate WhatsApp number?",
      "What does the guarantee cover?",
      "Is Comment → DM extra?"
    ]
  };
})();
