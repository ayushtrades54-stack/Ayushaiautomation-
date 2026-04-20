/* ════════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v6.0
   ════════════════════════════════════════════════════════════════
   Architecture:
     normalizeText  →  dedupeChars  →  hinglishMap  →  lemmatize
     →  NER (entities + user-type)
     →  scoreIntents (IDF + phrase + fuzzy + semantic clusters)
     →  contextResolve  →  priorityRoute
     →  multi-sentence merge  →  multi-intent blend
     →  dynamicResponseBuilder  →  salesLayer (CTA + objection)

   v6 changes vs v5:
     ✅ dedupeChars  (pricee→price, goood→good)
     ✅ Levenshtein fuzzy on every token  (tyops handled)
     ✅ Full AGENCY_DATA integration — case_studies, objections,
        user_types, cta_variants, feature_benefits, comparisons,
        urgency, response_templates, framework
     ✅ Dynamic response builder — no static string walls
     ✅ User-type detection → smart plan recommendation inline
     ✅ Objection detection + inline rebuttal injection
     ✅ Sales layer (CTA + urgency) on every substantive response
     ✅ 0–1 confidence score on every intent (sigmoid)
     ✅ Priority routing (plan_specific > pricing > process …)
     ✅ Context memory (6-turn) — follow-ups resolved automatically
     ✅ Multi-sentence AND multi-intent handling
     ✅ NEVER falls back if any intent signal exists

   Exports: window.CHATBOT { init, getResponse, getFaq, getTopFaqs }
   process() aliased to getResponse() for backward compat.
   ════════════════════════════════════════════════════════════════ */

(function (global) {
  "use strict";

  /* ── §0  DATA ACCESS ──────────────────────────────────────── */
  const D = global.AGENCY_DATA || {};

  /* ════════════════════════════════════════════════════════════
     §1  TEXT NORMALISATION PIPELINE
  ════════════════════════════════════════════════════════════ */

  /* 1a — lemma map */
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

  /* 1b — Hinglish phrase map (longest first) */
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
    ["total kitna","total cost"],["kitna hai","how much"],
    ["kitna","how much"],
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

  /* 1c — deduplicate repeated chars: pricee→price, goood→good */
  function dedupeChars(s) {
    return s.replace(/(.)\1{2,}/g, "$1$1").replace(/(.)\1{2,}/g, "$1");
  }

  /* 1d — master normalizer */
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

  /* ── Levenshtein distance ─────────────────────────────────── */
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

  /* ── Overlap helper ─────────────────────────────────────── */
  function overlap(gramSet, keywords) {
    let score = 0;
    for (const kw of keywords) {
      const lk = kw.split(" ").map(lemmatize).join(" ");
      if (gramSet.has(kw) || gramSet.has(lk)) score++;
    }
    return score;
  }

  /* ── Sigmoid → 0–1 confidence ───────────────────────────── */
  function toConf(raw) {
    return Math.round((1 / (1 + Math.exp(-0.55 * (raw - 3)))) * 100) / 100;
  }

  /* ── Random pick ────────────────────────────────────────── */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ════════════════════════════════════════════════════════════
     §2  IDF BOOST TABLE  (built at init time)
  ════════════════════════════════════════════════════════════ */
  let IDF = {};

  function buildIdf(intents) {
    const df = {}, N = intents.length;
    for (const intent of intents) {
      const seen = new Set();
      for (const t of [...intent.keywords, ...intent.phrases]) {
        const k = t.toLowerCase();
        if (!seen.has(k)) { df[k] = (df[k] || 0) + 1; seen.add(k); }
      }
    }
    IDF = {};
    for (const [t, f] of Object.entries(df)) IDF[t] = Math.log((N+1)/(f+1))+1;
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
     §4  USER-TYPE DETECTION  (from AGENCY_DATA.user_types)
  ════════════════════════════════════════════════════════════ */
  function detectUserType(normInput) {
    for (const ut of (D.user_types || []))
      if (ut.signals.some(sig => normInput.includes(sig))) return ut;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §5  INTENT CATALOGUE  (27 intents)
         priority: 1=highest (plan_specific), 9=lowest (thanks)
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
    const tokens = lemTokens(normInput);
    const grams  = allGrams(tokens);
    const scored = [];

    for (const intent of INTENTS) {
      let score = 0;

      for (const kw of intent.keywords) {
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

      for (const ph of intent.phrases) {
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
     §7  CONTEXT MEMORY  (6-turn rolling window)
  ════════════════════════════════════════════════════════════ */
  const MEM = {
    history: [],
    MAX: 6,
    push(intent, plan, entities, input) {
      this.history.push({ intent, plan, entities, input });
      if (this.history.length > this.MAX) this.history.shift();
    },
    get last()       { return this.history[this.history.length-1] || {}; },
    get lastPlan()   { return [...this.history].reverse().find(h => h.plan)?.plan || null; },
    get lastIntent() { return this.last.intent || null; },
    get turnCount()  { return this.history.length; },
    resolvePlan(nerPlan) { return nerPlan || this.lastPlan; },
  };

  /* ════════════════════════════════════════════════════════════
     §8  PLAN UTILITIES
  ════════════════════════════════════════════════════════════ */
  const PLAN_IDX = { free:0, starter:1, growth:2, whatsapp:3, combo:4 };
  function getPlan(key) {
    const i = PLAN_IDX[key];
    return (i !== undefined && D.plans) ? D.plans[i] : null;
  }
  function planFromIntents(scored) {
    for (const s of scored) if (s.planHint) return s.planHint;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §9  RESPONSE FACTORY
  ════════════════════════════════════════════════════════════ */
  function R(text, link, cta) { return { text: text || "", link: link || null, cta: cta || null }; }

  /* ════════════════════════════════════════════════════════════
     §10  SALES LAYER
          Appends rotating CTA and optional urgency signal.
          Uses D.cta_variants and D.urgency live.
  ════════════════════════════════════════════════════════════ */
  const _ctaIdx = { n: 0 };
  function nextCta() {
    const variants = D.cta_variants || ["Want to see how this would work for your page?"];
    const c = variants[_ctaIdx.n % variants.length];
    _ctaIdx.n++;
    return c;
  }

  function salesLayer(text, { skipCta = false, addUrgency = false } = {}) {
    let out = text;
    if (!skipCta) out += "\n\n👉 " + nextCta();
    if (addUrgency && D.urgency && D.urgency.length) out += "\n⚡ " + pick(D.urgency);
    return out;
  }

  /* ════════════════════════════════════════════════════════════
     §11  DYNAMIC RESPONSE BUILDERS
          Every builder pulls live data from AGENCY_DATA.
          Structured, scannable, max 8 content lines.
  ════════════════════════════════════════════════════════════ */

  /* ── Greeting ────────────────────────────────────────────── */
  const GREET_OPENERS = [
    "Hey! 👋 Welcome to Ayush AI Automation.",
    "Hi there! 👋 Great to have you here.",
    "Hello! 🙌 You've reached Ayush AI Automation.",
  ];
  function buildGreeting() {
    const a = D.agency || {};
    return R(
      pick(GREET_OPENERS) + "\n\n" +
      (a.tagline || "AI-powered DM automation for fitness coaches.") + "\n\n" +
      "I can help with:\n" +
      "💰 Pricing & Plans  ·  ⚙️ How it works  ·  📊 Features\n" +
      "🛡️ Safety  ·  🎥 Demo  ·  🚀 Getting started\n\n" +
      "What's on your mind?"
    );
  }

  /* ── Pricing overview ─────────────────────────────────────── */
  function buildPricingOverview() {
    if (!D.plans) return buildFallback();
    const tpl  = (D.response_templates && D.response_templates.pricing) || {};
    const intro = pick(tpl.intro || ["Here's a clean pricing breakdown:"]);
    const close = pick(tpl.close || ["Best plan depends on your current stage."]);
    const rows  = D.plans.map(p => {
      const star = p.popular ? " ⭐ Most Popular" : "";
      return `${p.name}${star}\n  💰 ${p.price}  ·  Setup: ${p.price_alt}\n  → ${p.best_for}`;
    }).join("\n\n");
    return R(
      intro + "\n\n" + rows + "\n\n💡 " + close +
      "\n📌 Paid plans also need a ManyChat subscription.",
      "https://ayushaiautomation.in/pricing.html", "View Full Pricing"
    );
  }

  /* ── Single plan detail ───────────────────────────────────── */
  const PLAN_OPENERS = {
    free:     ["Free Plan — ₹0, genuinely zero:", "Free Plan breakdown:"],
    starter:  ["Starter Plan — organised leads, less manual work:", "Starter Plan — what you get:"],
    growth:   ["Growth Plan — our most popular. Here's why:", "Growth Plan — full breakdown:"],
    whatsapp: ["WhatsApp Qualification System — everything inside:", "WhatsApp Plan detail:"],
    combo:    ["Combo Plan — Instagram + WhatsApp, end-to-end:", "Combo Plan — the full sales machine:"],
  };

  function buildPlanDetail(key) {
    const plan = getPlan(key);
    if (!plan) return buildPricingOverview();
    const intro  = pick(PLAN_OPENERS[key] || ["Plan details:"]);
    const feats  = plan.features.slice(0, 7).map(f => "✅ " + f).join("\n");
    const limits = plan.limitations && plan.limitations.length
      ? "\n\n❌ Not included:\n" + plan.limitations.slice(0, 4).map(l => "• " + l).join("\n")
      : "";
    const note   = plan.note ? "\n\n💡 " + plan.note : "";
    return R(
      intro + "\n\n📋 " + plan.name +
      "\n💰 " + plan.price + "\n📦 Setup: " + plan.price_alt +
      "\n\n" + feats + limits + note,
      "https://ayushaiautomation.in/pricing.html", "See Full Plan"
    );
  }

  /* ── Plan comparison ─────────────────────────────────────── */
  function buildComparison() {
    const rows = D.plans ? D.plans.map(p => {
      const star = p.popular ? " ⭐" : "";
      return `• ${p.name}${star}  —  ${p.price}\n  ${p.best_for}`;
    }).join("\n\n") : "";
    return R(
      "Here's how to pick the right plan:\n\n" + rows +
      "\n\n🎯 Rule: Start FREE → get results → upgrade only when ready.",
      "https://ayushaiautomation.in/pricing.html", "Compare All Plans"
    );
  }

  /* ── Services ────────────────────────────────────────────── */
  function buildServices() {
    const svcs = (D.services || []).slice(0, 6);
    const list = svcs.map(s => `⚡ ${s.name}\n   ${s.short}`).join("\n\n");
    return R(
      "Here's the full automation system for fitness coaches:\n\n" + list +
      "\n\nEvery piece connects — from first DM to booked call. Fully automated.",
      "https://ayushaiautomation.in/services.html", "Explore All Services"
    );
  }

  /* ── Process ─────────────────────────────────────────────── */
  function buildProcess() {
    const steps = D.process || [];
    const list  = steps.map(s => `${s.step}️⃣ ${s.title}\n   ${s.desc}`).join("\n\n");
    return R(
      "Here's exactly how it works — start to finish:\n\n" + list +
      "\n\n⏱️ Live in 24–72 hours. You approve — we build everything.",
      "https://ayushaiautomation.in/process.html", "See Full Process"
    );
  }

  /* ── Results + Case Studies ──────────────────────────────── */
  function buildResults() {
    const g  = (D.meta && D.meta.guarantee) || "14-day rebuild guarantee.";
    const cs = D.case_studies || [];
    const proofLines = cs.map(c =>
      `🏆 ${c.name}\n   "${c.proof_line}"\n   Before: ${c.before}\n   After:  ${c.after}`
    ).join("\n\n");
    return R(
      "What to realistically expect:\n\n" +
      "• Drastic drop in ghosting and manual DM time\n" +
      "• Only qualified, serious leads reach you\n" +
      "• Consistent call bookings — even while you sleep\n" +
      "• 15–20 hours/week saved\n\n" +
      "🛡️ Guarantee: " + g +
      (proofLines ? "\n\nReal coach results:\n\n" + proofLines : ""),
      "https://ayushaiautomation.in/demo.html", "See Proof & Results"
    );
  }

  /* ── Safety ──────────────────────────────────────────────── */
  function buildSafety() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).includes("safe"));
    return R(
      "100% safe — full picture:\n\n" +
      "✅ Uses ManyChat — official Instagram & Meta partner\n" +
      "✅ Trusted by 1M+ businesses worldwide\n" +
      "✅ Only replies when someone messages YOU first\n" +
      "✅ No spam, no bulk messages, no aggressive outreach\n" +
      "✅ Zero ban risk — safe automation only\n" +
      "✅ No password sharing — secure OAuth only" +
      (faq ? "\n\n" + faq.answer : "") +
      "\n\nYou see a live demo before any commitment.",
      "https://ayushaiautomation.in/demo.html", "See Live Demo"
    );
  }

  /* ── Setup timeline ──────────────────────────────────────── */
  function buildSetup() {
    const tl  = (D.meta && D.meta.setup_timeline) || {};
    const faq = (D.faqs || []).find(f => (f.keywords || []).join(" ").includes("how long"));
    return R(
      "Setup is fast — exact timelines:\n\n" +
      "📱 Instagram Automation: " + (tl.instagram || "24–72 hours") + "\n" +
      "💬 WhatsApp or Combo: " + (tl.whatsapp_or_combo || "48–72 hours") + "\n\n" +
      "The process:\n" +
      "1. You connect account (OAuth — no password sharing)\n" +
      "2. We build your conversation flows\n" +
      "3. You review and approve\n" +
      "4. System goes live ✅\n\n" +
      (faq ? faq.answer + "\n\n" : "") +
      "After setup — fully automatic. Zero daily management.",
      "https://ayushaiautomation.in/process.html", "See Full Setup"
    );
  }

  /* ── Demo ─────────────────────────────────────────────────── */
  function buildDemo() {
    const c = D.contact || {};
    const faq = (D.faqs || []).find(f => (f.keywords || []).includes("demo"));
    return R(
      "Yes! A full live demo is available before any commitment. 🎯\n\n" +
      "The demo shows:\n" +
      "• How the bot handles a real conversation\n" +
      "• How it qualifies leads and filters serious buyers\n" +
      "• How it moves someone toward booking\n\n" +
      "You experience it as your client would — interactive, not screenshots.\n" +
      "⏱️ Takes 10–15 minutes. Zero sales pressure.\n\n" +
      (faq ? faq.answer + "\n\n" : "") +
      "📱 Request via WhatsApp: " + (c.whatsapp || "+91 94772 93867"),
      c.demo || "https://ayushaiautomation.in/demo.html", "Request Live Demo"
    );
  }

  /* ── Contact ─────────────────────────────────────────────── */
  function buildContact() {
    const c = D.contact || {};
    return R(
      "Here's how to reach us:\n\n" +
      "📱 WhatsApp: " + (c.whatsapp || "+91 94772 93867") + "\n" +
      "📧 Email: " + (c.email || "ayushtrades54@gmail.com") + "\n" +
      "📅 Book a free 15-min strategy call\n\n" +
      (c.cta ? c.cta + "\n\n" : "") +
      "⏱️ From call to live system: 24–72 hours.",
      c.booking || "https://ayushaiautomation.in/book.html", "Book Free Call"
    );
  }

  /* ── Tools ───────────────────────────────────────────────── */
  function buildTools() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).includes("tools"));
    const tools = (D.meta && D.meta.tools_used) ? D.meta.tools_used.join(", ") : "ManyChat, Google Sheets";
    return R(
      "Tools powering the system:\n\n" +
      "🔧 ManyChat — automation engine\n" +
      "   • Official Instagram & WhatsApp partner (1M+ businesses)\n" +
      "   • Zero ban risk\n\n" +
      "📊 Google Sheets — real-time lead tracking\n\n" +
      (faq ? faq.answer + "\n\n" : "") +
      "Stack: " + tools,
      "https://ayushaiautomation.in/faq.html", "Read Full FAQ"
    );
  }

  /* ── About ───────────────────────────────────────────────── */
  function buildAbout() {
    const a = D.agency || {};
    return R(
      (a.name || "Ayush AI Automation") + "\n\n" +
      (a.about || "") + "\n\n" +
      "🎯 We don't build chatbots. We build revenue systems.",
      "https://ayushaiautomation.in/about.html", "Read About Us"
    );
  }

  /* ── Human feel ──────────────────────────────────────────── */
  function buildHumanFeel() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).includes("human feel"));
    return R(
      "Valid concern — honest answer:\n\n" +
      (faq ? faq.answer : "Conversations are engineered to feel natural and human — not robotic."),
      null, null
    );
  }

  /* ── Both platforms ──────────────────────────────────────── */
  function buildBothPlatforms() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).join(" ").includes("both platforms"));
    return R(
      "Yes — both platforms work together. 🔥\n\n" +
      (faq ? faq.answer : "Instagram captures leads. WhatsApp closes them. Together = one complete sales machine.") +
      "\n\n→ See Combo Plan for full pricing.",
      "https://ayushaiautomation.in/pricing.html", "View Combo Plan"
    );
  }

  /* ── Objection handlers (dynamic from D.objection_handling) ─ */
  function buildObjection(type) {
    const keys = {
      objection_expensive: ["expensive","costly","price"],
      objection_time:      ["time","management"],
      objection_unsure:    ["not sure","situation"],
      objection_va:        ["va","virtual","assistant"],
    };
    const signals = keys[type] || [];
    const match = (D.objection_handling || []).find(o =>
      signals.some(sig => o.objection.toLowerCase().includes(sig))
    );
    const resp = match ? match.response : null;

    if (type === "objection_expensive") return R(
      "Let me reframe with real numbers:\n\n" +
      (resp || "Most coaches recover the cost with just 1 client.") +
      "\n\n💡 Start FREE (₹0) — no card. See results first. Upgrade when it makes financial sense.",
      "https://ayushaiautomation.in/pricing.html", "Start Free — ₹0"
    );

    if (type === "objection_time") return R(
      "You're actually saving time — not spending it:\n\n" +
      (resp || "Setup: 1–2 hours once. After that — zero daily management. 15–20 hours/week saved."),
      null, null
    );

    if (type === "objection_va") {
      const comp = (D.comparisons || []).find(c => c.vs === "Virtual Assistant");
      return R(
        "VA vs Automation — honest comparison:\n\n" +
        (comp ? comp.points.map(p => "• " + p).join("\n") : (resp || "Automation runs 24/7 at a fraction of the cost.")),
        "https://ayushaiautomation.in/coaches.html", "Why Coaches Choose This"
      );
    }

    if (type === "objection_unsure") return R(
      "Totally fair — don't decide on words. Experience it first.\n\n" +
      (resp || "Request the free 10-min demo. See it running. Then decide with zero pressure.") +
      "\n\nNo payment. No commitment. No pitch.",
      "https://ayushaiautomation.in/demo.html", "Try Free Demo"
    );

    return buildContact();
  }

  /* ── Cancel ──────────────────────────────────────────────── */
  function buildCancel() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).includes("cancel"));
    return R(
      "No lock-in — here's how it works:\n\n" +
      (faq ? faq.answer : "Monthly plans — just don't renew. No contracts. No hidden fees."),
      "https://ayushaiautomation.in/terms.html", "Read Full Terms"
    );
  }

  /* ── Revisions ───────────────────────────────────────────── */
  function buildRevisions() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).includes("revisions"));
    return R(
      "Yes — revisions included in all active paid plans. 🔄\n\n" +
      (faq ? faq.answer : "Flow changes, message updates, new sequences — all included.") +
      "\n\nYour coaching evolves — your automation evolves with it.",
      "https://ayushaiautomation.in/services.html", "View Plans"
    );
  }

  /* ── Requirements ────────────────────────────────────────── */
  function buildRequirements() {
    const faq = (D.faqs || []).find(f => (f.keywords || []).join(" ").includes("required"));
    return R(
      "Here's all you need to provide:\n\n" +
      (faq ? faq.answer : "Instagram access via OAuth (no password), flow approval, payment. We handle everything else.") +
      "\n\n🔒 You never share your password. Secure official OAuth only.",
      "https://ayushaiautomation.in/process.html", "See Setup Steps"
    );
  }

  /* ── Smart plan recommendation (from user-type) ──────────── */
  function buildSmartRecommendation(userType) {
    if (!userType) return "";
    const tpl   = (D.response_templates && D.response_templates.recommendation) || {};
    const intro = pick(tpl.intro || ["Based on what you said:"]);
    const close = pick(tpl.close || ["You can always upgrade later."]);
    const rec   = userType.recommendation;
    const planKey = rec.toLowerCase().replace(/\s*(plan|or)\s*/gi, "").trim().split(" ")[0];
    const plan  = getPlan(planKey);
    return (
      intro + "\n\n" +
      "Your situation points to: **" + rec + "**\n" +
      (plan ? "💰 " + plan.price + " · " + plan.best_for : "") +
      "\n\n" + close
    );
  }

  /* ── Thanks ──────────────────────────────────────────────── */
  const THANKS_MSGS = [
    "Glad that helped! 👍\n\nAnytime you have more questions — just ask.",
    "Of course! 😊 Feel free to ask about pricing, features, setup, or getting started.",
    "Great! The free demo is available anytime you want to see it live. 🎯",
  ];
  function buildThanks() {
    return R(pick(THANKS_MSGS), "https://ayushaiautomation.in/demo.html", "See Demo");
  }

  /* ── Smart fallback (absolute last resort) ───────────────── */
  function buildFallback() {
    return R(
      (MEM.turnCount > 0
        ? "I want to give you the exact right answer — could you rephrase that?"
        : "Happy to help! Here's what I can cover:") +
      "\n\n💰 Pricing & Plans  ·  ⚙️ How it works\n📊 Features  ·  🛡️ Safety\n🚀 Getting started  ·  🎥 Live Demo\n\n" +
      "Just type your question!",
      null, null
    );
  }

  /* ════════════════════════════════════════════════════════════
     §12  FAQ SCORER  (from D.faqs keywords + fuzzy)
  ════════════════════════════════════════════════════════════ */
  function matchFaq(normInput) {
    if (!D.faqs) return null;
    const tokens = lemTokens(normInput);
    const grams  = allGrams(tokens);
    let best = null, bestScore = 0;
    for (const faq of D.faqs) {
      let score = overlap(grams, faq.keywords);
      for (const kw of faq.keywords)
        for (const tok of tokens)
          if (fuzzyScore(tok, kw) >= 0.84) { score += 0.4; break; }
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    return bestScore >= 1.5 ? best : null;
  }

  /* ════════════════════════════════════════════════════════════
     §13  INTENT ROUTER
         Priority: plan_specific(1) > pricing(2) > process(3) > …
  ════════════════════════════════════════════════════════════ */
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

  /* ════════════════════════════════════════════════════════════
     §14  MULTI-INTENT BLENDER
  ════════════════════════════════════════════════════════════ */
  function blend2(r1, r2, h1, h2) {
    return R(
      h1 + ":\n" + r1.text + "\n\n─────────────────\n\n" + h2 + ":\n" + r2.text,
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
     §15  MULTI-SENTENCE PROCESSOR
  ════════════════════════════════════════════════════════════ */
  function processMultiSentence(sentences, plan, entities) {
    const parts = [], seen = new Set();
    for (const sent of sentences) {
      const norm   = normalizeText(sent);
      const scored = scoreIntents(norm);
      const topId  = scored[0]?.id;
      if (!topId || seen.has(topId) || topId === "greeting" || topId === "thanks") continue;
      seen.add(topId);
      const sentPlan = NER.extract(norm).plan || plan;
      const resp = route(topId, sentPlan, entities);
      if (resp) parts.push(resp.text);
    }
    if (parts.length >= 2) {
      return R(
        parts.join("\n\n─────────────────\n\n"),
        (D.contact && D.contact.booking) || "https://ayushaiautomation.in/book.html",
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

    // "What about price?" after plan discussed
    if ((topId === "pricing" || entities.hasPriceSignal) && MEM.lastPlan && !nerPlan)
      return { intent:"pricing", plan:MEM.lastPlan };

    // Features follow-up after plan discussed
    if ((topId === "services" || topId === "process") && MEM.lastPlan && !nerPlan &&
        /feature|include|what|tell me more|detail/i.test(normInput))
      return { intent:"plan_"+MEM.lastPlan, plan:MEM.lastPlan };

    // Bare follow-up — no new intent
    if (!topId && MEM.lastIntent)
      return { intent:MEM.lastIntent, plan:MEM.resolvePlan(nerPlan) };

    return { intent:topId||null, plan:MEM.resolvePlan(nerPlan)||planFromIntents(topIntents) };
  }

  /* ════════════════════════════════════════════════════════════
     §17  OBJECTION SIGNAL DETECTOR
          Checks D.objections trigger lists for inline rebuttal.
  ════════════════════════════════════════════════════════════ */
  function detectObjSignal(normInput) {
    for (const obj of (D.objections || []))
      if ((obj.trigger || []).some(t => normInput.includes(t.toLowerCase()))) return obj;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §18  MAIN ENTRY  getResponse(rawInput)

     Priority routing:
       A — Multi-sentence compound
       B — Multi-intent blend  (2 strong signals)
       C — Primary intent  (context-aware, with sales layer)
       D — FAQ match from D.faqs
       E — Partial salvage  (ANY scoring intent > 0)
       F — Smart fallback  (absolute last resort)

     NEVER says "I don't understand".
     NEVER shows menu instead of answering.
     ALWAYS attempts answer before asking for clarification.
  ════════════════════════════════════════════════════════════ */
  function getResponse(rawInput) {
    if (!rawInput || !rawInput.trim())
      return R("Didn't catch that — type your question and I'll help! 😊");

    // Step 1: Normalize (dedup + hinglish + lemma)
    const normInput  = normalizeText(rawInput);

    // Step 2: Entity extraction
    const entities   = NER.extract(normInput);

    // Step 3: Intent scoring
    const topIntents = scoreIntents(normInput);

    // Step 4: Context resolution
    const { intent, plan } = resolveWithContext(topIntents, entities, normInput);

    // Step 5: Update memory
    MEM.push(intent, plan || entities.plan, entities, normInput);

    // Step 6: User-type + objection signals
    const userType  = detectUserType(normInput);
    const objSignal = detectObjSignal(normInput);
    const engaged   = MEM.turnCount > 3;

    // ── Route A: Multi-sentence ──────────────────────────
    const sentences = splitSentences(normInput);
    if (sentences.length >= 2) {
      const multi = processMultiSentence(sentences, plan, entities);
      if (multi) {
        multi.text = salesLayer(multi.text, { addUrgency: engaged });
        return multi;
      }
    }

    // ── Route B: Multi-intent blend ──────────────────────
    if (topIntents.length >= 2 &&
        topIntents[0].score >= 1.8 &&
        topIntents[1].score >= 1.2 &&
        topIntents[0].id !== topIntents[1].id) {
      const blended = tryBlend(topIntents, plan);
      if (blended) {
        blended.text = salesLayer(blended.text, { addUrgency: engaged });
        return blended;
      }
    }

    // ── Route C: Primary intent ──────────────────────────
    if (intent) {
      const resp = route(intent, plan, entities);
      if (resp) {
        // Inject user-type recommendation for non-plan intents
        if (userType && !intent.startsWith("plan_") && intent !== "pricing" && intent !== "greeting" && intent !== "thanks") {
          resp.text += "\n\n" + buildSmartRecommendation(userType);
        }
        // Inject objection rebuttal if signalled alongside other intents
        if (objSignal && !intent.startsWith("objection_")) {
          resp.text += "\n\n💬 " + objSignal.response;
        }
        const skipCta = intent === "greeting" || intent === "thanks";
        resp.text = salesLayer(resp.text, { skipCta, addUrgency: engaged });
        return resp;
      }
    }

    // ── Route D: FAQ match ───────────────────────────────
    const faq = matchFaq(normInput);
    if (faq) {
      const resp = R(faq.answer);
      resp.text  = salesLayer(resp.text);
      return resp;
    }

    // ── Route E: Partial salvage — NEVER skip ────────────
    if (topIntents.length > 0) {
      const salvage = route(topIntents[0].id, plan, entities);
      if (salvage) {
        salvage.text = salesLayer(salvage.text);
        return salvage;
      }
    }

    // ── Route F: Smart fallback (last resort) ────────────
    return buildFallback();
  }

  /* ════════════════════════════════════════════════════════════
     §19  FAQ CHIP REGISTRY  (for quick-reply chips in UI)
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
     §20  INIT  (builds IDF table synchronously)
  ════════════════════════════════════════════════════════════ */
  function init() {
    buildIdf(INTENTS);
    return Promise.resolve();
  }

  /* ════════════════════════════════════════════════════════════
     §21  PUBLIC API
  ════════════════════════════════════════════════════════════ */
  global.CHATBOT = {
    init,
    getResponse,
    process: getResponse,   // backward-compat alias
    getFaq,
    getTopFaqs,
  };

})(typeof window !== "undefined" ? window : global);
