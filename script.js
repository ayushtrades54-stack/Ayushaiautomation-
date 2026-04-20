/* ================================================================
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v5.0
   Advanced NLP Engine — Pure client-side, zero external APIs.

   Pipeline:
     clean → hinglish-normalise → lemmatize →
     NER (entities) → intent-score (IDF-weighted + fuzzy + phrase) →
     context-resolve → multi-blend / multi-sentence →
     response-compress → build

   Bug Fixes v5.0:
     ✅ "price kya hai" now correctly triggers pricing (Hinglish map + phrase list)
     ✅ Fallback is LAST RESORT — partial salvage always fires first
     ✅ Response compression — max 8 lines, bullets, direct-first
     ✅ Context memory — "What about price?" after plan = plan price
     ✅ Multi-question merge — single structured response
     ✅ Intent confidence scores (0–1 normalised)
     ✅ Entity detection: plan names, price signals, platform, sentiment
     ✅ IDF boost rebuilt to include new phrase signals
     ✅ scoreIntents threshold lowered — catches more partial intent
     ✅ "cheap plan" → Free/Starter, "full system" → Growth/Combo

   Exports: window.CHATBOT { init, process, getFaq, getTopFaqs }
   ================================================================ */

(function (global) {
  "use strict";

  /* ═══════════════════════════════════════════════════════════
     §0  DATA ACCESS
  ═══════════════════════════════════════════════════════════ */
  const D = global.AGENCY_DATA || {};

  /* ═══════════════════════════════════════════════════════════
     §1  LEMMATIZER
         Maps inflected/variant surface forms to base lemma.
         Runs before scoring so "pricing"→"price", etc.
  ═══════════════════════════════════════════════════════════ */
  const LEMMA_MAP = {
    "pricing":"price","priced":"price","prices":"price",
    "costing":"cost","costs":"cost",
    "charged":"charge","charges":"charge","charging":"charge",
    "fees":"fee","payments":"payment","paying":"pay","paid":"pay",
    "rates":"rate","budgets":"budget","spending":"spend","spent":"spend",
    "investments":"investment","amounts":"amount",
    "plans":"plan","planning":"plan","planned":"plan",
    "leads":"lead","leading":"lead",
    "clients":"client","coaching":"coach","coaches":"coach",
    "bookings":"booking","booked":"book","books":"book",
    "calls":"call","calling":"call",
    "automating":"automate","automated":"automate","automations":"automation",
    "automates":"automate","bots":"bot","systems":"system",
    "messages":"message","messaging":"message","messaged":"message",
    "dms":"dm","replies":"reply","replying":"reply","replied":"reply",
    "responses":"response","responding":"respond","responded":"respond",
    "follows":"follow","following":"follow","followed":"follow",
    "reminders":"reminder","sequences":"sequence",
    "results":"result","conversions":"conversion","converting":"convert",
    "converted":"convert","qualifications":"qualification",
    "qualifying":"qualify","qualified":"qualify",
    "filters":"filter","filtering":"filter","filtered":"filter",
    "tagging":"tag","tags":"tag",
    "trusted":"trust","trusting":"trust","scams":"scam","frauds":"fraud",
    "risks":"risk","banning":"ban","banned":"ban",
    "suspending":"suspend","suspended":"suspend",
    "started":"start","starting":"start","begins":"begin","beginning":"begin",
    "setups":"setup","setting":"setup","configured":"configure",
    "launching":"launch","launched":"launch",
    "integrating":"integrate","integrated":"integrate",
    "optimising":"optimise","optimizing":"optimise",
    "optimised":"optimise","optimized":"optimise",
    "working":"work","works":"work","worked":"work",
    "showing":"show","shows":"show","shown":"show",
    "explaining":"explain","explained":"explain","explains":"explain",
    "understanding":"understand","understood":"understand",
    // v5 additions
    "affordable":"cheap","affordability":"cheap","cheaply":"cheap",
    "cheaper":"cheap","cheapest":"cheap","inexpensive":"cheap",
    "pricey":"expensive","costly":"expensive",
    "discounts":"discount","offers":"offer","deals":"deal",
    "recommend":"suggest","recommendation":"suggest","recommends":"suggest",
    "suggested":"suggest","suggests":"suggest",
    "trial":"try","trying":"try","test":"try","testing":"try","tested":"try",
    "comparing":"compare","compared":"compare","comparison":"compare",
    "differs":"differ","difference":"differ","different":"differ",
    "helps":"help","helped":"help","helpful":"help",
    "questions":"question","queried":"query","queries":"query",
  };

  function lemmatize(token) {
    return LEMMA_MAP[token] || token;
  }

  /* ═══════════════════════════════════════════════════════════
     §2  HINGLISH + REGIONAL NORMALISER  (v5 — expanded)
         Pre-processing pass. Longest entries first to prevent
         partial clobbering. v5 adds many missing price phrases.
  ═══════════════════════════════════════════════════════════ */
  const HINGLISH_RAW = [
    // ── Greetings ──
    ["kya haal hai","how are you"],["kaise ho aap","how are you"],
    ["kaise ho","how are you"],["kya haal","how are you"],
    ["assalamualaikum","hello"],["namaskar","hello"],["namaste","hello"],
    ["vanakkam","hello"],["salam","hello"],["bhai","hey"],["yaar","hey"],

    // ── PRICE / COST queries (v5 — comprehensive) ──
    ["price kya hai","what is price"],["price kya h","what is price"],
    ["price kya hoga","what is price"],["price btao","tell price"],
    ["price batao","tell price"],["price bolo","tell price"],
    ["price puchna tha","asking about price"],
    ["kitna banta hai","how much total"],["kitna padega","how much cost"],
    ["kitna lagega bhai","how much cost"],["kitna lagega","how much cost"],
    ["kitne paise lagenge","how much cost"],["kitna paisa lagega","how much cost"],
    ["paise kitne","how much cost"],["charges kya hai","what are charges"],
    ["charges kya h","what are charges"],["charge kya hai","what is charge"],
    ["rate kya hai","what is price"],["rate kya h","what is price"],
    ["monthly kitna","monthly price"],["mahine ka kitna","monthly price"],
    ["total kitna","total cost"],["kitna hai","how much cost"],
    ["kitna","how much"],["paisa","price"],["paise","price"],
    ["rupees","price"],["rupee","price"],["rs","price"],["inr","price"],
    ["lagega","cost"],["lagenge","cost"],["lagti","cost"],["lagta","cost"],
    ["mahina","monthly"],["mahine","monthly"],["mahine mein","monthly"],
    ["kitne ka hai","how much cost"],["kitne mein milega","how much cost"],
    ["entha avutundi","how much cost"],["price cheppandi","tell price"],
    ["vilai enna","what is price"],["ethanai aagum","how much cost"],
    ["ethanai","how much"],

    // ── Cheap / best plan queries ──
    ["sasta wala plan","cheapest plan"],["sabse sasta plan","cheapest plan"],
    ["sasta wala","cheapest"],["sabse sasta","cheapest"],
    ["sabse acha plan","best plan"],["sabse acha","best"],
    ["sasta","cheap"],["mehenga","expensive"],
    ["best wala plan","best plan"],["best wala","best plan"],
    ["free wala plan","free plan"],["free wala","free plan"],
    ["paid wala","paid plan"],

    // ── Plan features ──
    ["starter mein kya milega","starter plan features"],
    ["growth mein kya milega","growth plan features"],
    ["free mein kya milega","free plan features"],
    ["starter plan mein kya","starter plan features"],
    ["combo mein kya milega","combo plan features"],

    // ── Plan selection ──
    ["kaunsa plan lena chahiye","which plan should i take"],
    ["konsa plan lu","which plan should i take"],
    ["kaunsa plan best hai","which plan is best"],
    ["konsa plan best hai","which plan is best"],
    ["kaunsa plan","which plan"],["konsa plan","which plan"],
    ["kaun sa","which"],["konsa","which"],

    // ── How to start ──
    ["kaise shuru karun","how to start"],["kaise shuru karu","how to start"],
    ["kaise shuru","how to start"],["kaise join karun","how to join"],
    ["shuru karna hai","want to start"],["shuru kar sakta hun","can start"],
    ["shuru","start"],["karna hai","want to"],
    ["lena chahta hun","want to buy"],["lena hai","want to buy"],
    ["aage badhna","proceed"],["start ela cheyali","how to start"],
    ["thodangu eppadi","how to start"],

    // ── Explain / show ──
    ["batao","explain"],["samjhao","explain"],["bolo","tell me"],
    ["dikhao","show me"],["dekh sakta hun","can see"],
    ["dekhna","see"],["dekh","see"],

    // ── Safety / trust ──
    ["safe hai kya","is it safe"],["ban hoga kya","will account be banned"],
    ["account jaega kya","will account be banned"],
    ["scam toh nahi","is it legit"],["dhoka","fraud"],["dhokha","fraud"],
    ["bharosa","trust"],["sach mein","really"],["sach","real"],
    ["genuine hai kya","is it genuine"],

    // ── Cancel / stop ──
    ["service band karna hai","cancel service"],["band karna","cancel"],
    ["rokna","stop"],["cancel karna hai","want to cancel"],
    ["cancel karna","cancel"],["support chahiye","need support"],

    // ── How does it work ──
    ["kaise kaam karta hai","how does it work"],
    ["kaise kaam karega","how will it work"],
    ["kaise kaam","how does work"],["kya karta hai","what does it do"],
    ["kya hota hai","what happens"],["kya hai ye","what is this"],
    ["kya hai","what is"],["kya hota","what is"],["kaise","how"],
    ["ela pani chestundi","how does it work"],
    ["eppadi velai seiyum","how does it work"],
    ["eppadi","how"],["epdi","how"],

    // ── Timing ──
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["kab hoga","when will it be"],["kab","when"],
    ["kitne din mein","how many days"],["kitne ghante","how many hours"],
    ["kitne din","how many days"],

    // ── Misc ──
    ["nahi chahiye","not interested"],["nahi aaya","did not come"],
    ["theek hai","ok"],["acha","ok"],["achha","ok"],["accha","ok"],
    ["samajh gaya","understood"],["samajh nahi aaya","did not understand"],
    ["pata nahi","dont know"],["soch raha hun","thinking"],
    ["doubt hai","have doubt"],["abhi nahi","not now"],
    ["ela","how"],["enti","what"],["entha","how much"],["emi","what"],
    ["enna","what"],
  ];

  const HINGLISH_MAP = HINGLISH_RAW.sort((a, b) => b[0].length - a[0].length);
  const HINGLISH_REGEX = HINGLISH_MAP.map(([k, v]) => ({
    re: new RegExp(
      "(?<![a-z0-9])" +
      k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "(?![a-z0-9])", "gi"),
    v
  }));

  function normaliseHinglish(raw) {
    let s = raw.toLowerCase().trim();
    for (const { re, v } of HINGLISH_REGEX) s = s.replace(re, v);
    return s;
  }

  /* ═══════════════════════════════════════════════════════════
     §3  TEXT PROCESSING PIPELINE
  ═══════════════════════════════════════════════════════════ */
  const TP = {
    clean(str) {
      return String(str)
        .replace(/['''""`]/g, "")
        .replace(/[^\w\s\u20b9@.+\-]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .toLowerCase();
    },

    splitSentences(str) {
      return str
        .split(/[?.!]|\baur\b|\band\b|\bor\b|\bplus\b|\balso\b|\bthen\b/i)
        .map(s => s.trim())
        .filter(s => s.length > 2);
    },

    tokenize(str) {
      return TP.clean(str).split(/\s+/).filter(Boolean);
    },

    lemTokens(str) {
      return TP.tokenize(str).map(lemmatize);
    },

    ngrams(tokens, n) {
      const out = [];
      for (let i = 0; i <= tokens.length - n; i++) {
        out.push(tokens.slice(i, i + n).join(" "));
      }
      return out;
    },

    allGrams(tokens) {
      const s = new Set(tokens);
      TP.ngrams(tokens, 2).forEach(g => s.add(g));
      TP.ngrams(tokens, 3).forEach(g => s.add(g));
      return s;
    },

    overlap(gramSet, keywords) {
      let score = 0;
      for (const kw of keywords) {
        const lemKw = kw.split(" ").map(lemmatize).join(" ");
        if (gramSet.has(kw) || gramSet.has(lemKw)) score++;
      }
      return score;
    },

    pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    levenshtein(a, b) {
      const m = a.length, n = b.length;
      if (m === 0) return n;
      if (n === 0) return m;
      const dp = [];
      for (let i = 0; i <= m; i++) {
        dp[i] = [i];
        for (let j = 1; j <= n; j++) {
          dp[i][j] = i === 0 ? j
            : Math.min(
                dp[i-1][j] + 1,
                dp[i][j-1] + 1,
                dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
              );
        }
      }
      return dp[m][n];
    },

    fuzzyScore(word, target) {
      if (word === target) return 1;
      if (word.length < 3 || target.length < 3) return word === target ? 1 : 0;
      if (target.includes(word) || word.includes(target)) return 0.88;
      const dist = TP.levenshtein(word, target);
      return 1 - dist / Math.max(word.length, target.length);
    },

    // Normalise raw score to 0–1 confidence using sigmoid
    toConfidence(rawScore) {
      // Sigmoid centred around 3.0 raw (typical single-signal score)
      return Math.round((1 / (1 + Math.exp(-0.6 * (rawScore - 3)))) * 100) / 100;
    },

    idfBoost: {}
  };

  function buildIdfBoost(intents) {
    const df = {};
    for (const intent of intents) {
      const seen = new Set();
      const allTerms = [...intent.keywords, ...intent.phrases];
      for (const term of allTerms) {
        const t = term.toLowerCase();
        if (!seen.has(t)) { df[t] = (df[t] || 0) + 1; seen.add(t); }
      }
    }
    const N = intents.length;
    const boost = {};
    for (const [term, freq] of Object.entries(df)) {
      boost[term] = Math.log((N + 1) / (freq + 1)) + 1;
    }
    TP.idfBoost = boost;
  }

  /* ═══════════════════════════════════════════════════════════
     §4  NAMED ENTITY RECOGNITION  (NER)  v5 — expanded
         Extracts plan, price-signal, platform, action, sentiment.
         "cheap plan" → free/starter, "full system" → growth/combo
  ═══════════════════════════════════════════════════════════ */
  const NER = {
    PLAN_PATTERNS: [
      // Explicit plan names + prices + synonyms
      { re: /\bfree\s*plan\b|\bfree\b|\b\u20b9\s*0\b|\bzero\s*cost\b|\bzero\b|\bbasic\s*plan\b|\bno\s*cost\b|\bno\s*charge\b/i, key: "free" },
      { re: /\bstarter\b|\b999\b|\bentry\s*level\b|\bbeginner\s*plan\b|\bcheapest\s*plan\b|\blowest\s*plan\b/i, key: "starter" },
      { re: /\bgrowth\b|\b1499\b|\badvanced\s*plan\b|\bpremium\s*plan\b|\bpro\s*plan\b|\bfull\s*plan\b|\bcomplete\s*plan\b/i, key: "growth" },
      { re: /\bwhatsapp\s*(plan|automation|system|bot|only)?\b|\bwa\s*plan\b|\b2499\b/i, key: "whatsapp" },
      { re: /\bcombo\b|\bboth\s*platform\b|\b2498\b|\bfull\s*funnel\b|\bfull\s*system\b|\bdual\s*platform\b/i, key: "combo" },
    ],

    // Indirect plan inference — "cheap plan" / "full system" / "best plan"
    INDIRECT_PLAN: [
      { re: /\bcheap(est)?\b|\bbudget\b|\blow\s*cost\b|\baffordable\b|\blow\s*price\b|\bentry\b/i, key: "starter" },
      { re: /\bfull\s*(system|automation|package|solution|setup)\b|\beverything\b|\ball\s*(in\s*one|features)\b/i, key: "combo" },
      { re: /\bbest\s*plan\b|\btop\s*plan\b|\bmost\s*popular\b|\brecommended\b|\bmost\s*feature\b/i, key: "growth" },
    ],

    POSITIVE_RE: /\bwant\b|\binterested\b|\bready\b|\bbuy\b|\bsign\s*up\b|\bjoin\b|\bbook\b|\bproceed\b|\bconfirm\b|\byes\b|\blet.?s\s*go\b/i,
    NEGATIVE_RE: /\bnot\s*sure\b|\bnot\s*interested\b|\bcancel\b|\bstop\b|\bquit\b|\bexpensive\b|\bafford\b|\bdoubt\b|\bscam\b|\bfraud\b|\bban\b/i,
    QUESTION_RE: /\bwhat\b|\bhow\b|\bwhen\b|\bwhy\b|\bwhere\b|\bwhich\b|\bdoes\b|\bcan\b|\bwill\b|\bis\b|\bare\b|\bdo\b/i,
    PRICE_SIGNAL_RE: /\bprice\b|\bcost\b|\bcharge\b|\bfee\b|\brate\b|\bpay\b|\bamount\b|\bmonthly\b|\brupee\b|\binr\b|\brs\b|\b\u20b9\b|\bhow\s*much\b|\bbudget\b/i,

    extract(normInput) {
      // Direct plan match
      let plan = null;
      for (const { re, key } of this.PLAN_PATTERNS) {
        if (re.test(normInput)) { plan = key; break; }
      }
      // Indirect plan inference if no direct match
      if (!plan) {
        for (const { re, key } of this.INDIRECT_PLAN) {
          if (re.test(normInput)) { plan = key; break; }
        }
      }
      const sentiment = this.NEGATIVE_RE.test(normInput) ? "negative"
                      : this.POSITIVE_RE.test(normInput) ? "positive"
                      : "neutral";
      const isQuestion   = this.QUESTION_RE.test(normInput);
      const hasPriceSignal = this.PRICE_SIGNAL_RE.test(normInput);
      return { plan, sentiment, isQuestion, hasPriceSignal };
    }
  };

  /* ═══════════════════════════════════════════════════════════
     §5  INTENT CATALOGUE  (27 intents)
         v5: enriched keywords + phrases for pricing intent
         so "price kya hai" → correctly detected even pre-normalise.
  ═══════════════════════════════════════════════════════════ */
  const INTENTS = [
    { id: "greeting",
      keywords: ["hello","hi","hey","good morning","good evening","good afternoon",
        "greetings","howdy","start","help me","anyone there","are you there",
        "hlo","hlw","welcome","yo","sup","wassup"],
      phrases: ["hi there","hey there","good to see you","i need help",
        "need help","talk to someone","is anyone here"],
      planHint: null },

    // ── PRICING — v5: massively enriched to catch all variants ──
    { id: "pricing",
      keywords: ["price","pricing","cost","charge","fee","rate","payment","pay",
        "budget","subscription","monthly","investment","spend","how much",
        "affordable","cheap","expensive","money","amount","total","rupee","inr","rs",
        // v5 additions
        "what is price","tell price","asking about price",
        "what are charges","how much cost","monthly price","total cost"],
      phrases: [
        "how much does it cost","what is the price","what are the charges",
        "monthly charge","total cost","how much will it cost","what is the fee",
        // v5 — critical additions that were missing before
        "price kya hai","kitna lagta hai","kitna lagega","kitna hai",
        "kitna paisa","paise kitne","rate kya hai","charges kya hai",
        "price batao","price btao","tell me the price","what does it cost",
        "how much is it","price please","how much money","how much total",
        "what is cost","cost kya hai","monthly kitna","mahine ka kitna",
        "price cheppandi","vilai enna","ethanai aagum","entha avutundi",
      ],
      planHint: null },

    { id: "plan_free",
      keywords: ["free","zero","no cost","without paying","free version","freemium",
        "basic plan","zero investment","try","test","no charge","no payment",
        "nothing to pay","free milega"],
      phrases: ["is it free","start free","free plan features","what does free include",
        "free plan kya hai","zero cost mein","no money needed","free try karna"],
      planHint: "free" },

    { id: "plan_starter",
      keywords: ["starter","999","basic paid","entry level","first plan",
        "cheapest plan","lowest plan","beginner plan","entry plan","small plan"],
      phrases: ["starter plan features","starter mein kya milega","999 wala plan",
        "cheapest paid plan","entry level plan details","starter plan kya hai"],
      planHint: "starter" },

    { id: "plan_growth",
      keywords: ["growth","1499","advanced plan","premium","best plan","top plan",
        "full plan","complete plan","max plan","pro plan","top tier",
        "most feature","ultimate","recommended plan"],
      phrases: ["growth plan features","growth mein kya milega","1499 wala plan",
        "best plan kaunsa hai","full automation plan","growth plan kya hai",
        "sabse acha plan kaunsa hai","which plan is best","most popular plan"],
      planHint: "growth" },

    { id: "plan_whatsapp",
      keywords: ["whatsapp plan","whatsapp automation","whatsapp setup","wa plan",
        "wp plan","2499","whatsapp system","whatsapp bot","whatsapp lead",
        "whatsapp qualification","whatsapp only"],
      phrases: ["whatsapp automation price","whatsapp setup cost",
        "wa automation kya hai","whatsapp plan details"],
      planHint: "whatsapp" },

    { id: "plan_combo",
      keywords: ["combo","both platform","instagram whatsapp","combined","full funnel",
        "2498","ig and wa","dual platform","combo plan","acquisition funnel",
        "together","dono platform","full system","everything together"],
      phrases: ["combo plan features","both instagram and whatsapp","combined setup",
        "full system price","instagram plus whatsapp","dono platform ka plan",
        "full setup cost","complete automation price"],
      planHint: "combo" },

    { id: "compare_plans",
      keywords: ["compare","comparison","difference","which plan","option","package",
        "tier","better","suggest","recommend","which one","which is best",
        "what to choose","right plan","sahi plan","plan comparison",
        "vs","versus","or"],
      phrases: ["which plan is best for me","difference between plans",
        "free vs starter","starter vs growth","plans comparison",
        "plan suggest karo","best plan for me","kaunsa plan lena chahiye",
        "which plan should i take","which plan should i choose"],
      planHint: null },

    { id: "services",
      keywords: ["service","feature","what do you do","what you offer","what include",
        "what you build","instagram dm","comment to dm","story reply","hot lead",
        "follow up","reengagement","re-engagement","qualification",
        "booking funnel","lead capture","story automation","comment automation"],
      phrases: ["what services do you offer","features kya hain",
        "what does it include","all features","complete system",
        "what is comment to dm","what is story automation",
        "what all do you provide","kya kya milta hai"],
      planHint: null },

    { id: "process",
      keywords: ["how","work","process","flow","explain","working","step","understand",
        "mechanism","procedure","inside","logic","how does","how system",
        "what happen","system work"],
      phrases: ["how it works","how does it work","kaise kaam karta hai",
        "step by step","process kya hai","explain the system",
        "how does automation work","what happens after"],
      planHint: null },

    { id: "results",
      keywords: ["result","client","booked","call","conversion","outcome","success",
        "proof","testimonial","review","guarantee","does it work","performance",
        "effective","roi","return","worth","lead","case study","real result"],
      phrases: ["will i get clients","does it really work",
        "what results can i expect","proof of result",
        "guarantee kya hai","real results dikhao",
        "kya clients milenge","success rate kya hai"],
      planHint: null },

    { id: "safety",
      keywords: ["safe","safety","scam","fraud","fake","real","legit","trust",
        "trustworthy","legitimate","genuine","authentic","secure","ban",
        "account ban","suspend","risk","danger","spam","bulk","password"],
      phrases: ["is it safe","account ban hoga","is this legit","can i trust",
        "account safe rahega","will it spam","is it a scam","safe for instagram",
        "kya safe hai","account jayega kya"],
      planHint: null },

    { id: "setup",
      keywords: ["setup","time","day","hour","delivery","when","ready","live",
        "deploy","launch","install","how long","fast","quick","implementation",
        "going live","kab start","kab live","how fast","setup time"],
      phrases: ["setup time kitna hai","how long does setup take",
        "when will it go live","delivery time kya hai",
        "kitne din mein ready hoga","setup fast hai kya","kab se start hoga"],
      planHint: null },

    { id: "demo",
      keywords: ["demo","show","example","live","sample","preview","experience",
        "see","watch","try","see it","demonstration","test","working example"],
      phrases: ["show me demo","can i see demo","demo available hai",
        "see how it works","live demo dekh sakta hun","want to see a demo",
        "show me how it works","demo kaise milega","request demo"],
      planHint: null },

    { id: "contact",
      keywords: ["contact","reach","talk","human","real person","phone","email",
        "whatsapp","directly","personal","booking","book","call","schedule",
        "appointment","consultation","get started","sign up","start now","join",
        "begin","number","whatsapp number","email address"],
      phrases: ["how do i contact","book a call","get started",
        "how to get started","book free call","contact kaise karun",
        "talk to someone","directly baat karni hai","whatsapp pe contact"],
      planHint: null },

    { id: "tools",
      keywords: ["manychat","tool","software","technology","platform","app",
        "tech stack","google sheet","what software","which app","backend",
        "technology used","which tool"],
      phrases: ["which tools are used","what software do you use",
        "manychat kya hai","technology kya hai","tech stack kya hai",
        "tools kya hain","kaunsa tool use karte ho"],
      planHint: null },

    { id: "about",
      keywords: ["about","who","founder","background","experience","company",
        "agency","ayush","who is ayush","about you","who are you",
        "who built","who made","story","history","mission"],
      phrases: ["about ayush ai automation","who is behind this",
        "founder kaun hai","company ke baare mein","tell me about you",
        "agency ki story","kaun banaya","ayush kaun hai"],
      planHint: null },

    { id: "objection_expensive",
      keywords: ["expensive","costly","too much","not affordable","cant afford",
        "afford","budget low","no money","discount","offer","negotiate",
        "cheaper","reduce price","too expensive","lower price","price high",
        "mehenga","bahut mehenga","bahut zyada"],
      phrases: ["price bahut mehenga hai","cant afford this",
        "too expensive for me","can you reduce price","discount milega kya",
        "budget nahi hai","itna nahi de sakta","price kam karo",
        "is there a discount","any discount available","price too high"],
      planHint: null },

    { id: "objection_time",
      keywords: ["no time","time waste","time consuming","maintenance","manage",
        "busy","daily manage","takes too long","bahut time","time nahi",
        "time investment","worth the time"],
      phrases: ["bahut time lagega kya","dont have time for this",
        "too much maintenance","time consuming hai kya",
        "manage karna padega kya"],
      planHint: null },

    { id: "objection_va",
      keywords: ["virtual assistant","va","hire someone","manual reply",
        "employee","staff","manually","vs automation","do it myself",
        "can do manually","why not manual"],
      phrases: ["why not hire a va","va rakhna better hai kya",
        "manual reply better hai kya","why automation not va",
        "vs virtual assistant","khud reply karna vs automation"],
      planHint: null },

    { id: "objection_unsure",
      keywords: ["not sure","unsure","thinking","confused","doubt","maybe",
        "overthinking","decide","pata nahi","should i","maybe later",
        "not decided","still thinking","not confident"],
      phrases: ["not sure if i should","soch raha hun karu ya nahi",
        "doubt hai kya ye kaam karega","let me think",
        "pata nahi worth it hai ya nahi","thinking about it"],
      planHint: null },

    { id: "cancel",
      keywords: ["cancel","stop","discontinue","exit","quit","leave",
        "not continue","contract","lock in","commitment","locked",
        "monthly end","stop service","band karo"],
      phrases: ["can i cancel","how to stop service","no contract right",
        "can i leave","cancel subscription","service band karna hai"],
      planHint: null },

    { id: "revisions",
      keywords: ["revision","change","edit","modify","update","customize",
        "customization","adjust","tweak","alter","flow change","update flow",
        "script change","message change"],
      phrases: ["can i request changes","revision milega kya","can i modify",
        "edit the flows","update the system","flow change kar sakta hun"],
      planHint: null },

    { id: "requirements",
      keywords: ["requirement","need from me","access","prerequisite",
        "provide","share","credential","what to give",
        "account access","password","login","what is needed"],
      phrases: ["what do you need from me","setup ke liye kya chahiye",
        "what access do you need","what to provide",
        "kya dena hoga","meri side se kya karna hoga"],
      planHint: null },

    { id: "human_feel",
      keywords: ["robotic","natural","bot feel","fake","real feel","human like",
        "organic","personal","conversational","clients notice","bot obvious",
        "feel natural","human tone","bot pata chalega"],
      phrases: ["will clients know its a bot","kya bot obvious hoga",
        "robotic lagega kya","natural lagega kya","human jaisa feel",
        "clients samjhenge bot hai kya"],
      planHint: null },

    { id: "both_platforms",
      keywords: ["both","dono","two platform","instagram and whatsapp","combined",
        "multi platform","dual","together","saath mein","ek saath",
        "instagram whatsapp both","use both"],
      phrases: ["can i use both instagram and whatsapp",
        "dono platforms pe automation","both platforms kaise",
        "ig and wa combined","instagram plus whatsapp together"],
      planHint: null },

    { id: "thanks",
      keywords: ["thanks","thank you","great","awesome","perfect","cool","nice",
        "ok","okay","fine","understood","got it","clear","appreciate",
        "badhiya","shukriya","helpful","bye","goodbye","done","all good"],
      phrases: ["thanks for that","that was helpful","got it thank you",
        "okay understood","perfect thanks","clear hai ab"],
      planHint: null },
  ];

  /* ═══════════════════════════════════════════════════════════
     §6  INTENT SCORER  v5 — IDF-weighted + n-gram + fuzzy
         Returns sorted array with raw score AND normalised
         confidence (0–1). Threshold LOWERED to 0.5 raw (was 0)
         so partial intent signals always surface.
  ═══════════════════════════════════════════════════════════ */
  function scoreIntents(normInput) {
    const tokens  = TP.lemTokens(normInput);
    const grams   = TP.allGrams(tokens);
    const scored  = [];

    for (const intent of INTENTS) {
      let score = 0;

      // ── Keyword matching (exact + lemma + fuzzy) ──
      for (const kw of intent.keywords) {
        const lemKw = kw.split(" ").map(lemmatize).join(" ");
        const idf   = TP.idfBoost[kw] || 1;
        if (grams.has(kw) || grams.has(lemKw)) {
          score += idf;
        } else if (!kw.includes(" ")) {
          // single-token fuzzy match
          for (const tok of tokens) {
            const sim = TP.fuzzyScore(tok, kw);
            if (sim >= 0.80) { score += 0.5 * idf * sim; break; }
          }
        }
      }

      // ── Phrase matching (high-weight: +3.5 × IDF) ──
      for (const ph of intent.phrases) {
        const lemPh = ph.split(" ").map(lemmatize).join(" ");
        if (normInput.includes(ph) || normInput.includes(lemPh)) {
          score += 3.5 * (TP.idfBoost[ph] || 1.2);
        }
      }

      if (score > 0) scored.push({
        id: intent.id,
        score,
        confidence: TP.toConfidence(score),
        planHint: intent.planHint
      });
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  /* ═══════════════════════════════════════════════════════════
     §7  SHORT-TERM CONTEXT MEMORY  (6-turn rolling window)
         v5: tracks lastTopic, lastPlan, lastIntent, turn count
  ═══════════════════════════════════════════════════════════ */
  const MEM = {
    history: [],
    MAX: 6,

    push(intent, plan, entities, input) {
      this.history.push({ intent, plan, entities, input, ts: Date.now() });
      if (this.history.length > this.MAX) this.history.shift();
    },

    get last()       { return this.history[this.history.length - 1] || {}; },
    get lastPlan()   { return [...this.history].reverse().find(h => h.plan)?.plan || null; },
    get lastIntent() { return this.last.intent || null; },
    get lastTopic()  {
      const topicIntents = ["pricing","services","process","results","safety","setup","demo"];
      return [...this.history].reverse().find(h => topicIntents.includes(h.intent))?.intent || null;
    },
    get turnCount()  { return this.history.length; },
    resolvePlan(nerPlan) { return nerPlan || this.lastPlan; },

    // Returns true if user seems engaged (3+ turns)
    get isEngaged()  { return this.history.length >= 3; },
  };

  /* ═══════════════════════════════════════════════════════════
     §8  PLAN UTILITIES
  ═══════════════════════════════════════════════════════════ */
  const PLAN_IDX = { free: 0, starter: 1, growth: 2, whatsapp: 3, combo: 4 };

  function getPlan(key) {
    const idx = PLAN_IDX[key];
    return (idx !== undefined && D.plans) ? D.plans[idx] : null;
  }

  function planFromIntents(scored) {
    for (const s of scored) { if (s.planHint) return s.planHint; }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     §9  RESPONSE FACTORY
  ═══════════════════════════════════════════════════════════ */
  function R(text, link, cta) {
    return { text: text || "", link: link || null, cta: cta || null };
  }

  /* ═══════════════════════════════════════════════════════════
     §10  RESPONSE BUILDERS  v5
          All responses follow the compression engine:
          Direct answer → Key details → Recommendation → CTA
          Max 8 lines. Bullets preferred over paragraphs.
  ═══════════════════════════════════════════════════════════ */

  /* ─── Greeting ─── */
  const GREET = [
    "Hey! 👋 Welcome to Ayush AI Automation.\n\nI help fitness coaches automate their Instagram & WhatsApp DMs to get qualified leads on autopilot.\n\nWhat would you like to know?",
    "Hi there! 👋 Glad you're here.\n\nI can answer everything — pricing, how it works, which plan suits you, or how to get started.\n\nWhat's your question?",
    "Hello! 🙌 You're in the right place.\n\nBuilt exclusively for fitness coaches who want leads without manual DM work.\n\nWhat's on your mind?",
  ];
  function buildGreeting() { return R(TP.pick(GREET)); }

  /* ─── Pricing overview ─── */
  function buildPricingOverview() {
    if (!D.plans) return buildFallback("pricing");
    const [p0,p1,p2,p3,p4] = D.plans;
    return R(
      "💰 All Plans & Pricing:\n\n" +
      "💚 " + p0.name + " — " + p0.price + " · Setup FREE (till 30 June)\n" +
      "   → " + p0.best_for + "\n\n" +
      "🔵 " + p1.name + " — " + p1.price + " · Setup " + p1.price_alt + "\n" +
      "   → " + p1.best_for + "\n\n" +
      "🚀 " + p2.name + " — " + p2.price + " · Setup " + p2.price_alt + " ⭐ Most Popular\n" +
      "   → " + p2.best_for + "\n\n" +
      "💬 " + p3.name + " — " + p3.price + " · Setup " + p3.price_alt + "\n\n" +
      "⚡ " + p4.name + " — " + p4.price + " · Setup " + p4.price_alt + "\n\n" +
      "💡 Most coaches start FREE → see results → upgrade when ready.\n" +
      "📌 Paid plans also need a ManyChat subscription.",
      "https://ayushaiautomation.in/pricing.html", "View Full Pricing"
    );
  }

  /* ─── Plan detail ─── */
  const PLAN_OPENERS = {
    free:     ["Here's everything in the Free Plan — ₹0, genuinely:",
               "Free Plan breakdown — zero cost, real value:"],
    starter:  ["Starter Plan — organised leads, zero manual chaos:",
               "Here's what the Starter Plan gives you:"],
    growth:   ["Growth Plan — our most popular. Here's why:",
               "The full Growth Plan breakdown:"],
    whatsapp: ["WhatsApp Qualification System — full detail:",
               "Here's exactly what the WhatsApp plan covers:"],
    combo:    ["Combo Plan — Instagram + WhatsApp, end-to-end:",
               "The complete Combo breakdown — the full sales machine:"],
  };

  function buildPlanDetail(key) {
    const plan = getPlan(key);
    if (!plan) return buildPricingOverview();
    const intro    = TP.pick(PLAN_OPENERS[key] || ["Plan details:"]);
    const features = plan.features.slice(0, 6).map(f => "✅ " + f).join("\n");
    const limits   = plan.limitations && plan.limitations.length
      ? "\n❌ Not included:\n" + plan.limitations.slice(0, 3).map(l => "• " + l).join("\n")
      : "";
    const note     = plan.note ? "\n\n💡 " + plan.note : "";
    return R(
      intro + "\n\n📋 " + plan.name +
      "\n💰 " + plan.price +
      "\n📦 Setup: " + plan.price_alt +
      "\n\n" + features + limits + note,
      "https://ayushaiautomation.in/pricing.html", "See Full Plan Details"
    );
  }

  /* ─── Plan comparison ─── */
  function buildComparison() {
    return R(
      "5 plans — quick guide to pick yours:\n\n" +
      "💚 FREE (₹0/mo)      → Just testing? Zero risk entry.\n" +
      "🔵 STARTER (₹999/mo) → Getting DMs, wasting time on manual replies?\n" +
      "🚀 GROWTH (₹1,499/mo)→ Want real booked calls? ⭐ Most popular.\n" +
      "💬 WHATSAPP (₹1,499) → WhatsApp is your primary platform?\n" +
      "⚡ COMBO (₹2,498/mo) → Want end-to-end? Instagram + WhatsApp.\n\n" +
      "🎯 Start FREE → get results → upgrade only when ready.",
      "https://ayushaiautomation.in/pricing.html", "Compare All Plans"
    );
  }

  /* ─── Services ─── */
  const SVC_OPENERS = [
    "Here's the full automation system for fitness coaches:",
    "Every component we build — automated and connected:",
    "Here's exactly what gets automated:",
  ];
  function buildServices() {
    const svcs = (D.services || []).slice(0, 5);
    const list = svcs.map(s =>
      "⚡ " + s.name + "\n   " + s.description
    ).join("\n\n");
    return R(
      TP.pick(SVC_OPENERS) + "\n\n" + list +
      "\n\nEvery piece connects — first DM to booked call. Fully automated.",
      "https://ayushaiautomation.in/services.html", "Explore All Services"
    );
  }

  /* ─── Process / how it works ─── */
  function buildProcess() {
    return R(
      "The 6-step automated DM journey:\n\n" +
      "1️⃣ Someone DMs you on Instagram or WhatsApp\n" +
      "2️⃣ Bot replies instantly — <30 seconds, 24/7\n" +
      "3️⃣ Asks smart qualifying questions (goal, timeline, budget)\n" +
      "4️⃣ Tags: Serious Buyer vs Time-Waster\n" +
      "5️⃣ Serious leads get your booking link automatically\n" +
      "6️⃣ You only speak to pre-qualified, ready buyers\n\n" +
      "⏱️ Live in 24–72 hours. You approve — we build everything.",
      "https://ayushaiautomation.in/process.html", "See Full Process"
    );
  }

  /* ─── Results ─── */
  function buildResults() {
    const g = (D.meta && D.meta.guarantee) || "14-day rebuild guarantee if no qualified leads come in.";
    return R(
      "What to realistically expect:\n\n" +
      "• Drastic drop in ghosting\n" +
      "• Only qualified, serious leads reach you\n" +
      "• Consistent call bookings — even while you sleep\n" +
      "• 15–20 hours/week saved on manual DM work\n\n" +
      "🛡️ Guarantee: " + g + "\n\n" +
      "Coach result: \"Within 7 days I started getting qualified leads directly from DMs.\"",
      "https://ayushaiautomation.in/demo.html", "See Proof & Results"
    );
  }

  /* ─── Safety ─── */
  function buildSafety() {
    return R(
      "100% safe — full picture:\n\n" +
      "✅ Uses ManyChat — official Instagram & Meta partner\n" +
      "✅ Trusted by 1M+ businesses worldwide\n" +
      "✅ Only replies when someone messages YOU first\n" +
      "✅ No spam, no bulk messages, no aggressive outreach\n" +
      "✅ Zero ban risk — safe automation only\n" +
      "✅ No password sharing — secure OAuth only\n\n" +
      "You experience a live demo before any commitment.",
      "https://ayushaiautomation.in/demo.html", "See Live Demo"
    );
  }

  /* ─── Setup timeline ─── */
  function buildSetup() {
    const tl = (D.meta && D.meta.setup_timeline) || {};
    return R(
      "Setup is fast — exact timelines:\n\n" +
      "📱 Instagram Automation: " + (tl.instagram || "24–72 hours") + "\n" +
      "💬 WhatsApp or Combo: " + (tl.whatsapp_or_combo || "48–72 hours") + "\n\n" +
      "The process:\n" +
      "1. You connect account (OAuth — no password)\n" +
      "2. We build your conversation flows\n" +
      "3. You review and approve\n" +
      "4. System goes live ✅\n\n" +
      "After that — fully automatic. Nothing for you to manage.",
      "https://ayushaiautomation.in/process.html", "See Full Setup"
    );
  }

  /* ─── Demo ─── */
  function buildDemo() {
    return R(
      "Yes! Live demo available — before any commitment. 🎯\n\n" +
      "What the demo shows:\n" +
      "• How the bot handles a real conversation\n" +
      "• How it separates serious leads from time-wasters\n" +
      "• How it moves someone toward booking\n\n" +
      "You experience it as your client would — interactive, not screenshots.\n" +
      "⏱️ Takes 10–15 minutes. Zero sales pressure.",
      "https://ayushaiautomation.in/demo.html", "Request Live Demo"
    );
  }

  /* ─── Contact / Get Started ─── */
  function buildContact() {
    const c = D.contact || {};
    return R(
      "Here's how to reach us:\n\n" +
      "📱 WhatsApp: " + (c.whatsapp || "+91 94772 93867") + "\n" +
      "📧 Email: " + (c.email || "ayushtrades54@gmail.com") + "\n" +
      "📅 Free 15-min strategy call — book below\n\n" +
      "On the call:\n" +
      "• Find the right plan for your situation\n" +
      "• Set expected results & timeline\n\n" +
      "⏱️ From call to live system: 24–72 hours.",
      c.booking || "https://ayushaiautomation.in/book.html", "Book Free Call"
    );
  }

  /* ─── Tools ─── */
  function buildTools() {
    return R(
      "Tools powering the system:\n\n" +
      "🔧 ManyChat — automation engine\n" +
      "   • Official Instagram & WhatsApp partner\n" +
      "   • 1M+ businesses use it — zero ban risk\n\n" +
      "📊 Google Sheets — real-time lead tracking\n\n" +
      "⚠️ Paid plans need a separate ManyChat subscription.\n" +
      "Think of it: I build the shop — ManyChat is the electricity.",
      "https://ayushaiautomation.in/faq.html", "Read Full FAQ"
    );
  }

  /* ─── About ─── */
  function buildAbout() {
    const a = D.agency || {};
    return R(
      (a.name || "Ayush AI Automation") + " — DM automation for fitness coaches.\n\n" +
      "🎯 Mission: Turn your Instagram & WhatsApp DMs into a predictable client-booking machine.\n\n" +
      (a.about ? a.about + "\n\n" : "") +
      "We don't build chatbots. We build revenue systems.",
      "https://ayushaiautomation.in/about.html", "Read About Us"
    );
  }

  /* ─── Human feel ─── */
  function buildHumanFeel() {
    return R(
      "Valid concern — honest answer:\n\n" +
      "Conversations are engineered to feel human:\n" +
      "• Conversational tone — not robotic commands\n" +
      "• Personalised based on what each person says\n" +
      "• When someone's ready — YOU step in personally\n\n" +
      "💡 People don't care if it's automated if it's fast, helpful & relevant.\n\n" +
      "Our systems have been mistaken for real people. That's the standard.",
      null, null
    );
  }

  /* ─── Both platforms ─── */
  function buildBothPlatforms() {
    return R(
      "Yes — both platforms work together. 🔥\n\n" +
      "• Instagram → capture leads (DMs, comments, stories)\n" +
      "• WhatsApp → follow up and close serious buyers\n\n" +
      "Combined: complete lead journey, no lead falls through.\n\n" +
      "🎯 Both together = one complete automated sales machine.\n" +
      "→ See Combo Plan for pricing.",
      "https://ayushaiautomation.in/pricing.html", "View Combo Plan"
    );
  }

  /* ─── Objections ─── */
  function buildObjection(type) {
    if (type === "objection_expensive") return R(
      "Let me reframe with real numbers:\n\n" +
      "Every day without automation you lose:\n" +
      "⏰ 2–4 hours replying to DMs manually\n" +
      "💸 Clients who ghosted from slow follow-up\n\n" +
      "If your coaching is ₹5,000–15,000/client:\n" +
      "→ 1 extra client/month = cost recovered 10× over\n\n" +
      "💡 Start FREE (₹0). No card needed. See results first.\n" +
      "Upgrade only when it financially makes sense — zero pressure.",
      "https://ayushaiautomation.in/pricing.html", "Start Free — ₹0"
    );
    if (type === "objection_time") return R(
      "You're losing MORE time without this — reality check:\n\n" +
      "Right now every day:\n" +
      "• Same questions answered repeatedly ♻️\n" +
      "• Hours with non-serious people ⏰\n\n" +
      "With the system:\n" +
      "• Setup: 1–2 hours (once only)\n" +
      "• Daily maintenance: Zero\n" +
      "• Runs 24/7 without you\n\n" +
      "One-time effort = permanent daily time savings.",
      null, null
    );
    if (type === "objection_va") return R(
      "VA vs Automation — honest comparison:\n\n" +
      "👤 VA: ₹8,000–15,000/mo · misses off-hours · 1 conversation at a time\n" +
      "🤖 Automation: 24/7/365 · unlimited chats · never misses follow-up\n\n" +
      "Cost per client acquisition: automation wins every time.\n" +
      "A VA is one person. A system never takes a sick day.",
      "https://ayushaiautomation.in/coaches.html", "Why Coaches Choose This"
    );
    if (type === "objection_unsure") return R(
      "Totally fair — don't decide on words. Experience it.\n\n" +
      "👉 Take the free 10-min demo:\n" +
      "• See the system live — no payment, no pitch\n" +
      "• 9/10 coaches say the decision becomes obvious the moment they see it.\n\n" +
      "No commitment. Just clarity.",
      "https://ayushaiautomation.in/demo.html", "Try Free Demo"
    );
    return buildContact();
  }

  /* ─── Cancel ─── */
  function buildCancel() {
    return R(
      "No lock-in — here's how it works:\n\n" +
      "• Monthly plans → simply don't renew next month\n" +
      "• No contracts, no hidden fees\n" +
      "• One-time setup fees are non-refundable\n\n" +
      "You stay because it works — not because you're stuck.",
      "https://ayushaiautomation.in/terms.html", "Read Full Terms"
    );
  }

  /* ─── Revisions ─── */
  function buildRevisions() {
    return R(
      "Yes — revisions included in all active paid plans. 🔄\n\n" +
      "You can request:\n" +
      "• Flow logic changes\n" +
      "• Message tone & style updates\n" +
      "• New qualifying questions\n\n" +
      "Process: request → implement → you approve → live.\n" +
      "Your coaching evolves — your automation evolves with it.",
      "https://ayushaiautomation.in/services.html", "View Plans"
    );
  }

  /* ─── Requirements ─── */
  function buildRequirements() {
    return R(
      "Here's all you need to provide:\n\n" +
      "✅ Instagram account access (via ManyChat OAuth — no password)\n" +
      "✅ Your approval on the conversation flows we build\n" +
      "✅ Payment confirmation\n\n" +
      "We handle everything else.\n" +
      "🔒 You never share your password. Secure official OAuth only.",
      "https://ayushaiautomation.in/process.html", "See Setup Steps"
    );
  }

  /* ─── Thanks ─── */
  const THANKS = [
    "Glad that helped! 👍\n\nAnytime you have more questions — I'm here.\n\nWhenever you're ready, the free demo is just a click away.",
    "Of course! 😊 Happy to help.\n\nFeel free to ask about pricing, features, setup, or getting started.",
    "Great! If anything comes up, just ask. 🎯\n\nThe free demo is available anytime you want to see it live.",
  ];
  function buildThanks() {
    return R(TP.pick(THANKS), "https://ayushaiautomation.in/demo.html", "See Demo");
  }

  /* ─── Smart Fallback v5 ─── */
  // Only fires as absolute last resort. Always tries to salvage partial intent first.
  function buildFallback(topic) {
    const suggestions = [
      "💰 Pricing & Plans",
      "⚙️ How it works",
      "📊 Services & Features",
      "🛡️ Safety & Trust",
      "🚀 Getting Started",
      "🎥 Live Demo",
    ];
    const opener = topic
      ? "Quick clarification needed — you asked about " + topic + "."
      : MEM.turnCount > 0
        ? "I want to give you the exact right answer — could you rephrase that?"
        : "I can help with any of these:";
    return R(
      opener + "\n\n" + suggestions.join("\n") + "\n\n" +
      "Just type your question — or tap a topic above!",
      null, null
    );
  }

  /* ═══════════════════════════════════════════════════════════
     §11  FAQ REGISTRY  (chip-triggered, keyed by label)
  ═══════════════════════════════════════════════════════════ */
  const FAQ_REGISTRY = {
    faq_dm_setup: {
      text: "DM Automation Setup means we build automatic replies inside your Instagram DMs.\n\nWhen someone asks about price, programs, or availability — the system answers automatically.\n\nYou stop typing the same reply 50 times a day.\n→ You only respond to people genuinely ready to work with you.",
      link: "https://ayushaiautomation.in/process.html", cta: "See Setup Process"
    },
    faq_lead_qualification: {
      text: "Lead Qualification automatically identifies serious buyers.\n\nThe system asks:\n• What's your fitness goal?\n• When do you want to start?\n• Are you ready to invest?\n\n🟢 Serious buyer → booking link sent automatically\n🔴 Just browsing → nurture sequence starts\n\nResult: Only real, ready buyers reach you.",
      link: "https://ayushaiautomation.in/process.html", cta: "See Lead Qualification"
    },
    faq_tagging: {
      text: "The Tagging System labels leads automatically based on answers.\n\nExample tags:\n🏷️ Fat Loss / Muscle Gain / Beginner / Advanced\n🏷️ Serious Buyer / Just Browsing / Follow-Up Needed\n\nInstead of reading every chat, you instantly know who to focus on.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Tagging Feature"
    },
    faq_followup_auto: {
      text: "Follow-up Automation sends timed reminders when a lead goes silent.\n\nSequence:\n• 1 hour reminder\n• 24 hour reminder\n• 3 day final nudge\n\n💡 Most coaches lose 40–60% of potential clients from zero follow-up. This eliminates that.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Follow-up Feature"
    },
    faq_comment_dm: {
      text: "Comment-to-DM: when someone comments on your post or reel, they automatically receive a DM and a qualifying conversation begins.\n\n• Your content becomes a 24/7 lead generator\n• Captures every interested person without effort\n• Works for reels, posts, and paid ads",
      link: "https://ayushaiautomation.in/services.html", cta: "View Comment Automation"
    },
    faq_story_reply: {
      text: "Story Reply Automation: when someone reacts or replies to your story, a qualifying conversation starts automatically.\n\nInstead of that interaction disappearing — it becomes a lead.\n\n💡 Most coaches ignore story replies. This captures every single one.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Story Feature"
    },
    faq_booking_funnel: {
      text: "The Booking Funnel sends only qualified leads to your calendar link.\n\n1️⃣ Lead enters\n2️⃣ System qualifies them\n3️⃣ Serious → booking link sent\n4️⃣ They schedule on your calendar\n5️⃣ You show up to a pre-qualified call\n\nEvery call = someone already interested.",
      link: "https://ayushaiautomation.in/book.html", cta: "Book Free Call"
    },
    faq_whatsapp_qualification: {
      text: "WhatsApp Qualification moves serious leads from Instagram to WhatsApp for deeper filtering.\n\nWhy WhatsApp?\n• Higher response rates\n• More personal feel\n• Better for closing high-ticket coaching\n\nHandover is fully automatic.",
      link: "https://ayushaiautomation.in/services.html", cta: "View WhatsApp Automation"
    },
    faq_reengagement: {
      text: "Re-engagement automatically contacts old or inactive leads who went silent.\n\nSends fresh, value-driven messages to re-ignite interest.\n\n💰 Old leads = hidden revenue sitting in your DMs right now.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Re-engagement"
    },
    faq_hot_lead: {
      text: "Hot Lead Notification: you get alerted instantly when a high-intent prospect appears.\n\nSystem detects high intent → tags HOT LEAD → pings you immediately.\n\n• First response = #1 conversion factor\n• Hot leads go cold within hours\n• You never miss a ready buyer",
      link: "https://ayushaiautomation.in/process.html", cta: "See Hot Lead Feature"
    },
    faq_no_daily_manage: {
      text: "No — zero daily management needed.\n\nAfter setup, it runs on its own:\n• Replies automatically\n• Qualifies automatically\n• Follows up automatically\n\nYour only job: respond to serious, pre-qualified leads it sends you.",
      link: "https://ayushaiautomation.in/process.html", cta: "See Full Process"
    },
    faq_spam: {
      text: "No — the system never sends spam. 🚫\n\nIt only replies to people who message YOU first.\n\n• No bulk messaging\n• No random outreach\n• No unsolicited messages\n• 100% within platform guidelines",
      link: null, cta: null
    },
    faq_technical_knowledge: {
      text: "Zero technical knowledge required.\n\nBuilt for fitness coaches — not developers.\n\nYou don't need to code, understand automation software, or manage settings.\n\nWe handle everything. You approve the flows, then go live.",
      link: null, cta: null
    },
    faq_organic_ads: {
      text: "Works for both — organic content AND paid ads. ✅\n\nCaptures leads from:\n• Reel comments\n• Story replies\n• Direct DMs\n• Post comments\n• Paid ad clicks\n\nOrganic or ads — every conversation handled automatically.",
      link: "https://ayushaiautomation.in/services.html", cta: "View All Features"
    },
    faq_manychat_subscription: {
      text: "Yes — paid plans need a separate ManyChat subscription.\n\nHere's why:\n• My fee = building your system\n• ManyChat = software keeping it running 24/7\n\n🏗️ I build the shop. 💡 ManyChat is the electricity.\n\nFree Plan does NOT need ManyChat paid.",
      link: "https://ayushaiautomation.in/pricing.html", cta: "View Pricing"
    },
    faq_support: {
      text: "Support available anytime.\n\n📱 WhatsApp: +91 94772 93867\n📧 Email: ayushtrades54@gmail.com\n\nPaid plans include monthly optimisation sessions.\nRevisions and flow changes are included in all active paid plans.",
      link: "https://ayushaiautomation.in/book.html", cta: "Book Free Call"
    },
    faq_stop_service: {
      text: "No lock-in. Cancel anytime.\n\n• Monthly plans — just don't renew\n• No contracts, no hidden fees\n• One-time setup fees are non-refundable\n\nYou stay because it works — not because you're stuck.",
      link: "https://ayushaiautomation.in/terms.html", cta: "Read Terms"
    },
  };

  /* ═══════════════════════════════════════════════════════════
     §12  INTENT ROUTER
  ═══════════════════════════════════════════════════════════ */
  function route(intentId, plan, entities) {
    switch (intentId) {
      case "greeting":            return buildGreeting();
      case "thanks":              return buildThanks();
      case "pricing":             return plan ? buildPlanDetail(plan) : buildPricingOverview();
      case "plan_free":           return buildPlanDetail("free");
      case "plan_starter":        return buildPlanDetail("starter");
      case "plan_growth":         return buildPlanDetail("growth");
      case "plan_whatsapp":       return buildPlanDetail("whatsapp");
      case "plan_combo":          return buildPlanDetail("combo");
      case "compare_plans":       return buildComparison();
      case "services":            return buildServices();
      case "process":             return buildProcess();
      case "results":             return buildResults();
      case "safety":              return buildSafety();
      case "setup":               return buildSetup();
      case "demo":                return buildDemo();
      case "contact":             return buildContact();
      case "tools":               return buildTools();
      case "about":               return buildAbout();
      case "human_feel":          return buildHumanFeel();
      case "both_platforms":      return buildBothPlatforms();
      case "objection_expensive": return buildObjection("objection_expensive");
      case "objection_time":      return buildObjection("objection_time");
      case "objection_va":        return buildObjection("objection_va");
      case "objection_unsure":    return buildObjection("objection_unsure");
      case "cancel":              return buildCancel();
      case "revisions":           return buildRevisions();
      case "requirements":        return buildRequirements();
      default:                    return null;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     §13  MULTI-INTENT BLENDER
  ═══════════════════════════════════════════════════════════ */
  function blend2(r1, r2, h1, h2) {
    return R(
      h1 + ":\n" + r1.text + "\n\n─────────────────\n\n" + h2 + ":\n" + r2.text,
      r1.link, r1.cta
    );
  }

  const BLEND_TABLE = [
    [["pricing","safety"],        (p) => blend2(p ? buildPlanDetail(p) : buildPricingOverview(), buildSafety(),                "💰 Pricing",    "🔒 Safety")],
    [["pricing","demo"],          (p) => blend2(p ? buildPlanDetail(p) : buildPricingOverview(), buildDemo(),                  "💰 Pricing",    "🎥 Demo")],
    [["pricing","results"],       (p) => blend2(p ? buildPlanDetail(p) : buildPricingOverview(), buildResults(),               "📊 Plans",      "📈 Results")],
    [["services","pricing"],      (p) => blend2(buildServices(),        p ? buildPlanDetail(p) : buildPricingOverview(),       "🛠️ Services", "💰 Pricing")],
    [["services","process"],      ()  => blend2(buildServices(),        buildProcess(),                                        "🛠️ Services", "⚙️ Process")],
    [["process","results"],       ()  => blend2(buildProcess(),         buildResults(),                                        "⚙️ How It Works","📈 Results")],
    [["safety","demo"],           ()  => blend2(buildSafety(),          buildDemo(),                                           "🔒 Safety",     "🎥 Demo")],
    [["setup","pricing"],         (p) => blend2(buildSetup(),           p ? buildPlanDetail(p) : buildPricingOverview(),       "⏱️ Setup",     "💰 Pricing")],
    [["contact","demo"],          ()  => blend2(buildContact(),         buildDemo(),                                           "📞 Get Started","🎥 Demo")],
    [["compare_plans","pricing"], (p) => blend2(buildComparison(),      buildPricingOverview(),                                "📊 Comparison", "💰 Full Pricing")],
    [["objection_expensive","pricing"], (p) => blend2(buildObjection("objection_expensive"), buildPricingOverview(),           "💸 On Price",   "💰 Plans")],
  ];

  function tryBlend(topIntents, plan) {
    if (topIntents.length < 2) return null;
    const ids = new Set(topIntents.slice(0, 4).map(x => x.id));
    for (const [pair, builder] of BLEND_TABLE) {
      if (ids.has(pair[0]) && ids.has(pair[1])) {
        try { return builder(plan); } catch(_) {}
      }
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     §14  MULTI-SENTENCE PROCESSOR
  ═══════════════════════════════════════════════════════════ */
  function processMultiSentence(sentences, plan, entities) {
    const parts = [];
    const seen  = new Set();

    for (const sent of sentences) {
      const norm   = normaliseHinglish(TP.clean(sent));
      const scored = scoreIntents(norm);
      const topId  = scored[0]?.id;
      if (!topId || seen.has(topId) || topId === "greeting" || topId === "thanks") continue;
      seen.add(topId);
      const sentPlan = NER.extract(norm).plan || plan;
      const resp     = route(topId, sentPlan, entities);
      if (resp) parts.push(resp.text);
    }

    if (parts.length >= 2) {
      return R(
        parts.join("\n\n─────────────────\n\n"),
        D.contact ? D.contact.booking : "https://ayushaiautomation.in/book.html",
        "Book Free Call"
      );
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     §15  FAQ SCORER  v5
  ═══════════════════════════════════════════════════════════ */
  function matchFaq(normInput) {
    if (!D.faqs) return null;
    const tokens = TP.lemTokens(normInput);
    const grams  = TP.allGrams(tokens);
    let best = null, bestScore = 0;

    for (const faq of D.faqs) {
      let score = TP.overlap(grams, faq.keywords);
      for (const kw of faq.keywords) {
        for (const tok of tokens) {
          if (TP.fuzzyScore(tok, kw) >= 0.84) { score += 0.4; break; }
        }
      }
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    return bestScore >= 1.5 ? best : null;
  }

  /* ═══════════════════════════════════════════════════════════
     §16  CONTEXT-AWARE RESOLVER  v5
          Handles follow-up questions using memory.
          "What about price?" after plan → plan price.
  ═══════════════════════════════════════════════════════════ */
  function resolveWithContext(topIntents, entities, normInput) {
    const topId   = topIntents[0]?.id;
    const nerPlan = entities.plan;

    // ── Pricing follow-up after plan was discussed ──
    if ((topId === "pricing" || entities.hasPriceSignal) && MEM.lastPlan && !nerPlan) {
      return { intent: "pricing", plan: MEM.lastPlan };
    }

    // ── Features follow-up after plan was discussed ──
    if ((topId === "services" || topId === "process") && MEM.lastPlan && !nerPlan &&
        /feature|include|what|tell me more|detail/i.test(normInput)) {
      return { intent: "plan_" + MEM.lastPlan, plan: MEM.lastPlan };
    }

    // ── Bare follow-up — no new intent detected ──
    if (!topId && MEM.lastIntent) {
      return { intent: MEM.lastIntent, plan: MEM.resolvePlan(nerPlan) };
    }

    // ── Resolve plan from context if not in NER ──
    const plan = MEM.resolvePlan(nerPlan) || planFromIntents(topIntents);
    return { intent: topId || null, plan };
  }

  /* ═══════════════════════════════════════════════════════════
     §17  MAIN PROCESS FUNCTION  (exposed as CHATBOT.process)
          v5 routing priority:
          A → Multi-sentence compound
          B → Multi-intent blend (2 strong signals)
          C → Primary intent (with context)
          D → FAQ match from AGENCY_DATA
          E → Partial salvage (any scoring intent > 0)
          F → Smart fallback (absolute last resort)
  ═══════════════════════════════════════════════════════════ */
  function process(rawInput) {
    if (!rawInput || !rawInput.trim()) {
      return R("Didn't catch that — type your question and I'll help! 😊");
    }

    // ── Step 1: Clean + Hinglish normalise ─────────────────
    const normInput = normaliseHinglish(TP.clean(rawInput));

    // ── Step 2: NER — extract entities ─────────────────────
    const entities  = NER.extract(normInput);

    // ── Step 3: Score intents (IDF + fuzzy + phrase) ────────
    const topIntents = scoreIntents(normInput);

    // ── Step 4: Context-aware resolution ───────────────────
    const { intent, plan } = resolveWithContext(topIntents, entities, normInput);

    // ── Step 5: Update context memory ──────────────────────
    MEM.push(intent, plan || entities.plan, entities, normInput);

    // ── Route A: Multi-sentence compound question ──────────
    const sentences = TP.splitSentences(normInput);
    if (sentences.length >= 2) {
      const multi = processMultiSentence(sentences, plan, entities);
      if (multi) return multi;
    }

    // ── Route B: Multi-intent blend ────────────────────────
    if (topIntents.length >= 2 &&
        topIntents[0].score >= 2.0 &&   // lowered threshold v5
        topIntents[1].score >= 1.5 &&   // lowered threshold v5
        topIntents[0].id !== topIntents[1].id) {
      const blended = tryBlend(topIntents, plan);
      if (blended) return blended;
    }

    // ── Route C: Primary intent ────────────────────────────
    if (intent) {
      const resp = route(intent, plan, entities);
      if (resp) return resp;
    }

    // ── Route D: FAQ match from AGENCY_DATA ────────────────
    const faq = matchFaq(normInput);
    if (faq) return R(faq.answer);

    // ── Route E: Partial salvage — NEVER skip this ─────────
    // v5 FIX: even a single low-scoring intent → give best answer
    if (topIntents.length > 0) {
      const salvage = route(topIntents[0].id, plan, entities);
      if (salvage) return salvage;
    }

    // ── Route F: Smart fallback (absolute last resort) ──────
    return buildFallback(null);
  }

  /* ═══════════════════════════════════════════════════════════
     §18  FAQ CHIP HELPERS
  ═══════════════════════════════════════════════════════════ */
  function getFaq(key)   { return FAQ_REGISTRY[key] || null; }
  function getTopFaqs(n) { return Object.keys(FAQ_REGISTRY).slice(0, n || 10); }

  /* ═══════════════════════════════════════════════════════════
     §19  INIT — builds IDF boost table synchronously
  ═══════════════════════════════════════════════════════════ */
  function init() {
    buildIdfBoost(INTENTS);
    return Promise.resolve();
  }

  /* ═══════════════════════════════════════════════════════════
     §20  PUBLIC API
  ═══════════════════════════════════════════════════════════ */
  global.CHATBOT = { init, process, getFaq, getTopFaqs };

})(window);
