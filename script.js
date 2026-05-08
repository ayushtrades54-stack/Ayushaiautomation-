/* ════════════════════════════════════════════════════════════════
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v9.0
   ════════════════════════════════════════════════════════════════
   v9 Language Intelligence Upgrades vs v8:

   LAYER 1 — ADVANCED NORMALIZATION ENGINE
     ✅ 200+ Hinglish phrase mappings (was ~90)
     ✅ Phonetic normalization (kewl→cool, wanna→want to, etc.)
     ✅ Aggressive repeated-char collapse (broooo→bro)
     ✅ Slang + abbreviation expansion (wt→what, msg→message, etc.)
     ✅ Emoticon → semantic token conversion
     ✅ Roman Urdu normalization
     ✅ Internet typing patterns (lol, tbh, ngl, imo, etc.)

   LAYER 2 — PHRASE UNDERSTANDING ENGINE
     ✅ 80+ composite phrase patterns with multi-signal detection
     ✅ Compound meaning extraction (not just isolated keywords)
     ✅ Pain-point phrase detection ("leads aa rahe hain but…")
     ✅ Negative phrasing detection ("not getting serious leads")

   LAYER 3 — SEMANTIC CLUSTER BRAIN
     ✅ 12 large semantic meaning clusters (was 6)
     ✅ Cluster-weighted intent scoring
     ✅ Cross-cluster reasoning for compound states
     ✅ Emotional tone clusters

   LAYER 4 — SENTENCE DECOMPOSITION ENGINE
     ✅ Topic/emotion/intent/concern/urgency extraction per sentence
     ✅ BUT-clause detection (positive but negative)
     ✅ Conditional intent detection ("if this works then…")
     ✅ Implied desire extraction

   LAYER 5 — CONTEXTUAL REASONING SIMULATION
     ✅ Multi-turn context accumulation
     ✅ Intent drift detection across turns
     ✅ Conversation momentum tracking
     ✅ Callback references ("you mentioned earlier…")

   LAYER 6 — GRAMMAR + STRUCTURE INTELLIGENCE
     ✅ Negation scope detection (NOT just matching negative words)
     ✅ Uncertainty qualifier detection (kinda, sorta, maybe, might)
     ✅ Comparative phrasing (better than, worse than, vs)
     ✅ Question vs statement classification
     ✅ Implicit subject detection

   LAYER 7 — HINGLISH INTELLIGENCE ENGINE
     ✅ Hindi verb conjugation normalization
     ✅ Roman Hindi grammar patterns
     ✅ Hinglish sentence construction understanding
     ✅ Code-switching mid-sentence handling
     ✅ Common Hindi idioms → semantic meaning

   LAYER 8 — SMART FALLBACK ENGINE
     ✅ Partial match salvage before true fallback
     ✅ Cluster-based educated guess responses
     ✅ Clarifying question selection (context-aware)
     ✅ Graceful unknown-language handling

   LAYER 9 — HUMAN-LIKE RESPONSE GENERATION
     ✅ Emotion-aware response tuning
     ✅ Frustration detection → empathy injection
     ✅ Excitement detection → energy matching
     ✅ Confusion detection → simplification mode
     ✅ Response variety engine (never same pattern twice)

   LAYER 10 — CONVERSATIONAL MEMORY REASONING
     ✅ Pain point memory (referenced in later replies)
     ✅ Objection accumulation + pattern detection
     ✅ Topic thread tracking (return to unresolved topics)
     ✅ Emotional state history

   Architecture (layered):
     Raw Input
       → L1: Advanced Normalization (phonetic + Hinglish + slang)
       → L6: Grammar Intelligence (negation, uncertainty, structure)
       → L4: Sentence Decomposition (topic/emotion/intent/concern)
       → L3: Semantic Cluster Scoring
       → L2: Phrase Pattern Matching
       → L7: Hinglish Deep Parse
       → NER: Named Entity Recognition
       → L5: Context Resolution (memory + momentum)
       → Intent Scoring (IDF + phrase + fuzzy + cluster-boosted)
       → L10: Memory Reasoning (pain points + objections)
       → Response Selection + L9: Human-like Generation
       → L8: Smart Fallback if needed
       → Delivery Engine

   Exports: window.CHATBOT { init, getResponse, getFaq, getTopFaqs,
                              smartDelay, intelligentSplit, shouldHesitate,
                              buildReengagement, getUserProfile }
   ════════════════════════════════════════════════════════════════ */

(function (global) {
  "use strict";

  /* ── §0  DATA ACCESS ──────────────────────────────────────── */
  function D() { return global.AGENCY_DATA || {}; }

  /* ════════════════════════════════════════════════════════════
     §1  LAYER 1 — ADVANCED NORMALIZATION ENGINE
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
    wanna:"want to",gonna:"going to",gotta:"got to",kinda:"kind of",
    sorta:"sort of",dunno:"dont know",lemme:"let me",gimme:"give me",
    lotta:"lot of",outta:"out of",hafta:"have to",
  };

  /* ── §1a  SLANG + ABBREVIATION EXPANSION ─────────────────── */
  const SLANG_MAP = [
    // Internet shorthand
    ["wt ", "what "],["wts ","what is "],["msg","message"],["msgs","messages"],
    ["dm ","direct message "],["dms ","direct messages "],
    ["insta","instagram"],["wa ","whatsapp "],["wa?","whatsapp?"],
    ["biz","business"],["bro","brother"],["sis","sister"],
    ["tbh","to be honest"],["ngl","not going to lie"],["imo","in my opinion"],
    ["imho","in my honest opinion"],["lol",""],["lmao",""],["haha",""],
    ["smh","shaking my head"],["idk","i dont know"],["idc","i dont care"],
    ["imo","in my opinion"],["fyi","for your information"],
    ["asap","as soon as possible"],["btw","by the way"],["omg",""],
    ["nvm","never mind"],["ttyl","talk to you later"],["brb","be right back"],
    ["rn","right now"],["ig ","i guess "],["irl","in real life"],
    ["obv","obviously"],["def","definitely"],["prob","probably"],
    ["tho","though"],["thru","through"],["coz","because"],["cuz","because"],
    ["bcoz","because"],["bcuz","because"],["bc ","because "],
    ["vs ","versus "],["n ","and "],["nd ","and "],["& ","and "],
    ["pls","please"],["plz","please"],["plss","please"],
    ["ok ","okay "],["okk ","okay "],["okkk ","okay "],
    ["yep","yes"],["yup","yes"],["ya ","yes "],["ye ","yes "],
    ["nah","no"],["nope","no"],["nay","no"],
    ["wanna","want to"],["gonna","going to"],["gotta","have to"],
    ["lemme","let me"],["gimme","give me"],["kinda","kind of"],
    ["sorta","sort of"],["lotta","lot of"],
    // Fitness domain
    ["pt ","personal trainer "],["pt?","personal trainer?"],
    ["online coaching","coaching"],["1on1","one on one"],["1:1","one on one"],
  ];

  /* ── §1b  EXPANDED HINGLISH + ROMAN HINDI MAP ────────────── */
  const HINGLISH_RAW = [
    // Pricing — extended
    ["price kya hai","what is price"],["price kya h","what is price"],
    ["price kya hoga","what is price"],["price batao","tell price"],
    ["price btao","tell price"],["price bolo","tell price"],
    ["price kitna hai","what is price"],["kitna price hai","what is price"],
    ["price pta nahi","not sure about price"],
    ["kitna banta hai","how much total"],["kitna padega","how much cost"],
    ["kitna lagega bhai","how much cost"],["kitna lagega","how much cost"],
    ["kitne paise lagenge","how much cost"],["kitna paisa lagega","how much cost"],
    ["paise kitne","how much cost"],["charges kya hai","what are charges"],
    ["charges kya h","what are charges"],["charge kya hai","what is charge"],
    ["rate kya hai","what is price"],["rate kya h","what is price"],
    ["monthly kitna","monthly price"],["mahine ka kitna","monthly price"],
    ["total kitna","total cost"],["kitna hai","how much"],["kitna","how much"],
    ["paisa wala","pricing"],["paison ka kya","pricing"],
    ["rupaye kitne","how much cost"],["rupaye","price"],
    ["paise","price"],["rupees","price"],["rupee","price"],
    ["paisa","price"],["lagega","cost"],["lagenge","cost"],
    ["lagti","cost"],["lagta","cost"],
    // How it works — extended
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
    // Starting — extended
    ["kaise shuru karun","how to start"],["kaise shuru karu","how to start"],
    ["kaise shuru","how to start"],["kaise join karun","how to join"],
    ["shuru karna hai","want to start"],["shuru kar sakta hun","can start"],
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["shuru karna chahta hun","want to start"],
    ["start karna hai","want to start"],["start karna chahta","want to start"],
    // Buying intent
    ["lena chahta hun","want to buy"],["lena hai","want to buy"],
    ["kharidna hai","want to buy"],["kharidna chahta hun","want to buy"],
    ["le lun kya","should i buy"],["le lu","will take it"],
    // Plan selection
    ["kaunsa plan lena chahiye","which plan should i take"],
    ["konsa plan lu","which plan should i take"],
    ["kaunsa plan best hai","which plan is best"],
    ["konsa plan best hai","which plan is best"],
    ["kaunsa plan","which plan"],["konsa plan","which plan"],
    ["kaun sa plan","which plan"],["sahi plan","right plan"],
    ["sahi plan kaunsa hai","which is right plan"],
    ["mere liye kaunsa plan","which plan for me"],
    ["mujhe kaunsa plan lena chahiye","which plan should i take"],
    // Plan feature queries
    ["starter mein kya milega","starter plan features"],
    ["growth mein kya milega","growth plan features"],
    ["free mein kya milega","free plan features"],
    ["combo mein kya milega","combo plan features"],
    ["whatsapp wale mein kya","whatsapp plan features"],
    ["is mein kya kya milega","what all is included"],
    ["kya kya milega","what is included"],
    // Trust + Safety
    ["safe hai kya","is it safe"],["ban hoga kya","will account be banned"],
    ["account jaega kya","will account be banned"],
    ["scam toh nahi","is it legit"],["dhoka","fraud"],["dhokha","fraud"],
    ["bharosa","trust"],["sach mein","really"],["sach","real"],
    ["genuine hai kya","is it genuine"],["legit hai kya","is it legit"],
    ["jhoot toh nahi","is it real"],["fake toh nahi hai","is it not fake"],
    ["account band nahi hoga","account wont be banned"],
    ["instagram nahi pakdega","instagram wont catch"],
    // Cancellation
    ["service band karna hai","cancel service"],["band karna","cancel"],
    ["cancel karna hai","want to cancel"],["cancel karna","cancel"],
    ["chhodna hai","want to stop"],["chhod dun","should i stop"],
    // Timeline
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["kab hoga","when will it be"],["kab","when"],
    ["kitne din mein","how many days"],["kitne ghante","how many hours"],
    ["kitne din","how many days"],["kitna time lagega","how long will it take"],
    ["jaldi ho jaega","will it be quick"],["kitne time mein","how long"],
    // Instructions
    ["batao","explain"],["samjhao","explain"],["bolo","tell me"],
    ["dikhao","show me"],["dekhna","see"],["dekh","see"],
    ["bata","tell"],["dikha","show"],["samaj nahi aya","didnt understand"],
    ["samajh nahi aaya","didnt understand"],["dobara samjhao","explain again"],
    // Plan value expressions
    ["sasta wala plan","cheapest plan"],["sabse sasta plan","cheapest plan"],
    ["sasta wala","cheapest"],["sabse sasta","cheapest"],
    ["sabse acha plan","best plan"],["sabse acha","best"],
    ["sasta","cheap"],["mehenga","expensive"],["bahut mehenga","very expensive"],
    ["thoda mehnga","a bit expensive"],["zyada mehenga","too expensive"],
    ["best wala plan","best plan"],["best wala","best plan"],
    ["free wala plan","free plan"],["free wala","free plan"],
    ["paid wala","paid plan"],["shuru","start"],["karna hai","want to"],
    ["aage badhna","proceed"],["theek hai","ok"],
    ["acha","ok"],["achha","ok"],["accha","ok"],
    ["bilkul","absolutely"],["zaroor","definitely"],["beshak","definitely"],
    ["haan","yes"],["nahi","no"],["nai","no"],
    // Confusion / thinking
    ["nahi chahiye","not interested"],
    ["samajh gaya","understood"],["samajh gayi","understood"],
    ["pata nahi","dont know"],["nahi pata","dont know"],
    ["kuch pata nahi","dont know anything"],
    ["soch raha hun","thinking"],["soch rahi hun","thinking"],
    ["soch raha hoon","thinking"],
    ["doubt hai","have doubt"],["confusion hai","am confused"],
    ["confuse ho gaya","got confused"],["kuch samajh nahi aaya","dont understand"],
    ["abhi nahi","not now"],["baad mein","later"],["baad mein dekhta hun","will see later"],
    // Negations — special Hinglish
    ["leads nahi aate","not getting leads"],
    ["leads aate hain but","leads come but"],
    ["leads toh aate hain","leads do come"],
    ["clients nahi milte","not getting clients"],
    ["reply manage nahi hota","cant manage replies"],
    ["reply karna mushkil hai","replying is difficult"],
    ["time nahi hai","dont have time"],
    ["pura din chala jata hai","whole day is spent"],
    ["bahut time jata hai","lot of time is spent"],
    ["thak gaya hun","am exhausted"],["thak gayi hun","am exhausted"],
    ["bore ho gaya","got bored"],
    // Pain points
    ["serious lead nahi aate","not getting serious leads"],
    ["fake lead bahut aate hain","getting many fake leads"],
    ["time waster bahut hain","many time wasters"],
    ["manually reply karna padta hai","have to reply manually"],
    ["khud reply karna padta hai","have to reply myself"],
    ["ghar baith ke reply karta hun","replying from home"],
    ["din bhar sirf reply karta hun","replying all day"],
    ["raat ko bhi reply karna padta hai","have to reply at night too"],
    // Bot feel concern
    ["bot lagega kya","will it seem like a bot"],
    ["bot pata chalega kya","will they know its a bot"],
    ["robot jaisa lagega","will it feel robotic"],
    ["fake lagega kya","will it seem fake"],
    ["natural lagega kya","will it feel natural"],
    ["human jaisa","human like"],
    // Results interest
    ["kaam karta hai kya","does it work"],
    ["result milega kya","will i get results"],
    ["clients milenge kya","will i get clients"],
    ["calls book hogi kya","will calls get booked"],
    ["proof dikhao","show proof"],["proof kya hai","what is proof"],
    // Worth it
    ["worth it hai kya","is it worth it"],["worth it hai","is it worth it"],
    ["faida hoga kya","will there be benefit"],["kya fayda","what benefit"],
    ["kya farak padega","what difference will it make"],
    // Greetings + social
    ["kya haal hai","how are you"],["kaise ho aap","how are you"],
    ["kaise ho","how are you"],["kya chal raha hai","whats going on"],
    ["sab theek hai","all good"],["sab kuch theek","all good"],
    ["namaste","hello"],["namaskar","hello"],["assalamualaikum","hello"],
    ["walaikum assalam","hello"],["jai hind","hello"],
    ["bhai","hey"],["yaar","hey"],["dost","hey"],["boss","hey"],
    ["guru","hey"],["bro ","hey "],["sis ","hey "],
    ["mahina","monthly"],["mahine","monthly"],
    ["kaun sa","which"],["konsa","which"],
    // Telugu + Tamil (preserved from v8)
    ["ela pani chestundi","how does it work"],["entha avutundi","how much cost"],
    ["start ela cheyali","how to start"],["price cheppandi","tell price"],
    ["ela","how"],["enti","what"],["entha","how much"],["emi","what"],
    ["eppadi velai seiyum","how does it work"],["ethanai aagum","how much cost"],
    ["thodangu eppadi","how to start"],["vilai enna","what is price"],
    ["eppadi","how"],["ethanai","how much"],["enna","what"],["epdi","how"],
    // Common Hinglish connectors
    ["par ","but "],["lekin ","but "],["magar ","but "],
    ["aur ","and "],["toh ","so "],["isliye ","therefore "],
    ["phir bhi","still"],["phir bhi ","even then "],
    ["kyunki","because"],["kyuki","because"],["isiliye","therefore"],
    ["tabhi toh","thats why"],["warna","otherwise"],
    ["agar ","if "],["jab ","when "],["jab tak","until"],
    ["abhi","now"],["abhi ke liye","for now"],
    ["pehle","first"],["baad mein","later"],["fir","then"],
  ];

  /* ── §1c  PHONETIC NORMALIZATION ─────────────────────────── */
  const PHONETIC_MAP = [
    ["kewl","cool"],["kool","cool"],["coool","cool"],["cooool","cool"],
    ["gr8","great"],["gr9","great"],["gr8t","great"],
    ["l8r","later"],["2day","today"],["2moro","tomorrow"],["4u","for you"],
    ["u r","you are"],["ur ","your "],["u ","you "],["r u","are you"],
    ["b4","before"],["luv","love"],["hav ","have "],["wud ","would "],
    ["cud ","could "],["shud ","should "],["wil ","will "],
    ["dat ","that "],["dis ","this "],["dere ","there "],["dem ","them "],
    ["smajh","samajh"],["samaj ","samajh "],["smjh","samajh"],
    ["samj ","samajh "],["smaj","samajh"],
    ["karo","karo"],["kro","karo"],["kro ","karo "],
    ["logo","log"],["logon","log"],
    ["suno","sun"],["dekho","dekh"],["batao","bata"],
    ["chahiye","chahiye"],["chhaiye","chahiye"],["chaiye","chahiye"],
    ["milega","milega"],["milega","milega"],
    ["hoga","hoga"],["hogi","hogi"],["honge","honge"],
    ["acha","ok"],["achha","ok"],["acha ","ok "],
  ];

  /* ── §1d  EMOTICON → SEMANTIC TOKEN ──────────────────────── */
  const EMOTICON_MAP = [
    [/😤|😠|😡|🤬/g, " user_frustrated "],
    [/😊|😀|😃|😄|🙂|😁/g, " user_happy "],
    [/😕|😟|😢|😥|😩/g, " user_worried "],
    [/🤔|🧐|🤨/g, " user_thinking "],
    [/👍|✅|💯/g, " user_positive "],
    [/👎|❌/g, " user_negative "],
    [/💸|💰|💵/g, " price "],
    [/⏰|⏱️|🕐/g, " time "],
    [/❓|🤷/g, " question "],
    [/🔥|💪|✨/g, " user_excited "],
  ];

  /* ── Compile regex arrays once ───────────────────────────── */
  const _hinglishRegexes = HINGLISH_RAW
    .sort((a, b) => b[0].length - a[0].length)
    .map(([k, v]) => ({
      re: new RegExp("(?<![a-z0-9])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-z0-9])", "gi"),
      v,
    }));

  const _slangRegexes = SLANG_MAP
    .sort((a, b) => b[0].length - a[0].length)
    .map(([k, v]) => ({
      re: new RegExp("(?<![a-z0-9])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-z0-9])", "gi"),
      v,
    }));

  const _phoneticRegexes = PHONETIC_MAP
    .sort((a, b) => b[0].length - a[0].length)
    .map(([k, v]) => ({
      re: new RegExp("(?<![a-z])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-z])", "gi"),
      v,
    }));

  function dedupeChars(s) {
    // Normalize repeated chars: broooo→bro, kyaaa→kya, bottt→bot
    return s.replace(/(.)\1{2,}/g, "$1$1").replace(/(.)\1{2,}/g, "$1");
  }

  function normalizeText(raw) {
    if (!raw) return "";
    let s = String(raw).toLowerCase().trim();

    // Emoticons → semantic tokens
    for (const [re, token] of EMOTICON_MAP) s = s.replace(re, token);

    // Deduplicate repeated characters
    s = dedupeChars(s);

    // Clean punctuation (preserve ₹ and common symbols)
    s = s.replace(/['''""`]/g, "").replace(/[^\w\s\u20b9@.+\-]/g, " ").replace(/\s{2,}/g, " ").trim();

    // Apply slang expansion first
    for (const { re, v } of _slangRegexes) s = s.replace(re, v);

    // Apply phonetic normalization
    for (const { re, v } of _phoneticRegexes) s = s.replace(re, v);

    // Apply Hinglish/Roman Hindi translations
    for (const { re, v } of _hinglishRegexes) s = s.replace(re, v);

    return s.replace(/\s{2,}/g, " ").trim();
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
    return s.split(/[?.!]|\baur\b|\band\b|\bor\b|\bplus\b|\balso\b|\bthen\b|\bpar\b|\blekin\b|\bmagar\b/i)
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
     §3  LAYER 3 — SEMANTIC CLUSTER BRAIN (12 clusters)
  ════════════════════════════════════════════════════════════ */
  const SEMANTIC_CLUSTERS = {
    // Trust & Safety signals
    trust_concern: {
      keywords: ["safe","ban","scam","fraud","risk","fake","legit","genuine","trust",
                 "secure","banned","suspend","spam","account","real","legit","dhoka",
                 "jhoot","sach","bharosa","pakdega"],
      weight: 1.4,
      intent_boost: "safety"
    },
    // Price sensitivity
    price_concern: {
      keywords: ["expensive","costly","budget","afford","cheap","mehenga","worth",
                 "price","money","rupee","rupees","cost","fee","rate","monthly",
                 "zyada","sasta","lagega","paisa","paise","kitna"],
      weight: 1.5,
      intent_boost: "pricing"
    },
    // Time & workload pain
    time_pain: {
      keywords: ["busy","time","daily","effort","complicated","maintain","manual",
                 "reply","replies","manage","management","din","pura","chala",
                 "thak","exhausted","overwhelmed","handling","all day","hours",
                 "roz","har roz","din bhar"],
      weight: 1.3,
      intent_boost: "process"
    },
    // Results & proof seeking
    results_interest: {
      keywords: ["result","proof","work","effective","coaches","clients","case",
                 "guarantee","conversion","booking","calls","revenue","growth",
                 "success","testimonial","kaam karta","milenge","milega","fayda"],
      weight: 1.3,
      intent_boost: "results"
    },
    // Ready to buy signals
    purchase_intent: {
      keywords: ["start","setup","ready","proceed","book","join","yes","begin",
                 "sign up","get","buy","purchase","take","order","invest",
                 "shuru","lena","lena chahta","le lun","kharidna","chalu"],
      weight: 1.6,
      intent_boost: "contact"
    },
    // Just browsing / uncertain
    exploration: {
      keywords: ["curious","maybe","thinking","later","not sure","exploring",
                 "checking","just looking","soch","abhi nahi","baad","perhaps",
                 "possibly","might","considering","wondering"],
      weight: 0.8,
      intent_boost: "compare_plans"
    },
    // Bot authenticity concern
    authenticity_concern: {
      keywords: ["robotic","natural","bot feel","fake","real feel","human like",
                 "organic","personal","clients notice","bot obvious","natural",
                 "human tone","bot pata","lagega kya","feel","robot"],
      weight: 1.4,
      intent_boost: "human_feel"
    },
    // Lead quality frustration
    lead_frustration: {
      keywords: ["serious","quality","waster","time waster","unserious","fake lead",
                 "not serious","junk","useless lead","ghosting","no response",
                 "serious nahi","time waste","ganda lead","bakwas"],
      weight: 1.5,
      intent_boost: "services"
    },
    // Confusion / need explanation
    confusion: {
      keywords: ["confused","dont understand","unclear","complex","complicated",
                 "explain","elaborate","clarify","not sure how","kya matlab",
                 "kaise","samajh nahi","dobara","again","simple"],
      weight: 1.2,
      intent_boost: "process"
    },
    // Positive excitement
    excitement: {
      keywords: ["amazing","awesome","great","love","excited","wow","fantastic",
                 "incredible","perfect","exactly","this is it","yes please",
                 "badhiya","zabardast","mast","shandar","ekdum"],
      weight: 1.0,
      intent_boost: "contact"
    },
    // Comparison seeking
    comparison_seeking: {
      keywords: ["compare","vs","versus","better","worse","difference","which",
                 "or","between","option","alternative","instead","rather",
                 "fark","antar","ya","behtar"],
      weight: 1.1,
      intent_boost: "compare_plans"
    },
    // Automation skepticism
    automation_doubt: {
      keywords: ["will it work","does it work","really","actually","honestly",
                 "i doubt","not sure if","skeptic","prove","convince me",
                 "sach mein","sach","really work","kya actually","doubt"],
      weight: 1.3,
      intent_boost: "results"
    },
  };

  function getSemanticScores(normInput) {
    const scores = {};
    const tokens = normInput.toLowerCase().split(/\s+/);
    for (const [cluster, data] of Object.entries(SEMANTIC_CLUSTERS)) {
      let hits = 0;
      for (const kw of data.keywords) {
        if (normInput.includes(kw)) hits += data.weight;
        else {
          for (const tok of tokens) {
            if (fuzzyScore(tok, kw) > 0.82) { hits += 0.5 * data.weight; break; }
          }
        }
      }
      if (hits > 0) scores[cluster] = hits;
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

  function getSemanticProfile() {
    const allInputs = MEM.history.map(h => h.input || "").join(" ").toLowerCase();
    const profile = {};
    for (const [cluster, data] of Object.entries(SEMANTIC_CLUSTERS)) {
      const hits = data.keywords.filter(kw => allInputs.includes(kw)).length;
      if (hits > 0) profile[cluster] = hits;
    }
    return profile;
  }

  /* ════════════════════════════════════════════════════════════
     §3b  LAYER 2 — PHRASE UNDERSTANDING ENGINE
     Detects meaning from multi-word patterns — not just keywords
  ════════════════════════════════════════════════════════════ */

  // Phrase patterns that capture composite meaning
  const PHRASE_PATTERNS = [
    // Lead quality frustration
    {
      patterns: [/leads.{0,20}but.{0,20}(serious|quality|not|nahi)/i,
                 /lead.{0,20}(fake|waster|unserious|time)/i,
                 /serious.{0,15}(lead|nahi|not)/i,
                 /lead.{0,20}aate.{0,10}but/i,
                 /lead.{0,20}aa.{0,10}rahe.{0,10}(par|but|lekin)/i],
      signals: ["lead_quality_issue","qualification_needed","time_waster_frustration"],
      intent_boost: "services",
      empathy_key: "lead_frustration"
    },
    // Trust / authenticity fear
    {
      patterns: [/not.{0,15}want.{0,15}(fake|robotic|robot|bot)/i,
                 /(fake|robotic|robot|bot).{0,20}(feel|seem|look|sound|lag)/i,
                 /don.{0,5}t.{0,15}want.{0,15}(bot|robot|fake|artificial)/i,
                 /(bot|robot).{0,15}(obvious|pata|notice|detect|feel)/i,
                 /natural.{0,15}(feel|lag|seem)/i,
                 /fear.{0,20}(fake|robotic|bot)/i],
      signals: ["trust_concern","authenticity_fear","real_feel_needed"],
      intent_boost: "human_feel",
      empathy_key: "authenticity_concern"
    },
    // Time/workload pain
    {
      patterns: [/reply.{0,30}(pura din|all day|din bhar|whole day|hours|hours a day)/i,
                 /(pura din|whole day|all day).{0,20}(reply|message|dm)/i,
                 /(time|din|roz).{0,20}(chala jata|chali jati|wasted|waste|gone|jaata|jaati)/i,
                 /(busy|tired|thak).{0,20}(reply|message|dm|respond)/i,
                 /(manually|khud|myself).{0,20}reply/i,
                 /can.{0,10}t.{0,20}(manage|handle|keep up)/i],
      signals: ["manual_workload_pain","time_management_issue","scaling_needed"],
      intent_boost: "services",
      empathy_key: "time_pain"
    },
    // Price objection with reasoning
    {
      patterns: [/(expensive|costly|mehenga|price).{0,30}(but|though|however|par|lekin)/i,
                 /(budget|afford|money).{0,20}(tight|less|low|not much|nahi)/i,
                 /can.{0,5}t.{0,20}afford/i,
                 /(invest|spend).{0,20}(lot|much|zyada|bahut)/i],
      signals: ["price_hesitation","budget_conscious"],
      intent_boost: "objection_expensive",
      empathy_key: "price_concern"
    },
    // Uncertainty with positive lean
    {
      patterns: [/(sounds|looks|seems).{0,15}good.{0,20}but/i,
                 /(interested|curious|like it).{0,20}but.{0,20}(not sure|doubt|worry)/i,
                 /(acha hai|good|nice).{0,10}(but|par|lekin|magar)/i,
                 /thinking.{0,20}about.{0,20}(it|this|getting)/i,
                 /considering.{0,20}(but|however)/i],
      signals: ["positive_lean","hesitation","want_more_info"],
      intent_boost: "objection_unsure",
      empathy_key: "exploration"
    },
    // Direct buy signal
    {
      patterns: [/(want|wanna|need).{0,15}(to start|to get|this|to buy|to try)/i,
                 /(how|where).{0,10}(to sign up|to start|to get started|to join)/i,
                 /(ready|let.s|lets|go ahead).{0,15}(start|get|try|setup)/i,
                 /sign me up/i,
                 /(interested in|want).{0,15}(growth|starter|combo|whatsapp).{0,10}plan/i],
      signals: ["purchase_intent","ready_to_commit"],
      intent_boost: "contact",
      empathy_key: "purchase_intent"
    },
    // Comparison intent
    {
      patterns: [/(vs|versus|compared to|or).{0,20}(plan|package|option)/i,
                 /difference.{0,20}(between|in).{0,20}plan/i,
                 /which.{0,15}(is better|should i|would you recommend)/i,
                 /(free|starter|growth|combo|whatsapp).{0,10}(vs|versus|or).{0,10}(free|starter|growth|combo|whatsapp)/i],
      signals: ["comparison_needed","decision_support"],
      intent_boost: "compare_plans",
      empathy_key: "comparison_seeking"
    },
    // Results skepticism
    {
      patterns: [/does (it|this) (really|actually) work/i,
                 /(prove|show me|convince me).{0,20}(works|results|real)/i,
                 /(really|actually).{0,20}(get|see|have).{0,20}(result|client|lead)/i,
                 /kya (sach mein|actually|really).{0,20}kaam/i],
      signals: ["skepticism","proof_needed","trust_building_required"],
      intent_boost: "results",
      empathy_key: "automation_doubt"
    },
    // Demo / see it in action
    {
      patterns: [/(show me|let me see|can i see|want to see).{0,20}(demo|example|how it works)/i,
                 /(before|first).{0,20}(decide|commit|buy|purchase|invest)/i,
                 /(test|try).{0,20}(before|first|it out)/i,
                 /live.{0,15}(demo|example|preview)/i],
      signals: ["wants_demo","low_trust","visual_proof_needed"],
      intent_boost: "demo",
      empathy_key: "automation_doubt"
    },
  ];

  function matchPhrasePatterns(normInput, rawInput) {
    const detected = {
      signals: [],
      intent_boosts: {},
      empathy_keys: [],
    };

    for (const pattern of PHRASE_PATTERNS) {
      const matched = pattern.patterns.some(re => re.test(rawInput) || re.test(normInput));
      if (matched) {
        detected.signals.push(...pattern.signals);
        if (pattern.intent_boost) {
          detected.intent_boosts[pattern.intent_boost] = (detected.intent_boosts[pattern.intent_boost] || 0) + 2.5;
        }
        if (pattern.empathy_key) {
          detected.empathy_keys.push(pattern.empathy_key);
        }
      }
    }

    return detected;
  }

  /* ════════════════════════════════════════════════════════════
     §3c  LAYER 6 — GRAMMAR + STRUCTURE INTELLIGENCE
  ════════════════════════════════════════════════════════════ */

  // Negation detection — scope-aware
  const NEGATION_WORDS = /\b(not|no|never|dont|don't|wont|won't|cant|can't|isnt|isn't|aren't|arent|wasn't|weren't|neither|nor|nahi|na|nai|mat|maat|bilkul nahi)\b/i;
  const NEGATION_SCOPE = 5; // words after negation that are negated

  function detectNegationScope(tokens) {
    const negated = new Set();
    for (let i = 0; i < tokens.length; i++) {
      if (NEGATION_WORDS.test(tokens[i])) {
        for (let j = i + 1; j <= Math.min(i + NEGATION_SCOPE, tokens.length - 1); j++) {
          negated.add(j);
        }
      }
    }
    return negated;
  }

  // Uncertainty qualifier detection
  const UNCERTAINTY_RE = /\b(maybe|perhaps|possibly|might|could|kinda|sorta|kind of|sort of|not sure|unsure|thinking|soch|pata nahi|shayad|lag raha|not exactly|roughly|approximately|i think|i guess)\b/i;

  // Positive-but-negative pattern (enthusiasm + concern)
  function detectButClause(normInput) {
    const butMatch = normInput.match(/^(.{10,}?)\s+(?:but|however|though|par|lekin|magar|phir bhi)\s+(.{5,})$/i);
    if (!butMatch) return null;
    return {
      positive: butMatch[1].trim(),
      concern: butMatch[2].trim(),
    };
  }

  // Question classification
  const QUESTION_INDICATORS = /\b(what|how|when|why|where|which|who|is|are|can|will|does|do|should|kya|kaise|kab|kyun|kahan|konsa|kaun)\b.*[?]?$/i;

  function classifyInput(normInput, rawInput) {
    const tokens = tokenize(normInput);
    const negated = detectNegationScope(tokens);
    const hasUncertainty = UNCERTAINTY_RE.test(normInput);
    const butClause = detectButClause(normInput);
    const isQuestion = QUESTION_INDICATORS.test(rawInput) || rawInput.includes("?");
    const isNegative = negated.size > 0;
    const wordCount = tokens.length;

    return {
      tokens,
      negated,
      hasUncertainty,
      butClause,
      isQuestion,
      isNegative,
      wordCount,
      isShort: wordCount <= 3,
      isDetailed: wordCount >= 20,
      isMixed: butClause !== null,
    };
  }

  /* ════════════════════════════════════════════════════════════
     §3d  LAYER 4 — SENTENCE DECOMPOSITION ENGINE
  ════════════════════════════════════════════════════════════ */

  function decomposeSentence(sentence, normSentence) {
    const clusterScores = getSemanticScores(normSentence);
    const phraseMatches = matchPhrasePatterns(normSentence, sentence);
    const grammar = classifyInput(normSentence, sentence);

    // Detect emotion
    let emotion = "neutral";
    if (/user_frustrated|thak|exhausted|bore|frustrated|angry/i.test(normSentence)) emotion = "frustrated";
    else if (/user_happy|user_excited|excited|amazing|love|wow|great|mast|badhiya/i.test(normSentence)) emotion = "excited";
    else if (/user_worried|worried|fear|scared|nervous|darr|tension/i.test(normSentence)) emotion = "worried";
    else if (/user_thinking|thinking|confused|soch|doubt|unclear/i.test(normSentence)) emotion = "thinking";
    else if (grammar.hasUncertainty) emotion = "uncertain";

    // Detect urgency
    let urgency = "none";
    if (/now|today|asap|immediately|right now|abhi|aaj|jaldi|urgent|quick/i.test(normSentence)) urgency = "high";
    else if (/soon|this week|next week|baad|maybe|thinking/i.test(normSentence)) urgency = "medium";

    // Extract desire (what the user ultimately wants)
    let desire = null;
    if (phraseMatches.signals.includes("purchase_intent")) desire = "wants_to_buy";
    else if (phraseMatches.signals.includes("proof_needed")) desire = "wants_proof";
    else if (phraseMatches.signals.includes("wants_demo")) desire = "wants_demo";
    else if (phraseMatches.signals.includes("lead_quality_issue")) desire = "wants_better_leads";
    else if (phraseMatches.signals.includes("manual_workload_pain")) desire = "wants_time_back";
    else if (phraseMatches.signals.includes("price_hesitation")) desire = "wants_affordable_option";
    else if (phraseMatches.signals.includes("trust_concern")) desire = "wants_reassurance";
    else if (phraseMatches.signals.includes("authenticity_fear")) desire = "wants_natural_bot";

    return {
      emotion,
      urgency,
      desire,
      signals: phraseMatches.signals,
      empathy_keys: phraseMatches.empathy_keys,
      intent_boosts: phraseMatches.intent_boosts,
      clusterScores,
      grammar,
    };
  }

  /* ════════════════════════════════════════════════════════════
     §3e  LAYER 7 — HINGLISH INTELLIGENCE ENGINE
     Post-normalization deeper Hindi grammar understanding
  ════════════════════════════════════════════════════════════ */

  // Hindi verb ending patterns → convert to intent signals
  const HINDI_VERB_PATTERNS = [
    // Negative intent patterns
    { re: /\b(nahi|na|mat|maat)\s+(chahiye|chahta|chahti|chahiye|chaiye)\b/i, signal: "negative_intent" },
    { re: /\b(nahi|nai)\s+(milta|milte|milti|hota|hoti|hote)\b/i, signal: "problem_statement" },
    { re: /\bnahi\s+ho\s+(raha|rahi|rahe)\b/i, signal: "problem_ongoing" },
    // Desire patterns
    { re: /\b(chahiye|chahta|chahti|chunta|chunti)\b/i, signal: "desire_expressed" },
    { re: /\b(lena|karna|dekhna|samajhna)\s+(hai|hoga|chahiye)\b/i, signal: "action_intent" },
    // Question patterns
    { re: /\b(hai|hoga|hogi)\s+kya\b/i, signal: "yes_no_question" },
    { re: /\bkya\s+(aap|tum|ye)\b/i, signal: "question_asked" },
    // Concern patterns
    { re: /\b(darr|dar)\s+(hai|lag raha|raha)\b/i, signal: "fear_expressed" },
    { re: /\btension\s+(hai|ho rahi|mat lo)\b/i, signal: "concern_expressed" },
    // Time expressions
    { re: /\b(roz|har roz|din bhar|pura din|24 ghante|24\/7)\b/i, signal: "daily_struggle" },
    { re: /\b(bahut|bohot)\s+(time|ghante|din)\b/i, signal: "time_complaint" },
  ];

  function extractHindiSignals(normInput) {
    const signals = [];
    for (const { re, signal } of HINDI_VERB_PATTERNS) {
      if (re.test(normInput)) signals.push(signal);
    }
    return signals;
  }

  /* ════════════════════════════════════════════════════════════
     §4  NAMED ENTITY RECOGNITION
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
     §4b  HARDCODED FAST-PATH PATTERNS
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
     §5  USER-TYPE DETECTION
  ════════════════════════════════════════════════════════════ */
  function detectUserType(normInput) {
    for (const ut of (D().user_types || []))
      if (ut.signals.some(sig => normInput.includes(sig))) return ut;
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §6  INTENT CATALOGUE  (27 intents)
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
     §7  INTENT SCORER — with cluster + phrase boosting
  ════════════════════════════════════════════════════════════ */
  function scoreIntents(normInput, phraseBoosts, clusterBoosts) {
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

      // Apply phrase pattern boosts
      if (phraseBoosts && phraseBoosts[intent.id]) {
        score += phraseBoosts[intent.id];
      }

      // Apply semantic cluster boosts
      if (clusterBoosts && clusterBoosts[intent.id]) {
        score += clusterBoosts[intent.id];
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
     §8  CONTEXT MEMORY — With enhanced semantic slots + pain tracking
  ════════════════════════════════════════════════════════════ */
  const MEM = {
    history: [],
    MAX: 6,
    slots: {
      userGoal: null,
      budgetSentiment: null,
      urgency: null,
      trustLevel: 0,
      questionDepth: 0,
      // NEW in v9
      painPoints: [],          // accumulated pain signals
      objectionPattern: [],    // repeated objection types
      emotionalState: "neutral",
      desireHistory: [],       // what user ultimately wants
      unresolvedTopics: [],    // topics asked but not fully answered
      sentenceDecompositions: [], // last decomposed sentences
    },

    push(intent, plan, entities, input, decomposition) {
      this.history.push({ intent, plan, entities, input, decomposition });
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

      // v9: Track pain points
      if (decomposition) {
        if (decomposition.signals && decomposition.signals.length) {
          this.slots.painPoints.push(...decomposition.signals);
          // Keep unique, max 20
          this.slots.painPoints = [...new Set(this.slots.painPoints)].slice(-20);
        }
        if (decomposition.emotion && decomposition.emotion !== "neutral")
          this.slots.emotionalState = decomposition.emotion;
        if (decomposition.desire)
          this.slots.desireHistory.push(decomposition.desire);
        if (decomposition.empathy_keys)
          this.slots.sentenceDecompositions.push(...decomposition.empathy_keys);
      }

      // Track unresolved topics
      if (intent && !["greeting","thanks","contact"].includes(intent)) {
        if (!this.slots.unresolvedTopics.includes(intent))
          this.slots.unresolvedTopics.push(intent);
        if (this.slots.unresolvedTopics.length > 5)
          this.slots.unresolvedTopics.shift();
      }

      // Objection pattern tracking
      if (intent && intent.startsWith("objection_")) {
        this.slots.objectionPattern.push(intent);
        if (this.slots.objectionPattern.length > 3) this.slots.objectionPattern.shift();
      }
    },

    get last()       { return this.history[this.history.length-1] || {}; },
    get lastPlan()   { return [...this.history].reverse().find(h => h.plan)?.plan || null; },
    get lastIntent() { return this.last.intent || null; },
    get turnCount()  { return this.history.length; },
    resolvePlan(nerPlan) { return nerPlan || this.lastPlan; },

    hasPainPoint(signal) {
      return this.slots.painPoints.includes(signal);
    },

    getTopDesire() {
      const hist = this.slots.desireHistory;
      if (!hist.length) return null;
      // Most recent desire is most relevant
      return hist[hist.length - 1];
    },

    getContextHints() {
      const hints = [];
      if (this.slots.budgetSentiment === "price_sensitive") hints.push("user_price_sensitive");
      if (this.slots.urgency === "now") hints.push("user_ready_now");
      if (this.slots.questionDepth > 4) hints.push("deep_researcher");
      if (this.slots.trustLevel > 6) hints.push("trust_established");
      if (this.slots.urgency === "later") hints.push("user_not_ready");
      // v9 additions
      if (this.slots.emotionalState === "frustrated") hints.push("user_frustrated");
      if (this.slots.emotionalState === "excited") hints.push("user_excited");
      if (this.hasPainPoint("manual_workload_pain")) hints.push("has_workload_pain");
      if (this.hasPainPoint("lead_quality_issue")) hints.push("has_lead_quality_pain");
      if (this.hasPainPoint("authenticity_fear")) hints.push("has_bot_fear");
      if (this.hasPainPoint("trust_concern")) hints.push("has_trust_concern");
      if (this.slots.objectionPattern.length >= 2) hints.push("multiple_objections");
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
     §8b  USER PROFILE — localStorage persistent
  ════════════════════════════════════════════════════════════ */
  const USER_PROFILE = {
    KEY: "aaa_user_profile_v2",

    defaults() {
      return {
        visitCount: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        coachType: null,
        platformInterest: null,
        objections: [],
        topicsAsked: [],
        conversionStage: "aware",
        name: null,
        lastPlanDiscussed: null,
        // v9 additions
        painPointsSeen: [],
        emotionalProfile: "neutral",
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

      if (/fat\s*loss|weight\s*loss|transformation/i.test(normInput)) profile.coachType = "fat_loss";
      else if (/muscle|bodybuilding|bulk/i.test(normInput)) profile.coachType = "muscle";
      else if (/yoga/i.test(normInput)) profile.coachType = "yoga";
      else if (/nutrition|diet/i.test(normInput)) profile.coachType = "nutrition";

      if (/instagram|ig\b/i.test(normInput) && !/whatsapp/i.test(normInput)) profile.platformInterest = "instagram";
      else if (/whatsapp|wa\b/i.test(normInput) && !/instagram/i.test(normInput)) profile.platformInterest = "whatsapp";
      else if (/both|combo|dono/i.test(normInput)) profile.platformInterest = "both";

      if (intent === "pricing" && profile.conversionStage === "aware")
        profile.conversionStage = "interested";
      if ((intent === "demo" || intent === "contact") && profile.conversionStage === "interested")
        profile.conversionStage = "considering";
      if (entities && entities.sentiment === "positive" && profile.conversionStage === "considering")
        profile.conversionStage = "ready";

      if (intent && intent.startsWith("objection_") && !profile.objections.includes(intent))
        profile.objections.push(intent);

      if (entities && entities.plan) profile.lastPlanDiscussed = entities.plan;

      if (intent && !profile.topicsAsked.includes(intent))
        profile.topicsAsked.push(intent);

      this.save(profile);
      return profile;
    }
  };

  /* ════════════════════════════════════════════════════════════
     §8c  SESSION — sessionStorage per-visit
  ════════════════════════════════════════════════════════════ */
  const SESSION = {
    KEY: "aaa_session_v2",
    fresh() {
      return { startTime:Date.now(), messageCount:0, ctaShownCount:0, currentTopic:null };
    },
    get() {
      try { return JSON.parse(sessionStorage.getItem(this.KEY)) || this.fresh(); }
      catch(_) { return this.fresh(); }
    },
    save(s) { try { sessionStorage.setItem(this.KEY, JSON.stringify(s)); } catch(_) {} },
    bumpMessage() { const s=this.get(); s.messageCount++; this.save(s); },
    trackCta() { const s=this.get(); s.ctaShownCount++; this.save(s); return s.ctaShownCount; },
    ctaCount() { return this.get().ctaShownCount; },
    setTopic(intent) { const s=this.get(); s.currentTopic=intent; this.save(s); }
  };

  /* ════════════════════════════════════════════════════════════
     §8d  RESPONSE HISTORY — anti-repetition
  ════════════════════════════════════════════════════════════ */
  const RESPONSE_HISTORY = {
    hashes: [], MAX: 8,
    fingerprint(text) { return text.slice(0,70).replace(/\s+/g,"").toLowerCase(); },
    isDuplicate(text) { return this.hashes.includes(this.fingerprint(text)); },
    register(text) {
      const fp = this.fingerprint(text);
      if (!this.hashes.includes(fp)) {
        this.hashes.push(fp);
        if (this.hashes.length > this.MAX) this.hashes.shift();
      }
    }
  };

  /* ════════════════════════════════════════════════════════════
     §8e  CONV_STATE — Conversation Heat / Mood / Stage Machine
         Tracks: heat (0–10), mood, stage, topic thread, drift
  ════════════════════════════════════════════════════════════ */
  const CONV_STATE = {
    heat: 0,          // 0=cold, 10=hot (engagement level)
    mood: "neutral",  // neutral | curious | frustrated | excited | skeptical | ready
    stage: "intro",   // intro | exploring | evaluating | deciding | done
    topicThread: [],  // ordered list of discussed topics
    lastTopicTime: Date.now(),
    driftDetected: false,
    consecutiveFallbacks: 0,
    messageVelocity: 0, // how fast user is sending messages
    lastMessageTime: Date.now(),

    bump(intent, energy, decomposition) {
      const now = Date.now();
      const timeSinceLast = (now - this.lastMessageTime) / 1000; // seconds
      this.lastMessageTime = now;

      // Message velocity — fast replies = high engagement
      this.messageVelocity = timeSinceLast < 15 ? 3 : timeSinceLast < 60 ? 1 : 0;

      // Heat calculation
      if (energy === "high_energy" || energy === "frustrated") this.heat = Math.min(10, this.heat + 2);
      else if (energy === "terse") this.heat = Math.max(0, this.heat - 0.5);
      else this.heat = Math.min(10, this.heat + 1);

      if (this.messageVelocity === 3) this.heat = Math.min(10, this.heat + 1);

      // Mood state machine
      if (decomposition) {
        const emo = decomposition.emotion;
        if (emo === "frustrated") this.mood = "frustrated";
        else if (emo === "excited") this.mood = "excited";
        else if (emo === "worried") this.mood = "skeptical";
        else if (emo === "thinking") this.mood = "curious";
        else if (decomposition.signals.includes("purchase_intent")) this.mood = "ready";
        else if (decomposition.signals.includes("proof_needed")) this.mood = "skeptical";
        else if (decomposition.signals.includes("price_hesitation")) this.mood = "skeptical";
        else if (MEM.slots.trustLevel > 6) this.mood = "curious";
      }

      // Stage progression
      const tc = MEM.turnCount;
      if (tc === 0) this.stage = "intro";
      else if (tc < 3) this.stage = "exploring";
      else if (tc < 6) this.stage = "evaluating";
      else if (this.mood === "ready" || MEM.slots.urgency === "now") this.stage = "deciding";
      else this.stage = "evaluating";

      // Topic thread tracking + drift detection
      if (intent && !["greeting","thanks"].includes(intent)) {
        if (this.topicThread.length > 0) {
          const last = this.topicThread[this.topicThread.length - 1];
          // Drift = sudden unrelated topic switch after 2+ turns on same topic
          const sameFamily = this._sameFamily(last, intent);
          this.driftDetected = !sameFamily && this.topicThread.filter(t => t === last).length >= 2;
        }
        this.topicThread.push(intent);
        if (this.topicThread.length > 8) this.topicThread.shift();
      }

      // Fallback tracking
      if (!intent) this.consecutiveFallbacks++;
      else this.consecutiveFallbacks = 0;
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
      for (const f of families) {
        if (f.includes(a) && f.includes(b)) return true;
      }
      return a === b;
    },

    getToneMode() {
      // Returns tone mode that response generators should use
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
      // Returns target response density
      if (this.mood === "frustrated") return "concise"; // don't overwhelm
      if (this.stage === "intro") return "concise";
      if (this.stage === "evaluating") return "full";
      if (this.stage === "deciding") return "focused";
      if (MEM.slots.questionDepth > 5) return "full";
      return "normal";
    }
  };

  /* ════════════════════════════════════════════════════════════
     §8f  TONE ADAPTATION ENGINE
         Reshapes response text based on CONV_STATE.getToneMode()
  ════════════════════════════════════════════════════════════ */

  // Opener pools — replaces robotic uniform openers
  const OPENER_POOLS = {
    empathetic_calm: [
      "Totally get where you're coming from. ",
      "That's a real pain point — let me address it directly. ",
      "Heard. Here's the honest answer: ",
      "I understand the frustration. Here's what actually matters: ",
    ],
    match_energy: [
      "Yes! Here's exactly what you need: ",
      "Love the question — ",
      "Right, let's go: ",
      "Perfect timing to ask — ",
    ],
    prove_it: [
      "Fair skepticism. Here's the actual evidence: ",
      "Let me show you instead of just telling you: ",
      "Real data, not promises: ",
      "Valid concern — here's the honest answer: ",
    ],
    action_focused: [
      "Great — here's what to do: ",
      "Perfect. Next step: ",
      "Let's make this happen: ",
      "Here's exactly how to proceed: ",
    ],
    detail_rich: [
      "Good question — full breakdown: ",
      "Here's the complete picture: ",
      "Full detail: ",
      "Let me be thorough: ",
    ],
    close_focused: [
      "At this point, here's what matters most: ",
      "The key thing to know: ",
      "Bottom line: ",
      "To wrap this up clearly: ",
    ],
    warm_intro: [
      "Happy to explain — ",
      "Good question — ",
      "Here's the answer: ",
      "",
    ],
    conversational: [
      "So — ",
      "Here's the thing: ",
      "Straight answer: ",
      "",
      "",
    ],
  };

  function getToneOpener(toneMode) {
    const pool = OPENER_POOLS[toneMode] || OPENER_POOLS.conversational;
    return pick(pool);
  }

  // Verbosity adapter — trim or expand based on getVerbosity()
  function applyVerbosity(text, verbosity) {
    if (!text) return text;
    const paras = text.split("\n\n");

    if (verbosity === "concise" && paras.length > 3) {
      // Keep first 3 paras — add short follow-up invite
      return paras.slice(0, 3).join("\n\n") + "\n\n(Want the full detail? Just ask.)";
    }
    if (verbosity === "focused" && paras.length > 5) {
      return paras.slice(0, 4).join("\n\n");
    }
    return text;
  }

  // Sentence structure variation — prevents uniform reply shapes
  const TRANSITION_VARIANTS = [
    "\n\n",
    "\n\nAlso — ",
    "\n\nWorth adding: ",
    "\n\nOne more thing: ",
    "\n\nAnd importantly: ",
  ];

  function varyStructure(text) {
    // 25% chance to vary double-newline transitions to feel less template-like
    if (Math.random() > 0.75) {
      const variant = pick(TRANSITION_VARIANTS.slice(1));
      return text.replace(/\n\n(?=[A-Z•⚡✅❌📌🔄🏆📊])/,  variant);
    }
    return text;
  }

  /* ════════════════════════════════════════════════════════════
     §8g  GRAMMAR-DRIVEN RESPONSE SHAPING
         Uses classifyInput() results to actually change response behavior
  ════════════════════════════════════════════════════════════ */

  function applyGrammarShaping(text, grammar, intent) {
    if (!grammar) return text;

    // BUT-CLAUSE: User said "X sounds good but [concern]"
    // → Acknowledge positive THEN address concern directly
    if (grammar.isMixed && grammar.butClause) {
      const concern = grammar.butClause.concern;
      const concernResponse = resolveConcernText(concern);
      if (concernResponse) {
        return text + "\n\n💡 On your concern about \"" + concern.slice(0, 60) + (concern.length > 60 ? "…" : "") + "\":\n" + concernResponse;
      }
    }

    // UNCERTAINTY: "kinda interested", "might consider", "not sure"
    // → Add reassurance + low-commitment CTA
    if (grammar.hasUncertainty && !text.includes("zero pressure") && !text.includes("no commitment")) {
      text += "\n\n🔓 Zero pressure — you can start free, see it working, then decide. No commitment needed.";
    }

    // NEGATION SCOPE: User said "not getting results", "don't want fake replies"
    // → Flip framing to address the negative directly
    if (grammar.isNegative && intent && !intent.startsWith("objection_")) {
      const negationAddons = {
        safety: "\n\n✅ To be clear: this is NOT spam, NOT bulk messaging, NOT risky. Official Meta-compliant only.",
        results: "\n\n📊 If results aren't happening — the guarantee kicks in: full system rebuild at no charge.",
        human_feel: "\n\n🗣️ Not robotic. Not template-pasting. Responses adapt to what each lead actually says.",
        process: "\n\nAnd no — you don't need to manage this daily. Once live, it runs fully on its own.",
      };
      const addon = negationAddons[intent];
      if (addon && !text.includes(addon.trim().slice(0, 20))) {
        text += addon;
      }
    }

    // SHORT INPUT (1-3 words): Give direct, scannable answer
    if (grammar.isShort && text.split("\n").length > 8) {
      const lines = text.split("\n").filter(l => l.trim());
      text = lines.slice(0, 5).join("\n");
    }

    return text;
  }

  // Maps concern phrases to short rebuttal text
  function resolveConcernText(concern) {
    const concern_l = concern.toLowerCase();
    if (/fake|robotic|bot|natural/i.test(concern_l))
      return "The system adapts to each person's replies. Leads consistently engage without suspecting automation.";
    if (/expensive|costly|price|mehenga|afford/i.test(concern_l))
      return "Start with the Free Plan — ₹0, no card. See results first. Upgrade only when it pays for itself.";
    if (/safe|ban|scam|risk/i.test(concern_l))
      return "Uses official ManyChat (Meta partner). No password sharing. Zero ban risk. 1M+ businesses use it.";
    if (/time|manage|maintain/i.test(concern_l))
      return "After setup: zero daily management. It runs 24/7 on its own. Your only job = respond to pre-qualified leads.";
    if (/work|result|proof|really/i.test(concern_l))
      return "14-day guarantee — if traffic exists and zero leads come in, full rebuild at no charge.";
    if (/sure|confident|decide|commit/i.test(concern_l))
      return "No commitment needed. Free 10-min demo first — see it live, then decide with zero pressure.";
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     §8h  INTENT DRIFT HANDLER
         When user suddenly changes topic — acknowledge + bridge
  ════════════════════════════════════════════════════════════ */
  function applyDriftBridge(text, driftDetected, previousTopic, newIntent) {
    if (!driftDetected || !previousTopic || !newIntent) return text;
    if (previousTopic === newIntent) return text;

    const prevLabel = previousTopic.replace(/_/g, " ");
    const bridges = [
      `Switching gears from ${prevLabel} — `,
      `On this new question — `,
      `Good point to bring up — `,
    ];
    return pick(bridges) + text;
  }

  /* ════════════════════════════════════════════════════════════
     §8i  SOCIAL PROOF INJECTION ENGINE
         Context-sensitive proof injection — not just at evaluating stage
  ════════════════════════════════════════════════════════════ */
  const SOCIAL_PROOF_LINES = [
    "📊 One coach went from ~5 to 15+ booked calls/week in 14 days.",
    "🏆 40–60% reduction in DM time reported by coaches using this.",
    "📈 15+ hours/week saved on average after the first month.",
    "💬 Real coaches say leads genuinely can't tell it's automated.",
    "🎯 3x increase in booked calls without increasing content frequency.",
  ];

  let _proofIdx = 0;
  function getNextProofLine() {
    const line = SOCIAL_PROOF_LINES[_proofIdx % SOCIAL_PROOF_LINES.length];
    _proofIdx++;
    return line;
  }

  function injectSocialProof(text, intent, stage, hints) {
    // Don't inject if already has proof markers
    if (text.includes("🏆") || text.includes("📊") || text.includes("proof_line")) return text;

    // Inject at right moments
    const shouldInject = (
      (stage === "evaluating" && ["pricing","results","services","compare_plans"].includes(intent)) ||
      (hints.includes("automation_doubt") || hints.includes("has_trust_concern")) ||
      (MEM.slots.questionDepth >= 3 && ["safety","human_feel"].includes(intent))
    );

    if (shouldInject && Math.random() > 0.4) {
      return text + "\n\n" + getNextProofLine();
    }
    return text;
  }

  /* ════════════════════════════════════════════════════════════
     §8j  SMART URGENCY / SCARCITY LAYER
         Context-aware — only when trust is established + stage is right
  ════════════════════════════════════════════════════════════ */
  function injectUrgency(text, hints, stage, mood) {
    // Never inject urgency when: frustrated, early stage, price_sensitive already shown
    if (mood === "frustrated") return text;
    if (stage === "intro" || stage === "exploring") return text;
    if (hints.includes("user_price_sensitive") && SESSION.ctaCount() >= 1) return text;
    if (MEM.slots.trustLevel < 3) return text;

    const urgencyLines = D().urgency || [
      "Free Plan pricing may change soon.",
      "We take limited setup slots each week.",
      "Best time to set this up is before your next content push.",
    ];

    if (stage === "deciding" || hints.includes("user_ready_now")) {
      if (Math.random() > 0.5) {
        return text + "\n⚡ " + pick(urgencyLines);
      }
    }
    return text;
  }

  /* ════════════════════════════════════════════════════════════
     §9  PLAN UTILITIES
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

  const PLAN_TRANSFORMATIONS = {
    free:     "Before: manually answering the same DM questions all day.\nAfter: bot handles all common queries 24/7 — you only respond to genuine interest.",
    starter:  "Before: can't tell serious leads from time-wasters, spending hours replying.\nAfter: every lead tagged and prioritised — your time goes only to high-intent people.",
    growth:   "Before: leads going cold after the first message, no follow-up system.\nAfter: multi-step follow-up keeps them warm until they're ready to book.",
    whatsapp: "Before: answering the same WhatsApp questions manually, all day long.\nAfter: system qualifies and routes automatically — you see only ready buyers.",
    combo:    "Before: juggling both Instagram and WhatsApp manually, leads slipping through.\nAfter: one connected system handles both end to end — from first message to booked call.",
  };

  /* ════════════════════════════════════════════════════════════
     §10  LAYER 9 — HUMAN-LIKE RESPONSE GENERATION SYSTEMS
  ════════════════════════════════════════════════════════════ */
  function R(text, link, cta) { return { text: text || "", link: link || null, cta: cta || null }; }

  /* ── §10a  EMOTIONAL ENERGY DETECTION ────────────────────── */
  function detectUserEnergy(rawInput) {
    const excl  = (rawInput.match(/!/g) || []).length;
    const caps  = (rawInput.match(/[A-Z]/g) || []).length / Math.max(rawInput.length, 1);
    const words = rawInput.split(/\s+/).length;
    const q     = (rawInput.match(/\?/g) || []).length;
    const frustrated = /user_frustrated|thak|tired|exhaust|bore|ugh|argh/i.test(rawInput);
    const excited = /user_excited|amazing|love|wow|great|nice|zabardast|mast/i.test(rawInput);

    if (frustrated) return "frustrated";
    if (excited || excl >= 2 || caps > 0.4) return "high_energy";
    if (words <= 3 && q === 0) return "terse";
    if (words >= 20) return "detailed";
    return "normal";
  }

  function mirrorEnergy(text, energy) {
    if (energy === "terse") {
      const lines = text.split("\n").filter(l => l.trim());
      return lines.slice(0, Math.min(6, lines.length)).join("\n");
    }
    if (energy === "high_energy" && !text.includes("!")) {
      return text.replace(/\.$/, "!");
    }
    if (energy === "frustrated") {
      // Don't add exclamation — keep calm and empathetic
      return text;
    }
    return text;
  }

  /* ── §10b  EMPATHY INJECTION ENGINE ──────────────────────── */
  const EMPATHY_LINES = {
    time_pain: [
      "That's a real time drain — and it compounds every single day. ",
      "Spending your entire day replying is one of the biggest blockers for coaches. ",
      "Replying manually 24/7 isn't a sustainable business model. ",
    ],
    lead_frustration: [
      "Leads coming in but not converting is actually the most fixable problem. ",
      "When leads aren't serious, the issue is usually pre-qualification — not the coach. ",
      "Getting unqualified leads is a system problem, not a you problem. ",
    ],
    price_concern: [
      "Totally understand — let me show you the real cost-to-return picture. ",
      "Fair question on the price — here's the actual calculation that matters. ",
      "Makes sense to think about the investment carefully. ",
    ],
    authenticity_concern: [
      "This is honestly the most common concern — and it's a completely valid one. ",
      "The fear of sounding robotic is real, and it's exactly what the system is designed around. ",
      "Natural vs robotic is the core thing we obsess over in the builds. ",
    ],
    trust_concern: [
      "Completely fair to want to verify this before trusting it. ",
      "The skepticism makes sense — this is your business. ",
      "Let me address that directly and honestly. ",
    ],
    automation_doubt: [
      "I get the skepticism — let me show you instead of just telling you. ",
      "Fair to want proof, not promises. Here's what the data actually looks like. ",
      "The best answer to 'does it work' is seeing it work. ",
    ],
    exploration: [
      "No pressure at all — let me help you think it through. ",
      "Taking time to decide properly is the right move. ",
    ],
    purchase_intent: [
      "Great — let's get this moving. ",
      "Perfect — setup is faster than you might think. ",
    ],
    excited: [
      "Love the energy! ",
      "That enthusiasm is exactly right — ",
    ],
    frustrated: [
      "I hear you — that situation is genuinely exhausting. ",
      "That's a frustrating place to be stuck. Let's fix it. ",
    ],
  };

  function getEmpathyLine(empathyKeys) {
    if (!empathyKeys || !empathyKeys.length) return "";
    // Use the most specific / recent empathy key
    for (const key of empathyKeys.reverse()) {
      const lines = EMPATHY_LINES[key];
      if (lines && lines.length) return pick(lines);
    }
    return "";
  }

  /* ── §10c  SMART SALES LAYER ──────────────────────────────── */
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
    if (hints.includes("has_workload_pain"))
      return "Want to see exactly how much time this would free up for you specifically?";
    if (hints.includes("has_lead_quality_pain"))
      return "Want me to show you how the qualification system filters out time-wasters?";
    if (hints.includes("has_bot_fear"))
      return "The best way to address this is to experience the demo yourself — it takes 10 min.";
    if (hints.includes("user_frustrated"))
      return "Let's actually solve this — what does your current setup look like?";
    return nextCta();
  }

  function salesLayer(text, options = {}) {
    const { skipCta = false, addUrgency = false } = options;
    let out = text;
    const hints = MEM.getContextHints();
    const ctaCount = SESSION.ctaCount();

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

  /* ── §10d  ACKNOWLEDGMENT PREFIXES ───────────────────────── */
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
    if (Math.random() > 0.8) return "";
    return pick(opts) + " ";
  }

  /* ── §10e  FOLLOW-UP QUESTIONS ────────────────────────────── */
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
    human_feel: ["Have you seen any AI-automated DM before? I can share what the actual conversation looks like."],
    objection_expensive: ["What's your current monthly spend on lead generation — even if just in time?"],
  };

  function getFollowUp(intent, conversionStage) {
    if (conversionStage === "ready") return null;
    const opts = FOLLOW_UPS[intent];
    if (!opts) return null;
    if (Math.random() > 0.7) return null;
    return pick(opts);
  }

  /* ── §10f  SMART DELAY ────────────────────────────────────── */
  function smartDelay(responseText) {
    const words    = (responseText || "").split(/\s+/).length;
    const base     = 420;
    const perWord  = 16;
    const jitter   = Math.random() * 280;
    const thinkPause = (words > 55 && Math.random() > 0.55) ? 550 : 0;
    return Math.min(base + (words * perWord) + jitter + thinkPause, 3600);
  }

  /* ── §10g  INTELLIGENT RESPONSE SPLITTER ─────────────────── */
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

  /* ── §10h  HESITATION / SELF-CORRECTION ILLUSION ─────────── */
  function shouldHesitate() { return Math.random() < 0.08 && MEM.turnCount > 2; }
  const HESITATION_LINES = [
    "Actually, let me be more specific —",
    "Wait — better way to put it:",
    "Let me clarify that:",
    "More accurate answer:",
  ];
  function getHesitationLine() { return pick(HESITATION_LINES); }

  /* ── §10i  PAIN-AWARE RESPONSE PREFIX ENGINE ─────────────── */
  function getPainAwarePrefix(hints, decomposition) {
    // If we detect pain points, open with empathy before the answer
    if (!decomposition) return "";
    const empathyLine = getEmpathyLine(decomposition.empathy_keys || []);
    return empathyLine;
  }

  /* ════════════════════════════════════════════════════════════
     §11  DYNAMIC RESPONSE BUILDERS
  ════════════════════════════════════════════════════════════ */

  // ── §11.1  GREETING ──────────────────────────────────────────
  const GREET_OPENERS_NEW = ["Hey! 👋","Hi there! 👋","Hello! 🙌"];
  const GREET_OPENERS_RETURNING = ["Welcome back! 👋","Good to see you again! 👋","Hey, welcome back! 👋"];

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
    let proofLine = "";
    if (stage === "evaluating") {
      const cs = D().case_studies || [];
      if (cs.length) proofLine = `\n\n📊 Real result: ${cs[0].proof_line}`;
    }

    return R(
      intro + "\n\n" + rows + proofLine + "\n\n📌 All paid plans also need a ManyChat subscription.\n\n" + close,
      "https://ayushaiautomation.in/pricing.html", "View Full Pricing"
    );
  }

  // ── §11.3  PLAN DETAIL ───────────────────────────────────────
  function buildPlanDetail(planKey) {
    const plan = getPlan(planKey);
    if (!plan) return buildPricingOverview();
    const stage = MEM.getDepthStage();
    const tf = PLAN_TRANSFORMATIONS[planKey] || "";
    const featList = (plan.features || []).map(f => "✅ " + f).join("\n");
    const limitList = (plan.limitations || []).length
      ? "\n\n❌ Not included:\n" + plan.limitations.map(l => "• " + l).join("\n")
      : "";
    const popular = plan.popular ? "⭐ Most popular plan\n\n" : "";

    let proofLine = "";
    if (stage === "evaluating") {
      const cs = D().case_studies || [];
      if (cs.length) proofLine = `\n\n📊 ${cs[0].proof_line}`;
    }

    return R(
      popular + plan.name + "\n\n" +
      "💰 " + plan.price + "  ·  Setup: " + plan.price_alt + "\n\n" +
      "Best for: " + plan.best_for + "\n\n" +
      featList + limitList +
      (plan.note ? "\n\n📌 " + plan.note : "") +
      (tf ? "\n\n🔄 " + tf : "") +
      proofLine,
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

  /* ── §11.22  LAYER 8 — SMART FALLBACK ENGINE ─────────────── */
  function buildSmartFallback(normInput, clusterScores) {
    // Step 1: Try to salvage from cluster scores
    if (clusterScores && Object.keys(clusterScores).length > 0) {
      const topCluster = Object.entries(clusterScores).sort((a,b) => b[1]-a[1])[0];
      const [clusterName] = topCluster;
      const intentBoost = SEMANTIC_CLUSTERS[clusterName]?.intent_boost;

      if (intentBoost) {
        const salvageResp = route(intentBoost, null, { plan:null, hasPriceSignal:false, sentiment:"neutral", isQuestion:true });
      if (salvageResp) {
          salvageResp.text = "Let me help with what I think you're asking about:\n\n" + salvageResp.text;
          return salvageResp;
        }
      }
    }

    // Step 2: Check for partial language recognition (non-English)
    const hasUnknownChars = /[\u0900-\u097f\u0600-\u06ff\u0c00-\u0c7f\u0b80-\u0bff]/i.test(normInput);
    if (hasUnknownChars) {
      return R(
        "I can understand English, Hindi (Roman script), and Hinglish best. 👋\n\n" +
        "Please try typing in English or Roman Hindi — like:\n" +
        "\"Price kya hai\" or \"How does it work\" or \"Kaunsa plan best hai\"\n\n" +
        "Happy to help once I can understand properly!"
      );
    }

    // Step 3: Context-aware clarification
    const contextHints = MEM.getContextHints();
    if (MEM.turnCount > 0) {
      // We know something about the user — use it
      const lastIntent = MEM.lastIntent;
      const contextualQ = lastIntent ?
        `You were asking about ${lastIntent.replace(/_/g," ")} — did you want more detail on that, or something else?` :
        "Could you give me a bit more detail about what you're looking for?";

      return R(
        `Hmm, I'm not quite sure what you meant there 😅\n\n${contextualQ}\n\n` +
        "Or you can ask directly about:\n" +
        "💰 Pricing  ·  ⚙️ How it works  ·  🛡️ Safety  ·  🎥 Demo  ·  🚀 Getting started"
      );
    }

    // Step 4: First-turn fallback (gentle + helpful)
    const FALLBACK_VARIANTS = [
      "I want to make sure I give you the right answer — could you rephrase that slightly?\n\nI can help with:\n💰 Pricing & Plans  ·  ⚙️ How it works\n📊 Features  ·  🛡️ Safety\n🚀 Getting started  ·  🎥 Live Demo",
      "Not quite sure I caught that — want to try phrasing it differently?\n\nSome things I can help with:\n💰 Pricing  ·  ⚙️ How it works  ·  🛡️ Safety\n🎥 Demo  ·  🚀 Getting started",
      "Hmm, let me make sure I help you properly — could you be a bit more specific?\n\nI can cover: pricing, plans, safety, features, demo, setup, or getting started.",
    ];
    return R(pick(FALLBACK_VARIANTS), null, null);
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
     §13  INTENT ROUTER — with acknowledgment + empathy injection
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
    }
    if (!resp) return null;

    // Inject acknowledgment prefix
    const ack = getAck(intentId);
    if (ack) resp.text = ack + resp.text;

    return resp;
  }

  /* ════════════════════════════════════════════════════════════
     §14  MULTI-SENTENCE PROCESSING
  ════════════════════════════════════════════════════════════ */
  const MULTI_TRANSITIONS = [
    "\n\n— Also —\n\n",
    "\n\nAnd on your other point —\n\n",
    "\n\nTo also address your second question —\n\n",
    "\n\nAlso worth covering —\n\n",
  ];

  function processMultiSentence(sentences, plan, entities) {
    const seen = new Set();
    const parts = [];
    for (const sent of sentences) {
      const norm  = normalizeText(sent);
      if (!norm || norm.length < 4) continue;
      const phraseBoosts = matchPhrasePatterns(norm, sent).intent_boosts;
      const clusterScores = getSemanticScores(norm);
      const clusterBoosts = getClusterBoosts(clusterScores);
      const scored = scoreIntents(norm, phraseBoosts, clusterBoosts);
      const topId  = scored[0]?.id;
      if (!topId || seen.has(topId) || topId === "greeting" || topId === "thanks") continue;
      seen.add(topId);
      const sentPlan = NER.extract(norm).plan || plan;
      const resp = route(topId, sentPlan, entities);
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
     §15  MULTI-INTENT BLEND
  ════════════════════════════════════════════════════════════ */
  const BLENDS = [
    { a:"pricing", b:"safety",
      text:"Two important questions — price and safety. Let me answer both:\n\n" },
    { a:"pricing", b:"results",
      text:"Good combination — cost and results. Here's both:\n\n" },
    { a:"safety", b:"results",
      text:"Safety + proof — both addressed:\n\n" },
    { a:"process", b:"pricing",
      text:"How it works AND what it costs — smart to ask together:\n\n" },
    { a:"human_feel", b:"results",
      text:"You're asking if it feels real AND if it works. Both matter:\n\n" },
    { a:"objection_expensive", b:"results",
      text:"The price vs results question — here's the honest answer:\n\n" },
    { a:"services", b:"pricing",
      text:"What you get AND what it costs — here's the full picture:\n\n" },
  ];

  function tryBlend(topIntents, plan) {
    if (topIntents.length < 2) return null;
    const a = topIntents[0].id, b = topIntents[1].id;
    const blend = BLENDS.find(bl => (bl.a===a && bl.b===b) || (bl.a===b && bl.b===a));
    if (!blend) return null;
    const r1 = route(a, plan, {}), r2 = route(b, plan, {});
    if (!r1 || !r2) return null;
    return R(
      blend.text + r1.text + "\n\n— Also —\n\n" + r2.text,
      (D().contact && D().contact.booking) || "https://ayushaiautomation.in/book.html",
      "Book Free Call"
    );
  }

  /* ════════════════════════════════════════════════════════════
     §16  LAYER 5 — CONTEXTUAL REASONING RESOLVER
  ════════════════════════════════════════════════════════════ */
  function resolveWithContext(topIntents, entities, normInput) {
    const topId   = topIntents[0]?.id;
    const nerPlan = entities.plan;

    // Contextual carryover — use previous plan when asking follow-up
    if ((topId === "pricing" || entities.hasPriceSignal) && MEM.lastPlan && !nerPlan)
      return { intent:"pricing", plan:MEM.lastPlan };

    if ((topId === "services" || topId === "process") && MEM.lastPlan && !nerPlan &&
        /feature|include|what|tell me more|detail/i.test(normInput))
      return { intent:"plan_"+MEM.lastPlan, plan:MEM.lastPlan };

    // If user is clearly continuing from previous topic
    if (!topId && MEM.lastIntent)
      return { intent:MEM.lastIntent, plan:MEM.resolvePlan(nerPlan) };

    // v9: Resolve from desire history if still no clear intent
    const topDesire = MEM.getTopDesire();
    if (!topId && topDesire) {
      const desireToIntent = {
        wants_to_buy: "contact",
        wants_proof: "results",
        wants_demo: "demo",
        wants_better_leads: "services",
        wants_time_back: "services",
        wants_affordable_option: "objection_expensive",
        wants_reassurance: "safety",
        wants_natural_bot: "human_feel",
      };
      const desireIntent = desireToIntent[topDesire];
      if (desireIntent) return { intent:desireIntent, plan:MEM.resolvePlan(nerPlan) };
    }

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
     §18  DEPTH-ADAPTIVE RESPONSE
  ════════════════════════════════════════════════════════════ */
  function adaptResponseDepth(text, intent, profile) {
    const stage = MEM.getDepthStage();

    if (stage === "evaluating" && intent === "pricing") {
      const cs = D().case_studies || [];
      const extra = cs.length ? `\n\n📊 ${cs[0].proof_line}` : "";
      return text + extra + "\n\n🎯 At this point — 10 minutes on a call would answer everything specific to your setup.";
    }

    if (stage === "surface") {
      const paras = text.split("\n\n");
      if (paras.length > 4) {
        return paras.slice(0, 3).join("\n\n") + "\n\n(Ask me anything for more detail)";
      }
    }

    return text;
  }

  /* ════════════════════════════════════════════════════════════
     §19  LAYER 10 — MEMORY-AWARE RESPONSE PERSONALIZATION
  ════════════════════════════════════════════════════════════ */
  function personalizeResponse(text, profile, decomposition) {
    let out = text;

    // Soften paid plan references for price-sensitive users
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

    // v9: Inject pain-aware opening if decomposition detected pain
    if (decomposition && decomposition.empathy_keys && decomposition.empathy_keys.length > 0) {
      const empathy = getPainAwarePrefix(MEM.getContextHints(), decomposition);
      if (empathy && !out.startsWith(empathy)) {
        out = empathy + out;
      }
    }

    // v9: Reference previously mentioned pain when relevant
    if (MEM.hasPainPoint("manual_workload_pain") && out.includes("automation") && MEM.turnCount > 2) {
      if (!out.includes("time") && Math.random() > 0.6) {
        out = out + "\n\n(This directly addresses the time you're spending on manual replies.)";
      }
    }

    return out;
  }

  /* ════════════════════════════════════════════════════════════
     §20  PROACTIVE RE-ENGAGEMENT
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
    if (semProfile.trust_concern || hints.includes("has_trust_concern")) {
      return "The fastest way to clear any doubt is just to see the demo. Takes 10 minutes, zero pressure. Want the link?";
    }
    if (hints.includes("has_bot_fear")) {
      return "Still unsure about the authenticity? That's fair — the demo shows you exactly what your leads would experience. Want to try it?";
    }
    if (hints.includes("has_workload_pain")) {
      return "You mentioned the manual reply workload — that's something we can fix in 48 hours. Want to see how?";
    }
    if (profile.conversionStage === "considering") {
      return "Still here? 😊 Happy to answer any specific questions before you decide — what's the main thing holding you back?";
    }
    return "Still exploring? Happy to dig into anything specific — pricing, safety, how the system actually works, or setting it up for your page.";
  }

  /* ════════════════════════════════════════════════════════════
     §21  FAQ CHIP REGISTRY
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
     §22  NAME EXTRACTION
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
     §23  MAIN ENTRY  getResponse(rawInput)
         — Full 10-Layer Intelligence Pipeline
  ════════════════════════════════════════════════════════════ */
  function getResponse(rawInput) {
    if (!rawInput || !rawInput.trim())
      return R("Didn't catch that — type your question and I'll help! 😊");

    // ── LAYER 1: Advanced Normalization ──────────────────────
    const normInput = normalizeText(rawInput);
    const entities  = NER.extract(normInput);

    // Load / update user profile
    const profile = USER_PROFILE.load();
    const extractedName = extractName(rawInput);
    if (extractedName && !profile.name) {
      profile.name = extractedName;
      USER_PROFILE.save(profile);
    }
    USER_PROFILE.update(profile, null, entities, normInput);

    // ── LAYER 6: Grammar Intelligence ────────────────────────
    const grammar = classifyInput(normInput, rawInput);

    // ── LAYER 7: Hinglish Deep Signals ───────────────────────
    const hindiSignals = extractHindiSignals(normInput);

    // ── LAYER 4: Sentence Decomposition ──────────────────────
    const decomposition = decomposeSentence(rawInput, normInput);
    // Merge Hindi signals into decomposition
    if (hindiSignals.length) decomposition.signals.push(...hindiSignals);

    // ── LAYER 3: Semantic Cluster Scoring ─────────────────────
    const clusterScores = getSemanticScores(normInput);
    const clusterBoosts = getClusterBoosts(clusterScores);

    // ── LAYER 2: Phrase Pattern Matching ─────────────────────
    const phraseMatches = matchPhrasePatterns(normInput, rawInput);
    const phraseBoosts  = phraseMatches.intent_boosts;

    // ── LAYER 9: Energy Detection ─────────────────────────────
    const energy = detectUserEnergy(rawInput);

    SESSION.bumpMessage();

    // ── CONV_STATE: Bump heat/mood/stage machine ──────────────
    CONV_STATE.bump(null, energy, decomposition);
    const toneMode   = CONV_STATE.getToneMode();
    const verbosity  = CONV_STATE.getVerbosity();
    // Early hints available before intent resolution (for Route 0)
    const earlyHints = MEM.getContextHints();

    // ── Route 0: HARDCODED FAST-PATH ─────────────────────────
    for (const fp of FAST_PATH) {
      if (fp.re.test(rawInput) || fp.re.test(normInput)) {
        const resp = fp.handler(entities);
        if (resp) {
          MEM.push("pricing", entities.plan, entities, normInput, decomposition);
          USER_PROFILE.update(profile, "pricing", entities, normInput);
          SESSION.setTopic("pricing");

          if (RESPONSE_HISTORY.isDuplicate(resp.text)) {
            const vars = ["To add more detail — ", "Let me break this down slightly differently — ", "Worth noting: "];
            resp.text = pick(vars) + resp.text;
          }
          RESPONSE_HISTORY.register(resp.text);
          resp.text = applyGrammarShaping(resp.text, grammar, "pricing");
          resp.text = applyVerbosity(resp.text, CONV_STATE.getVerbosity());
          resp.text = personalizeResponse(resp.text, profile, decomposition);
          resp.text = mirrorEnergy(resp.text, energy);
          resp.text = salesLayer(resp.text, { skipCta: false });
          return resp;
        }
      }
    }

    // ── Emergency price signal guarantee ─────────────────────
    if (entities.hasPriceSignal) {
      const resp = entities.plan ? buildPlanDetail(entities.plan) : buildPricingOverview();
      MEM.push("pricing", entities.plan, entities, normInput, decomposition);
      resp.text = personalizeResponse(resp.text, profile, decomposition);
      resp.text = mirrorEnergy(resp.text, energy);
      resp.text = salesLayer(resp.text);
      RESPONSE_HISTORY.register(resp.text);
      return resp;
    }

    // ── Score intents with ALL boosts applied ─────────────────
    const topIntents = scoreIntents(normInput, phraseBoosts, clusterBoosts);
    const { intent, plan } = resolveWithContext(topIntents, entities, normInput);

    MEM.push(intent, plan || entities.plan, entities, normInput, decomposition);
    USER_PROFILE.update(profile, intent, entities, normInput);
    SESSION.setTopic(intent);

    // Re-bump CONV_STATE now that intent is known
    CONV_STATE.bump(intent, energy, decomposition);
    const finalToneMode = CONV_STATE.getToneMode();
    const finalVerbosity = CONV_STATE.getVerbosity();
    const hints = MEM.getContextHints();

    const userType  = detectUserType(normInput);
    const objSignal = detectObjSignal(normInput);
    const engaged   = MEM.turnCount > 3;

    // ── Route A: Multi-sentence (compound questions) ──────────
    const sentences = splitSentences(normInput);
    if (sentences.length >= 2) {
      const multi = processMultiSentence(sentences, plan, entities);
      if (multi) {
        multi.text = applyVerbosity(multi.text, finalVerbosity);
        multi.text = injectSocialProof(multi.text, "services", CONV_STATE.stage, hints);
        multi.text = personalizeResponse(multi.text, profile, decomposition);
        multi.text = mirrorEnergy(multi.text, energy);
        multi.text = salesLayer(multi.text, { addUrgency: engaged });
        multi.text = injectUrgency(multi.text, hints, CONV_STATE.stage, CONV_STATE.mood);
        RESPONSE_HISTORY.register(multi.text);
        return multi;
      }
    }

    // ── Route B: Multi-intent blend ───────────────────────────
    if (topIntents.length >= 2 &&
        topIntents[0].score >= 1.8 &&
        topIntents[1].score >= 1.2 &&
        topIntents[0].id !== topIntents[1].id) {
      const blended = tryBlend(topIntents, plan);
      if (blended) {
        blended.text = applyGrammarShaping(blended.text, grammar, topIntents[0].id);
        blended.text = applyVerbosity(blended.text, finalVerbosity);
        blended.text = personalizeResponse(blended.text, profile, decomposition);
        blended.text = mirrorEnergy(blended.text, energy);
        blended.text = salesLayer(blended.text, { addUrgency: engaged });
        blended.text = injectUrgency(blended.text, hints, CONV_STATE.stage, CONV_STATE.mood);
        RESPONSE_HISTORY.register(blended.text);
        return blended;
      }
    }

    // ── Route C: Primary intent ───────────────────────────────
    if (intent) {
      const resp = route(intent, plan, entities);
      if (resp) {
        if (userType && !intent.startsWith("plan_") && intent !== "pricing" && intent !== "greeting" && intent !== "thanks") {
          resp.text += "\n\n" + buildSmartRecommendation(userType);
        }
        if (objSignal && !intent.startsWith("objection_")) {
          resp.text += "\n\n💬 " + objSignal.response;
        }

        // ── Depth-adaptive shaping ─────────────────────────
        resp.text = adaptResponseDepth(resp.text, intent, profile);

        // ── Grammar-driven shaping (negation/uncertainty/but) ─
        resp.text = applyGrammarShaping(resp.text, grammar, intent);

        // ── Social proof injection ─────────────────────────
        resp.text = injectSocialProof(resp.text, intent, CONV_STATE.stage, hints);

        // ── Verbosity adaptation ───────────────────────────
        resp.text = applyVerbosity(resp.text, finalVerbosity);

        // ── Tone opener (replaces/prepends robotic starters) ──
        const toneOpener = getToneOpener(finalToneMode);
        // Only prepend if no existing acknowledgment and not greeting/thanks
        if (toneOpener && !["greeting","thanks","pricing"].includes(intent) && Math.random() > 0.45) {
          // Don't double-up if ack already added
          if (!resp.text.match(/^(Sure —|Good question —|Totally|Fair|Honest|Valid|Let me|Here's exactly|Step by step|Absolutely|Yes,|Of course|Quick answer|Worth)/)) {
            resp.text = toneOpener + resp.text;
          }
        }

        // ── Sentence structure variation ───────────────────
        resp.text = varyStructure(resp.text);

        // ── Intent drift bridge ────────────────────────────
        const prevTopic = CONV_STATE.topicThread.length >= 2
          ? CONV_STATE.topicThread[CONV_STATE.topicThread.length - 2]
          : null;
        resp.text = applyDriftBridge(resp.text, CONV_STATE.driftDetected, prevTopic, intent);

        // ── Anti-repetition ────────────────────────────────
        if (RESPONSE_HISTORY.isDuplicate(resp.text)) {
          const vars = ["Let me come at this from a different angle — ", "Worth expanding on this: ", "To be more specific — "];
          resp.text = pick(vars) + resp.text;
        }
        RESPONSE_HISTORY.register(resp.text);

        // ── Personalize + energy mirror ────────────────────
        resp.text = personalizeResponse(resp.text, profile, decomposition);
        resp.text = mirrorEnergy(resp.text, energy);

        // ── Sales layer + smart urgency ────────────────────
        const skipCta = intent === "greeting" || intent === "thanks";
        resp.text = salesLayer(resp.text, { skipCta, addUrgency: engaged });
        resp.text = injectUrgency(resp.text, hints, CONV_STATE.stage, CONV_STATE.mood);

        const followUp = getFollowUp(intent, profile.conversionStage);
        if (followUp) resp.followUp = followUp;

        return resp;
      }
    }

    // ── Route D: FAQ match ────────────────────────────────────
    const faq = matchFaq(normInput);
    if (faq) {
      const resp = R(faq.answer);
      resp.text = applyGrammarShaping(resp.text, grammar, null);
      resp.text = salesLayer(resp.text);
      RESPONSE_HISTORY.register(resp.text);
      return resp;
    }

    // ── Route E: Partial salvage (cluster-based) ──────────────
    if (topIntents.length > 0) {
      const salvage = route(topIntents[0].id, plan, entities);
      if (salvage) {
        salvage.text = applyVerbosity(salvage.text, finalVerbosity);
        salvage.text = salesLayer(salvage.text);
        RESPONSE_HISTORY.register(salvage.text);
        return salvage;
      }
    }

    // ── Route F: Layer 8 — Smart Fallback ─────────────────────
    return buildSmartFallback(normInput, clusterScores);
  }

  /* ════════════════════════════════════════════════════════════
     §24  INIT
  ════════════════════════════════════════════════════════════ */
  function init() {
    buildIdf(INTENTS);
    const d = D();
    if (!d || !d.plans) {
      console.error("[CHATBOT] ⚠️ AGENCY_DATA missing or plans not loaded. Check script load order.");
    } else {
      console.log("[CHATBOT v9] ✅ Ready — AGENCY_DATA confirmed, IDF built, 10-layer intelligence online.");
      console.log("[CHATBOT v9] 🧠 Systems: L1 Normalization | L2 Phrase Engine | L3 Semantic Clusters (12) | L4 Decomposition | L5 Context | L6 Grammar | L7 Hinglish | L8 Smart Fallback | L9 Human-like Gen | L10 Memory Reasoning");
    }

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
     §25  PUBLIC API
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
  };

})(typeof window !== "undefined" ? window : global);
