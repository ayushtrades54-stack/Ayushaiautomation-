/* ════════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v8.0
   ════════════════════════════════════════════════════════════════
   v8 Intelligence Upgrades vs v7:
     ✅ USER_PROFILE — persistent localStorage cross-session memory
     ✅ SESSION — sessionStorage per-visit tracking
     ✅ CONV_STATE — conversation heat/mood/stage machine
     ✅ SEMANTIC_MEM — slot-filling (budget, urgency, trust, depth)
     ✅ SEMANTIC_CLUSTERS — keyword-cluster user profiling
     ✅ Smart CTA suppression — max 2/session, context-aware selection
     ✅ smartDelay() — response length-proportional typing delays
     ✅ Returning user detection + personalised greeting
     ✅ blend2() HR dividers → natural transition language
     ✅ Acknowledgment prefixes per intent
     ✅ Follow-up question injection (70% rate, stage-aware)
     ✅ Name extraction + personalisation
     ✅ RESPONSE_HISTORY anti-repetition fingerprinting
     ✅ Depth-adaptive responses (surface/exploring/evaluating)
     ✅ Emotional energy mirroring
     ✅ PLAN_TRANSFORMATIONS before/after framing
     ✅ Social proof injection at decision stage
     ✅ Honest uncertainty lines for results responses
     ✅ Proactive re-engagement after 90s silence
     ✅ Hesitation/self-correction illusion (8% rate)
     ✅ Multi-bubble intelligent response splitting (exported)

   Architecture (layered):
     Raw Input
       → Text Normalization
       → User Profile Builder (localStorage-persistent)
       → Conversation State Machine (heat/mood/stage)
       → Intent Recognition (IDF + phrase + fuzzy)
       → Context Resolution (semantic slot-aware)
       → Response Selection (profile-aware builders)
       → Response Personalization
       → Delivery Engine (smart delays + multi-bubble)
       → Post-Response: follow-ups, proactive re-engagement

   Exports: window.CHATBOT { init, getResponse, getFaq, getTopFaqs,
                              smartDelay, intelligentSplit, shouldHesitate }
   ════════════════════════════════════════════════════════════════ */

(function (global) {
  "use strict";

  /* ── §0  DATA ACCESS ──────────────────────────────────────── */
  function D() { return global.AGENCY_DATA || {}; }

  /* ════════════════════════════════════════════════════════════
     §1  TEXT NORMALISATION PIPELINE
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
    integrating:"integrate",integrated:"integrate",
    optimising:"optimise",optimizing:"optimise",
    optimised:"optimise",optimized:"optimise",
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
  };

  const HINGLISH_RAW = [
    ["price kya hai","what is price"],["price kya h","what is price"],
    ["price kya hoga","what is price"],["price batao","tell price"],
    ["price btao","tell price"],["price bolo","tell price"],
    ["kitna banta hai","how much total"],["kitna padega","how much cost"],
    ["kitna lagega bhai","how much cost"],["kitna lagega","how much cost"],
    ["kitne paise lagenge","how much cost"],["kitna paisa lagega","how much cost"],
    ["paise kitne","how much cost"],["charges kya hai","what are charges"],
    ["charges kya h","what are charges"],["charge kya hai","what is charge"],
    ["rate kya hai","what is price"],["rate kya h","what is price"],
    ["monthly kitna","monthly price"],["mahine ka kitna","monthly price"],
    ["total kitna","total cost"],["kitna hai","how much"],["kitna","how much"],
    ["kaise kaam karta hai","how does it work"],
    ["kaise kaam karega","how will it work"],
    ["kaise kaam","how does work"],["kya karta hai","what does it do"],
    ["kya hota hai","what happens"],["kya hai ye","what is this"],
    ["kya hai","what is"],["kya hota","what is"],
    ["kaise shuru karun","how to start"],["kaise shuru karu","how to start"],
    ["kaise shuru","how to start"],["kaise join karun","how to join"],
    ["shuru karna hai","want to start"],["shuru kar sakta hun","can start"],
    ["lena chahta hun","want to buy"],["lena hai","want to buy"],
    ["kaunsa plan lena chahiye","which plan should i take"],
    ["konsa plan lu","which plan should i take"],
    ["kaunsa plan best hai","which plan is best"],
    ["konsa plan best hai","which plan is best"],
    ["kaunsa plan","which plan"],["konsa plan","which plan"],
    ["starter mein kya milega","starter plan features"],
    ["growth mein kya milega","growth plan features"],
    ["free mein kya milega","free plan features"],
    ["combo mein kya milega","combo plan features"],
    ["safe hai kya","is it safe"],["ban hoga kya","will account be banned"],
    ["account jaega kya","will account be banned"],
    ["scam toh nahi","is it legit"],["dhoka","fraud"],["dhokha","fraud"],
    ["bharosa","trust"],["sach mein","really"],["sach","real"],
    ["genuine hai kya","is it genuine"],
    ["service band karna hai","cancel service"],["band karna","cancel"],
    ["cancel karna hai","want to cancel"],["cancel karna","cancel"],
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["kab hoga","when will it be"],["kab","when"],
    ["kitne din mein","how many days"],["kitne ghante","how many hours"],
    ["kitne din","how many days"],
    ["batao","explain"],["samjhao","explain"],["bolo","tell me"],
    ["dikhao","show me"],["dekhna","see"],["dekh","see"],
    ["sasta wala plan","cheapest plan"],["sabse sasta plan","cheapest plan"],
    ["sasta wala","cheapest"],["sabse sasta","cheapest"],
    ["sabse acha plan","best plan"],["sabse acha","best"],
    ["sasta","cheap"],["mehenga","expensive"],["bahut mehenga","very expensive"],
    ["best wala plan","best plan"],["best wala","best plan"],
    ["free wala plan","free plan"],["free wala","free plan"],
    ["paid wala","paid plan"],["shuru","start"],["karna hai","want to"],
    ["aage badhna","proceed"],
    ["nahi chahiye","not interested"],["theek hai","ok"],
    ["acha","ok"],["achha","ok"],["accha","ok"],
    ["samajh gaya","understood"],["pata nahi","dont know"],
    ["soch raha hun","thinking"],["doubt hai","have doubt"],
    ["abhi nahi","not now"],
    ["kya haal hai","how are you"],["kaise ho aap","how are you"],
    ["kaise ho","how are you"],["namaste","hello"],["namaskar","hello"],
    ["assalamualaikum","hello"],["bhai","hey"],["yaar","hey"],
    ["paisa","price"],["paise","price"],["rupees","price"],["rupee","price"],
    ["lagega","cost"],["lagenge","cost"],["lagti","cost"],["lagta","cost"],
    ["mahina","monthly"],["mahine","monthly"],
    ["kaun sa","which"],["konsa","which"],
    ["ela pani chestundi","how does it work"],["entha avutundi","how much cost"],
    ["start ela cheyali","how to start"],["price cheppandi","tell price"],
    ["ela","how"],["enti","what"],["entha","how much"],["emi","what"],
    ["eppadi velai seiyum","how does it work"],["ethanai aagum","how much cost"],
    ["thodangu eppadi","how to start"],["vilai enna","what is price"],
    ["eppadi","how"],["ethanai","how much"],["enna","what"],["epdi","how"],
  ];

  const _hinglishRegexes = HINGLISH_RAW
    .sort((a, b) => b[0].length - a[0].length)
    .map(([k, v]) => ({
      re: new RegExp("(?<![a-z0-9])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-z0-9])", "gi"),
      v,
    }));

  function dedupeChars(s) {
    return s.replace(/(.)\1{2,}/g, "$1$1").replace(/(.)\1{2,}/g, "$1");
  }

  function normalizeText(raw) {
    if (!raw) return "";
    let s = String(raw).toLowerCase().trim();
    s = dedupeChars(s);
    s = s.replace(/['''""`]/g, "").replace(/[^\w\s\u20b9@.+\-]/g, " ").replace(/\s{2,}/g, " ").trim();
    for (const { re, v } of _hinglishRegexes) s = s.replace(re, v);
    return s;
  }

  function tokenize(s) { return s.split(/\s+/).filter(Boolean); }
  function lemmatize(t) { return LEMMA[t] || t; }
  function lemTokens(s) { return tokenize(s).map(lemmatize); }

  function ngrams(tokens, n) {
    const out = [];
    for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(" "));
    return out;
  }
  function allGrams(tokens) {
    const s = new Set(tokens);
    ngrams(tokens, 2).forEach(g => s.add(g));
    ngrams(tokens, 3).forEach(g => s.add(g));
    return s;
  }

  function splitSentences(s) {
    return s.split(/[?.!]|\baur\b|\band\b|\bor\b|\bplus\b|\balso\b|\bthen\b/i)
      .map(x => x.trim()).filter(x => x.length > 2);
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return dp[m][n];
  }

  function fuzzyScore(word, target) {
    if (word === target) return 1;
    if (word.length < 3 || target.length < 3) return word === target ? 1 : 0;
    if (target.includes(word) || word.includes(target)) return 0.88;
    return 1 - levenshtein(word, target) / Math.max(word.length, target.length);
  }

  function overlap(gramSet, keywords) {
    let score = 0;
    for (const kw of keywords) {
      const lk = kw.split(" ").map(lemmatize).join(" ");
      if (gramSet.has(kw) || gramSet.has(lk)) score++;
    }
    return score;
  }

  function toConf(raw) {
    return Math.round((1 / (1 + Math.exp(-0.55 * (raw - 3)))) * 100) / 100;
  }

  function pick(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ""; }

  /* ════════════════════════════════════════════════════════════
     §2  IDF BOOST TABLE
  ════════════════════════════════════════════════════════════ */
  let IDF = {};
  let _idfBuilt = false;

  function buildIdf(intents) {
    if (_idfBuilt) return;
    const df = {}, N = intents.length;
    for (const intent of intents) {
      const seen = new Set();
      for (const t of [...(intent.keywords||[]), ...(intent.phrases||[])]) {
        const k = t.toLowerCase();
        if (!seen.has(k)) { df[k] = (df[k] || 0) + 1; seen.add(k); }
      }
    }
    IDF = {};
    for (const [t, f] of Object.entries(df)) IDF[t] = Math.log((N+1)/(f+1))+1;
    _idfBuilt = true;
  }

  /* ════════════════════════════════════════════════════════════
     §3  NAMED ENTITY RECOGNITION
  ════════════════════════════════════════════════════════════ */
  const NER = {
    PLAN_RE: [
      { re:/\bfree\s*plan\b|\bfree\b|\b\u20b90\b|\bzero\s*cost\b|\bno\s*cost\b|\bno\s*charge\b/i, key:"free" },
      { re:/\bstarter\b|\b999\b|\bentry\s*level\b|\bcheapest\s*plan\b|\blowest\s*plan\b|\bbeginner\s*plan\b/i, key:"starter" },
      { re:/\bgrowth\b|\b1499\b|\badvanced\s*plan\b|\bpremium\s*plan\b|\bpro\s*plan\b|\bfull\s*plan\b/i, key:"growth" },
      { re:/\bwhatsapp\s*(plan|automation|system|bot|only)?\b|\bwa\s*plan\b|\b2499\b/i, key:"whatsapp" },
      { re:/\bcombo\b|\bboth\s*platform\b|\b2498\b|\bfull\s*funnel\b|\bfull\s*system\b|\bdual\s*platform\b/i, key:"combo" },
    ],
    INDIRECT_PLAN_RE: [
      { re:/\bcheap(est)?\b|\blow\s*budget\b|\baffordable\b|\blow\s*cost\b|\bentry\b/i, key:"starter" },
      { re:/\bfull\s*(system|automation|package|solution|setup)\b|\beverything\b|\ball\s*(in\s*one|features)\b/i, key:"combo" },
      { re:/\bbest\s*plan\b|\btop\s*plan\b|\bmost\s*popular\b|\brecommended\b|\bmost\s*feature\b/i, key:"growth" },
    ],
    PRICE_RE: /\bprice\b|\bcost\b|\bcharge\b|\bfee\b|\brate\b|\bpay\b|\bamount\b|\bmonthly\b|\brupee\b|\binr\b|\brs\b|\b\u20b9\b|\bhow\s*much\b|\bbudget\b/i,
    POS_RE:   /\bwant\b|\binterested\b|\bready\b|\bbuy\b|\bsign\s*up\b|\bjoin\b|\bbook\b|\bproceed\b|\bconfirm\b|\byes\b|\blet.?s\s*go\b/i,
    NEG_RE:   /\bnot\s*sure\b|\bnot\s*interested\b|\bcancel\b|\bstop\b|\bquit\b|\bexpensive\b|\bafford\b|\bdoubt\b|\bscam\b|\bfraud\b|\bban\b/i,
    Q_RE:     /\bwhat\b|\bhow\b|\bwhen\b|\bwhy\b|\bwhere\b|\bwhich\b|\bdoes\b|\bcan\b|\bwill\b|\bis\b|\bare\b|\bdo\b/i,

    extract(s) {
      let plan = null;
      for (const { re, key } of this.PLAN_RE) if (re.test(s)) { plan = key; break; }
      if (!plan) for (const { re, key } of this.INDIRECT_PLAN_RE) if (re.test(s)) { plan = key; break; }
      return {
        plan,
        hasPriceSignal: this.PRICE_RE.test(s),
        sentiment: this.NEG_RE.test(s) ? "negative" : this.POS_RE.test(s) ? "positive" : "neutral",
        isQuestion: this.Q_RE.test(s),
      };
    }
  };

  /* ════════════════════════════════════════════════════════════
     §3b  HARDCODED FAST-PATH PATTERNS
  ════════════════════════════════════════════════════════════ */
  const FAST_PATH = [
    {
      re: /\b(price|pricing|cost|costs|charge|charges|fee|fees|rate|rates|pay|payment|how\s*much|budget|monthly|rupee|rupees|inr|rs|\u20b9|kitna|paisa|paise|lagega|lagenge|mehenga|sasta)\b/i,
      handler: (entities) => entities.plan ? buildPlanDetail(entities.plan) : buildPricingOverview()
    },
    {
      re: /\bplan(s)?\b|\bpackage(s)?\b|\bsubscription(s)?\b|\btier(s)?\b/i,
      handler: (entities) => entities.plan ? buildPlanDetail(entities.plan) : buildPricingOverview()
    },
    {
      re: /^(hi|hey|hello|hlo|hlw|yo|sup|namaste|namaskar|hai|hii|heyy|howdy|good\s*(morning|evening|afternoon)|start|help)[\s!?.]*$/i,
      handler: () => buildGreeting()
    },
    {
      re: /^(what\s*is\s*(this|it)|tell\s*me\s*about|about\s*you|about\s*this)[\s?]*$/i,
      handler: () => buildAbout()
    },
  ];

  /* ════════════════════════════════════════════════════════════
     §4  USER-TYPE DETECTION
  ════════════════════════════════════════════════════════════ */
  function detectUserType(normInput) {
    for (const ut of (D().user_types || []))
      if (ut.signals.some(sig => normInput.includes(sig))) return ut;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §5  INTENT CATALOGUE  (27 intents)
  ════════════════════════════════════════════════════════════ */
  const INTENTS = [
    { id:"greeting", priority:8,
      keywords:["hello","hi","hey","good morning","good evening","good afternoon",
        "greetings","howdy","start","help me","anyone there","are you there",
        "hlo","hlw","welcome","yo","sup","wassup"],
      phrases:["hi there","hey there","i need help","need help","is anyone here"],
      planHint:null },

    { id:"pricing", priority:2,
      keywords:["price","pricing","cost","charge","fee","rate","payment","pay",
        "budget","subscription","monthly","investment","spend","how much",
        "affordable","cheap","expensive","money","amount","total","rupee","inr","rs",
        "what is price","tell price","what are charges","how much cost","monthly price"],
      phrases:["how much does it cost","what is the price","what are the charges",
        "monthly charge","total cost","how much will it cost","what is the fee",
        "price kya hai","kitna lagta hai","kitna lagega","kitna hai",
        "rate kya hai","charges kya hai","price batao","tell me the price",
        "how much is it","price please","how much money","how much total",
        "cost kya hai","monthly kitna","mahine ka kitna"],
      planHint:null },

    { id:"plan_free", priority:1,
      keywords:["free","zero","no cost","without paying","free version","freemium",
        "basic plan","zero investment","try","test","no charge","no payment",
        "nothing to pay","free milega"],
      phrases:["is it free","start free","free plan features","what does free include",
        "free plan kya hai","zero cost mein","no money needed"],
      planHint:"free" },

    { id:"plan_starter", priority:1,
      keywords:["starter","999","basic paid","entry level","first plan",
        "cheapest plan","lowest plan","beginner plan","entry plan","small plan"],
      phrases:["starter plan features","starter mein kya milega","999 wala plan",
        "cheapest paid plan","starter plan kya hai"],
      planHint:"starter" },

    { id:"plan_growth", priority:1,
      keywords:["growth","1499","advanced plan","premium","best plan","top plan",
        "full plan","complete plan","max plan","pro plan","top tier",
        "most feature","ultimate","recommended plan"],
      phrases:["growth plan features","growth mein kya milega","1499 wala plan",
        "best plan kaunsa hai","full automation plan","growth plan kya hai",
        "which plan is best","most popular plan","sabse acha plan"],
      planHint:"growth" },

    { id:"plan_whatsapp", priority:1,
      keywords:["whatsapp plan","whatsapp automation","whatsapp setup","wa plan",
        "wp plan","2499","whatsapp system","whatsapp bot","whatsapp lead",
        "whatsapp qualification","whatsapp only"],
      phrases:["whatsapp automation price","whatsapp setup cost",
        "wa automation kya hai","whatsapp plan details"],
      planHint:"whatsapp" },

    { id:"plan_combo", priority:1,
      keywords:["combo","both platform","instagram whatsapp","combined","full funnel",
        "2498","ig and wa","dual platform","combo plan","acquisition funnel",
        "together","dono platform","full system","everything together"],
      phrases:["combo plan features","both instagram and whatsapp","combined setup",
        "full system price","instagram plus whatsapp","dono platform ka plan",
        "full setup cost","complete automation price"],
      planHint:"combo" },

    { id:"compare_plans", priority:3,
      keywords:["compare","comparison","difference","which plan","option","package",
        "tier","better","suggest","recommend","which one","which is best",
        "what to choose","right plan","sahi plan","plan comparison","vs","versus"],
      phrases:["which plan is best for me","difference between plans",
        "free vs starter","starter vs growth","plans comparison",
        "best plan for me","kaunsa plan lena chahiye",
        "which plan should i take","which plan should i choose"],
      planHint:null },

    { id:"services", priority:4,
      keywords:["service","feature","what do you do","what you offer","what include",
        "what you build","instagram dm","comment to dm","story reply","hot lead",
        "follow up","reengagement","re-engagement","qualification",
        "booking funnel","lead capture","story automation","comment automation"],
      phrases:["what services do you offer","features kya hain",
        "what does it include","all features","complete system",
        "what is comment to dm","what is story automation",
        "what all do you provide","kya kya milta hai"],
      planHint:null },

    { id:"process", priority:3,
      keywords:["how","work","process","flow","explain","working","step","understand",
        "mechanism","procedure","inside","logic","how does","how system",
        "what happen","system work"],
      phrases:["how it works","how does it work","kaise kaam karta hai",
        "step by step","process kya hai","explain the system",
        "how does automation work","what happens after"],
      planHint:null },

    { id:"results", priority:5,
      keywords:["result","client","booked","call","conversion","outcome","success",
        "proof","testimonial","review","guarantee","does it work","performance",
        "effective","roi","return","worth","lead","case study","real result"],
      phrases:["will i get clients","does it really work",
        "what results can i expect","proof of result",
        "guarantee kya hai","real results dikhao",
        "kya clients milenge","success rate kya hai"],
      planHint:null },

    { id:"safety", priority:5,
      keywords:["safe","safety","scam","fraud","fake","real","legit","trust",
        "trustworthy","legitimate","genuine","authentic","secure","ban",
        "account ban","suspend","risk","danger","spam","bulk","password"],
      phrases:["is it safe","account ban hoga","is this legit","can i trust",
        "account safe rahega","will it spam","is it a scam","safe for instagram",
        "kya safe hai","account jayega kya"],
      planHint:null },

    { id:"setup", priority:4,
      keywords:["setup","time","day","hour","delivery","when","ready","live",
        "deploy","launch","install","how long","fast","quick","implementation",
        "going live","kab start","kab live","how fast","setup time"],
      phrases:["setup time kitna hai","how long does setup take",
        "when will it go live","delivery time kya hai",
        "kitne din mein ready hoga","setup fast hai kya","kab se start hoga"],
      planHint:null },

    { id:"demo", priority:5,
      keywords:["demo","show","example","live","sample","preview","experience",
        "see","watch","try","see it","demonstration","test","working example"],
      phrases:["show me demo","can i see demo","demo available hai",
        "see how it works","want to see a demo","show me how it works",
        "demo kaise milega","request demo"],
      planHint:null },

    { id:"contact", priority:6,
      keywords:["contact","reach","talk","human","real person","phone","email",
        "whatsapp","directly","personal","booking","book","call","schedule",
        "appointment","consultation","get started","sign up","start now","join",
        "begin","number","whatsapp number","email address"],
      phrases:["how do i contact","book a call","get started",
        "how to get started","book free call","contact kaise karun",
        "talk to someone","directly baat karni hai","whatsapp pe contact"],
      planHint:null },

    { id:"tools", priority:7,
      keywords:["manychat","tool","software","technology","platform","app",
        "tech stack","google sheet","what software","which app","backend",
        "technology used","which tool"],
      phrases:["which tools are used","what software do you use",
        "manychat kya hai","technology kya hai","tools kya hain"],
      planHint:null },

    { id:"about", priority:7,
      keywords:["about","who","founder","background","experience","company",
        "agency","ayush","who is ayush","about you","who are you",
        "who built","who made","story","history","mission"],
      phrases:["about ayush ai automation","who is behind this",
        "founder kaun hai","tell me about you","agency ki story","ayush kaun hai"],
      planHint:null },

    { id:"objection_expensive", priority:6,
      keywords:["expensive","costly","too much","not affordable","cant afford",
        "afford","budget low","no money","discount","offer","negotiate",
        "cheaper","reduce price","too expensive","lower price","price high",
        "mehenga","bahut mehenga","bahut zyada"],
      phrases:["price bahut mehenga hai","cant afford this",
        "too expensive for me","can you reduce price","discount milega kya",
        "budget nahi hai","itna nahi de sakta","price kam karo",
        "is there a discount","any discount available"],
      planHint:null },

    { id:"objection_time", priority:6,
      keywords:["no time","time waste","time consuming","maintenance","manage",
        "busy","daily manage","takes too long","bahut time","time nahi",
        "time investment","worth the time"],
      phrases:["bahut time lagega kya","dont have time for this",
        "too much maintenance","time consuming hai kya","manage karna padega kya"],
      planHint:null },

    { id:"objection_va", priority:6,
      keywords:["virtual assistant","va","hire someone","manual reply",
        "employee","staff","manually","vs automation","do it myself",
        "can do manually","why not manual"],
      phrases:["why not hire a va","manual reply better hai kya",
        "why automation not va","vs virtual assistant"],
      planHint:null },

    { id:"objection_unsure", priority:6,
      keywords:["not sure","unsure","thinking","confused","doubt","maybe",
        "overthinking","decide","pata nahi","should i","maybe later",
        "not decided","still thinking","not confident"],
      phrases:["not sure if i should","soch raha hun karu ya nahi",
        "doubt hai kya ye kaam karega","let me think",
        "pata nahi worth it hai ya nahi","thinking about it"],
      planHint:null },

    { id:"cancel", priority:7,
      keywords:["cancel","stop","discontinue","exit","quit","leave",
        "not continue","contract","lock in","commitment","locked",
        "monthly end","stop service","band karo"],
      phrases:["can i cancel","how to stop service","no contract right",
        "can i leave","cancel subscription","service band karna hai"],
      planHint:null },

    { id:"revisions", priority:7,
      keywords:["revision","change","edit","modify","update","customize",
        "customization","adjust","tweak","alter","flow change","update flow",
        "script change","message change"],
      phrases:["can i request changes","revision milega kya","can i modify",
        "edit the flows","update the system","flow change kar sakta hun"],
      planHint:null },

    { id:"requirements", priority:7,
      keywords:["requirement","need from me","access","prerequisite",
        "provide","share","credential","what to give",
        "account access","password","login","what is needed"],
      phrases:["what do you need from me","setup ke liye kya chahiye",
        "what access do you need","what to provide","kya dena hoga"],
      planHint:null },

    { id:"human_feel", priority:7,
      keywords:["robotic","natural","bot feel","fake","real feel","human like",
        "organic","personal","conversational","clients notice","bot obvious",
        "feel natural","human tone","bot pata chalega"],
      phrases:["will clients know its a bot","kya bot obvious hoga",
        "robotic lagega kya","natural lagega kya","human jaisa feel"],
      planHint:null },

    { id:"both_platforms", priority:4,
      keywords:["both","dono","two platform","instagram and whatsapp","combined",
        "multi platform","dual","together","saath mein","ek saath",
        "instagram whatsapp both","use both"],
      phrases:["can i use both instagram and whatsapp",
        "dono platforms pe automation","ig and wa combined",
        "instagram plus whatsapp together"],
      planHint:null },

    { id:"thanks", priority:9,
      keywords:["thanks","thank you","great","awesome","perfect","cool","nice",
        "ok","okay","fine","understood","got it","clear","appreciate",
        "badhiya","shukriya","helpful","bye","goodbye","done","all good"],
      phrases:["thanks for that","that was helpful","got it thank you",
        "okay understood","perfect thanks","clear hai ab"],
      planHint:null },
  ];

  /* ════════════════════════════════════════════════════════════
     §6  INTENT SCORER  (IDF + phrase + fuzzy)
  ════════════════════════════════════════════════════════════ */
  function scoreIntents(normInput) {
    buildIdf(INTENTS);
    const tokens = lemTokens(normInput);
    const grams  = allGrams(tokens);
    const scored = [];

    for (const intent of INTENTS) {
      let score = 0;

      for (const kw of (intent.keywords || [])) {
        const lk  = kw.split(" ").map(lemmatize).join(" ");
        const idf = IDF[kw] || 1;
        if (grams.has(kw) || grams.has(lk)) {
          score += idf;
        } else if (!kw.includes(" ")) {
          for (const tok of tokens) {
            const sim = fuzzyScore(tok, kw);
            if (sim >= 0.79) { score += 0.55 * idf * sim; break; }
          }
        }
      }

      for (const ph of (intent.phrases || [])) {
        const lp = ph.split(" ").map(lemmatize).join(" ");
        if (normInput.includes(ph) || normInput.includes(lp))
          score += 3.5 * (IDF[ph] || 1.2);
      }

      if (score > 0) scored.push({
        id: intent.id, score,
        confidence: toConf(score),
        planHint: intent.planHint,
        priority: intent.priority,
      });
    }

    return scored.sort((a, b) => b.score - a.score || a.priority - b.priority);
  }

  /* ════════════════════════════════════════════════════════════
     §7  CONTEXT MEMORY — Upgraded with Semantic Slots
  ════════════════════════════════════════════════════════════ */
  const MEM = {
    history: [],
    MAX: 6,
    slots: {
      userGoal: null,
      budgetSentiment: null, // "price_sensitive" | "price_curious" | "price_ok"
      urgency: null,         // "now" | "later" | "unknown"
      trustLevel: 0,         // 0–10
      questionDepth: 0,
    },

    push(intent, plan, entities, input) {
      this.history.push({ intent, plan, entities, input });
      if (this.history.length > this.MAX) this.history.shift();

      // Update semantic slots
      if (entities && entities.sentiment === "positive")
        this.slots.trustLevel = Math.min(10, this.slots.trustLevel + 1.5);
      if (entities && entities.sentiment === "negative")
        this.slots.trustLevel = Math.max(0, this.slots.trustLevel - 1);
      if (intent === "objection_expensive")
        this.slots.budgetSentiment = "price_sensitive";
      if (intent === "pricing" && entities && entities.sentiment !== "negative")
        this.slots.budgetSentiment = "price_curious";
      if (intent === "contact" || intent === "demo")
        this.slots.trustLevel = Math.min(10, this.slots.trustLevel + 2);
      if (input && /now|today|ready|start|proceed|go ahead|let.?s go/i.test(input))
        this.slots.urgency = "now";
      if (input && /later|think|maybe|soch|abhi nahi/i.test(input))
        this.slots.urgency = "later";
      if (intent && intent !== "greeting" && intent !== "thanks")
        this.slots.questionDepth++;
    },

    get last()       { return this.history[this.history.length-1] || {}; },
    get lastPlan()   { return [...this.history].reverse().find(h => h.plan)?.plan || null; },
    get lastIntent() { return this.last.intent || null; },
    get turnCount()  { return this.history.length; },
    resolvePlan(nerPlan) { return nerPlan || this.lastPlan; },

    getContextHints() {
      const hints = [];
      if (this.slots.budgetSentiment === "price_sensitive") hints.push("user_price_sensitive");
      if (this.slots.urgency === "now") hints.push("user_ready_now");
      if (this.slots.questionDepth > 4) hints.push("deep_researcher");
      if (this.slots.trustLevel > 6) hints.push("trust_established");
      if (this.slots.urgency === "later") hints.push("user_not_ready");
      return hints;
    },

    getDepthStage() {
      const turns = this.history.length;
      if (turns >= 6) return "evaluating";
      if (turns >= 3) return "exploring";
      return "surface";
    }
  };

  /* ════════════════════════════════════════════════════════════
     §7b  USER PROFILE — localStorage persistent cross-session
  ════════════════════════════════════════════════════════════ */
  const USER_PROFILE = {
    KEY: "aaa_user_profile_v1",

    defaults() {
      return {
        visitCount: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        coachType: null,
        platformInterest: null,
        objections: [],
        topicsAsked: [],
        conversionStage: "aware", // aware → interested → considering → ready
        name: null,
        lastPlanDiscussed: null,
      };
    },

    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        const saved = raw ? JSON.parse(raw) : null;
        return saved ? { ...this.defaults(), ...saved } : this.defaults();
      } catch(_) { return this.defaults(); }
    },

    save(profile) {
      try { localStorage.setItem(this.KEY, JSON.stringify(profile)); } catch(_) {}
    },

    update(profile, intent, entities, normInput) {
      profile.lastSeen = Date.now();
      profile.visitCount = (profile.visitCount || 0) + 1;

      // Coach type detection
      if (/fat\s*loss|weight\s*loss|transformation/i.test(normInput)) profile.coachType = "fat_loss";
      else if (/muscle|bodybuilding|bulk/i.test(normInput)) profile.coachType = "muscle";
      else if (/yoga/i.test(normInput)) profile.coachType = "yoga";
      else if (/nutrition|diet/i.test(normInput)) profile.coachType = "nutrition";

      // Platform interest
      if (/instagram|ig\b/i.test(normInput) && !/whatsapp/i.test(normInput)) profile.platformInterest = "instagram";
      else if (/whatsapp|wa\b/i.test(normInput) && !/instagram/i.test(normInput)) profile.platformInterest = "whatsapp";
      else if (/both|combo|dono/i.test(normInput)) profile.platformInterest = "both";

      // Conversion stage progression
      if (intent === "pricing" && profile.conversionStage === "aware")
        profile.conversionStage = "interested";
      if ((intent === "demo" || intent === "contact") && profile.conversionStage === "interested")
        profile.conversionStage = "considering";
      if (entities && entities.sentiment === "positive" && profile.conversionStage === "considering")
        profile.conversionStage = "ready";

      // Objection tracking
      if (intent && intent.startsWith("objection_") && !profile.objections.includes(intent))
        profile.objections.push(intent);

      // Plan interest
      if (entities && entities.plan) profile.lastPlanDiscussed = entities.plan;

      // Topics asked
      if (intent && !profile.topicsAsked.includes(intent))
        profile.topicsAsked.push(intent);

      this.save(profile);
      return profile;
    }
  };

  /* ════════════════════════════════════════════════════════════
     §7c  SESSION — sessionStorage per-visit
  ════════════════════════════════════════════════════════════ */
  const SESSION = {
    KEY: "aaa_session_v1",

    fresh() {
      return {
        startTime: Date.now(),
        messageCount: 0,
        ctaShownCount: 0,
        currentTopic: null,
        lastBotFingerprint: "",
      };
    },

    get() {
      try {
        return JSON.parse(sessionStorage.getItem(this.KEY)) || this.fresh();
      } catch(_) { return this.fresh(); }
    },

    save(s) {
      try { sessionStorage.setItem(this.KEY, JSON.stringify(s)); } catch(_) {}
    },

    bumpMessage() {
      const s = this.get();
      s.messageCount++;
      this.save(s);
    },

    trackCta() {
      const s = this.get();
      s.ctaShownCount++;
      this.save(s);
      return s.ctaShownCount;
    },

    ctaCount() {
      return this.get().ctaShownCount;
    },

    setTopic(intent) {
      const s = this.get();
      s.currentTopic = intent;
      this.save(s);
    }
  };

  /* ════════════════════════════════════════════════════════════
     §7d  RESPONSE HISTORY — anti-repetition fingerprinting
  ════════════════════════════════════════════════════════════ */
  const RESPONSE_HISTORY = {
    hashes: [],
    MAX: 8,

    fingerprint(text) {
      return text.slice(0, 70).replace(/\s+/g, "").toLowerCase();
    },

    isDuplicate(text) {
      return this.hashes.includes(this.fingerprint(text));
    },

    register(text) {
      const fp = this.fingerprint(text);
      if (!this.hashes.includes(fp)) {
        this.hashes.push(fp);
        if (this.hashes.length > this.MAX) this.hashes.shift();
      }
    }
  };

  /* ════════════════════════════════════════════════════════════
     §7e  SEMANTIC CLUSTERS — keyword-cluster profiling
  ════════════════════════════════════════════════════════════ */
  const SEMANTIC_CLUSTERS = {
    trust_concern:    ["safe","ban","scam","fraud","risk","fake","legit","genuine","trust"],
    price_concern:    ["expensive","costly","budget","afford","cheap","mehenga","worth","price"],
    time_concern:     ["busy","management","daily","time","effort","complicated","maintain"],
    results_interest: ["results","proof","work","effective","coaches","clients","case","guarantee"],
    ready_to_buy:     ["start","setup","ready","proceed","book","join","yes","let's go","begin"],
    just_browsing:    ["just checking","curious","maybe","thinking","later","not sure","exploring"],
  };

  function getSemanticProfile() {
    const allInputs = MEM.history.map(h => h.input || "").join(" ").toLowerCase();
    const profile = {};
    for (const [cluster, keywords] of Object.entries(SEMANTIC_CLUSTERS)) {
      const hits = keywords.filter(kw => allInputs.includes(kw)).length;
      if (hits > 0) profile[cluster] = hits;
    }
    return profile;
  }

  /* ════════════════════════════════════════════════════════════
     §7f  NAME EXTRACTION
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
     §7g  EMOTIONAL ENERGY DETECTION
  ════════════════════════════════════════════════════════════ */
  function detectUserEnergy(rawInput) {
    const excl  = (rawInput.match(/!/g) || []).length;
    const caps  = (rawInput.match(/[A-Z]/g) || []).length / Math.max(rawInput.length, 1);
    const words = rawInput.split(/\s+/).length;
    const q     = (rawInput.match(/\?/g) || []).length;

    if (excl >= 2 || caps > 0.4) return "high_energy";
    if (words <= 3 && q === 0) return "terse";
    if (words >= 20) return "detailed";
    return "normal";
  }

  function mirrorEnergy(text, energy) {
    if (energy === "terse") {
      // Give a shorter version — first meaningful section
      const lines = text.split("\n").filter(l => l.trim());
      return lines.slice(0, Math.min(6, lines.length)).join("\n");
    }
    if (energy === "high_energy" && !text.includes("!")) {
      return text.replace(/\.$/, "!");
    }
    return text;
  }

  /* ════════════════════════════════════════════════════════════
     §8  PLAN UTILITIES
  ════════════════════════════════════════════════════════════ */
  const PLAN_IDX = { free:0, starter:1, growth:2, whatsapp:3, combo:4 };
  function getPlan(key) {
    const i = PLAN_IDX[key];
    const plans = D().plans || [];
    return (i !== undefined) ? (plans[i] || null) : null;
  }
  function planFromIntents(scored) {
    for (const s of scored) if (s.planHint) return s.planHint;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §8b  PLAN TRANSFORMATIONS — before/after framing
  ════════════════════════════════════════════════════════════ */
  const PLAN_TRANSFORMATIONS = {
    free:     "Before: manually answering the same DM questions all day.\nAfter: bot handles all common queries 24/7 — you only respond to genuine interest.",
    starter:  "Before: can't tell serious leads from time-wasters, spending hours replying.\nAfter: every lead tagged and prioritised — your time goes only to high-intent people.",
    growth:   "Before: leads going cold after the first message, no follow-up system.\nAfter: multi-step follow-up keeps them warm until they're ready to book.",
    whatsapp: "Before: answering the same WhatsApp questions manually, all day long.\nAfter: system qualifies and routes automatically — you see only ready buyers.",
    combo:    "Before: juggling both Instagram and WhatsApp manually, leads slipping through.\nAfter: one connected system handles both end to end — from first message to booked call.",
  };

  /* ════════════════════════════════════════════════════════════
     §9  RESPONSE FACTORY
  ════════════════════════════════════════════════════════════ */
  function R(text, link, cta) { return { text: text || "", link: link || null, cta: cta || null }; }

  /* ════════════════════════════════════════════════════════════
     §10  SALES LAYER — Smart CTA suppression
  ════════════════════════════════════════════════════════════ */
  const _ctaIdx = { n: 0 };

  function nextCta() {
    const variants = D().cta_variants || ["Want to see how this would work for your page?"];
    const c = variants[_ctaIdx.n % variants.length];
    _ctaIdx.n++;
    return c;
  }

  function selectContextualCta(hints) {
    if (hints.includes("user_ready_now"))
      return "Ready to start? We can have everything live within 48 hours.";
    if (hints.includes("user_price_sensitive"))
      return "You can start with the Free Plan — ₹0, no card, zero risk.";
    if (hints.includes("deep_researcher"))
      return "Want me to map this specifically for your coaching setup?";
    if (hints.includes("trust_established"))
      return "Want to see it live before deciding? 10 minutes, zero pressure.";
    return nextCta();
  }

  function salesLayer(text, options = {}) {
    const { skipCta = false, addUrgency = false } = options;
    let out = text;

    const hints = MEM.getContextHints();
    const ctaCount = SESSION.ctaCount();

    // Smart suppression logic
    const suppressCta = skipCta
      || ctaCount >= 3
      || MEM.slots.trustLevel < 1.5
      || (hints.includes("user_price_sensitive") && ctaCount >= 1)
      || hints.includes("user_not_ready");

    if (!suppressCta) {
      const cta = selectContextualCta(hints);
      out += "\n\n👉 " + cta;
      SESSION.trackCta();
    }

    if (addUrgency && MEM.slots.trustLevel > 4) {
      const urgency = D().urgency || [];
      if (urgency.length) out += "\n⚡ " + pick(urgency);
    }

    return out;
  }

  /* ════════════════════════════════════════════════════════════
     §10b  ACKNOWLEDGMENT PREFIXES
  ════════════════════════════════════════════════════════════ */
  const ACKNOWLEDGMENTS = {
    pricing:              ["Sure —", "Good question —", "Here's the breakdown —", "Let me break that down —"],
    safety:               ["Totally fair concern —", "Honest answer —", "Let me be straight with you —"],
    objection_expensive:  ["Fair point —", "Let me put that in perspective —", "Makes sense to ask —"],
    objection_time:       ["Good thing to flag —", "Here's the real picture —"],
    objection_unsure:     ["That's completely valid —", "Totally understandable —"],
    objection_va:         ["Worth comparing —", "Honest breakdown —"],
    process:              ["Here's exactly how it works —", "Step by step —"],
    demo:                 ["Absolutely —", "Yes, 100% —"],
    results:              ["Real question —", "Let me give you the honest picture —"],
    safety_variant:       ["No worries —"],
    setup:                ["Quick answer —", "Here's the timeline —"],
    tools:                ["Good to know what's under the hood —"],
    human_feel:           ["Valid concern —"],
    contact:              ["Of course —"],
    thanks:               ["Of course!", "Happy to help!", "Glad that was clear!"],
    cancel:               ["Sure —"],
    revisions:            ["Yes absolutely —"],
    requirements:         ["Simple answer —"],
  };

  function getAck(intent) {
    const opts = ACKNOWLEDGMENTS[intent];
    if (!opts || !opts.length) return "";
    // 80% show rate — not every single message, keeps it natural
    if (Math.random() > 0.8) return "";
    return pick(opts) + " ";
  }

  /* ════════════════════════════════════════════════════════════
     §10c  FOLLOW-UP QUESTIONS
  ════════════════════════════════════════════════════════════ */
  const FOLLOW_UPS = {
    pricing:   [
      "Which stage are you at — just starting out, or already getting DMs regularly?",
      "Are you on Instagram, WhatsApp, or both?",
      "What does your current situation look like — getting leads but struggling to convert them?"
    ],
    process:   ["Want to see what the actual qualifying conversation looks like for a lead?"],
    safety:    ["Want to see the demo? You'd experience it exactly the way your leads would."],
    results:   ["What's your current lead situation — getting DMs but not converting them to calls?"],
    services:  ["Which matters more to you right now — Instagram DMs or WhatsApp enquiries?"],
    demo:      ["Should I send you the demo link directly?"],
    about:     ["Anything specific you'd like to know about how the system was built?"],
    compare_plans: ["What's your main goal right now — save time, get more calls, or both?"],
  };

  function getFollowUp(intent, conversionStage) {
    if (conversionStage === "ready") return null;
    const opts = FOLLOW_UPS[intent];
    if (!opts) return null;
    if (Math.random() > 0.7) return null; // 70% show rate
    return pick(opts);
  }

  /* ════════════════════════════════════════════════════════════
     §10d  SMART DELAY — response length proportional
  ════════════════════════════════════════════════════════════ */
  function smartDelay(responseText) {
    const words = (responseText || "").split(/\s+/).length;
    const base  = 420;
    const perWord = 16;
    const jitter  = Math.random() * 280;
    const thinkPause = (words > 55 && Math.random() > 0.55) ? 550 : 0;
    return Math.min(base + (words * perWord) + jitter + thinkPause, 3600);
  }

  /* ════════════════════════════════════════════════════════════
     §10e  INTELLIGENT RESPONSE SPLITTER
  ════════════════════════════════════════════════════════════ */
  function intelligentSplit(text) {
    const paras = text.split(/\n\n+/);
    if (paras.length <= 1) return [text];

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
    return result.filter(s => s.length > 0);
  }

  /* ════════════════════════════════════════════════════════════
     §10f  HESITATION / SELF-CORRECTION ILLUSION
  ════════════════════════════════════════════════════════════ */
  function shouldHesitate() {
    return Math.random() < 0.08 && MEM.turnCount > 2;
  }

  const HESITATION_LINES = [
    "Actually, let me be more specific —",
    "Wait — better way to put it:",
    "Let me clarify that:",
    "More accurate answer:",
  ];

  function getHesitationLine() {
    return pick(HESITATION_LINES);
  }

  /* ════════════════════════════════════════════════════════════
     §11  DYNAMIC RESPONSE BUILDERS
  ════════════════════════════════════════════════════════════ */

  // ── §11.1  GREETING ──────────────────────────────────────────
  const GREET_OPENERS_NEW = [
    "Hey! 👋",
    "Hi there! 👋",
    "Hello! 🙌",
  ];

  const GREET_OPENERS_RETURNING = [
    "Welcome back! 👋",
    "Good to see you again! 👋",
    "Hey, welcome back! 👋",
  ];

  function buildGreeting() {
    const a       = D().agency || {};
    const profile = USER_PROFILE.load();
    const isReturn = profile.visitCount > 1;

    if (isReturn) {
      const daysSince = Math.floor((Date.now() - (profile.lastSeen || Date.now())) / 86400000);
      let opener = "";
      if (daysSince < 1)      opener = "Welcome back! 👋";
      else if (daysSince < 7) opener = "Good to see you again! 👋";
      else                    opener = "Hey, welcome back! It's been a while. 👋";

      const nameStr = profile.name ? ` ${profile.name}` : "";
      let contextLine = "";

      if (profile.lastPlanDiscussed && profile.conversionStage === "considering") {
        const pName = profile.lastPlanDiscussed.charAt(0).toUpperCase() + profile.lastPlanDiscussed.slice(1);
        contextLine = `\n\nLast time you were looking at the ${pName} Plan — want to pick up from there, or explore something new?`;
      } else if (profile.conversionStage === "interested") {
        contextLine = "\n\nStill exploring how automation could work for your coaching? Happy to go deeper on anything.";
      } else {
        contextLine = "\n\nWhat would you like to know today?";
      }

      return R(opener + nameStr + "!" + contextLine);
    }

    // First visit
    const nameStr = profile.name ? `, ${profile.name}` : "";
    return R(
      pick(GREET_OPENERS_NEW) + " Welcome to Ayush AI Automation." + "\n\n" +
      (a.tagline || "AI-powered DM automation for fitness coaches.") + "\n\n" +
      "I can help with:\n" +
      "💰 Pricing & Plans  ·  ⚙️ How it works  ·  📊 Features\n" +
      "🛡️ Safety  ·  🎥 Demo  ·  🚀 Getting started\n\n" +
      "What's on your mind?"
    );
  }

  // ── §11.2  PRICING OVERVIEW ──────────────────────────────────
  function buildPricingOverview() {
    const plans  = D().plans;
    const profile = USER_PROFILE.load();
    const stage  = MEM.getDepthStage();

    if (!plans || !plans.length) {
      return R(
        "Here are the plans:\n\n" +
        "🆓 Free Plan — ₹0/month\n→ Test automation, handle basic DM replies\n\n" +
        "🚀 Starter Plan — ₹999/month\n→ Lead tagging, qualification, 1 follow-up\n\n" +
        "⭐ Growth Plan — ₹1,499/month  (Most Popular)\n→ Full funnel, multi-step follow-ups, booking automation\n\n" +
        "💚 WhatsApp Plan — ₹1,499/month\n→ WhatsApp-only lead qualification\n\n" +
        "🔥 Combo Plan — ₹2,498/month\n→ Instagram + WhatsApp full system\n\n" +
        "📌 All paid plans need a separate ManyChat subscription.",
        "https://ayushaiautomation.in/pricing.html", "View Full Pricing"
      );
    }

    const tpl   = (D().response_templates && D().response_templates.pricing) || {};
    const intros = [
      "Here's the full pricing — simple breakdown:",
      "Let me show you exactly how the plans are structured:",
      "Here's what each plan costs and what you actually get:",
    ];
    const intro = pick(intros);

    const rows  = plans.map(p => {
      const star = p.popular ? " ⭐ Most Popular" : "";
      return `${p.name}${star}\n  💰 ${p.price}  ·  Setup: ${p.price_alt}\n  → ${p.best_for}`;
    }).join("\n\n");

    const closes = [
      "The right plan depends on where you are right now — not where you want to be.",
      "I can suggest the best fit if you tell me a bit about your current situation.",
      "Most coaches start with the Free Plan, see the system work, then upgrade.",
    ];
    const close = pick(closes);

    // At evaluating stage, inject social proof
    let proofLine = "";
    if (stage === "evaluating") {
      const cs = D().case_studies || [];
      if (cs.length) proofLine = `\n\n📊 Real result: ${cs[0].proof_line}`;
    }

    // Returning user with prior objection — soften the approach
    let footNote = "\n📌 Paid plans also need a ManyChat subscription.";
    if (profile.objections.includes("objection_expensive")) {
      footNote = "\n📌 Paid plans need ManyChat — but you can start FREE and see results before spending anything.";
    }

    return R(
      intro + "\n\n" + rows + "\n\n💡 " + close + proofLine + footNote,
      "https://ayushaiautomation.in/pricing.html", "View Full Pricing"
    );
  }

  // ── §11.3  PLAN DETAIL ───────────────────────────────────────
  const PLAN_OPENERS = {
    free:     [
      "Free Plan — genuinely ₹0. Here's the full picture:",
      "Here's what the Free Plan actually includes:",
    ],
    starter:  [
      "Starter Plan — organised leads, less manual work. Full breakdown:",
      "Here's everything inside the Starter Plan:",
    ],
    growth:   [
      "Growth Plan — this is our most popular, and here's why:",
      "Full Growth Plan breakdown — the one most coaches go with:",
    ],
    whatsapp: [
      "WhatsApp Qualification System — everything inside:",
      "Here's the full WhatsApp Plan detail:",
    ],
    combo:    [
      "Combo Plan — Instagram + WhatsApp, fully connected. Here's what you get:",
      "Full Combo Plan — the complete sales machine breakdown:",
    ],
  };

  function buildPlanDetail(key) {
    const plan  = getPlan(key);
    if (!plan) return buildPricingOverview();
    const stage = MEM.getDepthStage();
    const intro = pick(PLAN_OPENERS[key] || ["Plan details:"]);
    const feats = (plan.features || []).slice(0, 7).map(f => "✅ " + f).join("\n");
    const limits = plan.limitations && plan.limitations.length
      ? "\n\n❌ Not included:\n" + plan.limitations.slice(0, 4).map(l => "• " + l).join("\n")
      : "";
    const note = plan.note ? "\n\n💡 " + plan.note : "";

    // Before/after framing for exploring/evaluating stage
    const transformation = (stage !== "surface" && PLAN_TRANSFORMATIONS[key])
      ? "\n\n" + PLAN_TRANSFORMATIONS[key]
      : "";

    // Social proof injection at evaluating stage
    let proofLine = "";
    if (stage === "evaluating") {
      const cs = D().case_studies || [];
      const relevant = cs.find(c =>
        (key === "growth" && c.name.toLowerCase().includes("fat loss")) ||
        (key === "starter" && c.name.toLowerCase().includes("muscle"))
      ) || cs[0];
      if (relevant) proofLine = `\n\n📊 Real result: "${relevant.proof_line}"`;
    }

    return R(
      intro + "\n\n📋 " + plan.name +
      "\n💰 " + plan.price + "\n📦 Setup: " + plan.price_alt +
      "\n\n" + feats + limits + note + transformation + proofLine,
      "https://ayushaiautomation.in/pricing.html", "See Full Plan"
    );
  }

  // ── §11.4  COMPARISON ────────────────────────────────────────
  function buildComparison() {
    const plans = D().plans || [];
    const rows  = plans.map(p => {
      const star = p.popular ? " ⭐" : "";
      return `• ${p.name}${star}  —  ${p.price}\n  ${p.best_for}`;
    }).join("\n\n");
    const closes = [
      "🎯 Rule of thumb: Start FREE → get real results → upgrade only when it makes sense.",
      "🎯 Most coaches start free, see the system work in 48 hours, then decide from there.",
    ];
    return R(
      "Here's how to pick the right plan:\n\n" + rows + "\n\n" + pick(closes),
      "https://ayushaiautomation.in/pricing.html", "Compare All Plans"
    );
  }

  // ── §11.5  SERVICES ──────────────────────────────────────────
  function buildServices() {
    const svcs = (D().services || []).slice(0, 6);
    const list = svcs.map(s => `⚡ ${s.name}\n   ${s.short}`).join("\n\n");
    const intros = [
      "Here's the full automation system built for fitness coaches:",
      "Full picture — everything the system does:",
    ];
    return R(
      pick(intros) + "\n\n" +
      (list || "Instagram DM automation, WhatsApp automation, lead qualification, follow-up system, booking funnel.") +
      "\n\nEvery piece connects — from first DM to booked call. Fully automated.",
      "https://ayushaiautomation.in/services.html", "Explore All Services"
    );
  }

  // ── §11.6  PROCESS ───────────────────────────────────────────
  function buildProcess() {
    const steps = D().process || [];
    const list  = steps.map(s => `${s.step}️⃣ ${s.title}\n   ${s.desc}`).join("\n\n");
    return R(
      "Here's how it works — start to finish:\n\n" +
      (list || "1. Audit → 2. Build → 3. Launch → 4. Optimise") +
      "\n\n⏱️ You're live in 24–72 hours. You review and approve — we build everything.",
      "https://ayushaiautomation.in/process.html", "See Full Process"
    );
  }

  // ── §11.7  RESULTS ───────────────────────────────────────────
  const HONEST_UNCERTAINTY = [
    "Results vary by audience size and content quality — but here's the pattern we consistently see:",
    "Can't promise exact numbers, but based on fitness coaches we've worked with:",
    "This depends on your engagement rate — here's a realistic benchmark:",
  ];

  function buildResults() {
    const g  = (D().meta && D().meta.guarantee) || "14-day rebuild guarantee.";
    const cs = D().case_studies || [];
    const proofLines = cs.map(c =>
      `🏆 ${c.name}\n   "${c.proof_line}"\n   Before: ${c.before}\n   After:  ${c.after}`
    ).join("\n\n");

    const uncert = pick(HONEST_UNCERTAINTY);

    return R(
      uncert + "\n\n" +
      "• Significant drop in manual DM time\n" +
      "• Only qualified, serious leads reach you\n" +
      "• Consistent call bookings — even while you sleep\n" +
      "• 15–20 hours/week recovered\n\n" +
      "🛡️ Guarantee: " + g +
      (proofLines ? "\n\nReal coaches, real results:\n\n" + proofLines : ""),
      "https://ayushaiautomation.in/demo.html", "See Proof & Results"
    );
  }

  // ── §11.8  SAFETY ────────────────────────────────────────────
  function buildSafety() {
    const faq = (D().faqs || []).find(f => (f.keywords || []).includes("safe"));
    return R(
      "100% safe — here's the full picture:\n\n" +
      "✅ Uses ManyChat — official Instagram & Meta partner\n" +
      "✅ Trusted by 1M+ businesses worldwide\n" +
      "✅ Only ever replies when someone messages YOU first\n" +
      "✅ No spam, no bulk messages, no unsolicited outreach\n" +
      "✅ Zero ban risk — compliant automation only\n" +
      "✅ No password sharing — secure OAuth connection only" +
      (faq ? "\n\n" + faq.answer : "") +
      "\n\nYou see a live demo before any commitment — so you can verify everything yourself.",
      "https://ayushaiautomation.in/demo.html", "See Live Demo"
    );
  }

  // ── §11.9  SETUP ─────────────────────────────────────────────
  function buildSetup() {
    const tl   = (D().meta && D().meta.setup_timeline) || {};
    const reqs = (D().faqs || []).find(f => (f.keywords || []).some(k => k.includes("required")));
    return R(
      "Setup is fast — here's the timeline:\n\n" +
      "⏱️ Instagram automation: " + (tl.instagram || "24–72 hours") + "\n" +
      "⏱️ WhatsApp or Combo: "    + (tl.whatsapp_or_combo || "48–72 hours") + "\n\n" +
      "What you need to provide:\n" +
      (reqs ? reqs.answer : "Instagram OAuth access (no password), flow approval, payment. We handle everything else.") +
      "\n\n🔒 No password sharing. Secure official OAuth only.",
      "https://ayushaiautomation.in/process.html", "See Full Process"
    );
  }

  // ── §11.10  DEMO ─────────────────────────────────────────────
  function buildDemo() {
    const c   = D().contact || {};
    const faq = (D().faqs || []).find(f => (f.keywords || []).includes("demo"));
    return R(
      "Yes — full live demo before any commitment. 🎥\n\n" +
      "What you'll see:\n" +
      "• The exact conversation your leads would experience\n" +
      "• How it qualifies leads and filters out time-wasters\n" +
      "• How it moves someone toward booking — step by step\n\n" +
      "You experience it as your client would — interactive, not screenshots.\n" +
      "⏱️ Takes 10–15 minutes. Zero sales pressure.\n\n" +
      (faq ? faq.answer + "\n\n" : "") +
      "📱 Request via WhatsApp: " + (c.whatsapp || "+91 94772 93867"),
      c.demo || "https://ayushaiautomation.in/demo.html", "Request Live Demo"
    );
  }

  // ── §11.11  CONTACT ──────────────────────────────────────────
  function buildContact() {
    const c = D().contact || {};
    return R(
      "Here's how to reach us directly:\n\n" +
      "📱 WhatsApp: " + (c.whatsapp || "+91 94772 93867") + "\n" +
      "📧 Email: " + (c.email || "ayushtrades54@gmail.com") + "\n" +
      "📅 Book a free 15-min strategy call\n\n" +
      (c.cta ? c.cta + "\n\n" : "") +
      "⏱️ From call to live system: 24–72 hours.",
      c.booking || "https://ayushaiautomation.in/book.html", "Book Free Call"
    );
  }

  // ── §11.12  TOOLS ────────────────────────────────────────────
  function buildTools() {
    const faq   = (D().faqs || []).find(f => (f.keywords || []).includes("tools"));
    const tools = (D().meta && D().meta.tools_used) ? D().meta.tools_used.join(", ") : "ManyChat, Google Sheets";
    return R(
      "Tools powering the system:\n\n" +
      "🔧 ManyChat — the automation engine\n" +
      "   • Official Instagram & WhatsApp partner\n" +
      "   • 1M+ businesses worldwide\n" +
      "   • Zero ban risk\n\n" +
      "📊 Google Sheets — real-time lead tracking and reporting\n\n" +
      (faq ? faq.answer + "\n\n" : "") +
      "Stack: " + tools,
      "https://ayushaiautomation.in/faq.html", "Read Full FAQ"
    );
  }

  // ── §11.13  ABOUT ────────────────────────────────────────────
  function buildAbout() {
    const a = D().agency || {};
    return R(
      (a.name || "Ayush AI Automation") + "\n\n" +
      (a.about || "Done-for-you DM automation built exclusively for fitness coaches.") + "\n\n" +
      "🎯 Not a chatbot agency — a revenue system builder.",
      "https://ayushaiautomation.in/about.html", "Read About Us"
    );
  }

  // ── §11.14  HUMAN FEEL ───────────────────────────────────────
  function buildHumanFeel() {
    const faq = (D().faqs || []).find(f => (f.keywords || []).includes("human feel"));
    return R(
      "Honest answer:\n\n" +
      (faq ? faq.answer : "Conversations are built to feel natural and personalised — not robotic. Responses adapt to what each lead says. The standard we build to: leads genuinely mistake it for a real person."),
      null, null
    );
  }

  // ── §11.15  BOTH PLATFORMS ───────────────────────────────────
  function buildBothPlatforms() {
    const faq = (D().faqs || []).find(f => (f.keywords || []).join(" ").includes("both platforms"));
    return R(
      "Yes — both platforms together. 🔥\n\n" +
      (faq ? faq.answer : "Instagram captures and qualifies leads. WhatsApp closes and follows up. Together = one complete automated sales machine.") +
      "\n\n→ The Combo Plan covers both — see the full breakdown.",
      "https://ayushaiautomation.in/pricing.html", "View Combo Plan"
    );
  }

  // ── §11.16  OBJECTIONS ───────────────────────────────────────
  function buildObjection(type) {
    const keys = {
      objection_expensive: ["expensive","costly","price"],
      objection_time:      ["time","management"],
      objection_unsure:    ["not sure","situation"],
      objection_va:        ["va","virtual","assistant"],
    };
    const signals = keys[type] || [];
    const match   = (D().objection_handling || []).find(o =>
      signals.some(sig => (o.objection || "").toLowerCase().includes(sig))
    );
    const resp = match ? match.response : null;

    if (type === "objection_expensive") return R(
      "Real numbers:\n\n" +
      (resp || "Most coaches recover the cost with just 1 client. If your program is ₹5,000–15,000, this pays for itself almost immediately.") +
      "\n\n💡 Start FREE at ₹0 — no card needed. See results first. Upgrade when it makes financial sense.",
      "https://ayushaiautomation.in/pricing.html", "Start Free — ₹0"
    );

    if (type === "objection_time") return R(
      "You're saving time — not spending it:\n\n" +
      (resp || "Setup: 1–2 hours once. After that — zero daily management. 15–20 hours/week saved."),
      null, null
    );

    if (type === "objection_va") {
      const comp = (D().comparisons || []).find(c => c.vs === "Virtual Assistant");
      return R(
        "VA vs Automation — honest comparison:\n\n" +
        (comp ? comp.points.map(p => "• " + p).join("\n") : (resp || "Automation runs 24/7 at a fraction of the cost. A VA is one person — this is a system.")),
        "https://ayushaiautomation.in/coaches.html", "Why Coaches Choose This"
      );
    }

    if (type === "objection_unsure") return R(
      "Don't decide based on words — experience it first.\n\n" +
      (resp || "Request the free 10-min demo. See it running live. Then decide with zero pressure.") +
      "\n\nNo payment. No commitment. No pitch.",
      "https://ayushaiautomation.in/demo.html", "Try Free Demo"
    );

    return buildContact();
  }

  // ── §11.17  CANCEL ───────────────────────────────────────────
  function buildCancel() {
    const faq = (D().faqs || []).find(f => (f.keywords || []).includes("cancel"));
    return R(
      "No lock-in — here's how it works:\n\n" +
      (faq ? faq.answer : "Monthly plans — just don't renew. No contracts. No hidden fees."),
      "https://ayushaiautomation.in/terms.html", "Read Full Terms"
    );
  }

  // ── §11.18  REVISIONS ────────────────────────────────────────
  function buildRevisions() {
    const faq = (D().faqs || []).find(f => (f.keywords || []).includes("revisions"));
    return R(
      "Yes — revisions included in all active paid plans. 🔄\n\n" +
      (faq ? faq.answer : "Flow changes, message updates, new sequences — all included.") +
      "\n\nYour coaching evolves — your automation evolves with it.",
      "https://ayushaiautomation.in/services.html", "View Plans"
    );
  }

  // ── §11.19  REQUIREMENTS ─────────────────────────────────────
  function buildRequirements() {
    const faq = (D().faqs || []).find(f => (f.keywords || []).join(" ").includes("required"));
    return R(
      "Just three things from you:\n\n" +
      (faq ? faq.answer : "Instagram access via OAuth (no password), flow approval, payment. We handle everything else.") +
      "\n\n🔒 You never share your password. Secure official OAuth only.",
      "https://ayushaiautomation.in/process.html", "See Setup Steps"
    );
  }

  // ── §11.20  SMART RECOMMENDATION ─────────────────────────────
  function buildSmartRecommendation(userType) {
    if (!userType) return "";
    const tpl    = (D().response_templates && D().response_templates.recommendation) || {};
    const intros = [
      "Based on what you said:",
      "Your situation points to:",
      "Here's what I'd suggest for you:",
    ];
    const closes = [
      "This would be the most practical starting point.",
      "You can always upgrade later once results come in.",
    ];
    const rec    = userType.recommendation;
    const planKey = rec.toLowerCase().replace(/\s*(plan|or)\s*/gi, "").trim().split(" ")[0];
    const plan   = getPlan(planKey);
    return (
      pick(intros) + "\n\n" +
      "Your situation points to: " + rec + "\n" +
      (plan ? "💰 " + plan.price + " · " + plan.best_for : "") +
      "\n\n" + pick(closes)
    );
  }

  // ── §11.21  THANKS ───────────────────────────────────────────
  const THANKS_MSGS = [
    "Glad that helped! 👍\n\nAnytime you have more questions — just ask.",
    "Of course! 😊 Happy to help with anything else — pricing, features, setup, getting started.",
    "Great! The free demo is available whenever you're ready to see it live. 🎯",
    "No problem at all! What else would you like to know?",
  ];
  function buildThanks() {
    const profile = USER_PROFILE.load();
    const nameStr = profile.name ? `, ${profile.name}` : "";
    return R(pick(THANKS_MSGS).replace("!", `${nameStr}!`), "https://ayushaiautomation.in/demo.html", "See Demo");
  }

  // ── §11.22  FALLBACK ─────────────────────────────────────────
  const FALLBACK_VARIANTS = [
    "I want to make sure I give you the right answer — could you rephrase that slightly?\n\nI can help with:\n💰 Pricing & Plans  ·  ⚙️ How it works\n📊 Features  ·  🛡️ Safety\n🚀 Getting started  ·  🎥 Live Demo",
    "Not quite sure I caught that — want to try phrasing it differently?\n\nSome things I can help with:\n💰 Pricing  ·  ⚙️ How it works  ·  🛡️ Safety\n🎥 Demo  ·  🚀 Getting started",
    "Hmm, let me make sure I help you properly — could you be a bit more specific?\n\nI can cover: pricing, plans, safety, features, demo, setup, or getting started.",
  ];

  function buildFallback() {
    const profile = USER_PROFILE.load();
    if (MEM.turnCount > 0) {
      return R(pick(FALLBACK_VARIANTS), null, null);
    }
    return R(
      "Happy to help! Here's what I can cover:\n\n" +
      "💰 Pricing & Plans  ·  ⚙️ How it works\n📊 Features  ·  🛡️ Safety\n🚀 Getting started  ·  🎥 Live Demo\n\n" +
      "Just type your question!",
      null, null
    );
  }

  /* ════════════════════════════════════════════════════════════
     §12  FAQ SCORER
  ════════════════════════════════════════════════════════════ */
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
     §13  INTENT ROUTER — with acknowledgment injection
  ════════════════════════════════════════════════════════════ */
  function route(intentId, plan, entities) {
    let resp = null;
    switch (intentId) {
      case "greeting":            resp = buildGreeting(); break;
      case "thanks":              resp = buildThanks(); break;
      case "pricing":             resp = plan ? buildPlanDetail(plan) : buildPricingOverview(); break;
      case "plan_free":           resp = buildPlanDetail("free"); break;
      case "plan_starter":        resp = buildPlanDetail("starter"); break;
      case "plan_growth":         resp = buildPlanDetail("growth"); break;
      case "plan_whatsapp":       resp = buildPlanDetail("whatsapp"); break;
      case "plan_combo":          resp = buildPlanDetail("combo"); break;
      case "compare_plans":       resp = buildComparison(); break;
      case "services":            resp = buildServices(); break;
      case "process":             resp = buildProcess(); break;
      case "results":             resp = buildResults(); break;
      case "safety":              resp = buildSafety(); break;
      case "setup":               resp = buildSetup(); break;
      case "demo":                resp = buildDemo(); break;
      case "contact":             resp = buildContact(); break;
      case "tools":               resp = buildTools(); break;
      case "about":               resp = buildAbout(); break;
      case "human_feel":          resp = buildHumanFeel(); break;
      case "both_platforms":      resp = buildBothPlatforms(); break;
      case "objection_expensive": resp = buildObjection("objection_expensive"); break;
      case "objection_time":      resp = buildObjection("objection_time"); break;
      case "objection_va":        resp = buildObjection("objection_va"); break;
      case "objection_unsure":    resp = buildObjection("objection_unsure"); break;
      case "cancel":              resp = buildCancel(); break;
      case "revisions":           resp = buildRevisions(); break;
      case "requirements":        resp = buildRequirements(); break;
      default:                    resp = null;
    }

    // Inject acknowledgment prefix
    if (resp && intentId !== "greeting" && intentId !== "thanks") {
      const ack = getAck(intentId);
      if (ack) resp.text = ack + resp.text;
    }

    return resp;
  }

  /* ════════════════════════════════════════════════════════════
     §14  MULTI-INTENT BLENDER — natural transitions (no HR dividers)
  ════════════════════════════════════════════════════════════ */
  const TRANSITIONS = [
    "On the related question of",
    "And",
    "While we're on this —",
    "One more thing worth knowing:",
    "Related to that —",
  ];

  function blend2(r1, r2, h1, h2) {
    // Natural transition — no robotic HR dividers
    const trans = pick(TRANSITIONS);
    const h2clean = h2.replace(/[^\w\s]/g, "").trim();
    const connector = `\n\n${trans} ${h2clean.toLowerCase()}:\n`;
    return R(
      r1.text + connector + r2.text,
      r1.link, r1.cta
    );
  }

  const BLEND_TABLE = [
    [["pricing","safety"],        p => blend2(p?buildPlanDetail(p):buildPricingOverview(), buildSafety(),  "💰 Pricing","🔒 Safety")],
    [["pricing","demo"],          p => blend2(p?buildPlanDetail(p):buildPricingOverview(), buildDemo(),    "💰 Pricing","🎥 Demo")],
    [["pricing","results"],       p => blend2(p?buildPlanDetail(p):buildPricingOverview(), buildResults(), "📊 Plans","📈 Results")],
    [["services","pricing"],      p => blend2(buildServices(), p?buildPlanDetail(p):buildPricingOverview(), "🛠️ Services","💰 Pricing")],
    [["services","process"],      () => blend2(buildServices(), buildProcess(),  "🛠️ Services","⚙️ Process")],
    [["process","results"],       () => blend2(buildProcess(),  buildResults(),  "⚙️ How It Works","📈 Results")],
    [["safety","demo"],           () => blend2(buildSafety(),   buildDemo(),     "🔒 Safety","🎥 Demo")],
    [["setup","pricing"],         p => blend2(buildSetup(), p?buildPlanDetail(p):buildPricingOverview(), "⏱️ Setup","💰 Pricing")],
    [["contact","demo"],          () => blend2(buildContact(),  buildDemo(),     "📞 Get Started","🎥 Demo")],
    [["compare_plans","pricing"], () => blend2(buildComparison(), buildPricingOverview(), "📊 Comparison","💰 Full Pricing")],
    [["objection_expensive","pricing"], p => blend2(buildObjection("objection_expensive"), p?buildPlanDetail(p):buildPricingOverview(), "💸 On Price","💰 Plans")],
  ];

  function tryBlend(topIntents, plan) {
    if (topIntents.length < 2) return null;
    const ids = new Set(topIntents.slice(0, 4).map(x => x.id));
    for (const [pair, builder] of BLEND_TABLE)
      if (ids.has(pair[0]) && ids.has(pair[1])) try { return builder(plan); } catch(_) {}
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §15  MULTI-SENTENCE PROCESSOR — natural transitions
  ════════════════════════════════════════════════════════════ */
  const MULTI_TRANSITIONS = [
    "\n\nAnd on your other question —\n",
    "\n\nRelated to that —\n",
    "\n\nOne more thing —\n",
  ];

  function processMultiSentence(sentences, plan, entities) {
    const parts = [], seen = new Set();
    for (const sent of sentences) {
      const norm   = normalizeText(sent);
      const scored = scoreIntents(norm);
      const topId  = scored[0]?.id;
      if (!topId || seen.has(topId) || topId === "greeting" || topId === "thanks") continue;
      seen.add(topId);
      const sentPlan = NER.extract(norm).plan || plan;
      const resp     = route(topId, sentPlan, entities);
      if (resp) parts.push(resp.text);
    }
    if (parts.length >= 2) {
      const joined = parts[0] + pick(MULTI_TRANSITIONS) + parts.slice(1).join(pick(MULTI_TRANSITIONS));
      return R(
        joined,
        (D().contact && D().contact.booking) || "https://ayushaiautomation.in/book.html",
        "Book Free Call"
      );
    }
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §16  CONTEXT-AWARE RESOLVER
  ════════════════════════════════════════════════════════════ */
  function resolveWithContext(topIntents, entities, normInput) {
    const topId   = topIntents[0]?.id;
    const nerPlan = entities.plan;

    if ((topId === "pricing" || entities.hasPriceSignal) && MEM.lastPlan && !nerPlan)
      return { intent:"pricing", plan:MEM.lastPlan };

    if ((topId === "services" || topId === "process") && MEM.lastPlan && !nerPlan &&
        /feature|include|what|tell me more|detail/i.test(normInput))
      return { intent:"plan_"+MEM.lastPlan, plan:MEM.lastPlan };

    if (!topId && MEM.lastIntent)
      return { intent:MEM.lastIntent, plan:MEM.resolvePlan(nerPlan) };

    return { intent:topId||null, plan:MEM.resolvePlan(nerPlan)||planFromIntents(topIntents) };
  }

  /* ════════════════════════════════════════════════════════════
     §17  OBJECTION SIGNAL DETECTOR
  ════════════════════════════════════════════════════════════ */
  function detectObjSignal(normInput) {
    for (const obj of (D().objections || []))
      if ((obj.trigger || []).some(t => normInput.includes(t.toLowerCase()))) return obj;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §17b  DEPTH-ADAPTIVE RESPONSE
  ════════════════════════════════════════════════════════════ */
  function adaptResponseDepth(text, intent, profile) {
    const stage = MEM.getDepthStage();

    if (stage === "evaluating" && intent === "pricing") {
      const cs = D().case_studies || [];
      const extra = cs.length
        ? `\n\n📊 ${cs[0].proof_line}`
        : "";
      return text + extra + "\n\n🎯 At this point — 10 minutes on a call would answer everything specific to your setup.";
    }

    if (stage === "surface") {
      // New user — don't overwhelm. Trim to first 3 paragraphs
      const paras = text.split("\n\n");
      if (paras.length > 4) {
        return paras.slice(0, 3).join("\n\n") + "\n\n(Ask me anything for more detail)";
      }
    }

    return text;
  }

  /* ════════════════════════════════════════════════════════════
     §18  RESPONSE PERSONALIZATION
  ════════════════════════════════════════════════════════════ */
  function personalizeResponse(text, profile) {
    let out = text;

    // Returning user with price objection — soften paid plan references
    if (profile.objections.includes("objection_expensive") && out.includes("📌 Paid plans also need a ManyChat subscription")) {
      out = out.replace(
        "📌 Paid plans also need a ManyChat subscription.",
        "📌 Paid plans need ManyChat — but start FREE first, see results, then decide."
      );
    }

    // Reference previous plan interest
    if (profile.lastPlanDiscussed && out.includes("which plan") && MEM.turnCount > 1) {
      const pName = profile.lastPlanDiscussed.charAt(0).toUpperCase() + profile.lastPlanDiscussed.slice(1);
      out = `You were looking at the ${pName} Plan earlier — ` + out;
    }

    return out;
  }

  /* ════════════════════════════════════════════════════════════
     §18b  PROACTIVE RE-ENGAGEMENT
     Exported for chat.html to use with a setTimeout
  ════════════════════════════════════════════════════════════ */
  function buildReengagement() {
    const semProfile = getSemanticProfile();
    const hints      = MEM.getContextHints();
    const profile    = USER_PROFILE.load();

    if (hints.includes("user_price_sensitive") || semProfile.price_concern) {
      return "Just a quick reminder — the Free Plan is completely ₹0. No card, nothing to lose. Want me to show you what it includes?";
    }
    if (semProfile.results_interest) {
      return "Still thinking about whether this works? There are real coach results I haven't shown you yet — want to see?";
    }
    if (semProfile.trust_concern) {
      return "The fastest way to clear any doubt is just to see the demo. Takes 10 minutes, zero pressure. Want the link?";
    }
    if (profile.conversionStage === "considering") {
      return "Still here? 😊 Happy to answer any specific questions before you decide — what's the main thing holding you back?";
    }
    return "Still exploring? Happy to dig into anything specific — pricing, safety, how the system actually works, or setting it up for your page.";
  }

  /* ════════════════════════════════════════════════════════════
     §19  FAQ CHIP REGISTRY
  ════════════════════════════════════════════════════════════ */
  const FAQ_REGISTRY = {
    faq_dm_setup:           { text:"DM Automation Setup builds automatic replies inside your Instagram DMs — you stop typing the same message 50 times a day. You only talk to people ready to work with you.", link:"https://ayushaiautomation.in/process.html", cta:"See Setup" },
    faq_lead_qualification: { text:"Lead Qualification asks smart questions (goal, timeline, budget) and tags each lead — Serious Buyer → booking link, Just Browsing → nurture sequence.", link:"https://ayushaiautomation.in/process.html", cta:"See Qualification" },
    faq_followup_auto:      { text:"Follow-up Automation sends timed reminders — 1 hour, 24 hours, 3 days — when a lead goes silent. Eliminates 40–60% of potential lost clients.", link:"https://ayushaiautomation.in/services.html", cta:"View Follow-up" },
    faq_comment_dm:         { text:"Comment-to-DM: someone comments on your post → they get a DM automatically → qualifying conversation starts. Your content becomes a 24/7 lead machine.", link:"https://ayushaiautomation.in/services.html", cta:"View Feature" },
    faq_booking_funnel:     { text:"The Booking Funnel routes only qualified, serious leads to your calendar. Every call you take is with someone already interested.", link:"https://ayushaiautomation.in/book.html", cta:"Book Free Call" },
    faq_manychat_sub:       { text:"Paid plans need a separate ManyChat subscription. My fee = building your system. ManyChat = keeping it running 24/7. Free Plan does NOT need paid ManyChat.", link:"https://ayushaiautomation.in/pricing.html", cta:"View Pricing" },
    faq_no_daily_manage:    { text:"Zero daily management after setup. It replies, qualifies, follows up automatically. Your only job: respond to pre-qualified leads it surfaces.", link:"https://ayushaiautomation.in/process.html", cta:"See Process" },
    faq_support:            { text:"Support via WhatsApp (+91 94772 93867) and email anytime. Paid plans include monthly optimisation sessions. Revisions included in all active paid plans.", link:"https://ayushaiautomation.in/book.html", cta:"Book Free Call" },
  };

  function getFaq(key)   { return FAQ_REGISTRY[key] || null; }
  function getTopFaqs(n) { return Object.keys(FAQ_REGISTRY).slice(0, n || 10); }

  /* ════════════════════════════════════════════════════════════
     §20  MAIN ENTRY  getResponse(rawInput)
  ════════════════════════════════════════════════════════════ */
  function getResponse(rawInput) {
    if (!rawInput || !rawInput.trim())
      return R("Didn't catch that — type your question and I'll help! 😊");

    const normInput = normalizeText(rawInput);
    const entities  = NER.extract(normInput);

    // Load / update user profile
    const profile = USER_PROFILE.load();
    const extractedName = extractName(rawInput);
    if (extractedName && !profile.name) {
      profile.name = extractedName;
      USER_PROFILE.save(profile);
    }
    USER_PROFILE.update(profile, null, entities, normInput); // intent updated later

    // Detect user energy for mirroring
    const energy = detectUserEnergy(rawInput);

    SESSION.bumpMessage();

    // ── Route 0: HARDCODED FAST-PATH ────────────────────────
    for (const fp of FAST_PATH) {
      if (fp.re.test(rawInput) || fp.re.test(normInput)) {
        const resp = fp.handler(entities);
        if (resp) {
          MEM.push("pricing", entities.plan, entities, normInput);
          USER_PROFILE.update(profile, "pricing", entities, normInput);
          SESSION.setTopic("pricing");

          // Anti-repetition check
          if (RESPONSE_HISTORY.isDuplicate(resp.text)) {
            const vars = ["To add more detail — ", "Let me break this down slightly differently — ", "Worth noting: "];
            resp.text = pick(vars) + resp.text;
          }
          RESPONSE_HISTORY.register(resp.text);

          resp.text = mirrorEnergy(resp.text, energy);
          resp.text = salesLayer(resp.text, { skipCta: false });
          return resp;
        }
      }
    }

    // ── Emergency price signal guarantee ─────────────────────
    if (entities.hasPriceSignal) {
      const resp = entities.plan ? buildPlanDetail(entities.plan) : buildPricingOverview();
      MEM.push("pricing", entities.plan, entities, normInput);
      resp.text = personalizeResponse(resp.text, profile);
      resp.text = mirrorEnergy(resp.text, energy);
      resp.text = salesLayer(resp.text);
      RESPONSE_HISTORY.register(resp.text);
      return resp;
    }

    const topIntents = scoreIntents(normInput);
    const { intent, plan } = resolveWithContext(topIntents, entities, normInput);

    MEM.push(intent, plan || entities.plan, entities, normInput);
    USER_PROFILE.update(profile, intent, entities, normInput);
    SESSION.setTopic(intent);

    const userType  = detectUserType(normInput);
    const objSignal = detectObjSignal(normInput);
    const engaged   = MEM.turnCount > 3;

    // ── Route A: Multi-sentence ──────────────────────────────
    const sentences = splitSentences(normInput);
    if (sentences.length >= 2) {
      const multi = processMultiSentence(sentences, plan, entities);
      if (multi) {
        multi.text = personalizeResponse(multi.text, profile);
        multi.text = mirrorEnergy(multi.text, energy);
        multi.text = salesLayer(multi.text, { addUrgency: engaged });
        RESPONSE_HISTORY.register(multi.text);
        return multi;
      }
    }

    // ── Route B: Multi-intent blend ──────────────────────────
    if (topIntents.length >= 2 &&
        topIntents[0].score >= 1.8 &&
        topIntents[1].score >= 1.2 &&
        topIntents[0].id !== topIntents[1].id) {
      const blended = tryBlend(topIntents, plan);
      if (blended) {
        blended.text = personalizeResponse(blended.text, profile);
        blended.text = mirrorEnergy(blended.text, energy);
        blended.text = salesLayer(blended.text, { addUrgency: engaged });
        RESPONSE_HISTORY.register(blended.text);
        return blended;
      }
    }

    // ── Route C: Primary intent ──────────────────────────────
    if (intent) {
      const resp = route(intent, plan, entities);
      if (resp) {
        if (userType && !intent.startsWith("plan_") && intent !== "pricing" && intent !== "greeting" && intent !== "thanks") {
          resp.text += "\n\n" + buildSmartRecommendation(userType);
        }
        if (objSignal && !intent.startsWith("objection_")) {
          resp.text += "\n\n💬 " + objSignal.response;
        }

        // Depth-adaptive response shaping
        resp.text = adaptResponseDepth(resp.text, intent, profile);

        // Anti-repetition
        if (RESPONSE_HISTORY.isDuplicate(resp.text)) {
          const vars = ["Let me come at this from a different angle — ", "Worth expanding on this: ", "To be more specific — "];
          resp.text = pick(vars) + resp.text;
        }
        RESPONSE_HISTORY.register(resp.text);

        resp.text = personalizeResponse(resp.text, profile);
        resp.text = mirrorEnergy(resp.text, energy);

        const skipCta = intent === "greeting" || intent === "thanks";
        resp.text = salesLayer(resp.text, { skipCta, addUrgency: engaged });

        // Attach follow-up question as metadata for chat.html to display
        const followUp = getFollowUp(intent, profile.conversionStage);
        if (followUp) resp.followUp = followUp;

        return resp;
      }
    }

    // ── Route D: FAQ match ───────────────────────────────────
    const faq = matchFaq(normInput);
    if (faq) {
      const resp = R(faq.answer);
      resp.text  = salesLayer(resp.text);
      RESPONSE_HISTORY.register(resp.text);
      return resp;
    }

    // ── Route E: Partial salvage ─────────────────────────────
    if (topIntents.length > 0) {
      const salvage = route(topIntents[0].id, plan, entities);
      if (salvage) {
        salvage.text = salesLayer(salvage.text);
        RESPONSE_HISTORY.register(salvage.text);
        return salvage;
      }
    }

    // ── Route F: Smart fallback (last resort) ────────────────
    return buildFallback();
  }

  /* ════════════════════════════════════════════════════════════
     §21  INIT
  ════════════════════════════════════════════════════════════ */
  function init() {
    buildIdf(INTENTS);
    const d = D();
    if (!d || !d.plans) {
      console.error("[CHATBOT] ⚠️ AGENCY_DATA missing or plans not loaded. Check script load order.");
    } else {
      console.log("[CHATBOT v8] ✅ Ready — AGENCY_DATA confirmed, IDF built, intelligence systems online.");
    }

    // Increment visit count on init
    try {
      const profile = USER_PROFILE.load();
      profile.visitCount = (profile.visitCount || 0) + 1;
      profile.lastSeen   = Date.now();
      if (!profile.firstSeen) profile.firstSeen = Date.now();
      USER_PROFILE.save(profile);
    } catch(_) {}

    return Promise.resolve();
  }

  /* ════════════════════════════════════════════════════════════
     §22  PUBLIC API
  ════════════════════════════════════════════════════════════ */
  global.CHATBOT = {
    init,
    getResponse,
    process: getResponse,   // backward-compat alias
    getFaq,
    getTopFaqs,
    // Delivery helpers exported for chat.html
    smartDelay,
    intelligentSplit,
    shouldHesitate,
    getHesitationLine,
    buildReengagement,
    getUserProfile: () => USER_PROFILE.load(),
  };

})(typeof window !== "undefined" ? window : global);
