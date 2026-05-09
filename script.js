/* ════════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v10.0
   ════════════════════════════════════════════════════════════════

   v10 ARCHITECTURE UPGRADES vs v9:

   ✅ RESPONSE FAMILY ENGINE (replaces string concatenation pipeline)
      - 8–12 hand-authored full response variants per intent × tone
      - Composer selects ONE complete response — zero stitching
      - Covers: calm, curious, skeptical, excited, frustrated, Hinglish

   ✅ SALES PRESSURE BUDGET SYSTEM
      - Per-session CTA budget: max 2 per conversation stage
      - Urgency budget: max 1 per 5 turns
      - Social proof budget: max 1 per 4 turns
      - Spending resets when user shows explicit buying signal

   ✅ COMPLEXITY-AWARE DELAY ENGINE
      - Delay tied to question type, not text length
      - Simple factual: 600–900ms | Complex/emotional: 1200–2000ms
      - ±200ms random jitter always applied

   ✅ PER-SEGMENT INTER-BUBBLE PACING
      - Each bubble gets semantic role: ack / main / followup
      - Inter-bubble delays: 300ms / 600ms / 900ms by role
      - Typing indicator resets fresh between each bubble

   ✅ FULL SESSION PERSISTENCE (CONV_STATE to localStorage)
      - Persists: last intent, objections, tone, stage, pain points
      - Returning user rehydrates full context on init
      - Greeting adapts: never restarts conversation

   ✅ SOURCE LANGUAGE MIRROR
      - Detects sourceLanguage: en / hi / hinglish after L1
      - Hinglish users receive Hinglish-register responses
      - Language mismatch eliminated

   ✅ PARTIAL INTENT SALVAGE (pre-fallback)
      - Cluster score ≥ 0.8 → address theme + confirm vagueness
      - Example: "ye kaam karega kya?" → reflects automation concern
      - True zero-signal inputs only hit generic fallback

   ✅ CONTEXTUAL FLOAT BUTTON SYSTEM
      - Buttons appear only after: pricing/plan turns, intent signals, 5+ turns
      - Neutral/exploratory messages: no float buttons
      - Fallbacks: FAQ only, never "Get Started"

   ✅ NATURAL CHIP MESSAGES
      - Welcome chips send natural short queries (not robotic formal text)
      - Chip labels rotate across sessions

   ════════════════════════════════════════════════════════════════ */

(function (global) {
  "use strict";

  /* ── §0  DATA ACCESS ──────────────────────────────────────── */
  function D() { return global.AGENCY_DATA || {}; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function R(text, link, cta) { return { text: text || "", link: link || null, cta: cta || null }; }

  /* ════════════════════════════════════════════════════════════
     §1  LAYER 1 — NORMALIZATION ENGINE (preserved from v9)
  ════════════════════════════════════════════════════════════ */

  const LEMMA = {
    pricing:"price",priced:"price",prices:"price",
    costing:"cost",costs:"cost",
    charged:"charge",charges:"charge",charging:"charge",
    fees:"fee",payments:"payment",paying:"pay",paid:"pay",
    rates:"rate",budgets:"budget",spending:"spend",spent:"spend",
    investments:"investment",amounts:"amount",
    plans:"plan",planning:"plan",planned:"plan",
    leads:"lead",leading:"lead",
    clients:"client",coaching:"coach",coaches:"coach",
    bookings:"booking",booked:"book",books:"book",
    calls:"call",calling:"call",
    automating:"automate",automated:"automate",automations:"automation",
    automates:"automate",bots:"bot",systems:"system",
    messages:"message",messaging:"message",messaged:"message",
    dms:"dm",replies:"reply",replying:"reply",replied:"reply",
    responses:"response",responding:"respond",responded:"respond",
    follows:"follow",following:"follow",followed:"follow",
    reminders:"reminder",sequences:"sequence",
    results:"result",conversions:"conversion",converting:"convert",
    converted:"convert",qualifications:"qualification",
    qualifying:"qualify",qualified:"qualify",
    filters:"filter",filtering:"filter",filtered:"filter",
    tagging:"tag",tags:"tag",
    trusted:"trust",trusting:"trust",scams:"scam",frauds:"fraud",
    risks:"risk",banning:"ban",banned:"ban",
    suspending:"suspend",suspended:"suspend",
    started:"start",starting:"start",begins:"begin",beginning:"begin",
    setups:"setup",setting:"setup",configured:"configure",
    launching:"launch",launched:"launch",
    working:"work",works:"work",worked:"work",
    showing:"show",shows:"show",shown:"show",
    explaining:"explain",explained:"explain",explains:"explain",
    understanding:"understand",understood:"understand",
    affordable:"cheap",affordability:"cheap",cheaply:"cheap",
    cheaper:"cheap",cheapest:"cheap",inexpensive:"cheap",
    pricey:"expensive",costly:"expensive",
    discounts:"discount",offers:"offer",deals:"deal",
    recommend:"suggest",recommendation:"suggest",recommends:"suggest",
    suggested:"suggest",suggests:"suggest",
    trial:"try",trying:"try",testing:"try",tested:"try",
    comparing:"compare",compared:"compare",comparison:"compare",
    differs:"differ",difference:"differ",different:"differ",
    helps:"help",helped:"help",helpful:"help",
    questions:"question",queried:"query",queries:"query",
    wanna:"want to",gonna:"going to",gotta:"got to",kinda:"kind of",
    sorta:"sort of",dunno:"dont know",lemme:"let me",gimme:"give me",
    lotta:"lot of",outta:"out of",hafta:"have to",
  };

  const SLANG_MAP = [
    ["wt ","what "],["wts ","what is "],["msg","message"],["msgs","messages"],
    ["dm ","direct message "],["dms ","direct messages "],
    ["insta","instagram"],["wa ","whatsapp "],["wa?","whatsapp?"],
    ["biz","business"],["tbh","to be honest"],["ngl","not going to lie"],
    ["imo","in my opinion"],["lol",""],["lmao",""],["haha",""],
    ["idk","i dont know"],["idc","i dont care"],["fyi","for your information"],
    ["asap","as soon as possible"],["btw","by the way"],["omg",""],
    ["nvm","never mind"],["rn","right now"],["ig ","i guess "],
    ["obv","obviously"],["def","definitely"],["prob","probably"],
    ["tho","though"],["thru","through"],["coz","because"],["cuz","because"],
    ["bcoz","because"],["bcuz","because"],["bc ","because "],
    ["vs ","versus "],["n ","and "],["nd ","and "],["& ","and "],
    ["pls","please"],["plz","please"],["plss","please"],
    ["ok ","okay "],["okk ","okay "],["okkk ","okay "],
    ["yep","yes"],["yup","yes"],["ya ","yes "],["ye ","yes "],
    ["nah","no"],["nope","no"],
    ["wanna","want to"],["gonna","going to"],["gotta","have to"],
    ["lemme","let me"],["gimme","give me"],["kinda","kind of"],
    ["sorta","sort of"],["lotta","lot of"],
    ["pt ","personal trainer "],["pt?","personal trainer?"],
    ["1on1","one on one"],["1:1","one on one"],
  ];

  const HINGLISH_RAW = [
    ["price kya hai","what is price"],["price kya h","what is price"],
    ["price kya hoga","what is price"],["price batao","tell price"],
    ["price btao","tell price"],["price bolo","tell price"],
    ["price kitna hai","what is price"],["kitna price hai","what is price"],
    ["kitna banta hai","how much total"],["kitna padega","how much cost"],
    ["kitna lagega bhai","how much cost"],["kitna lagega","how much cost"],
    ["kitne paise lagenge","how much cost"],["kitna paisa lagega","how much cost"],
    ["paise kitne","how much cost"],["charges kya hai","what are charges"],
    ["charge kya hai","what is charge"],["rate kya hai","what is price"],
    ["monthly kitna","monthly price"],["mahine ka kitna","monthly price"],
    ["total kitna","total cost"],["kitna hai","how much"],["kitna","how much"],
    ["paisa wala","pricing"],["rupaye kitne","how much cost"],
    ["rupaye","price"],["paise","price"],["rupees","price"],["rupee","price"],
    ["paisa","price"],["lagega","cost"],["lagenge","cost"],
    ["lagti","cost"],["lagta","cost"],
    ["kaise kaam karta hai","how does it work"],
    ["kaise kaam karega","how will it work"],
    ["kaise kaam","how does work"],["kya karta hai","what does it do"],
    ["kya hota hai","what happens"],["kya hai ye","what is this"],
    ["kya hai","what is"],["kya hota","what is"],
    ["iska kaam kya hai","what does it do"],
    ["ye kya cheez hai","what is this"],
    ["samjha do","explain this"],["samjhao","explain"],
    ["thoda explain karo","please explain"],
    ["bata do","tell me"],["bata","tell"],
    ["kaise shuru karun","how to start"],["kaise shuru karu","how to start"],
    ["kaise shuru","how to start"],["kaise join karun","how to join"],
    ["shuru karna hai","want to start"],["shuru kar sakta hun","can start"],
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["shuru karna chahta hun","want to start"],
    ["start karna hai","want to start"],["start karna chahta","want to start"],
    ["lena chahta hun","want to buy"],["lena hai","want to buy"],
    ["kharidna hai","want to buy"],["kharidna chahta hun","want to buy"],
    ["le lun kya","should i buy"],["le lu","will take it"],
    ["kaunsa plan lena chahiye","which plan should i take"],
    ["konsa plan lu","which plan should i take"],
    ["kaunsa plan best hai","which plan is best"],
    ["konsa plan best hai","which plan is best"],
    ["kaunsa plan","which plan"],["konsa plan","which plan"],
    ["kaun sa plan","which plan"],["sahi plan","right plan"],
    ["mere liye kaunsa plan","which plan for me"],
    ["mujhe kaunsa plan lena chahiye","which plan should i take"],
    ["starter mein kya milega","starter plan features"],
    ["growth mein kya milega","growth plan features"],
    ["free mein kya milega","free plan features"],
    ["combo mein kya milega","combo plan features"],
    ["whatsapp wale mein kya","whatsapp plan features"],
    ["is mein kya kya milega","what all is included"],
    ["kya kya milega","what is included"],
    ["safe hai kya","is it safe"],["ban hoga kya","will account be banned"],
    ["account jaega kya","will account be banned"],
    ["scam toh nahi","is it legit"],["dhoka","fraud"],["dhokha","fraud"],
    ["bharosa","trust"],["sach mein","really"],["sach","real"],
    ["genuine hai kya","is it genuine"],["legit hai kya","is it legit"],
    ["jhoot toh nahi","is it real"],["fake toh nahi hai","is it not fake"],
    ["service band karna hai","cancel service"],["band karna","cancel"],
    ["cancel karna hai","want to cancel"],["cancel karna","cancel"],
    ["chhodna hai","want to stop"],["chhod dun","should i stop"],
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["kab hoga","when will it be"],["kab","when"],
    ["kitne din mein","how many days"],["kitne ghante","how many hours"],
    ["kitne din","how many days"],["kitna time lagega","how long will it take"],
    ["jaldi ho jaega","will it be quick"],["kitne time mein","how long"],
    ["batao","explain"],["samjhao","explain"],["bolo","tell me"],
    ["dikhao","show me"],["dekhna","see"],["dekh","see"],
    ["bata","tell"],["dikha","show"],
    ["sasta wala plan","cheapest plan"],["sabse sasta plan","cheapest plan"],
    ["sabse sasta","cheapest"],["sabse acha plan","best plan"],
    ["sabse acha","best"],["sasta","cheap"],["mehenga","expensive"],
    ["bahut mehenga","very expensive"],["thoda mehnga","a bit expensive"],
    ["zyada mehenga","too expensive"],
    ["best wala plan","best plan"],["free wala plan","free plan"],
    ["free wala","free plan"],["paid wala","paid plan"],
    ["shuru","start"],["karna hai","want to"],
    ["aage badhna","proceed"],["theek hai","ok"],
    ["acha","ok"],["achha","ok"],["accha","ok"],
    ["bilkul","absolutely"],["zaroor","definitely"],["beshak","definitely"],
    ["haan","yes"],["nahi","no"],["nai","no"],
    ["nahi chahiye","not interested"],
    ["samajh gaya","understood"],["samajh gayi","understood"],
    ["pata nahi","dont know"],["nahi pata","dont know"],
    ["soch raha hun","thinking"],["soch rahi hun","thinking"],
    ["soch raha hoon","thinking"],
    ["doubt hai","have doubt"],["confusion hai","am confused"],
    ["confuse ho gaya","got confused"],
    ["abhi nahi","not now"],["baad mein","later"],
    ["leads nahi aate","not getting leads"],
    ["leads aate hain but","leads come but"],
    ["clients nahi milte","not getting clients"],
    ["reply manage nahi hota","cant manage replies"],
    ["reply karna mushkil hai","replying is difficult"],
    ["time nahi hai","dont have time"],
    ["pura din chala jata hai","whole day is spent"],
    ["bahut time jata hai","lot of time is spent"],
    ["thak gaya hun","am exhausted"],["thak gayi hun","am exhausted"],
    ["serious lead nahi aate","not getting serious leads"],
    ["fake lead bahut aate hain","getting many fake leads"],
    ["manually reply karna padta hai","have to reply manually"],
    ["khud reply karna padta hai","have to reply myself"],
    ["bot lagega kya","will it seem like a bot"],
    ["bot pata chalega kya","will they know its a bot"],
    ["robot jaisa lagega","will it feel robotic"],
    ["fake lagega kya","will it seem fake"],
    ["natural lagega kya","will it feel natural"],
    ["human jaisa","human like"],
    ["kaam karta hai kya","does it work"],
    ["result milega kya","will i get results"],
    ["clients milenge kya","will i get clients"],
    ["calls book hogi kya","will calls get booked"],
    ["proof dikhao","show proof"],["proof kya hai","what is proof"],
    ["worth it hai kya","is it worth it"],["worth it hai","is it worth it"],
    ["faida hoga kya","will there be benefit"],["kya fayda","what benefit"],
    ["kya haal hai","how are you"],["kaise ho aap","how are you"],
    ["kaise ho","how are you"],["namaste","hello"],["namaskar","hello"],
    ["assalamualaikum","hello"],["bhai","hey"],["yaar","hey"],
    ["dost","hey"],["boss","hey"],["guru","hey"],
    ["bro ","hey "],["mahina","monthly"],["mahine","monthly"],
    ["kaun sa","which"],["konsa","which"],
    ["ye kaam karega kya","will this work"],
    ["ye sach mein kaam karta hai","does this really work"],
    ["iska kya fayda","what benefit does this give"],
    ["isse kya hoga","what will this do"],
    ["automation se kya hoga","what will automation do"],
    ["naya hun","i am new"],["main naya hun","i am new"],
    ["abhi start kar raha hun","just starting"],
    ["bahut leads aate hain","getting many leads"],
    ["scaling karna chahta hun","want to scale"],
    ["instagram pe hoon","on instagram"],["whatsapp pe hoon","on whatsapp"],
    ["dono pe hoon","on both platforms"],
  ];

  /* ── Source Language Detection ─────────────────────────── */
  function detectSourceLanguage(rawInput) {
    const hindi = /[\u0900-\u097f]/;
    if (hindi.test(rawInput)) return "hi";
    const hinglishMarkers = /\b(hai|hain|ho|hun|kya|nahi|nai|haan|bhai|yaar|kitna|kaise|kab|mein|se|ko|ka|ki|ke|par|lekin|aur|toh|bhi|sirf|bahut|thoda|zyada|sach|bilkul|zaroor|theek|acha|sasta|mehenga|wala|aate|lagega|milega|chahta|chahiye|batao|dikhao|samjhao|shuru|pehlhe|baad|abhi|roz)\b/i;
    const hinglishWordCount = (rawInput.match(hinglishMarkers) || []).length;
    const totalWords = rawInput.split(/\s+/).length;
    if (hinglishWordCount >= 1 && hinglishWordCount / totalWords >= 0.2) return "hinglish";
    return "en";
  }

  function normalizeText(raw) {
    if (!raw) return "";
    let t = raw.toLowerCase().trim();

    // Collapse repeated chars
    t = t.replace(/(.)\1{2,}/g, "$1$1");

    // Emoticons to tokens
    t = t.replace(/:\)/g, " happy ").replace(/:\(/g, " sad ").replace(/;\)/g, " wink ");

    // Hinglish mappings (longest first)
    const sorted = [...HINGLISH_RAW].sort((a,b) => b[0].length - a[0].length);
    for (const [h, e] of sorted) t = t.replace(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), "gi"), e);

    // Slang
    for (const [s, e] of SLANG_MAP) t = t.replace(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), "gi"), e);

    // Lemmatize
    t = t.replace(/\b(\w+)\b/g, w => LEMMA[w] || w);

    // Clean punctuation
    t = t.replace(/[^\w\s.!?'-]/g, " ").replace(/\s+/g, " ").trim();

    return t;
  }

  /* ════════════════════════════════════════════════════════════
     §2  SEMANTIC CLUSTERS (preserved from v9, 12 clusters)
  ════════════════════════════════════════════════════════════ */
  const SEMANTIC_CLUSTERS = {
    price_concern: {
      keywords: ["price","cost","fee","pay","money","affordable","cheap","expensive","budget","invest","rupee","paise","worth","value","return"],
      intent_boost: "pricing", weight: 1.4
    },
    trust_concern: {
      keywords: ["safe","trust","real","legit","genuine","fake","scam","ban","account","risk","secure","official","authentic","verify"],
      intent_boost: "safety", weight: 1.5
    },
    results_interest: {
      keywords: ["result","work","proof","client","call","book","convert","lead","success","growth","income","case","study","show"],
      intent_boost: "results", weight: 1.3
    },
    time_pain: {
      keywords: ["time","manual","reply","day","hour","busy","exhaust","tired","drain","manage","24/7","nonstop","all day","roz"],
      intent_boost: "services", weight: 1.2
    },
    automation_curiosity: {
      keywords: ["automate","bot","automation","system","flow","trigger","sequence","funnel","setup","build","integrate","connect"],
      intent_boost: "process", weight: 1.1
    },
    lead_quality: {
      keywords: ["serious","qualify","filter","fake","waster","unserious","junk","bad","good lead","real lead","interested"],
      intent_boost: "services", weight: 1.3
    },
    buying_signal: {
      keywords: ["start","get","ready","sign up","proceed","go ahead","register","begin","purchase","buy","enroll","take","join"],
      intent_boost: "contact", weight: 1.6
    },
    platform_instagram: {
      keywords: ["instagram","insta","ig","reel","story","post","dm","profile","follow","comment"],
      intent_boost: "services", weight: 1.0
    },
    platform_whatsapp: {
      keywords: ["whatsapp","wa","chat","number","mobile","phone","enquiry"],
      intent_boost: "plan_whatsapp", weight: 1.0
    },
    comparison_mode: {
      keywords: ["vs","versus","difference","compare","better","worse","which","or","option","plan","choose","choose between"],
      intent_boost: "compare_plans", weight: 1.2
    },
    authenticity_fear: {
      keywords: ["natural","human","robotic","robot","fake","detect","notice","feel","obvious","pata chalega","lag raha","jaisa"],
      intent_boost: "human_feel", weight: 1.4
    },
    demo_interest: {
      keywords: ["show","demo","example","preview","see","watch","before","decide","try","test","live","sample"],
      intent_boost: "demo", weight: 1.2
    },
  };

  function getSemanticScores(normInput) {
    const scores = {};
    for (const [cluster, data] of Object.entries(SEMANTIC_CLUSTERS)) {
      let score = 0;
      for (const kw of data.keywords) {
        if (normInput.includes(kw)) score += data.weight;
      }
      if (score > 0) scores[cluster] = score;
    }
    return scores;
  }

  function getClusterBoosts(clusterScores) {
    const boosts = {};
    for (const [cluster, score] of Object.entries(clusterScores)) {
      const boost = SEMANTIC_CLUSTERS[cluster]?.intent_boost;
      if (boost) boosts[boost] = (boosts[boost] || 0) + score * 0.4;
    }
    return boosts;
  }

  /* ════════════════════════════════════════════════════════════
     §3  PHRASE PATTERNS (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  const PHRASE_PATTERNS = [
    {
      patterns: [/leads.{0,20}but.{0,20}(serious|quality|not|nahi)/i,
                 /lead.{0,20}(fake|waster|unserious|time)/i,
                 /serious.{0,15}(lead|nahi|not)/i,
                 /lead.{0,20}aate.{0,10}but/i],
      signals: ["lead_quality_issue","qualification_needed"],
      intent_boost: "services", empathy_key: "lead_frustration"
    },
    {
      patterns: [/not.{0,15}want.{0,15}(fake|robotic|robot|bot)/i,
                 /(fake|robotic|robot|bot).{0,20}(feel|seem|look|sound|lag)/i,
                 /(bot|robot).{0,15}(obvious|pata|notice|detect|feel)/i,
                 /natural.{0,15}(feel|lag|seem)/i],
      signals: ["trust_concern","authenticity_fear"],
      intent_boost: "human_feel", empathy_key: "authenticity_concern"
    },
    {
      patterns: [/reply.{0,30}(pura din|all day|din bhar|whole day|hours)/i,
                 /(manually|khud|myself).{0,20}reply/i,
                 /can.{0,10}t.{0,20}(manage|handle|keep up)/i],
      signals: ["manual_workload_pain","scaling_needed"],
      intent_boost: "services", empathy_key: "time_pain"
    },
    {
      patterns: [/(expensive|costly|mehenga|price).{0,30}(but|though|however|par|lekin)/i,
                 /(budget|afford|money).{0,20}(tight|less|low|not much|nahi)/i,
                 /can.{0,5}t.{0,20}afford/i],
      signals: ["price_hesitation","budget_conscious"],
      intent_boost: "objection_expensive", empathy_key: "price_concern"
    },
    {
      patterns: [/(sounds|looks|seems).{0,15}good.{0,20}but/i,
                 /(interested|curious|like it).{0,20}but.{0,20}(not sure|doubt|worry)/i,
                 /thinking.{0,20}about.{0,20}(it|this|getting)/i],
      signals: ["positive_lean","hesitation"],
      intent_boost: "objection_unsure", empathy_key: "exploration"
    },
    {
      patterns: [/(want|wanna|need).{0,15}(to start|to get|this|to buy|to try)/i,
                 /(how|where).{0,10}(to sign up|to start|to get started|to join)/i,
                 /(ready|let.s|lets|go ahead).{0,15}(start|get|try|setup)/i,
                 /sign me up/i],
      signals: ["purchase_intent","ready_to_commit"],
      intent_boost: "contact", empathy_key: "purchase_intent"
    },
    {
      patterns: [/(vs|versus|compared to|or).{0,20}(plan|package|option)/i,
                 /difference.{0,20}(between|in).{0,20}plan/i,
                 /which.{0,15}(is better|should i|would you recommend)/i],
      signals: ["comparison_needed","decision_support"],
      intent_boost: "compare_plans", empathy_key: "comparison_seeking"
    },
    {
      patterns: [/does (it|this) (really|actually) work/i,
                 /(prove|show me|convince me).{0,20}(works|results|real)/i,
                 /kya (sach mein|actually|really).{0,20}kaam/i],
      signals: ["skepticism","proof_needed"],
      intent_boost: "results", empathy_key: "automation_doubt"
    },
    {
      patterns: [/(show me|let me see|can i see|want to see).{0,20}(demo|example|how it works)/i,
                 /(before|first).{0,20}(decide|commit|buy|purchase|invest)/i,
                 /live.{0,15}(demo|example|preview)/i],
      signals: ["wants_demo","visual_proof_needed"],
      intent_boost: "demo", empathy_key: "automation_doubt"
    },
  ];

  function matchPhrasePatterns(normInput, rawInput) {
    const detected = { signals:[], intent_boosts:{}, empathy_keys:[] };
    for (const pattern of PHRASE_PATTERNS) {
      const matched = pattern.patterns.some(re => re.test(rawInput) || re.test(normInput));
      if (matched) {
        detected.signals.push(...pattern.signals);
        if (pattern.intent_boost) detected.intent_boosts[pattern.intent_boost] = (detected.intent_boosts[pattern.intent_boost] || 0) + 2.5;
        if (pattern.empathy_key) detected.empathy_keys.push(pattern.empathy_key);
      }
    }
    return detected;
  }

  /* ════════════════════════════════════════════════════════════
     §4  GRAMMAR INTELLIGENCE (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  const NEGATION_WORDS = /\b(not|no|never|dont|don't|wont|won't|cant|can't|isnt|isn't|arent|aren't|nahi|na|nai|mat)\b/i;

  function classifyInput(normInput, rawInput) {
    const tokens = normInput.split(/\s+/);
    const isQuestion = /\?/.test(rawInput) || /^(what|how|why|when|where|which|who|is|are|can|do|does|will|would|should|kya|kaise|kab|kitna|kaun)/i.test(normInput);
    const isNegative = NEGATION_WORDS.test(normInput);
    const hasUncertainty = /\b(maybe|might|probably|not sure|kinda|sorta|could|thinking|soch|pata nahi|idk|dunno)\b/i.test(normInput);
    const isShort = tokens.length <= 4;
    const isMixed = /but|par|lekin|however|though|magar/i.test(normInput);
    let butClause = null;
    if (isMixed) {
      const m = normInput.match(/(.+?)\b(?:but|par|lekin|however|though|magar)\b(.+)/i);
      if (m) butClause = { positive: m[1].trim(), concern: m[2].trim() };
    }
    return { isQuestion, isNegative, hasUncertainty, isShort, isMixed, butClause, tokens };
  }

  /* ════════════════════════════════════════════════════════════
     §5  SENTENCE DECOMPOSITION (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  function decomposeSentence(rawInput, normInput) {
    const emotion = detectEmotion(normInput);
    const signals = [];
    const empathy_keys = [];

    if (/thak|exhaust|tired|bore|ugh|argh|frustrated|sick of/i.test(normInput)) {
      signals.push("user_frustrated"); empathy_keys.push("frustrated");
    }
    if (/amazing|love|wow|great|nice|zabardast|mast|perfect|excited|happy/i.test(normInput)) {
      signals.push("user_excited"); empathy_keys.push("excited");
    }
    if (/soch|thinking|considering|maybe|might|unsure|not sure|pata nahi/i.test(normInput)) {
      signals.push("user_thinking");
    }
    if (/lena|buy|start|ready|sign up|proceed|go ahead|get this|take this/i.test(normInput)) {
      signals.push("purchase_intent"); empathy_keys.push("purchase_intent");
    }
    if (/proof|show|result|real|actually work|evidence|sach mein/i.test(normInput)) {
      signals.push("proof_needed"); empathy_keys.push("automation_doubt");
    }
    if (/price|cost|fee|kitna|afford|budget|expensive|mehenga|paise/i.test(normInput)) {
      signals.push("price_hesitation"); empathy_keys.push("price_concern");
    }
    if (/bot|fake|natural|human|robotic|lag|pata chalega/i.test(normInput)) {
      signals.push("authenticity_concern"); empathy_keys.push("authenticity_concern");
    }
    if (/trust|safe|ban|account|scam|risk|secure|legit|genuine/i.test(normInput)) {
      signals.push("trust_concern"); empathy_keys.push("trust_concern");
    }

    return { emotion, signals, empathy_keys };
  }

  function detectEmotion(normInput) {
    if (/thak|exhaust|tired|bore|frustrated|sick|ugh/i.test(normInput)) return "frustrated";
    if (/amazing|love|wow|great|nice|excited|happy|perfect/i.test(normInput)) return "excited";
    if (/not sure|doubt|confuse|worry|scared|unsure|pata nahi/i.test(normInput)) return "worried";
    if (/thinking|consider|maybe|soch|might/i.test(normInput)) return "thinking";
    return "neutral";
  }

  /* ════════════════════════════════════════════════════════════
     §6  HINDI SIGNAL EXTRACTION (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  function extractHindiSignals(normInput) {
    const signals = [];
    if (/not getting lead|lead nahi|nahi aate/.test(normInput)) signals.push("lead_quality_issue");
    if (/want to buy|want to start|lena hai|shuru karna/.test(normInput)) signals.push("purchase_intent");
    if (/is it safe|safe hai|ban|account/.test(normInput)) signals.push("safety_concern");
    if (/feel natural|natural feel|bot pata|human jaisa/.test(normInput)) signals.push("authenticity_concern");
    if (/whole day|all day|pura din|bahut time|time nahi/.test(normInput)) signals.push("time_pain");
    if (/have doubt|doubt hai|am confused|soch raha/.test(normInput)) signals.push("user_thinking");
    if (/want to cancel|cancel karna|band karna/.test(normInput)) signals.push("cancel_intent");
    return signals;
  }

  /* ════════════════════════════════════════════════════════════
     §7  INTENT SCORING ENGINE (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  function lemTokens(norm) { return norm.toLowerCase().split(/\s+/).map(w => LEMMA[w] || w); }
  function allGrams(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      out.push(tokens[i]);
      if (i+1 < tokens.length) out.push(tokens[i]+" "+tokens[i+1]);
      if (i+2 < tokens.length) out.push(tokens[i]+" "+tokens[i+1]+" "+tokens[i+2]);
    }
    return out;
  }
  function overlap(grams, keys) {
    let s = 0;
    for (const g of grams) for (const k of keys) if (g === k) s += 1;
    return s;
  }
  function fuzzyScore(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.includes(shorter)) return shorter.length / longer.length;
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) if (longer.includes(shorter[i])) matches++;
    return matches / longer.length;
  }

  /* ── IDF WEIGHTS ──────────────────────────────────────────── */
  let IDF = {};
  function buildIdf(intents) {
    const df = {};
    const N = intents.length;
    for (const intent of intents) {
      const seen = new Set((intent.keywords || []).join(" ").split(/\s+/));
      for (const w of seen) df[w] = (df[w] || 0) + 1;
    }
    for (const [w, count] of Object.entries(df)) IDF[w] = Math.log(N / count + 1);
  }

  /* ── INTENT DEFINITIONS ───────────────────────────────────── */
  const INTENTS = [
    { id:"greeting",            planHint:null,        keywords:["hi","hello","hey","namaste","good morning","good afternoon","good evening","start","help","what can you","who are you","kaise ho","namaskar"] },
    { id:"thanks",              planHint:null,        keywords:["thank","thanks","great","good job","nice","perfect","appreciate","helpful","got it","understood","okay thanks","theek hai dhanyavaad"] },
    { id:"pricing",             planHint:null,        keywords:["price","cost","fee","plan","how much","kitna","rate","charge","investment","money","budget","afford","pay","monthly","rupee","paisa","paise","pricing"] },
    { id:"plan_free",           planHint:"free",      keywords:["free plan","free","zero cost","no cost","free tier","inbox assistant","trial","₹0","zero rupee","muft","free wala"] },
    { id:"plan_starter",        planHint:"starter",   keywords:["starter plan","starter","organised","organise","organized","tagging","₹999","999"] },
    { id:"plan_growth",         planHint:"growth",    keywords:["growth plan","growth","conversion","₹1499","1499","popular","full funnel","best plan","conversion system"] },
    { id:"plan_whatsapp",       planHint:"whatsapp",  keywords:["whatsapp plan","whatsapp","wa plan","₹1499","1499 whatsapp","wp plan"] },
    { id:"plan_combo",          planHint:"combo",     keywords:["combo plan","combo","both","instagram whatsapp","₹2498","2498","full system"] },
    { id:"compare_plans",       planHint:null,        keywords:["compare","difference","which plan","best plan","versus","vs","or","better","choose","free vs","starter vs","growth vs"] },
    { id:"services",            planHint:null,        keywords:["service","what do","feature","include","offer","automation","lead","reply","follow up","qualify","tagging","booking","comment","story"] },
    { id:"process",             planHint:null,        keywords:["process","how work","step","setup","build","configure","timeline","how long","audit","launch","how it works","kaise kaam"] },
    { id:"results",             planHint:null,        keywords:["result","work","proof","evidence","real","case study","success","how many","client","call","book","convert","guarantee","really work","does it work"] },
    { id:"safety",              planHint:null,        keywords:["safe","safety","ban","account","risk","scam","fake","legit","trust","secure","password","official","meta","real","genuine"] },
    { id:"setup",               planHint:null,        keywords:["setup","install","start","begin","how long","timeline","requirement","need","time","hours","days","kab","kitna time"] },
    { id:"demo",                planHint:null,        keywords:["demo","show","example","see","preview","try","test","before","live","watch","experience","see it"] },
    { id:"contact",             planHint:null,        keywords:["contact","whatsapp","call","book","reach","talk","connect","number","email","meeting","speak","chat","start now","get started","sign up"] },
    { id:"tools",               planHint:null,        keywords:["tool","manychat","sheet","google","platform","software","app","tech","technology","use","using"] },
    { id:"about",               planHint:null,        keywords:["about","who","founder","ayush","agency","background","story","experience","expertise","team"] },
    { id:"human_feel",          planHint:null,        keywords:["natural","human","robotic","robot","bot","fake","feel","detect","notice","obvious","pata chalega","lag raha","jaisa","real feeling","like human","not robotic"] },
    { id:"both_platforms",      planHint:null,        keywords:["both","instagram and whatsapp","two platform","instagram whatsapp","dono","both platform"] },
    { id:"objection_expensive", planHint:null,        keywords:["expensive","costly","mehenga","price high","too much","cant afford","not worth","overpriced","bahut mehenga","zyada mehenga"] },
    { id:"objection_time",      planHint:null,        keywords:["not now","later","busy","no time","baad mein","abhi nahi","when available","when free","later maybe"] },
    { id:"objection_va",        planHint:null,        keywords:["assistant","human assistant","virtual assistant","hire person","va","employee","manual reply is fine","dont need automation"] },
    { id:"objection_unsure",    planHint:null,        keywords:["not sure","confused","doubt","thinking","maybe","might","considering","not confident","not decided","pata nahi","soch raha"] },
    { id:"cancel",              planHint:null,        keywords:["cancel","stop","quit","end service","leave","discontinue","pause","band karna","cancel karna","chhodna"] },
    { id:"revisions",           planHint:null,        keywords:["revise","change","update","modify","edit","adjust","tweak","revision","fix","alter","rebuild"] },
    { id:"requirements",        planHint:null,        keywords:["require","need","access","permission","password","login","account access","what do i need","prerequisite"] },
  ];

  function scoreIntents(normInput, phraseBoosts, clusterBoosts) {
    const tokens = lemTokens(normInput);
    const grams  = allGrams(tokens);
    const scores = [];
    for (const intent of INTENTS) {
      let score = overlap(grams, intent.keywords || []);
      for (const kw of (intent.keywords || [])) {
        for (const tok of tokens) {
          if (fuzzyScore(tok, kw) >= 0.84) { score += 0.4; break; }
        }
      }
      for (const kw of (intent.keywords || [])) {
        if (IDF[kw]) score *= (1 + IDF[kw] * 0.1);
      }
      score += phraseBoosts[intent.id] || 0;
      score += clusterBoosts[intent.id] || 0;
      if (score > 0) scores.push({ id:intent.id, score, planHint:intent.planHint });
    }
    return scores.sort((a,b) => b.score - a.score);
  }

  /* ════════════════════════════════════════════════════════════
     §8  NAMED ENTITY RECOGNITION (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  const NER = {
    planMap: {
      free:["free","₹0","zero","muft","inbox assistant","free wala","free plan"],
      starter:["starter","₹999","999","organised","tagging","starter plan"],
      growth:["growth","₹1499","1499","conversion system","growth plan","most popular"],
      whatsapp:["whatsapp","wa plan","₹1499 whatsapp","whatsapp plan","whatsapp lead"],
      combo:["combo","₹2498","2498","both","full system","combo plan"],
    },
    extract(normInput) {
      const plan = (() => {
        for (const [key, terms] of Object.entries(NER.planMap)) {
          if (terms.some(t => normInput.includes(t))) return key;
        }
        return null;
      })();
      const hasPriceSignal = /\b(price|cost|fee|kitna|rate|how much|charge|paisa|rupee|budget|afford|pay|monthly|invest)\b/i.test(normInput);
      const sentiment = /\b(love|great|nice|good|amazing|perfect|excited|interested)\b/i.test(normInput) ? "positive"
                      : /\b(bad|hate|terrible|worried|scared|skeptical|doubt)\b/i.test(normInput) ? "negative"
                      : "neutral";
      const isQuestion = /\?/.test(normInput) || /^(what|how|why|when|where|which|who|is|are|can|do|does|will|would|should)/i.test(normInput);
      return { plan, hasPriceSignal, sentiment, isQuestion };
    }
  };

  /* ════════════════════════════════════════════════════════════
     §9  MEMORY SYSTEMS
  ════════════════════════════════════════════════════════════ */

  /* ── §9a  SEMANTIC MEMORY (per session + localStorage persist) */
  const MEM = {
    history: [],
    turnCount: 0,
    lastIntent: null,
    lastPlan: null,
    slots: {
      trustLevel: 0,
      urgency: null,
      questionDepth: 0,
      painPoints: [],
      desires: [],
    },
    push(intent, plan, entities, normInput, decomposition) {
      this.turnCount++;
      this.lastIntent = intent || this.lastIntent;
      this.lastPlan   = plan || this.lastPlan;
      const entry = { intent, plan, normInput, ts: Date.now() };
      this.history.push(entry);
      if (this.history.length > 12) this.history.shift();

      if (entities && entities.sentiment === "positive") this.slots.trustLevel = Math.min(10, this.slots.trustLevel + 0.8);
      if (entities && entities.isQuestion) this.slots.questionDepth++;
      if (decomposition) {
        for (const sig of (decomposition.signals || [])) {
          if (!this.slots.painPoints.includes(sig)) this.slots.painPoints.push(sig);
        }
      }
      if (intent === "contact" || (decomposition && decomposition.signals.includes("purchase_intent"))) {
        this.slots.desires.push("wants_to_buy");
      }
    },
    resolvePlan(plan) { return plan || this.lastPlan; },
    getDepthStage() {
      if (this.turnCount === 0) return "surface";
      if (this.turnCount < 3) return "exploring";
      if (this.turnCount < 6) return "evaluating";
      return "deep";
    },
    hasPainPoint(pain) { return this.slots.painPoints.includes(pain); },
    getTopDesire() { return this.slots.desires[this.slots.desires.length - 1] || null; },
    getContextHints() {
      const hints = [];
      if (this.slots.trustLevel > 6) hints.push("trust_established");
      if (this.slots.painPoints.includes("manual_workload_pain")) hints.push("has_workload_pain");
      if (this.slots.painPoints.includes("lead_quality_issue")) hints.push("has_lead_quality_pain");
      if (this.slots.painPoints.includes("authenticity_concern") || this.slots.painPoints.includes("trust_concern")) hints.push("has_bot_fear");
      if (this.slots.painPoints.includes("price_hesitation")) hints.push("user_price_sensitive");
      if (this.slots.desires.includes("wants_to_buy")) hints.push("user_ready_now");
      if (this.slots.questionDepth >= 4) hints.push("deep_researcher");
      if (this.slots.painPoints.includes("user_frustrated")) hints.push("user_frustrated");
      return hints;
    },
  };

  /* ── §9b  USER PROFILE (localStorage persist) ───────────────── */
  const USER_PROFILE = {
    KEY: "aaa_user_v10",
    load() {
      try { return JSON.parse(localStorage.getItem(this.KEY) || "{}"); } catch(_) { return {}; }
    },
    save(p) {
      try { localStorage.setItem(this.KEY, JSON.stringify(p)); } catch(_) {}
    },
    update(profile, intent, entities, normInput) {
      if (entities && entities.plan) profile.lastPlanDiscussed = entities.plan;
      if (intent) {
        profile.intentHistory = profile.intentHistory || [];
        profile.intentHistory.push(intent);
        if (profile.intentHistory.length > 20) profile.intentHistory.shift();
        if (["contact","demo"].includes(intent)) profile.conversionStage = "ready";
        else if (["pricing","compare_plans"].includes(intent)) profile.conversionStage = profile.conversionStage || "considering";
        else if (!profile.conversionStage) profile.conversionStage = "interested";
      }
      if (/objection/.test(intent || "")) {
        profile.objections = profile.objections || [];
        if (!profile.objections.includes(intent)) profile.objections.push(intent);
      }
      this.save(profile);
    },
  };

  /* ── §9c  CONV_STATE + FULL SESSION PERSISTENCE ─────────────── */
  const CONV_STATE = {
    heat: 0, mood: "neutral", stage: "intro",
    topicThread: [], driftDetected: false,
    lastMessageTime: Date.now(),
    messageVelocity: 0,
    PERSIST_KEY: "aaa_conv_v10",

    load() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.PERSIST_KEY) || "{}");
        const ageHours = (Date.now() - (saved.ts || 0)) / 3600000;
        if (ageHours < 48 && saved.stage) {
          this.stage  = saved.stage;
          this.mood   = saved.mood || "neutral";
          this.heat   = Math.max(0, (saved.heat || 0) - 1); // decay slightly
          if (saved.lastIntent) MEM.lastIntent = saved.lastIntent;
          if (saved.lastPlan) MEM.lastPlan = saved.lastPlan;
          if (saved.painPoints) MEM.slots.painPoints = saved.painPoints;
          if (saved.trustLevel) MEM.slots.trustLevel = saved.trustLevel;
          if (saved.questionDepth) MEM.slots.questionDepth = saved.questionDepth;
        }
      } catch(_) {}
    },
    save() {
      try {
        localStorage.setItem(this.PERSIST_KEY, JSON.stringify({
          ts: Date.now(),
          stage: this.stage, mood: this.mood, heat: this.heat,
          lastIntent: MEM.lastIntent, lastPlan: MEM.lastPlan,
          painPoints: MEM.slots.painPoints,
          trustLevel: MEM.slots.trustLevel,
          questionDepth: MEM.slots.questionDepth,
        }));
      } catch(_) {}
    },

    bump(intent, energy, decomposition) {
      const now = Date.now();
      const timeSinceLast = (now - this.lastMessageTime) / 1000;
      this.lastMessageTime = now;
      this.messageVelocity = timeSinceLast < 15 ? 3 : timeSinceLast < 60 ? 1 : 0;

      if (energy === "high_energy" || energy === "frustrated") this.heat = Math.min(10, this.heat + 2);
      else if (energy === "terse") this.heat = Math.max(0, this.heat - 0.5);
      else this.heat = Math.min(10, this.heat + 1);
      if (this.messageVelocity === 3) this.heat = Math.min(10, this.heat + 1);

      if (decomposition) {
        const emo = decomposition.emotion;
        if (emo === "frustrated") this.mood = "frustrated";
        else if (emo === "excited") this.mood = "excited";
        else if (emo === "worried") this.mood = "skeptical";
        else if (emo === "thinking") this.mood = "curious";
        else if (decomposition.signals.includes("purchase_intent")) this.mood = "ready";
        else if (decomposition.signals.includes("proof_needed")) this.mood = "skeptical";
        else if (decomposition.signals.includes("price_hesitation")) this.mood = "skeptical";
      }

      const tc = MEM.turnCount;
      if (tc === 0) this.stage = "intro";
      else if (tc < 3) this.stage = "exploring";
      else if (tc < 6) this.stage = "evaluating";
      else if (this.mood === "ready" || MEM.slots.urgency === "now") this.stage = "deciding";
      else this.stage = "evaluating";

      if (intent && !["greeting","thanks"].includes(intent)) {
        if (this.topicThread.length > 0) {
          const last = this.topicThread[this.topicThread.length - 1];
          this.driftDetected = !this._sameFamily(last, intent) && this.topicThread.filter(t => t === last).length >= 2;
        }
        this.topicThread.push(intent);
        if (this.topicThread.length > 8) this.topicThread.shift();
      }

      this.save();
    },

    _sameFamily(a, b) {
      const families = [
        ["pricing","plan_free","plan_starter","plan_growth","plan_whatsapp","plan_combo","compare_plans","objection_expensive"],
        ["safety","human_feel","results","demo"],
        ["process","services","setup","tools","requirements"],
        ["contact","demo","cancel","revisions"],
        ["greeting","thanks","about"],
        ["objection_expensive","objection_time","objection_va","objection_unsure"],
      ];
      for (const f of families) if (f.includes(a) && f.includes(b)) return true;
      return a === b;
    },

    getToneMode() {
      if (this.mood === "frustrated") return "empathetic_calm";
      if (this.mood === "excited") return "match_energy";
      if (this.mood === "skeptical") return "prove_it";
      if (this.mood === "ready") return "action_focused";
      if (this.stage === "evaluating") return "detail_rich";
      if (this.stage === "deciding") return "close_focused";
      if (this.heat < 2) return "warm_intro";
      return "conversational";
    },

    getVerbosity() {
      if (this.mood === "frustrated") return "concise";
      if (this.stage === "intro") return "concise";
      if (this.stage === "evaluating") return "full";
      if (this.stage === "deciding") return "focused";
      return "normal";
    }
  };

  /* ── §9d  SESSION TRACKER ────────────────────────────────────── */
  const SESSION = {
    _ctaCount: 0, _urgencyCount: 0, _proofCount: 0, _turnCount: 0,
    _topic: null,

    // v10: Sales Pressure Budget
    BUDGETS: {
      cta:     2,   // max per stage (resets on stage change)
      urgency: 1,   // max per 5 turns
      proof:   1,   // max per 4 turns
    },

    bumpMessage() { this._turnCount++; },
    setTopic(t)   { this._topic = t; },
    ctaCount()    { return this._ctaCount; },
    urgencyCount(){ return this._urgencyCount; },
    proofCount()  { return this._proofCount; },
    trackCta()    { this._ctaCount++; },
    trackUrgency(){ this._urgencyCount++; },
    trackProof()  { this._proofCount++; },

    canShowCta()    { return this._ctaCount < this.BUDGETS.cta; },
    canShowUrgency(){ return this._urgencyCount < this.BUDGETS.urgency && this._turnCount % 5 < 2; },
    canShowProof()  { return this._proofCount < this.BUDGETS.proof && this._turnCount % 4 < 2; },

    // Reset budgets on buying signal
    resetBudgets() { this._ctaCount = 0; this._urgencyCount = 0; this._proofCount = 0; },
  };

  /* ── §9e  RESPONSE HISTORY (anti-repeat) ─────────────────────── */
  const RESPONSE_HISTORY = {
    hashes: [], MAX: 8,
    _fp(t) {
      let h = 5381;
      for (let i = 0; i < Math.min(t.length, 80); i++) h = ((h << 5) + h) ^ t.charCodeAt(i);
      return (h >>> 0).toString(36);
    },
    isDuplicate(t) { return this.hashes.includes(this._fp(t)); },
    register(t) {
      const fp = this._fp(t);
      if (!this.hashes.includes(fp)) {
        this.hashes.push(fp);
        if (this.hashes.length > this.MAX) this.hashes.shift();
      }
    },
  };

  /* ════════════════════════════════════════════════════════════
     §10  v10 RESPONSE FAMILY ENGINE
          — The core upgrade: full authored responses per intent × tone
          — Composer picks ONE; zero string concatenation
  ════════════════════════════════════════════════════════════ */

  // Each family has tone keys: calm | curious | skeptical | excited | frustrated | hinglish | default
  // Each tone has 3–5 complete, natural responses

  const RESPONSE_FAMILIES = {

    greeting: {
      new_user: [
        "Hey! 👋 Welcome to Ayush AI Automation.\n\nWe build Instagram and WhatsApp DM automation for fitness coaches — so your leads get instant replies, qualify themselves, and book calls with you, 24/7.\n\nWhat would you like to know?",
        "Hi there! 👋 Good to have you here.\n\nQuick intro: I help fitness coaches automate their DMs — so instead of replying to every inquiry manually, you get a system that qualifies leads and pushes serious ones to booking, on autopilot.\n\nWhat's on your mind?",
        "Hello! 🙌 You've found Ayush AI Automation.\n\nWe help fitness coaches turn DM conversations into booked calls — without the manual hustle. Instant replies, smart lead filtering, automatic follow-ups.\n\nWhat can I help you figure out?",
      ],
      returning_same_day: [
        "Welcome back! 👋 What else can I help you with?",
        "Hey, you're back! 👋 Pick up where we left off, or something new?",
      ],
      returning_recent: [
        "Good to see you again! 👋 Still thinking things through, or ready to move forward?",
        "Welcome back! 👋 Happy to go deeper on anything we discussed — or answer something new.",
      ],
      returning_with_plan: (planName, stage) => [
        `Welcome back! 👋 Last time you were looking at the ${planName} Plan. Still on your mind, or want to explore something else?`,
        `Hey, welcome back! 👋 You were checking out the ${planName} Plan — want to pick up from there?`,
      ],
      returning_with_objection: [
        "Welcome back! 👋 Did you get a chance to think things through? Happy to clear up any questions.",
        "Good to see you again! 👋 Still figuring things out — no rush. What's the main thing you'd like to sort out?",
      ],
    },

    pricing: {
      calm: [
        "Here's how the plans break down — simple version:\n\n🆓 Free Plan — ₹0/month\nPerfect for testing. Handles common DM questions, late-night replies, program info.\n\n🚀 Starter — ₹999/month (+ ₹1,999 setup)\nAdds lead tagging, qualification questions, and 1 follow-up.\n\n⭐ Growth — ₹1,499/month (+ ₹2,999 setup)  ← most popular\nFull automation: qualify, filter, book calls, multi-step follow-ups.\n\n💚 WhatsApp — ₹1,499/month (+ ₹2,499 setup)\nSame power but on WhatsApp — for coaches who get enquiries there.\n\n🔥 Combo — ₹2,498/month (+ ₹2,999 setup)\nInstagram + WhatsApp together. Complete lead machine.\n\nMost coaches start with Free, see how it runs, then decide.",
        "Pricing is pretty straightforward:\n\nFree Plan — ₹0. Starts working the moment it's live. No card needed.\n\nStarter at ₹999/month adds lead sorting and basic qualification — so you stop talking to people who aren't serious.\n\nGrowth at ₹1,499/month is the full system: automated follow-ups, booking funnels, comment-to-DM. This is where coaches see 2–3x more booked calls.\n\nWhatsApp Plan is ₹1,499/month if you work mainly on WhatsApp.\n\nCombo at ₹2,498/month covers both platforms end-to-end.\n\nWhich stage are you at right now?",
      ],
      hinglish: [
        "Yahan plans ka full breakdown hai:\n\n🆓 Free Plan — ₹0/month\nBilkul free. Common DMs handle karta hai automatically.\n\n🚀 Starter — ₹999/month\nLead tagging, qualification, 1 follow-up. Serious aur non-serious lead alag ho jate hain.\n\n⭐ Growth — ₹1,499/month ← sabse popular\nPura automation — qualify, follow-up, booking. DMs khud chalta hai.\n\n💚 WhatsApp — ₹1,499/month\nWhatsApp pe same system.\n\n🔥 Combo — ₹2,498/month\nDono platform ek saath.\n\nAap abhi kahan ho — Instagram pe zyada hain ya WhatsApp pe?",
        "Seedha bolta hun — plans kuch aise hain:\n\nFree wala ₹0 ka hai, ekdum no risk. Bas connect karo aur dekho kaise kaam karta hai.\n\nStarter ₹999/month mein aata hai — isse serious leads alag hone lagte hain.\n\nGrowth ₹1,499 mein hai — yeh full system hai, booking tak sab kuch.\n\nWhatsApp plan bhi ₹1,499 ka hai, aur Combo dono ke liye ₹2,498.\n\nAap ke liye konsa theek rahega?",
      ],
      skeptical: [
        "Fair to want the real numbers before deciding. Here they are:\n\nFree Plan — ₹0. No card, no commitment. Just connect and test.\n\nStarter — ₹999/month. That's less than ₹35/day. If it helps you close even 1 extra client a month, it's paid for itself 5x over.\n\nGrowth — ₹1,499/month. Coaches using this report 2–3x more booked calls. One female fitness coach went from ~5 to 15+ calls/week in 14 days.\n\nWhatsApp / Combo — ₹1,499 and ₹2,498.\n\nThere's also a 14-day guarantee — if traffic exists but zero leads come in, full system rebuild at no charge.\n\nWant me to show you which plan fits your situation?",
      ],
      excited: [
        "Great timing to ask about pricing! Here's the quick breakdown:\n\n🆓 FREE — ₹0, instant start, zero risk\n🚀 Starter — ₹999/month\n⭐ Growth — ₹1,499/month (this is the one coaches love)\n💚 WhatsApp — ₹1,499/month\n🔥 Combo — ₹2,498/month (full machine!)\n\nMost people just start free and see the results first. Want me to suggest the best fit for you?",
      ],
    },

    results: {
      calm: [
        "Honest answer — results vary by audience size and content quality. But here's what we consistently see:\n\nCoaches using the Growth Plan report 40–60% less time spent on manual DMs. Some go from spending 2–3 hours a day replying to checking a filtered inbox of serious leads only.\n\nOne coach in the fat-loss niche went from ~5 booked calls/week to 15+ in just 14 days. Another saved 15+ hours/week immediately after setup.\n\nAnd there's a 14-day guarantee: if traffic exists but zero leads come in, full system rebuild at no charge.\n\nWhat does your current situation look like — are you getting DMs but struggling to convert them?",
        "Can't promise exact numbers because it depends on your content and audience. But the pattern is consistent:\n\nCoaches stop spending 2+ hours a day on manual replies. Serious leads get automatically separated from time-wasters. Booked calls increase without posting more.\n\n📊 One coach: 3x booked calls in 14 days. Another: 15+ hours/week saved in month one.\n\nAnd the 14-day guarantee has your back if traffic exists but results don't show.",
      ],
      skeptical: [
        "Fair to want real proof, not just promises. Here's what actually happened:\n\nA female fitness coach in the fat-loss niche went from roughly 5 booked calls a week to over 15 — within 14 days. No extra posting, no extra spend. Just better DM handling.\n\nAn online muscle-gain coach was spending 2–3 hours daily on manual replies. After setup: that dropped to checking a pre-qualified inbox. 15+ hours recovered per week.\n\nThere's also a guarantee: if traffic exists and zero leads come in within 14 days, the system gets fully rebuilt at no charge.\n\nThe best way to see if it works for your page is a 10-minute live demo — you experience it exactly the way your leads would.",
      ],
      hinglish: [
        "Sach bolunga — results depend karte hain aapke audience size aur content pe. Lekin pattern consistent hai:\n\nEk fitness coach ne 14 din mein 5 calls/week se 15+ calls/week kar li. Koi extra posting nahi ki.\n\nDusre coach ne 2–3 ghante roz reply karna chhor diya — ab bas serious leads ka inbox dekha karo.\n\nAur guarantee bhi hai: 14 din mein agar traffic hai aur leads nahi aate, toh pura system rebuild free mein.\n\nAap ke DMs abhi kaisa chal raha hai?",
      ],
      frustrated: [
        "I hear you — wanting to know if this actually works before spending money is completely reasonable.\n\nReal coaches, real results: one went from 5 to 15+ booked calls in 14 days. Another saved 15+ hours/week starting from week one. Both without posting more or changing anything else.\n\nAnd there's a 14-day guarantee. If it doesn't work, full rebuild at no charge.\n\nI'd rather show you than just tell you — a 10-minute demo would make it concrete. Want me to share the link?",
      ],
    },

    safety: {
      calm: [
        "This is the right thing to ask before trusting any system. Here's the complete picture:\n\nIt uses ManyChat — Instagram and Meta's official partner. Over 1 million businesses worldwide use it. No password sharing — connected via official OAuth only.\n\nThe bot only ever replies when someone messages you first. No spam. No bulk outreach. No unsolicited DMs. Zero ban risk — every message is compliant with Instagram's policies.\n\nYou also get to see everything before it goes live. You review the flows, approve the messages, and control what gets sent. Nothing runs without your sign-off.\n\nWant to see the demo so you can verify it yourself?",
        "Short answer: completely safe. Longer answer:\n\nManyChat is Meta's official messaging partner — used by 1M+ businesses. We connect via OAuth (no password ever). The system only replies to people who message you first — no spam, no bulk messages, nothing that risks your account.\n\nYou see exactly what the bot says before it runs. Full approval process. Full control.\n\nYour account is safer with this setup than with most manual reply patterns.",
      ],
      hinglish: [
        "Yeh concern bilkul sahi hai — account ka khayal rakhna zaroori hai.\n\nManyChat use karta hai system — yeh Meta (Instagram) ka official partner hai. 10 lakh se zyada businesses worldwide use karte hain.\n\nPassword? Bilkul nahi share karna padega. Sirf OAuth se connect hoga — official secure connection.\n\nBot sirf tab reply karta hai jab koi aapko message kare pehle. Koi spam nahi, koi bulk message nahi, account ban ka koi risk nahi.\n\nSab kuch aap approve karte ho pehle — phir live hota hai. Aapka pura control.\n\nDemo mein aap khud dekh sakte ho kaise kaam karta hai.",
      ],
      skeptical: [
        "Smart to be skeptical — this is your business account. Let me be very direct:\n\nManyChat is Instagram's official business messaging partner. It's not some grey-area tool. 1 million+ businesses use it daily without issues.\n\nConnection is via official Meta OAuth — no passwords, no screen access, nothing insecure.\n\nThe system only replies when someone messages you. It never initiates conversations, never sends bulk messages. Every reply follows Instagram's policies.\n\nAnd you see everything before it runs. Full approval. No surprises.\n\nThe best way to be 100% sure is to experience the demo — you'll see exactly what your leads see.",
      ],
    },

    human_feel: {
      calm: [
        "This is honestly the most common concern — and it's a completely valid one.\n\nHere's how the system handles it: every reply is built around what the person actually said. It's not copy-pasting templates — it responds based on the specific message, the goal they mentioned, their language, their timing.\n\nCoaches consistently report that their leads engage naturally without any suspicion. The conversations feel personal because they're contextually built, not robotic broadcasts.\n\nThe best way to see this isn't me explaining it — it's a 10-minute demo where you experience exactly what your leads would. Want the link?",
        "The fear of sounding robotic is real — it's actually what the entire system is designed around.\n\nReplies adapt to what each person says. If someone asks about fat loss in Hinglish, the reply matches. If someone sounds enthusiastic, the tone reflects that. It's not one-size-fits-all responses.\n\nFitness coaches using it say their leads genuinely can't tell it's automated. The conversations feel warm, relevant, and real.\n\nA demo would make this concrete — you'd see it exactly as your leads do.",
      ],
      hinglish: [
        "Yeh concern sahi hai — bot jaisa lagga toh lead toot sakta hai.\n\nIs system mein har reply us specific message ke hisaab se hoti hai joh lead ne bheja. Generic copy-paste nahi. Agar koi Hinglish mein puchhe, toh reply bhi uss register mein hoga.\n\nCoaches bolta hain unke leads ko pata hi nahi chalta ki automation hai — itna natural feel karta hai.\n\nSabse best way demo hai — aap khud experience karo jaise aapka lead karega. 10 minute, zero pressure.",
      ],
      skeptical: [
        "Fair doubt. Most chatbots do feel robotic — that's exactly what this system was built to avoid.\n\nEvery response adapts to what the specific person said. Goal, timeline, language, tone — the reply shifts accordingly. It's not template broadcasting.\n\nThe proof isn't in my description — it's in experiencing it. A 10-minute live demo where you message the bot as your lead would. You'll know immediately if it feels natural.",
      ],
    },

    objection_expensive: {
      calm: [
        "Makes total sense to think about the investment carefully.\n\nHere's the real calculation: if your coaching program is ₹10,000–₹30,000, you need to close just 1 extra client per month to cover the cost entirely. Most coaches close 2–3 extra clients in month one — so the system pays for itself multiple times over.\n\nAnd there's the Free Plan at ₹0 — no cost, no card, no risk. You can test the full system working on your page before spending anything.\n\nWant to start there and see the results first?",
        "Let me put this in perspective rather than just defending the price.\n\nThe Starter Plan is ₹999/month — that's ₹33/day. If you're charging ₹10,000 or more for coaching, recovering that cost takes less than a conversation with a single new client.\n\nMost coaches who track this report getting 2–4 extra clients in the first month. After that, it's pure profit.\n\nBut if the price is still a concern, the Free Plan is genuinely ₹0. You see results first, then decide.",
      ],
      hinglish: [
        "Bilkul samajh sakta hun — invest karne se pehle sochna chahiye.\n\nEk simple calculation: agar aapka coaching program ₹10,000 ka hai, toh ek extra client per month se Starter Plan ka cost cover ho jaata hai. Zyada coaches pehle mahine mein hi 2–3 extra clients close karte hain.\n\nAur Free Plan toh bilkul ₹0 ka hai — koi card nahi, koi risk nahi. Pehle dekho kaise kaam karta hai, phir decide karo.\n\nKya Free Plan se shuru karna theek lagega?",
      ],
      skeptical: [
        "You're right to question the price — let me give you the honest version.\n\nThe question isn't 'is ₹999/month expensive?' — it's 'does it pay for itself?' And the numbers are clear: if you close even 1 extra client per month who pays ₹10,000+, the system has a 10x return.\n\nCoaches using the Growth Plan report 2–3x more booked calls. That's not marketing — it's what they said after 30 days.\n\nAnd if you're not ready to spend yet, start with the Free Plan. ₹0. No card. See it working on your page first.",
      ],
    },

    objection_unsure: {
      calm: [
        "That's completely fair — and honestly, it's the right approach.\n\nHere's what I'd suggest: start with the Free Plan. It's ₹0, no card needed. You connect it, see exactly how it handles your incoming DMs, and experience the system working on your actual page.\n\nFrom there, the decision becomes concrete — not based on what I tell you, but on what you've seen yourself. Most coaches feel fully confident after 1–2 days of seeing it run.\n\nWant me to walk you through what the Free Plan setup looks like?",
        "Taking time to decide is the right move when it's your business. No pressure from my end.\n\nIf it helps: the Free Plan removes all financial risk. You test the actual system on your page, see how leads respond, and decide from a position of real information — not promises.\n\nWhat's the main thing you're trying to figure out? I can help you think through it.",
      ],
      hinglish: [
        "Bilkul sahi hai — apne aap se ek baar test karke dekhna chahiye.\n\nFree Plan try karo — ₹0, koi card nahi, koi commitment nahi. Apne page pe lagao, dekho kaise leads handle hote hain. Phir decide karo.\n\nZyada coaches ek-do din mein hi confident ho jate hain — kyunki khud dekh lete hain kaam karta hai.\n\nKoi specific doubt hai jo clear karna hai?",
      ],
    },

    objection_time: {
      calm: [
        "Completely understand — no pressure at all.\n\nOne thing worth keeping in mind: every DM that goes unanswered while you're busy is a potential client who moved on. The system handles those automatically — so you don't lose leads during your busy periods.\n\nWhenever you're ready, even the Free Plan takes less than an hour to set up and activate. Happy to help when the timing works for you.",
      ],
      hinglish: [
        "Theek hai, koi rush nahi.\n\nBas ek baat — jab aap busy hote ho tab jo DMs miss hote hain, woh potential clients hain jo chale jaate hain. Automation exactly wahan kaam karta hai — aapke inbox ko handle karta hai jab aap available nahi hote.\n\nJab bhi aapko theek lage, shuru karne mein zyada time nahi lagta. Hoon yahan.",
      ],
    },

    objection_va: {
      calm: [
        "A human assistant is a real option — let me give you the honest comparison.\n\nA VA can typically handle 50–100 DMs per day, works set hours, and costs ₹8,000–₹15,000/month minimum. The automation handles unlimited DMs, runs 24/7, responds in seconds, and costs less than most coaching clients pay in a single session.\n\nThe key difference: a VA decides whether to reply. The automation ensures every single DM gets an instant, intelligent response — and only surfaces the serious ones to you.\n\nMost coaches keep both — VA for complex conversations, automation for everything else. But many find the automation handles 80% without any human needed.",
      ],
    },

    process: {
      calm: [
        "Here's how it works, start to finish:\n\n1️⃣ Audit — we look at your current DMs, lead quality, and what's being missed\n2️⃣ Build — the full flow is custom-built for your coaching style and offer\n3️⃣ Review — you approve every message before anything goes live\n4️⃣ Launch — system goes live on your page\n5️⃣ Optimise — monthly improvements based on what's working\n\nTimeline: Instagram automation is live in 24–72 hours. WhatsApp or Combo takes 48–72 hours.\n\nYou don't need to manage it after setup — it runs on its own.",
        "The build process is pretty hands-off for you:\n\nWe start with an audit of your current setup — what messages you're getting, what's being missed. Then we build the complete flow, custom to your coaching style.\n\nYou review and approve everything before it goes live. After launch, it runs on its own. Monthly optimisation included.\n\nMost coaches are live within 48–72 hours of onboarding.",
      ],
      hinglish: [
        "Kaise kaam karta hai — step by step:\n\n1️⃣ Audit — aapke current DMs aur leads dekh ke samajhte hain\n2️⃣ Build — aapke coaching style ke hisaab se flow banate hain\n3️⃣ Review — aap approve karte ho har message\n4️⃣ Launch — live ho jata hai\n5️⃣ Optimise — monthly improvements\n\nTimeline: Instagram 24–72 hours. WhatsApp ya Combo 48–72 hours.\n\nSetup ke baad aapko kuch manage nahi karna — khud hi chalta rehta hai.",
      ],
    },

    contact: {
      calm: [
        "Here's how to reach us directly:\n\n📱 WhatsApp: +91 94772 93867\n📧 Email: ayushtrades54@gmail.com\n📅 Free 15-min strategy call — book directly on the site\n\nWhatsApp is usually the fastest. Most people get a response within a few hours.",
        "Easiest way is WhatsApp — +91 94772 93867. Just send a message and we'll get back quickly.\n\nOr if you prefer email: ayushtrades54@gmail.com\n\nYou can also book a free 15-min call if you want to talk through your specific setup before deciding.",
      ],
    },

    demo: {
      calm: [
        "Yes — full live demo before any commitment. 🎥\n\nYou'll see the actual conversation your leads would experience — how it greets them, asks qualifying questions, filters serious interest, and moves toward booking. Interactive, not a slideshow.\n\nTakes 10–15 minutes. No sales pressure.\n\n📱 Request via WhatsApp: +91 94772 93867",
        "The demo shows you exactly what your leads see — so you can decide based on the actual experience, not just a description.\n\nYou message the bot as a lead would. It qualifies you, adapts to your responses, and you see the full flow in real time.\n\n⏱️ 10–15 minutes. Zero obligation.\n\nWhatsApp +91 94772 93867 to get the demo link.",
      ],
    },

    services: {
      calm: [
        "Here's the full system — everything it handles:\n\n⚡ Instagram DM Automation\nInstant replies, lead qualification, booking funnel — all in your DMs.\n\n⚡ WhatsApp Automation\nSame intelligence on WhatsApp — qualify leads, filter serious buyers.\n\n⚡ Comment-to-DM\nSomeone comments on your post or reel → they get a DM → qualifying starts.\n\n⚡ Story Reply Automation\nEvery story reaction captured and converted into a lead conversation.\n\n⚡ Follow-Up & Re-Engagement\nTimed reminders at 1 hour, 24 hours, 3 days when leads go silent.\n\n⚡ Booking Funnel\nOnly pre-qualified leads get your calendar link.\n\nEvery piece connects — from first DM to booked call. Fully automated.",
      ],
      hinglish: [
        "Pura system kuch aise kaam karta hai:\n\n⚡ Instagram DM Automation\nInstant reply, lead qualify, booking — sab automatically.\n\n⚡ WhatsApp Automation\nWhatsApp pe bhi same — serious leads filter hote hain.\n\n⚡ Comment-to-DM\nKoi comment kare post pe → DM jaata hai → qualifying shuru.\n\n⚡ Story Reply\nHar story reaction ek potential lead ban sakta hai.\n\n⚡ Follow-Up System\n1 ghanta, 24 ghante, 3 din — silent leads ko automatically message.\n\n⚡ Booking Funnel\nSirf serious leads ko aapka calendar link milta hai.\n\nSab ek connected system — pehle DM se booking tak.",
      ],
    },

    setup: {
      calm: [
        "Setup is fast and low-effort on your side:\n\n⏱️ Instagram: 24–72 hours\n⏱️ WhatsApp or Combo: 48–72 hours\n\nWhat you need to provide: Instagram OAuth access (no password — official secure connection), flow approval, and payment. We handle everything else — building, testing, launching.\n\nAfter that, zero daily management needed.",
        "Timeline: most coaches are live within 48–72 hours of onboarding.\n\nYou grant Instagram access via official OAuth — no password sharing, completely secure. You review and approve the flows. We build and launch.\n\nOnce live, it runs on its own. Your job: talk to the pre-qualified leads it surfaces.",
      ],
    },

    about: {
      calm: [
        "Ayush AI Automation is a done-for-you DM automation agency built specifically for fitness coaches.\n\nFounded by Ayush — who has deep experience in AI-driven lead systems. The mission is simple: help fitness professionals convert DM conversations into booked calls without manual effort.\n\nEvery system is custom-built for the coach's specific offer, audience, and style. This isn't a plug-and-play template — it's built around how you actually communicate.",
      ],
    },

    tools: {
      calm: [
        "The system runs on ManyChat — Instagram and Meta's official business messaging partner. Trusted by 1M+ businesses worldwide.\n\nData is tracked and organised in Google Sheets — so you see lead flow, conversion rates, and drop-off points clearly.\n\nNo exotic tech, no custom software to maintain. ManyChat handles the automation layer. We handle the strategy and build.",
      ],
    },

    compare_plans: {
      calm: [
        "Here's a quick way to think about which plan fits:\n\n🆓 Free Plan — just starting, want to test automation risk-free\n🚀 Starter — getting DMs but spending too much time sorting them\n⭐ Growth — want leads to qualify themselves and book calls automatically\n💚 WhatsApp — your main enquiries come on WhatsApp\n🔥 Combo — want both platforms fully automated\n\nMost coaches start Free, see it working, then upgrade to Growth when they're ready to scale.\n\nWhat's your current situation — where do most of your leads come from?",
        "Simple decision guide:\n\nIf you're just testing: Free Plan.\nIf you're getting DMs but losing track of who's serious: Starter.\nIf you want DMs to fully run themselves — qualify, follow up, book: Growth.\nIf WhatsApp is your main channel: WhatsApp Plan.\nIf you want both platforms automated: Combo.\n\nWhat does your setup look like right now?",
      ],
      hinglish: [
        "Konsa plan lena hai — iska simple guide:\n\n🆓 Free — bas dekhna hai kaise kaam karta hai, koi risk nahi\n🚀 Starter — leads aa rahe hain but sorting mein time jata hai\n⭐ Growth — pura automation chahiye, booking tak\n💚 WhatsApp — enquiries WhatsApp pe aate hain\n🔥 Combo — dono platform ek saath\n\nZyada coaches Free se shuru karte hain, phir Growth pe switch karte hain jab results aate hain.\n\nAap ke leads mainly kahan se aate hain?",
      ],
    },

    both_platforms: {
      calm: [
        "Yes — the Combo Plan covers both Instagram and WhatsApp in one connected system.\n\nInstagram DMs → automatic replies, lead qualification, booking funnel\nWhatsApp enquiries → qualify, filter, route to call\nDM-to-WhatsApp handover → leads who engage on Instagram can be moved to WhatsApp automatically\n\n₹2,498/month (+ ₹2,999 one-time setup). Less than buying both plans separately.\n\nBuilt for coaches who are active on both platforms and don't want leads slipping through either.",
      ],
    },

    thanks: [
      "Happy to help! 👍 Anything else you'd like to know?",
      "Of course! Let me know if anything else comes up.",
      "Glad that was clear! 😊 Feel free to ask anything else.",
      "No problem at all. What else can I help with?",
    ],

    cancel: [
      "You can cancel any paid plan at any time — no lock-in, no penalty. Just let us know and it stops at the next billing cycle. The Free Plan has no billing at all.",
    ],

    revisions: [
      "Yes — revisions are included in all active paid plans. If a message isn't converting well or you want to change the tone, we adjust it. Monthly optimisation sessions are also part of paid plans.",
    ],

    requirements: [
      "Here's what you need to provide:\n\n✅ Instagram OAuth access — official secure connection, no password sharing\n✅ Approval of the flow/messages before launch\n✅ Payment\n\nFor WhatsApp automation: your WhatsApp Business number.\n\nThat's it. We build everything else.",
    ],

    human_feel_short: [
      "The system adapts to what each person actually says — not template blasting. Leads consistently engage without suspecting automation.\n\nBest way to verify: 10-minute demo. You'll experience it exactly as your leads would.",
    ],
  };

  /* ── OBJECTION RESPONSE FAMILIES ─────────────────────────── */
  const OBJECTION_FAMILIES = {
    objection_expensive: RESPONSE_FAMILIES.objection_expensive,
    objection_time: RESPONSE_FAMILIES.objection_time,
    objection_va: RESPONSE_FAMILIES.objection_va,
    objection_unsure: RESPONSE_FAMILIES.objection_unsure,
  };

  /* ════════════════════════════════════════════════════════════
     §11  RESPONSE COMPOSER
          — Selects ONE full response from correct family + tone
          — Zero string concatenation
  ════════════════════════════════════════════════════════════ */

  function composeResponse(intent, toneMode, sourceLanguage, profile, entities) {
    const family = RESPONSE_FAMILIES[intent];
    if (!family) return null;

    // Determine register priority
    const langKey = sourceLanguage === "hinglish" ? "hinglish" : null;
    const toneKey = toneMode.replace("_calm","").replace("match_energy","excited").replace("prove_it","skeptical").replace("action_focused","excited").replace("detail_rich","calm").replace("close_focused","calm").replace("warm_intro","calm").replace("conversational","calm");

    // Try: language-specific → tone-specific → default
    let candidates = null;
    if (langKey && family[langKey] && family[langKey].length) candidates = family[langKey];
    else if (family[toneKey] && family[toneKey].length) candidates = family[toneKey];
    else if (family.calm && family.calm.length) candidates = family.calm;
    else if (Array.isArray(family)) candidates = family;

    if (!candidates || !candidates.length) return null;

    // Anti-repeat: filter out recently used
    const filtered = candidates.filter(r => !RESPONSE_HISTORY.isDuplicate(typeof r === "function" ? "fn" : r));
    const pool = filtered.length > 0 ? filtered : candidates;

    const selected = typeof pool[0] === "function" ? pool[0](profile.lastPlanDiscussed, CONV_STATE.stage) : pick(pool);
    if (Array.isArray(selected)) return pick(selected);
    return selected;
  }

  /* ════════════════════════════════════════════════════════════
     §12  GREETING BUILDER (returning user intelligence)
  ════════════════════════════════════════════════════════════ */

  function buildSmartGreeting() {
    const profile = USER_PROFILE.load();
    const isReturn = (profile.visitCount || 0) > 1;
    const fam = RESPONSE_FAMILIES.greeting;

    if (!isReturn) {
      return R(pick(fam.new_user));
    }

    const daysSince = Math.floor((Date.now() - (profile.lastSeen || Date.now())) / 86400000);

    // Returning with active objection
    if (profile.objections && profile.objections.length > 0 && CONV_STATE.stage !== "intro") {
      return R(pick(fam.returning_with_objection));
    }

    // Returning same session (< 1 day) with plan context
    if (daysSince < 1 && profile.lastPlanDiscussed && profile.conversionStage === "considering") {
      const planName = profile.lastPlanDiscussed.charAt(0).toUpperCase() + profile.lastPlanDiscussed.slice(1);
      const variants = fam.returning_with_plan(planName, CONV_STATE.stage);
      return R(pick(variants));
    }

    if (daysSince < 1) return R(pick(fam.returning_same_day));
    return R(pick(fam.returning_recent));
  }

  /* ════════════════════════════════════════════════════════════
     §13  PLAN DETAIL BUILDER (data-driven, natural language)
  ════════════════════════════════════════════════════════════ */

  const PLAN_IDX = { free:0, starter:1, growth:2, whatsapp:3, combo:4 };

  function getPlan(key) {
    const plans = D().plans || [];
    const i = PLAN_IDX[key];
    return (i !== undefined) ? (plans[i] || null) : null;
  }

  function buildPlanDetail(planKey, sourceLanguage, toneMode) {
    const plan = getPlan(planKey);
    if (!plan) return buildPricingFull(sourceLanguage, toneMode);

    const featList = (plan.features || []).map(f => "✅ " + f).join("\n");
    const limitList = (plan.limitations || []).length
      ? "\n\nNot included:\n" + plan.limitations.map(l => "• " + l).join("\n")
      : "";
    const popular = plan.popular ? "This is the most popular plan.\n\n" : "";
    const stage = MEM.getDepthStage();
    let proofLine = "";
    if (stage === "evaluating") {
      const cs = D().case_studies || [];
      if (cs.length && SESSION.canShowProof()) {
        proofLine = `\n\n${cs[0].proof_line}`;
        SESSION.trackProof();
      }
    }

    const text = popular + plan.name + "\n\n" +
      plan.price + " · Setup: " + plan.price_alt + "\n\n" +
      "Best for: " + plan.best_for + "\n\n" +
      featList + limitList +
      (plan.note ? "\n\n" + plan.note : "") +
      proofLine;

    return R(text, "https://ayushaiautomation.in/pricing.html", "See Full Plan");
  }

  /* ════════════════════════════════════════════════════════════
     §14  PRICING OVERVIEW BUILDER (natural, tone-aware)
  ════════════════════════════════════════════════════════════ */

  function buildPricingFull(sourceLanguage, toneMode) {
    const toneKey = toneMode === "prove_it" ? "skeptical"
                  : (sourceLanguage === "hinglish") ? "hinglish"
                  : toneMode === "match_energy" ? "excited"
                  : "calm";

    const family = RESPONSE_FAMILIES.pricing;
    const candidates = family[toneKey] || family.calm;
    const text = pick(candidates);
    return R(text, "https://ayushaiautomation.in/pricing.html", "View Full Pricing");
  }

  /* ════════════════════════════════════════════════════════════
     §15  SMART FALLBACK (v10: Partial Intent Salvage first)
  ════════════════════════════════════════════════════════════ */

  function buildSmartFallback(normInput, rawInput, clusterScores, sourceLanguage) {

    // STEP 1: Partial Intent Salvage — if any cluster ≥ 0.8, reflect that theme
    if (clusterScores && Object.keys(clusterScores).length > 0) {
      const sorted = Object.entries(clusterScores).sort((a,b) => b[1]-a[1]);
      const [topCluster, topScore] = sorted[0];
      if (topScore >= 0.8) {
        const themeReflections = {
          price_concern: "Aap pricing ke baare mein pooch rahe ho ya specific plan ke baare mein?",
          trust_concern: "Lag raha hai aap account safety ke baare mein soch rahe ho — kya main yeh clear kar sakta hun?",
          results_interest: "Aap results aur proof ke baare mein pooch rahe ho — ya specifically koi coach ka case study dekhna hai?",
          time_pain: "Sounds like manual replying is the main issue — want me to explain exactly how that gets solved?",
          automation_curiosity: "Aap samajhna chahte ho ki system kaisa kaam karta hai — ya specific feature ke baare mein?",
          lead_quality: "Lead quality ke baare mein pooch rahe ho — serious leads filter karna ya follow-up system?",
          buying_signal: "You seem ready to move forward — want to get started or see the demo first?",
          authenticity_fear: "Aap automation ke natural feel ke baare mein pooch rahe ho ya leads ko pata chalega kya?",
          demo_interest: "Aap demo dekhna chahte ho — live experience ya just explanation?",
          comparison_mode: "Aap plans compare karna chahte ho — ya ek specific plan ke baare mein?",
        };
        const reflection = themeReflections[topCluster];
        if (reflection) return R(reflection);
      }
    }

    // STEP 2: Unknown script
    const hasUnknownChars = /[\u0900-\u097f\u0600-\u06ff]/i.test(rawInput);
    if (hasUnknownChars) {
      return R("I understand English, Hindi in Roman script, and Hinglish best. Try something like \"price kya hai\" or \"how does it work\" — happy to help!");
    }

    // STEP 3: Context-aware clarification (use what we know)
    if (MEM.turnCount > 0 && MEM.lastIntent) {
      const topicLabel = MEM.lastIntent.replace(/_/g," ");
      if (sourceLanguage === "hinglish") {
        return R(`Aap ${topicLabel} ke baare mein pooch rahe the — kya usi pe aur detail chahiye, ya kuch aur?`);
      }
      return R(`You were asking about ${topicLabel} — did you want more detail on that, or something different?`);
    }

    // STEP 4: Zero-signal genuine fallback (varied)
    const FALLBACKS = [
      "Not quite sure what you meant — could you rephrase? Happy to help with pricing, how it works, safety, demo, or getting started.",
      "Hmm, I didn't quite catch that. You can ask me about pricing, plans, how the system works, safety, or how to get started.",
      sourceLanguage === "hinglish"
        ? "Samajh nahi aaya — thoda aur detail do? Pricing, plans, safety, demo — kisi bhi topic pe help kar sakta hun."
        : "Could you be a bit more specific? I can cover pricing, how the system works, safety, features, or setting up.",
    ];
    return R(pick(FALLBACKS));
  }

  /* ════════════════════════════════════════════════════════════
     §16  SALES PRESSURE BUDGET SYSTEM (v10)
          — CTAs, urgency, social proof only when budget allows
          — No appending to existing responses — SEPARATE fields
  ════════════════════════════════════════════════════════════ */

  function shouldAddCta(intent, toneMode, hints) {
    if (!SESSION.canShowCta()) return false;
    if (["greeting","thanks","cancel","revisions"].includes(intent)) return false;
    if (toneMode === "empathetic_calm" && MEM.turnCount < 3) return false;
    if (hints.includes("user_price_sensitive") && SESSION.ctaCount() >= 1) return false;
    return true;
  }

  function selectCta(hints) {
    if (hints.includes("user_ready_now")) return "Ready to start? We can have it live in 48 hours.";
    if (hints.includes("user_price_sensitive")) return "You can start with the Free Plan — ₹0, no card needed.";
    if (hints.includes("has_bot_fear")) return "10-minute demo shows you exactly what your leads experience. Want the link?";
    if (hints.includes("has_workload_pain")) return "Want to see exactly how much time this frees up for you?";
    if (hints.includes("has_lead_quality_pain")) return "Want to see how the qualification system filters out time-wasters?";
    if (hints.includes("deep_researcher")) return "Want me to map this specifically for your coaching setup?";
    const variants = D().cta_variants || ["Want to see how this works for your page?"];
    return pick(variants);
  }

  /* ════════════════════════════════════════════════════════════
     §17  CONTEXTUAL FLOAT BUTTON LOGIC (v10)
          — Exported signal used by chat.html deliverResponse
  ════════════════════════════════════════════════════════════ */

  function shouldShowFloatButtons(intent, turnCount) {
    // Show only in relevant contexts — never on every message
    const showAfterIntents = ["pricing","plan_free","plan_starter","plan_growth","plan_whatsapp","plan_combo","compare_plans","results","demo","contact","human_feel","both_platforms"];
    if (showAfterIntents.includes(intent)) return true;
    if (turnCount >= 5) return true;
    return false;
  }

  function shouldShowGetStarted(intent, hints) {
    // Only show "Get Started" when trust is established or intent is clear
    if (hints.includes("user_ready_now")) return true;
    if (hints.includes("trust_established") && MEM.turnCount >= 4) return true;
    if (intent === "contact" || intent === "demo") return true;
    return false;
  }

  /* ════════════════════════════════════════════════════════════
     §18  COMPLEXITY-AWARE DELAY ENGINE (v10)
  ════════════════════════════════════════════════════════════ */

  const INTENT_COMPLEXITY = {
    greeting: "simple", thanks: "simple", pricing: "simple",
    plan_free: "simple", plan_starter: "simple", plan_growth: "simple",
    plan_whatsapp: "simple", plan_combo: "simple",
    setup: "simple", tools: "simple", contact: "simple",
    requirements: "simple", cancel: "simple", revisions: "simple",
    results: "complex", safety: "complex", human_feel: "complex",
    objection_expensive: "complex", objection_unsure: "complex",
    objection_va: "complex", objection_time: "medium",
    process: "medium", services: "medium", about: "medium",
    compare_plans: "medium", demo: "medium",
    both_platforms: "medium",
  };

  function smartDelay(responseText, intent, segmentRole) {
    // v10: complexity-based, not length-based
    const complexity = INTENT_COMPLEXITY[intent] || "medium";
    const role = segmentRole || "main";

    const baseByComplexity = { simple: 650, medium: 1100, complex: 1600 };
    const baseByRole = { ack: 300, main: 0, followup: 250 };
    const jitter = (Math.random() - 0.5) * 400; // ±200ms

    let base = baseByComplexity[complexity] + baseByRole[role];
    return Math.max(400, Math.min(base + jitter, 2400));
  }

  /* ════════════════════════════════════════════════════════════
     §19  PER-SEGMENT SEMANTIC ROLES (v10 bubble pacing)
  ════════════════════════════════════════════════════════════ */

  function intelligentSplit(text) {
    const paras = text.split(/\n\n+/);
    if (paras.length <= 1) return [{ text, role: "main" }];

    const result = [];
    let buffer = "";
    for (const p of paras) {
      const bufWords  = buffer.split(/\s+/).length;
      const paraWords = p.split(/\s+/).length;
      if (bufWords + paraWords > 42 && buffer.trim()) {
        result.push(buffer.trim());
        buffer = p;
      } else {
        buffer += (buffer ? "\n\n" : "") + p;
      }
    }
    if (buffer.trim()) result.push(buffer.trim());

    // Assign semantic roles
    return result.filter(s => s.length > 0).map((seg, i, arr) => {
      let role = "main";
      if (i === 0 && /^(Heard|Totally|Fair|I hear|Aap ka|Bilkul|Of course|Happy)/i.test(seg)) role = "ack";
      else if (i === arr.length - 1 && seg.length < 80) role = "followup";
      return { text: seg, role };
    });
  }

  /* ════════════════════════════════════════════════════════════
     §20  HESITATION ENGINE (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  function shouldHesitate() { return Math.random() < 0.07 && MEM.turnCount > 2; }
  const HESITATION_LINES = [
    "Actually — let me be more specific:",
    "Wait, better way to put it:",
    "Let me clarify that:",
    "More precise answer:",
  ];
  function getHesitationLine() { return pick(HESITATION_LINES); }

  /* ════════════════════════════════════════════════════════════
     §21  RE-ENGAGEMENT (preserved + improved)
  ════════════════════════════════════════════════════════════ */
  function buildReengagement() {
    const hints = MEM.getContextHints();
    const profile = USER_PROFILE.load();
    if (hints.includes("user_price_sensitive")) return "Quick reminder — the Free Plan is completely ₹0. No card, nothing to lose. Want to see what's included?";
    if (hints.includes("has_bot_fear")) return "Still unsure about the feel? The demo shows you exactly what your leads experience. 10 minutes, zero pressure — want the link?";
    if (hints.includes("has_workload_pain")) return "You mentioned the manual reply workload — that's something we can fix in 48 hours. Want to see how?";
    if (hints.includes("has_lead_quality_pain")) return "Still thinking about lead quality? The qualification system is literally built for that problem.";
    if (profile.conversionStage === "considering") return "Still here? 😊 Happy to answer anything before you decide — what's the main question?";
    return "Still exploring? Happy to dig into anything — pricing, safety, how it works, or getting started.";
  }

  /* ════════════════════════════════════════════════════════════
     §22  FAQ SYSTEM (preserved from v9)
  ════════════════════════════════════════════════════════════ */
  const FAQ_REGISTRY = {
    faq_dm_setup:           { text:"DM Automation Setup builds automatic replies inside your Instagram DMs — you stop typing the same message 50 times a day. You only talk to people ready to work with you.", link:"https://ayushaiautomation.in/process.html", cta:"See Setup" },
    faq_lead_qualification: { text:"Lead Qualification asks smart questions (goal, timeline, budget) and tags each lead — serious buyers get your booking link, browsers get a nurture sequence.", link:"https://ayushaiautomation.in/process.html", cta:"See Qualification" },
    faq_followup_auto:      { text:"Follow-up Automation sends timed reminders — 1 hour, 24 hours, 3 days — when a lead goes silent. Eliminates 40–60% of potential lost clients.", link:"https://ayushaiautomation.in/services.html", cta:"View Follow-up" },
    faq_comment_dm:         { text:"Comment-to-DM: someone comments on your post → they get a DM automatically → qualifying conversation starts. Your content becomes a 24/7 lead machine.", link:"https://ayushaiautomation.in/services.html", cta:"View Feature" },
    faq_booking_funnel:     { text:"The Booking Funnel routes only qualified, serious leads to your calendar. Every call you take is with someone already interested.", link:"https://ayushaiautomation.in/book.html", cta:"Book Free Call" },
    faq_manychat_sub:       { text:"Paid plans need a separate ManyChat subscription. Agency fee = building your system. ManyChat = keeping it running 24/7. Free Plan does NOT need paid ManyChat.", link:"https://ayushaiautomation.in/pricing.html", cta:"View Pricing" },
    faq_no_daily_manage:    { text:"Zero daily management after setup. It replies, qualifies, follows up automatically. Your only job: respond to pre-qualified leads it surfaces.", link:"https://ayushaiautomation.in/process.html", cta:"See Process" },
    faq_support:            { text:"Support via WhatsApp (+91 94772 93867) and email anytime. Paid plans include monthly optimisation sessions and revisions.", link:"https://ayushaiautomation.in/book.html", cta:"Book Free Call" },
  };

  function getFaq(key)   { return FAQ_REGISTRY[key] || null; }
  function getTopFaqs(n) { return Object.keys(FAQ_REGISTRY).slice(0, n || 10); }

  function matchFaq(normInput) {
    const faqs = D().faqs;
    if (!faqs) return null;
    const tokens = lemTokens(normInput);
    const grams  = allGrams(tokens);
    let best = null, bestScore = 0;
    for (const faq of faqs) {
      let score = overlap(grams, faq.keywords || []);
      for (const kw of (faq.keywords || []))
        for (const tok of tokens)
          if (fuzzyScore(tok, kw) >= 0.84) { score += 0.4; break; }
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    return bestScore >= 1.5 ? best : null;
  }

  /* ════════════════════════════════════════════════════════════
     §23  INTENT ROUTER (v10: uses Response Family Engine)
  ════════════════════════════════════════════════════════════ */

  function route(intentId, plan, toneMode, sourceLanguage, profile) {
    const c = D().contact || {};
    const links = {
      pricing:   { link:"https://ayushaiautomation.in/pricing.html", cta:"View Full Pricing" },
      demo:      { link: c.demo || "https://ayushaiautomation.in/demo.html", cta:"Request Live Demo" },
      contact:   { link: "https://ayushaiautomation.in/book.html", cta:"Book Free Call" },
      results:   { link:"https://ayushaiautomation.in/demo.html", cta:"See Proof & Results" },
      process:   { link:"https://ayushaiautomation.in/process.html", cta:"See Full Process" },
      services:  { link:"https://ayushaiautomation.in/services.html", cta:"Explore Services" },
      safety:    { link:"https://ayushaiautomation.in/demo.html", cta:"See Live Demo" },
    };

    let text = null;
    let linkData = null;

    switch(intentId) {
      case "greeting":
        return buildSmartGreeting();

      case "thanks":
        text = Array.isArray(RESPONSE_FAMILIES.thanks) ? pick(RESPONSE_FAMILIES.thanks) : RESPONSE_FAMILIES.thanks;
        return R(text);

      case "pricing":
        if (plan) return buildPlanDetail(plan, sourceLanguage, toneMode);
        return buildPricingFull(sourceLanguage, toneMode);

      case "plan_free":     return buildPlanDetail("free", sourceLanguage, toneMode);
      case "plan_starter":  return buildPlanDetail("starter", sourceLanguage, toneMode);
      case "plan_growth":   return buildPlanDetail("growth", sourceLanguage, toneMode);
      case "plan_whatsapp": return buildPlanDetail("whatsapp", sourceLanguage, toneMode);
      case "plan_combo":    return buildPlanDetail("combo", sourceLanguage, toneMode);

      case "compare_plans":
        text = composeResponse("compare_plans", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("compare_plans", "calm", "en", profile, {});
        return R(text, links.pricing.link, links.pricing.cta);

      case "services":
        text = composeResponse("services", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("services", "calm", "en", profile, {});
        return R(text, links.services.link, links.services.cta);

      case "process":
        text = composeResponse("process", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("process", "calm", "en", profile, {});
        return R(text, links.process.link, links.process.cta);

      case "results":
        text = composeResponse("results", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("results", "calm", "en", profile, {});
        return R(text, links.results.link, links.results.cta);

      case "safety":
        text = composeResponse("safety", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("safety", "calm", "en", profile, {});
        return R(text, links.safety.link, links.safety.cta);

      case "setup":
        text = composeResponse("setup", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("setup", "calm", "en", profile, {});
        return R(text, links.process.link, links.process.cta);

      case "demo":
        text = composeResponse("demo", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("demo", "calm", "en", profile, {});
        return R(text, links.demo.link, links.demo.cta);

      case "contact":
        text = composeResponse("contact", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("contact", "calm", "en", profile, {});
        return R(text, links.contact.link, links.contact.cta);

      case "tools":
        text = composeResponse("tools", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("tools", "calm", "en", profile, {});
        return R(text);

      case "about":
        text = composeResponse("about", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("about", "calm", "en", profile, {});
        return R(text);

      case "human_feel":
        text = composeResponse("human_feel", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("human_feel", "calm", "en", profile, {});
        return R(text, links.demo.link, links.demo.cta);

      case "both_platforms":
        text = composeResponse("both_platforms", toneMode, sourceLanguage, profile, {});
        if (!text) text = composeResponse("both_platforms", "calm", "en", profile, {});
        return R(text, links.pricing.link, links.pricing.cta);

      case "objection_expensive":
      case "objection_time":
      case "objection_va":
      case "objection_unsure": {
        const fam = RESPONSE_FAMILIES[intentId];
        if (fam) {
          const langKey = sourceLanguage === "hinglish" ? "hinglish" : null;
          const toneKey = toneMode.includes("calm") ? "calm" : toneMode.includes("skeptical") || toneMode === "prove_it" ? "skeptical" : "calm";
          const cands = (langKey && fam[langKey]) || fam[toneKey] || fam.calm || (Array.isArray(fam) ? fam : []);
          if (cands && cands.length) text = pick(cands);
        }
        return text ? R(text) : null;
      }

      case "cancel":
        text = Array.isArray(RESPONSE_FAMILIES.cancel) ? pick(RESPONSE_FAMILIES.cancel) : RESPONSE_FAMILIES.cancel;
        return R(text);

      case "revisions":
        text = Array.isArray(RESPONSE_FAMILIES.revisions) ? pick(RESPONSE_FAMILIES.revisions) : RESPONSE_FAMILIES.revisions;
        return R(text);

      case "requirements":
        text = Array.isArray(RESPONSE_FAMILIES.requirements) ? pick(RESPONSE_FAMILIES.requirements) : RESPONSE_FAMILIES.requirements;
        return R(text, links.process.link, links.process.cta);

      default:
        return null;
    }
  }

  /* ════════════════════════════════════════════════════════════
     §24  CONTEXT RESOLVER (preserved from v9)
  ════════════════════════════════════════════════════════════ */

  function resolveWithContext(topIntents, entities, normInput) {
    const topId  = topIntents[0]?.id;
    const nerPlan = entities.plan;

    if ((topId === "pricing" || entities.hasPriceSignal) && MEM.lastPlan && !nerPlan)
      return { intent:"pricing", plan:MEM.lastPlan };

    if ((topId === "services" || topId === "process") && MEM.lastPlan && !nerPlan &&
        /feature|include|what|tell me more|detail/i.test(normInput))
      return { intent:"plan_"+MEM.lastPlan, plan:MEM.lastPlan };

    if (!topId && MEM.lastIntent)
      return { intent:MEM.lastIntent, plan:MEM.resolvePlan(nerPlan) };

    const topDesire = MEM.getTopDesire();
    if (!topId && topDesire) {
      const desireToIntent = {
        wants_to_buy:"contact", wants_proof:"results", wants_demo:"demo",
        wants_better_leads:"services", wants_time_back:"services",
        wants_affordable_option:"objection_expensive", wants_reassurance:"safety",
        wants_natural_bot:"human_feel",
      };
      const di = desireToIntent[topDesire];
      if (di) return { intent:di, plan:MEM.resolvePlan(nerPlan) };
    }

    return { intent:topId||null, plan:MEM.resolvePlan(nerPlan)||entities.plan };
  }

  /* ════════════════════════════════════════════════════════════
     §25  NAME EXTRACTION (preserved from v9)
  ════════════════════════════════════════════════════════════ */

  function extractName(input) {
    const patterns = [
      /i[' ]?m\s+([A-Z][a-z]{2,14})\b/i,
      /my name is\s+([A-Z][a-z]{2,14})\b/i,
      /this is\s+([A-Z][a-z]{2,14})\b/i,
      /call me\s+([A-Z][a-z]{2,14})\b/i,
      /naam\s+(?:mera|hai|kya)?\s*([A-Z][a-z]{2,14})\b/i,
    ];
    for (const re of patterns) {
      const m = input.match(re);
      if (m && m[1]) {
        const reserved = ["The","Its","This","That","Here","There","Then","When","What","Which"];
        if (!reserved.includes(m[1])) return m[1];
      }
    }
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §26  FOLLOW-UP QUESTIONS (contextual, not robotic)
  ════════════════════════════════════════════════════════════ */

  const FOLLOW_UPS = {
    pricing: [
      "Which stage are you at — just starting, or already getting DMs regularly?",
      "Are you mainly on Instagram, WhatsApp, or both?",
      "What does your current setup look like — getting leads but struggling to convert?",
    ],
    process: ["Want to see what the actual qualifying conversation looks like?"],
    safety: ["Want a live demo? You'd experience it exactly as your leads would."],
    results: ["What's your current lead situation — DMs coming in but not converting to calls?"],
    services: ["Which matters more to you right now — Instagram DMs or WhatsApp?"],
    demo: ["Should I send the demo link directly?"],
    compare_plans: ["What's your main goal — save time, get more calls, or both?"],
    human_feel: ["Have you seen AI-automated DMs before? I can share what the conversation actually looks like."],
    objection_expensive: ["What's your current monthly spend on lead generation — even if just in time?"],
    objection_unsure: ["What's the main thing holding you back — pricing, safety, or seeing it work first?"],
  };

  function getFollowUp(intent, conversionStage) {
    if (conversionStage === "ready") return null;
    const opts = FOLLOW_UPS[intent];
    if (!opts) return null;
    if (Math.random() > 0.65) return null;
    return pick(opts);
  }

  /* ════════════════════════════════════════════════════════════
     §27  MAIN ENTRY  getResponse(rawInput)
          v10 full pipeline
  ════════════════════════════════════════════════════════════ */

  function getResponse(rawInput) {
    if (!rawInput || !rawInput.trim())
      return Object.assign(R("Didn't catch that — type your question and I'll help! 😊"), { showButtons: false });

    // ── Source Language Detection (v10 NEW) ──────────────────
    const sourceLanguage = detectSourceLanguage(rawInput);

    // ── LAYER 1: Normalization ────────────────────────────────
    const normInput = normalizeText(rawInput);
    const entities  = NER.extract(normInput);

    // ── Load + update profile ─────────────────────────────────
    const profile = USER_PROFILE.load();
    const extractedName = extractName(rawInput);
    if (extractedName && !profile.name) { profile.name = extractedName; USER_PROFILE.save(profile); }
    USER_PROFILE.update(profile, null, entities, normInput);

    // ── LAYER 6: Grammar ──────────────────────────────────────
    const grammar = classifyInput(normInput, rawInput);

    // ── LAYER 7: Hindi Signals ────────────────────────────────
    const hindiSignals = extractHindiSignals(normInput);

    // ── LAYER 4: Decomposition ────────────────────────────────
    const decomposition = decomposeSentence(rawInput, normInput);
    if (hindiSignals.length) decomposition.signals.push(...hindiSignals);

    // ── LAYER 3: Semantic Clusters ────────────────────────────
    const clusterScores = getSemanticScores(normInput);
    const clusterBoosts = getClusterBoosts(clusterScores);

    // ── LAYER 2: Phrase Patterns ──────────────────────────────
    const phraseMatches = matchPhrasePatterns(normInput, rawInput);
    const phraseBoosts  = phraseMatches.intent_boosts;

    // ── Energy Detection ──────────────────────────────────────
    const energy = detectUserEnergy(rawInput);

    SESSION.bumpMessage();

    // ── CONV_STATE Update ─────────────────────────────────────
    CONV_STATE.bump(null, energy, decomposition);
    const toneMode = CONV_STATE.getToneMode();

    // ── Score Intents ─────────────────────────────────────────
    const topIntents = scoreIntents(normInput, phraseBoosts, clusterBoosts);
    const { intent, plan } = resolveWithContext(topIntents, entities, normInput);

    MEM.push(intent, plan || entities.plan, entities, normInput, decomposition);
    USER_PROFILE.update(profile, intent, entities, normInput);
    SESSION.setTopic(intent);
    CONV_STATE.bump(intent, energy, decomposition);

    // ── Reset sales budget on buying signal ───────────────────
    if (decomposition.signals.includes("purchase_intent")) SESSION.resetBudgets();

    const hints = MEM.getContextHints();

    // ── Price signal fast-path ────────────────────────────────
    if (entities.hasPriceSignal && !intent) {
      const resp = entities.plan ? buildPlanDetail(entities.plan, sourceLanguage, toneMode) : buildPricingFull(sourceLanguage, toneMode);
      MEM.push("pricing", entities.plan, entities, normInput, decomposition);
      const segments = intelligentSplit(resp.text);
      RESPONSE_HISTORY.register(resp.text);
      resp.segments = segments;
      resp.showButtons = shouldShowFloatButtons("pricing", MEM.turnCount);
      resp.showGetStarted = shouldShowGetStarted("pricing", hints);
      resp.followUp = getFollowUp("pricing", profile.conversionStage);
      return resp;
    }

    // ── Primary intent routing ────────────────────────────────
    if (intent) {
      let resp = route(intent, plan, toneMode, sourceLanguage, profile);

      if (resp) {
        // Anti-repeat
        if (RESPONSE_HISTORY.isDuplicate(resp.text)) {
          const alts = ["Here's another angle on this: ", "Worth adding: ", "To be more specific — "];
          resp.text = pick(alts) + resp.text;
        }
        RESPONSE_HISTORY.register(resp.text);

        // Segment + roles
        resp.segments = intelligentSplit(resp.text);
        resp.followUp = getFollowUp(intent, profile.conversionStage);

        // v10 contextual CTA (separate field, not appended to text)
        if (shouldAddCta(intent, toneMode, hints)) {
          resp.ctaLine = selectCta(hints);
          SESSION.trackCta();
        }

        resp.showButtons = shouldShowFloatButtons(intent, MEM.turnCount);
        resp.showGetStarted = shouldShowGetStarted(intent, hints);
        resp.intent = intent;
        resp.complexity = INTENT_COMPLEXITY[intent] || "medium";
        resp.sourceLanguage = sourceLanguage;

        return resp;
      }
    }

    // ── FAQ match ─────────────────────────────────────────────
    const faq = matchFaq(normInput);
    if (faq) {
      const resp = R(faq.answer, faq.link, faq.cta);
      resp.segments = intelligentSplit(resp.text);
      resp.showButtons = false;
      RESPONSE_HISTORY.register(resp.text);
      return resp;
    }

    // ── Partial salvage ───────────────────────────────────────
    if (topIntents.length > 0) {
      const salvageResp = route(topIntents[0].id, plan, toneMode, sourceLanguage, profile);
      if (salvageResp) {
        salvageResp.segments = intelligentSplit(salvageResp.text);
        salvageResp.showButtons = false;
        RESPONSE_HISTORY.register(salvageResp.text);
        return salvageResp;
      }
    }

    // ── Smart Fallback ────────────────────────────────────────
    const fallback = buildSmartFallback(normInput, rawInput, clusterScores, sourceLanguage);
    fallback.showButtons = false;
    fallback.segments = [{ text: fallback.text, role: "main" }];
    return fallback;
  }

  /* ════════════════════════════════════════════════════════════
     §28  ENERGY DETECTION (preserved from v9)
  ════════════════════════════════════════════════════════════ */

  function detectUserEnergy(rawInput) {
    const excl = (rawInput.match(/!/g) || []).length;
    const caps = (rawInput.match(/[A-Z]/g) || []).length / Math.max(rawInput.length, 1);
    const words = rawInput.split(/\s+/).length;
    const q = (rawInput.match(/\?/g) || []).length;
    const frustrated = /thak|tired|exhaust|bore|ugh|argh/i.test(rawInput);
    const excited = /amazing|love|wow|great|nice|zabardast|mast/i.test(rawInput);

    if (frustrated) return "frustrated";
    if (excited || excl >= 2 || caps > 0.4) return "high_energy";
    if (words <= 3 && q === 0) return "terse";
    if (words >= 20) return "detailed";
    return "normal";
  }

  /* ════════════════════════════════════════════════════════════
     §29  INIT
  ════════════════════════════════════════════════════════════ */

  function init() {
    buildIdf(INTENTS);

    // Load persisted CONV_STATE for returning users
    CONV_STATE.load();

    const d = D();
    if (!d || !d.plans) {
      console.warn("[CHATBOT v10] ⚠️ AGENCY_DATA missing — check script load order.");
    } else {
      console.log("[CHATBOT v10] ✅ Ready. Response Family Engine active. Sales budget system online. Source language detection live.");
    }

    try {
      const profile = USER_PROFILE.load();
      profile.visitCount = (profile.visitCount || 0) + 1;
      profile.lastSeen   = Date.now();
      if (!profile.firstSeen) profile.firstSeen = Date.now();
      profile.objections = profile.objections || [];
      USER_PROFILE.save(profile);
    } catch(_) {}

    return Promise.resolve();
  }

  /* ════════════════════════════════════════════════════════════
     §30  PUBLIC API
  ════════════════════════════════════════════════════════════ */

  global.CHATBOT = {
    init,
    getResponse,
    process: getResponse,
    getFaq,
    getTopFaqs,
    smartDelay,
    intelligentSplit,
    shouldHesitate,
    getHesitationLine,
    buildReengagement,
    getUserProfile: () => USER_PROFILE.load(),
    shouldShowFloatButtons,
    shouldShowGetStarted,
    INTENT_COMPLEXITY,
  };

})(typeof window !== "undefined" ? window : global);
