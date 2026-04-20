/* ================================================================
   AYUSH AI AUTOMATION — CHATBOT BRAIN  v4.0
   Advanced NLP Engine — Pure client-side, zero external APIs.
   Pipeline: clean → normalise → lemmatize → NER →
             intent-score (IDF-weighted + fuzzy) →
             context-resolve → multi-blend → build
   Exports: window.CHATBOT  { init, process, getFaq, getTopFaqs }
   ================================================================ */

(function (global) {
  "use strict";

  /* ═══════════════════════════════════════════════════════════
     §0  DATA ACCESS
  ═══════════════════════════════════════════════════════════ */
  const D = global.AGENCY_DATA || {};

  /* ═══════════════════════════════════════════════════════════
     §1  LIGHTWEIGHT LEMMATIZER
         Maps inflected surface forms to their base lemma.
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
  };

  function lemmatize(token) {
    return LEMMA_MAP[token] || token;
  }

  /* ═══════════════════════════════════════════════════════════
     §2  HINGLISH + REGIONAL NORMALISER
         Pre-processing pass — replaces Hinglish/slang with
         standard English equivalents before NLP runs.
         Entries sorted longest-first to prevent partial clobbering.
  ═══════════════════════════════════════════════════════════ */
  const HINGLISH_RAW = [
    ["kya haal hai","how are you"],["kaise ho aap","how are you"],
    ["kaise ho","how are you"],["kya haal","how are you"],
    ["assalamualaikum","hello"],["namaskar","hello"],["namaste","hello"],
    ["vanakkam","hello"],["salam","hello"],["bhai","hey"],["yaar","hey"],
    ["kitna banta hai","how much total"],["kitna padega","how much cost"],
    ["kitna lagega bhai","how much cost"],["kitna lagega","how much cost"],
    ["kitne paise lagenge","how much cost"],["kitna paisa lagega","how much cost"],
    ["paise kitne","how much cost"],["charges kya hai","what are charges"],
    ["rate kya hai","what is price"],["monthly kitna","monthly price"],
    ["mahine ka kitna","monthly price"],["total kitna","total cost"],
    ["kitna hai","how much cost"],["kitna","how much"],
    ["paisa","price"],["paise","price"],["rupees","price"],["rupee","price"],
    ["lagega","cost"],["lagenge","cost"],["lagti","cost"],["lagta","cost"],
    ["mahina","monthly"],["mahine","monthly"],["mahine mein","monthly"],
    ["sasta wala","cheapest"],["sabse sasta","cheapest"],["sabse acha","best"],
    ["sasta","cheap"],["mehenga","expensive"],
    ["kitne ka hai","how much cost"],["kitne mein milega","how much cost"],
    ["starter mein kya milega","starter plan features"],
    ["growth mein kya milega","growth plan features"],
    ["free mein kya milega","free plan features"],
    ["starter plan mein kya","starter plan features"],
    ["kaunsa plan lena chahiye","which plan should i take"],
    ["konsa plan lu","which plan should i take"],
    ["kaunsa plan","which plan"],["konsa plan","which plan"],
    ["kaun sa","which"],["konsa","which"],
    ["free wala plan","free plan"],["paid wala","paid plan"],
    ["best wala","best plan"],["free wala","free plan"],
    ["kaise shuru karun","how to start"],["kaise shuru karu","how to start"],
    ["kaise shuru","how to start"],["kaise join karun","how to join"],
    ["shuru karna hai","want to start"],["shuru kar sakta hun","can start"],
    ["shuru","start"],["karna hai","want to"],
    ["lena chahta hun","want to buy"],["lena hai","want to buy"],
    ["aage badhna","proceed"],
    ["batao","explain"],["samjhao","explain"],["bolo","tell me"],
    ["dikhao","show me"],["dekh sakta hun","can see"],
    ["dekhna","see"],["dekh","see"],
    ["safe hai kya","is it safe"],["ban hoga kya","will account be banned"],
    ["account jaega kya","will account be banned"],
    ["scam toh nahi","is it legit"],["dhoka","fraud"],["dhokha","fraud"],
    ["bharosa","trust"],["sach mein","really"],["sach","real"],
    ["genuine hai kya","is it genuine"],
    ["service band karna hai","cancel service"],["band karna","cancel"],
    ["rokna","stop"],["cancel karna hai","want to cancel"],
    ["cancel karna","cancel"],["support chahiye","need support"],
    ["kaise kaam karta hai","how does it work"],
    ["kaise kaam karega","how will it work"],
    ["kaise kaam","how does work"],["kya karta hai","what does it do"],
    ["kya hota hai","what happens"],["kya hai ye","what is this"],
    ["kya hai","what is"],["kya hota","what is"],["kaise","how"],
    ["kab se shuru hoga","when will it start"],["kab live hoga","when go live"],
    ["kab hoga","when will it be"],["kab","when"],
    ["kitne din mein","how many days"],["kitne ghante","how many hours"],
    ["kitne din","how many days"],
    ["nahi chahiye","not interested"],["nahi aaya","did not come"],
    ["theek hai","ok"],["acha","ok"],["achha","ok"],["accha","ok"],
    ["samajh gaya","understood"],["samajh nahi aaya","did not understand"],
    ["pata nahi","dont know"],["soch raha hun","thinking"],
    ["doubt hai","have doubt"],["abhi nahi","not now"],
    ["ela pani chestundi","how does it work"],["entha avutundi","how much cost"],
    ["start ela cheyali","how to start"],["price cheppandi","tell price"],
    ["ela","how"],["enti","what"],["entha","how much"],["emi","what"],
    ["eppadi velai seiyum","how does it work"],["ethanai aagum","how much cost"],
    ["thodangu eppadi","how to start"],["vilai enna","what is price"],
    ["eppadi","how"],["ethanai","how much"],["enna","what"],["epdi","how"],
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
     §4  NAMED ENTITY RECOGNITION  (NER)
         Extracts plan, price, platform, action-type, sentiment
         from normalised input — informs routing logic.
  ═══════════════════════════════════════════════════════════ */
  const NER = {
    PLAN_PATTERNS: [
      { re: /\bfree\b|\b\u20b9\s*0\b|\bzero\b|\bbasic plan\b/i,        key: "free"      },
      { re: /\bstarter\b|\b999\b|\bentry\b|\bbeginner plan\b/i,         key: "starter"   },
      { re: /\bgrowth\b|\b1499\b|\badvanced plan\b|\bpremium plan\b/i,  key: "growth"    },
      { re: /\bwhatsapp\s*(plan|automation|system|bot|only)?\b|\bwa\s+plan\b|\b2499\b/i, key: "whatsapp" },
      { re: /\bcombo\b|\bboth\s+platform\b|\b2498\b|\bfull\s+funnel\b/i,key: "combo"     },
    ],
    POSITIVE_RE: /\bwant\b|\binterested\b|\bready\b|\bbuy\b|\bsign up\b|\bjoin\b|\bbook\b|\bproceed\b|\bconfirm\b|\byes\b|\blet.?s go\b/i,
    NEGATIVE_RE: /\bnot sure\b|\bnot interested\b|\bcancel\b|\bstop\b|\bquit\b|\bexpensive\b|\bafford\b|\bdoubt\b|\bscam\b|\bfraud\b|\bban\b/i,
    QUESTION_RE: /\bwhat\b|\bhow\b|\bwhen\b|\bwhy\b|\bwhere\b|\bwhich\b|\bdoes\b|\bcan\b|\bwill\b|\bis\b|\bare\b|\bdo\b/i,

    extract(normInput) {
      let plan = null;
      for (const { re, key } of this.PLAN_PATTERNS) {
        if (re.test(normInput)) { plan = key; break; }
      }
      const sentiment = this.NEGATIVE_RE.test(normInput) ? "negative"
                      : this.POSITIVE_RE.test(normInput) ? "positive"
                      : "neutral";
      const isQuestion = this.QUESTION_RE.test(normInput);
      return { plan, sentiment, isQuestion };
    }
  };

  /* ═══════════════════════════════════════════════════════════
     §5  INTENT CATALOGUE  (27 intents)
  ═══════════════════════════════════════════════════════════ */
  const INTENTS = [
    { id: "greeting",
      keywords: ["hello","hi","hey","good morning","good evening","good afternoon",
        "greetings","howdy","start","help me","anyone there","are you there",
        "hlo","hlw","welcome","yo","sup","wassup"],
      phrases: ["hi there","hey there","good to see you","i need help",
        "need help","talk to someone","is anyone here"],
      planHint: null },

    { id: "pricing",
      keywords: ["price","pricing","cost","charge","fee","rate","payment","pay",
        "budget","subscription","monthly","investment","spend","how much",
        "affordable","cheap","expensive","money","amount","total","rupee","inr","rs"],
      phrases: ["how much does it cost","what is the price","what are the charges",
        "monthly charge","total cost","how much will it cost","what is the fee",
        "kitna lagta hai","price kya hai"],
      planHint: null },

    { id: "plan_free",
      keywords: ["free","zero","no cost","without paying","free version","freemium",
        "basic plan","zero investment","try","test","no charge","no payment",
        "nothing to pay","bina paisa","free milega"],
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
        "most feature","ultimate"],
      phrases: ["growth plan features","growth mein kya milega","1499 wala plan",
        "best plan kaunsa hai","full automation plan","growth plan kya hai",
        "sabse acha plan kaunsa hai"],
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
        "together","dono platform"],
      phrases: ["combo plan features","both instagram and whatsapp","combined setup",
        "full system price","instagram plus whatsapp","dono platform ka plan"],
      planHint: "combo" },

    { id: "compare_plans",
      keywords: ["compare","comparison","difference","which plan","option","package",
        "tier","better","suggest","recommend","which one","which is best",
        "what to choose","right plan","sahi plan","plan comparison"],
      phrases: ["which plan is best for me","difference between plans",
        "free vs starter","starter vs growth","plans comparison",
        "plan suggest karo","best plan for me","kaunsa plan lena chahiye"],
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
        "cheaper","reduce price","too expensive","lower price","price high"],
      phrases: ["price bahut mehenga hai","cant afford this",
        "too expensive for me","can you reduce price","discount milega kya",
        "budget nahi hai","itna nahi de sakta","price kam karo"],
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
     §6  INTENT SCORER  (IDF-weighted, n-gram, fuzzy)
  ═══════════════════════════════════════════════════════════ */
  function scoreIntents(normInput) {
    const tokens  = TP.lemTokens(normInput);
    const grams   = TP.allGrams(tokens);
    const scored  = [];

    for (const intent of INTENTS) {
      let score = 0;

      for (const kw of intent.keywords) {
        const lemKw = kw.split(" ").map(lemmatize).join(" ");
        const idf   = TP.idfBoost[kw] || 1;
        if (grams.has(kw) || grams.has(lemKw)) {
          score += idf;
        } else if (!kw.includes(" ")) {
          for (const tok of tokens) {
            const sim = TP.fuzzyScore(tok, kw);
            if (sim >= 0.82) { score += 0.45 * idf * sim; break; }
          }
        }
      }

      for (const ph of intent.phrases) {
        const lemPh = ph.split(" ").map(lemmatize).join(" ");
        if (normInput.includes(ph) || normInput.includes(lemPh)) {
          score += 3 * (TP.idfBoost[ph] || 1.2);
        }
      }

      if (score > 0) scored.push({ id: intent.id, score, planHint: intent.planHint });
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  /* ═══════════════════════════════════════════════════════════
     §7  SHORT-TERM CONTEXT MEMORY  (4-turn rolling window)
  ═══════════════════════════════════════════════════════════ */
  const MEM = {
    history: [],
    MAX: 4,
    push(intent, plan, entities, input) {
      this.history.push({ intent, plan, entities, input });
      if (this.history.length > this.MAX) this.history.shift();
    },
    get last()      { return this.history[this.history.length - 1] || {}; },
    get lastPlan()  { return [...this.history].reverse().find(h => h.plan)?.plan || null; },
    get lastIntent(){ return this.last.intent || null; },
    resolvePlan(nerPlan) { return nerPlan || this.lastPlan; },
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
     §10  RESPONSE BUILDERS
  ═══════════════════════════════════════════════════════════ */

  /* ─── Greeting ─── */
  const GREET = [
    "Hey! \uD83D\uDC4B Welcome to Ayush AI Automation.\n\nI'm your AI assistant — ask me anything about Instagram & WhatsApp DM automation for fitness coaches.\n\nWhat's on your mind?",
    "Hi there! \uD83D\uDC4B Glad you're here.\n\nI can answer everything about our DM automation system — pricing, features, how it works, or how to get started.\n\nWhat would you like to know?",
    "Hello! \uD83D\uDE4C Great to have you here.\n\nI'm your guide to Ayush AI Automation — built exclusively for fitness coaches who want leads on autopilot.\n\nWhat's your question?",
  ];
  function buildGreeting() { return R(TP.pick(GREET)); }

  /* ─── Pricing overview ─── */
  function buildPricingOverview() {
    if (!D.plans) return buildFallback("pricing");
    const [p0,p1,p2,p3,p4] = D.plans;
    return R(
      "Here's a clean pricing breakdown — all plans:\n\n" +
      "\uD83D\uDC9A " + p0.name + "\n   " + p0.price + "  \u00B7  Setup: FREE (till 30 June)\n   \u2714 " + p0.best_for + "\n\n" +
      "\uD83D\uDD35 " + p1.name + "\n   " + p1.price + "  \u00B7  Setup: " + p1.price_alt + "\n   \u2714 " + p1.best_for + "\n\n" +
      "\uD83D\uDE80 " + p2.name + "  \u2B50 Most Popular\n   " + p2.price + "  \u00B7  Setup: " + p2.price_alt + "\n   \u2714 " + p2.best_for + "\n\n" +
      "\uD83D\uDCAC " + p3.name + "\n   " + p3.price + "  \u00B7  Setup: " + p3.price_alt + "\n\n" +
      "\u26A1 " + p4.name + "\n   " + p4.price + "  \u00B7  Setup: " + p4.price_alt + "\n\n" +
      "\uD83D\uDCA1 Most coaches start on the FREE plan → see results → upgrade.\n" +
      "\uD83D\uDCCC Paid plans also need a ManyChat subscription to keep automation running.",
      "https://ayushaiautomation.in/pricing.html", "View Full Pricing"
    );
  }

  /* ─── Plan detail ─── */
  const PLAN_OPENERS = {
    free:     ["Here's everything inside the Free Plan — yes, genuinely \u20B90:",
               "The Free Plan is the smartest starting point. Here's what you get:"],
    starter:  ["The Starter Plan organises your lead inbox. Here's the full breakdown:",
               "Here's what the Starter Plan gives you:"],
    growth:   ["The Growth Plan is our most popular — here's exactly why:",
               "Everything inside the Growth Plan — the full conversion system:"],
    whatsapp: ["The WhatsApp Qualification System — full detail:",
               "Here's exactly what the WhatsApp plan covers:"],
    combo:    ["The Combo Plan is the complete sales machine. Here's everything:",
               "Combo = Instagram + WhatsApp, end-to-end. Here's what's inside:"],
  };

  function buildPlanDetail(key) {
    const plan = getPlan(key);
    if (!plan) return buildPricingOverview();
    const intro    = TP.pick(PLAN_OPENERS[key] || ["Plan details:"]);
    const features = plan.features.map(f => "• " + f).join("\n");
    const limits   = plan.limitations.length
      ? "\n\n\u274C Not included:\n" + plan.limitations.map(l => "• " + l).join("\n")
      : "";
    const note     = plan.note ? "\n\n\uD83D\uDCA1 " + plan.note : "";
    return R(
      intro + "\n\n\uD83D\uDCCB " + plan.name +
      "\n\uD83D\uDCB0 " + plan.price +
      "\n\uD83D\uDCE6 Setup: " + plan.price_alt +
      "\n\n\u2705 What's included:\n" + features + limits + note,
      "https://ayushaiautomation.in/pricing.html", "See Full Plan Details"
    );
  }

  /* ─── Plan comparison ─── */
  function buildComparison() {
    return R(
      "5 plans — here's how to pick yours:\n\n" +
      "\uD83D\uDCCC FREE (\u20B90/mo)       — Basic auto-replies, zero cost\n   \u2192 Just testing? Zero risk entry.\n\n" +
      "\uD83D\uDCCC STARTER (\u20B9999/mo)  — Lead tagging + organised inbox\n   \u2192 Getting DMs but wasting time on manual replies?\n\n" +
      "\uD83D\uDCCC GROWTH (\u20B91,499/mo) — Full qualification + booking funnel \u2B50\n   \u2192 Want real booked calls on autopilot?\n\n" +
      "\uD83D\uDCCC WHATSAPP (\u20B91,499/mo) — Qualification on WhatsApp\n   \u2192 WhatsApp is your primary platform?\n\n" +
      "\uD83D\uDCCC COMBO (\u20B92,498/mo)  — Instagram + WhatsApp together\n   \u2192 Want end-to-end? This is the full machine.\n\n" +
      "\uD83C\uDFAF Rule: Start FREE \u2192 get results \u2192 upgrade only when ready.",
      "https://ayushaiautomation.in/pricing.html", "Compare All Plans"
    );
  }

  /* ─── Services ─── */
  const SVC_OPENERS = [
    "Here's the complete system we build for fitness coaches:",
    "Every component — built, automated, and explained:",
    "Here's exactly what gets automated and why each part matters:",
  ];
  function buildServices() {
    const svcs = D.services || [];
    const list = svcs.map(s =>
      "\u26A1 " + s.name + "\n   " + s.description + "\n   \uD83D\uDCC8 Result: " + s.result
    ).join("\n\n");
    return R(
      TP.pick(SVC_OPENERS) + "\n\n" + list +
      "\n\nEvery piece connects — from first DM to booked call. All automated.",
      "https://ayushaiautomation.in/services.html", "Explore All Services"
    );
  }

  /* ─── Process / how it works ─── */
  const HOW_VARIANTS = [
    function() {
      const steps = D.process || [];
      return "Here's how the system works — start to finish:\n\n" +
        steps.map(s => s.step + "\uFE0F\u20E3 " + s.title + "\n   " + s.desc).join("\n\n") +
        "\n\n\u23F1\uFE0F Live in 24\u201372 hours. You just approve \u2014 we handle everything.";
    },
    function() {
      return "The 6-step automated DM journey:\n\n" +
        "1\uFE0F\u20E3 Someone messages you on Instagram or WhatsApp\n" +
        "2\uFE0F\u20E3 Bot replies instantly \u2014 seconds, 24/7\n" +
        "3\uFE0F\u20E3 Asks smart qualifying questions (goal, timeline, budget)\n" +
        "4\uFE0F\u20E3 Tags them: Serious Buyer vs Time-Waster\n" +
        "5\uFE0F\u20E3 Serious leads get booking link automatically\n" +
        "6\uFE0F\u20E3 You only talk to people already ready to work with you\n\n" +
        "\uD83C\uDFAF Result: Zero wasted chats. Only qualified conversations reach you.";
    }
  ];
  function buildProcess() {
    return R(TP.pick(HOW_VARIANTS)(), "https://ayushaiautomation.in/process.html", "See Full Process");
  }

  /* ─── Results ─── */
  function buildResults() {
    const g = (D.meta && D.meta.guarantee) || "14-day rebuild guarantee if no qualified leads come in.";
    return R(
      "What you can realistically expect:\n\n" +
      "• Drastic reduction in ghosting\n" +
      "• Only qualified, serious leads reach you\n" +
      "• Consistent call bookings \u2014 even while you sleep\n" +
      "• 15\u201320 hours/week saved on manual DM work\n\n" +
      "\uD83D\uDEE1\uFE0F Guarantee: " + g + "\n\n" +
      "Real coach result: \"Within 7 days I started getting qualified leads directly from DMs \u2014 no more wasting time on random chats.\"",
      "https://ayushaiautomation.in/demo.html", "See Proof & Results"
    );
  }

  /* ─── Safety ─── */
  function buildSafety() {
    return R(
      "100% safe \u2014 full picture:\n\n" +
      "\u2705 Uses ManyChat \u2014 official Instagram & Meta partner\n" +
      "\u2705 Trusted by 1M+ businesses worldwide\n" +
      "\u2705 Only replies when someone messages YOU first\n" +
      "\u2705 Fully within Instagram's official guidelines\n" +
      "\u2705 No spam, no bulk messages, no aggressive outreach\n" +
      "\u2705 Zero ban risk \u2014 safe automation practices only\n" +
      "\u2705 No password sharing \u2014 secure OAuth access only\n\n" +
      "You experience the live demo before any commitment. Zero risk.",
      "https://ayushaiautomation.in/demo.html", "See Live Demo"
    );
  }

  /* ─── Setup timeline ─── */
  function buildSetup() {
    const tl = (D.meta && D.meta.setup_timeline) || {};
    return R(
      "Setup is fast \u2014 exact timelines:\n\n" +
      "\uD83D\uDCF1 Instagram Automation: " + (tl.instagram || "24\u201372 hours") + "\n" +
      "\uD83D\uDCAC WhatsApp or Combo: " + (tl.whatsapp_or_combo || "48\u201372 hours") + "\n\n" +
      "What setup looks like:\n" +
      "1. You connect account (secure OAuth \u2014 no password)\n" +
      "2. We build & customise your conversation flows\n" +
      "3. You review and approve\n" +
      "4. System goes live \u2705\n\n" +
      "After that \u2014 fully automatic. Nothing for you to manage.",
      "https://ayushaiautomation.in/process.html", "See Full Setup"
    );
  }

  /* ─── Demo ─── */
  function buildDemo() {
    return R(
      "Yes! Live demo available \u2014 before any commitment. \uD83C\uDFAF\n\n" +
      "What the demo shows you:\n" +
      "• How the bot handles a real conversation\n" +
      "• The qualifying questions it asks\n" +
      "• How it separates serious leads from time-wasters\n" +
      "• How it moves someone toward booking\n\n" +
      "You experience it as your client would \u2014 interactive, not screenshots.\n\n" +
      "\u23F1\uFE0F Takes 10\u201315 minutes. Zero sales pressure.",
      "https://ayushaiautomation.in/demo.html", "Request Live Demo"
    );
  }

  /* ─── Contact / Get Started ─── */
  function buildContact() {
    const c = D.contact || {};
    return R(
      "Here's how to reach us or get started:\n\n" +
      "\uD83D\uDCF1 WhatsApp: " + (c.whatsapp || "+91 94772 93867") + "\n" +
      "\uD83D\uDCE7 Email: " + (c.email || "ayushtrades54@gmail.com") + "\n" +
      "\uD83D\uDCC5 Book a free 15-min strategy call\n\n" +
      "On the call:\n" +
      "• We understand your current DM situation\n" +
      "• Identify the right plan for you\n" +
      "• Set clear expected results\n" +
      "• Confirm timeline and next steps\n\n" +
      "\u23F1\uFE0F From call to live system: 24\u201372 hours.",
      c.booking || "https://ayushaiautomation.in/book.html", "Book Free Call"
    );
  }

  /* ─── Tools ─── */
  function buildTools() {
    return R(
      "The tools powering the system:\n\n" +
      "\uD83D\uDD27 ManyChat \u2014 automation engine\n" +
      "   \u2022 Official Instagram & WhatsApp partner\n" +
      "   \u2022 Used by 1M+ businesses\n" +
      "   \u2022 Zero ban risk\n\n" +
      "\uD83D\uDCCA Google Sheets \u2014 lead tracking & reporting\n" +
      "   \u2022 All leads organised in real-time\n" +
      "   \u2022 Easy to review and export\n\n" +
      "\u26A0\uFE0F Paid plans need a separate ManyChat subscription.\n" +
      "We build the shop \u2014 ManyChat is the electricity that keeps it running.",
      "https://ayushaiautomation.in/faq.html", "Read Full FAQ"
    );
  }

  /* ─── About ─── */
  function buildAbout() {
    const a = D.agency || {};
    return R(
      (a.name || "Ayush AI Automation") + " \u2014 DM automation built exclusively for fitness coaches.\n\n" +
      "\uD83C\uDFAF Mission: Turn your Instagram & WhatsApp DMs into a predictable client-booking machine.\n\n" +
      "Founded by Ayush \u2014 deep expertise in AI automation and lead systems.\n\n" +
      (a.about || "") + "\n\nWe don't build chatbots. We build revenue systems.",
      "https://ayushaiautomation.in/about.html", "Read About Us"
    );
  }

  /* ─── Human feel ─── */
  function buildHumanFeel() {
    return R(
      "Valid concern \u2014 here's the honest answer:\n\n" +
      "Conversations are engineered to feel human:\n" +
      "• Conversational tone \u2014 no robotic commands\n" +
      "• Natural flow \u2014 like a warm, helpful assistant\n" +
      "• Personalised based on what each person says\n" +
      "• When someone's ready \u2014 YOU step in personally\n\n" +
      "\uD83D\uDCA1 People don't care if it's automated if it's helpful, fast, and relevant.\n\n" +
      "Our systems have been mistaken for real people. That's the standard.",
      null, null
    );
  }

  /* ─── Both platforms ─── */
  function buildBothPlatforms() {
    return R(
      "Yes \u2014 both platforms work together. \uD83D\uDD25\n\n" +
      "How most coaches use it:\n" +
      "• Instagram \u2192 capture leads (DMs, comments, stories)\n" +
      "• WhatsApp \u2192 follow up and close serious buyers\n\n" +
      "Combined benefits:\n" +
      "• Complete lead journey covered end-to-end\n" +
      "• No lead falls through the cracks\n" +
      "• Higher conversion across all touchpoints\n\n" +
      "\uD83C\uDFAF Both together = one complete automated sales machine.\n" +
      "See the Combo Plan for full pricing.",
      "https://ayushaiautomation.in/pricing.html", "View Combo Plan"
    );
  }

  /* ─── Objections ─── */
  function buildObjection(type) {
    if (type === "objection_expensive") return R(
      "Let me reframe this with real numbers:\n\n" +
      "Without automation, every day you lose:\n" +
      "\u23F0 2\u20134 hours manually replying to DMs\n" +
      "\uD83D\uDCB8 Clients who ghosted from slow follow-up\n" +
      "\uD83D\uDE24 Energy wasted on people who were never serious\n\n" +
      "If your coaching is \u20B95,000\u201315,000/client:\n" +
      "\u2192 1 extra client/month from automation = cost recovered 10\u00D7 over\n\n" +
      "\uD83D\uDCA1 Start FREE (\u20B90). No card needed. See results first.\n" +
      "Upgrade only when it financially makes sense \u2014 zero pressure.",
      "https://ayushaiautomation.in/pricing.html", "Start Free \u2014 \u20B90"
    );
    if (type === "objection_time") return R(
      "You're actually losing MORE time without this \u2014 here's the reality:\n\n" +
      "Every day right now:\n" +
      "• Same questions answered repeatedly \u267B\uFE0F\n" +
      "• Hours with non-serious people \u23F0\n" +
      "• Manually tracking follow-ups \u274C\n\n" +
      "With the system:\n" +
      "• Setup: 1\u20132 hours (once only)\n" +
      "• Daily maintenance: Zero\n" +
      "• Runs 24/7 without you\n\n" +
      "One-time investment = permanent daily time savings.",
      null, null
    );
    if (type === "objection_va") return R(
      "VA vs Automation \u2014 honest comparison:\n\n" +
      "\uD83D\uDC64 Virtual Assistant:\n" +
      "• Misses messages (sick days, off hours)\n" +
      "• \u20B98,000\u201315,000/month minimum\n" +
      "• Can't handle 100+ DMs at once\n" +
      "• Needs training and oversight\n\n" +
      "\uD83E\uDD16 Automation:\n" +
      "• Replies in <30 seconds \u2014 24/7/365\n" +
      "• Never forgets a follow-up\n" +
      "• Unlimited simultaneous conversations\n" +
      "• Set once \u2192 works forever\n" +
      "• Costs less than one client's fee per month\n\n" +
      "A VA is one person. A system never takes a sick day.",
      "https://ayushaiautomation.in/coaches.html", "Why Coaches Choose This"
    );
    if (type === "objection_unsure") return R(
      "Totally fair \u2014 big decisions need clarity, not pressure.\n\n" +
      "My suggestion: don't decide on words. Experience it.\n\n" +
      "\uD83D\uDC49 Take the free 10-min demo:\n" +
      "• See the system live\n" +
      "• Experience it as your clients would\n" +
      "• Then decide with full information\n\n" +
      "No payment. No commitment. No pitch.\n\n" +
      "9/10 coaches say the decision becomes obvious the moment they see it.",
      "https://ayushaiautomation.in/demo.html", "Try Free Demo"
    );
    return buildContact();
  }

  /* ─── Cancel ─── */
  function buildCancel() {
    return R(
      "No lock-in \u2014 here's how it works:\n\n" +
      "• Monthly plans \u2192 simply don't renew next month\n" +
      "• No contracts, no hidden fees\n" +
      "• One-time setup fees are non-refundable\n\n" +
      "You stay because the system is working \u2014 not because you're stuck.\n\n" +
      "Most coaches who consider stopping end up staying once they see the monthly reports.",
      "https://ayushaiautomation.in/terms.html", "Read Full Terms"
    );
  }

  /* ─── Revisions ─── */
  function buildRevisions() {
    return R(
      "Yes \u2014 revisions included in all active paid plans. \uD83D\uDD04\n\n" +
      "What you can request:\n" +
      "• Flow logic changes\n" +
      "• Message tone and style updates\n" +
      "• New qualifying question sequences\n" +
      "• New keyword triggers\n\n" +
      "Process: request \u2192 implement \u2192 you approve \u2192 live.\n" +
      "No extra charges for reasonable requests.\n\n" +
      "Your coaching evolves \u2014 your automation evolves with it.",
      "https://ayushaiautomation.in/services.html", "View Plans"
    );
  }

  /* ─── Requirements ─── */
  function buildRequirements() {
    return R(
      "Here's all you need to provide \u2014 that's it:\n\n" +
      "\u2705 Instagram account access (via ManyChat OAuth \u2014 no password)\n" +
      "\u2705 Your approval on the conversation flows we build\n" +
      "\u2705 Payment confirmation\n\n" +
      "We handle everything else.\n\n" +
      "\uD83D\uDD12 Security: You never share your password. Access via secure official OAuth.",
      "https://ayushaiautomation.in/process.html", "See Setup Steps"
    );
  }

  /* ─── Thanks ─── */
  const THANKS = [
    "Glad that helped! \uD83D\uDC4D\n\nAnytime you have more questions \u2014 I'm here.\n\nWhenever you're ready, the free demo is just a click away.",
    "Of course! \uD83D\uDE0A Happy to help.\n\nFeel free to ask about anything else \u2014 pricing, features, setup, or getting started.",
    "Great! If anything comes up, just ask. \uD83C\uDFAF\n\nThe free demo is available anytime you want to see it live.",
  ];
  function buildThanks() {
    return R(TP.pick(THANKS), "https://ayushaiautomation.in/demo.html", "See Demo");
  }

  /* ─── Fallback ─── */
  function buildFallback(topic) {
    const opening = topic
      ? "Looks like you're asking about " + topic + ". Could you share a bit more so I can give you the right answer?"
      : "I want to make sure I give you exactly the right answer.";
    return R(
      opening + "\n\nHere's what I can help with:\n\n" +
      "\uD83D\uDCB0 Pricing & Plans\n" +
      "\u2699\uFE0F How the system works\n" +
      "\uD83D\uDCCA Services & Features\n" +
      "\uD83D\uDEE1\uFE0F Safety & Trust\n" +
      "\uD83D\uDE80 Getting Started\n" +
      "\uD83D\uDCDE Contact & Booking\n" +
      "\uD83C\uDFA5 Live Demo\n\n" +
      "Just type your question \u2014 I'll find the answer!",
      null, null
    );
  }

  /* ═══════════════════════════════════════════════════════════
     §11  FAQ REGISTRY  (chip-triggered, keyed by label)
  ═══════════════════════════════════════════════════════════ */
  const FAQ_REGISTRY = {
    faq_dm_setup: {
      text: "DM Automation Setup means we build automatic replies inside your Instagram DMs.\n\nWhen someone asks about price, programs, or availability \u2014 the system answers automatically.\n\nYou stop typing the same reply 50 times a day.\n\u2192 You only respond to people genuinely ready to work with you.",
      link: "https://ayushaiautomation.in/process.html", cta: "See Setup Process"
    },
    faq_lead_qualification: {
      text: "Lead Qualification automatically identifies serious buyers.\n\nThe system asks:\n• What's your fitness goal?\n• When do you want to start?\n• Are you ready to invest?\n\nBased on answers:\n\uD83D\uDFE2 Serious buyer \u2192 booking link sent automatically\n\uD83D\uDD34 Just browsing \u2192 nurture sequence starts\n\nResult: Only real, ready buyers reach you.",
      link: "https://ayushaiautomation.in/process.html", cta: "See Lead Qualification"
    },
    faq_tagging: {
      text: "The Tagging System labels leads automatically based on answers.\n\nExample tags:\n\uD83C\uDFF7\uFE0F Fat Loss / Muscle Gain / Beginner / Advanced\n\uD83C\uDFF7\uFE0F Serious Buyer / Just Browsing / Follow-Up Needed\n\nInstead of reading every chat, you instantly know who to focus on.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Tagging Feature"
    },
    faq_followup_auto: {
      text: "Follow-up Automation sends timed reminders when a lead goes silent.\n\nSequence:\n• 1 hour reminder\n• 24 hour reminder\n• 3 day final nudge\n\n\uD83D\uDCA1 Most coaches lose 40\u201360% of potential clients from zero follow-up. This eliminates that.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Follow-up Feature"
    },
    faq_comment_dm: {
      text: "Comment-to-DM: when someone comments on your post or reel, they automatically receive a DM and a qualifying conversation begins.\n\n• Your content becomes a 24/7 lead generator\n• Captures every interested person without effort\n• Works for reels, posts, and paid ads",
      link: "https://ayushaiautomation.in/services.html", cta: "View Comment Automation"
    },
    faq_story_reply: {
      text: "Story Reply Automation: when someone reacts or replies to your story, a qualifying conversation starts automatically.\n\nInstead of that interaction disappearing \u2014 it becomes a lead.\n\n\uD83D\uDCA1 Most coaches ignore story replies. This captures every single one.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Story Feature"
    },
    faq_booking_funnel: {
      text: "The Booking Funnel sends only qualified leads to your calendar link.\n\n1\uFE0F\u20E3 Lead enters\n2\uFE0F\u20E3 System qualifies them\n3\uFE0F\u20E3 Serious \u2192 booking link sent\n4\uFE0F\u20E3 They schedule on your calendar\n5\uFE0F\u20E3 You show up to a pre-qualified call\n\nEvery call = someone already interested.",
      link: "https://ayushaiautomation.in/book.html", cta: "Book Free Call"
    },
    faq_whatsapp_qualification: {
      text: "WhatsApp Qualification moves serious leads from Instagram to WhatsApp for deeper filtering.\n\nWhy WhatsApp?\n• Higher response rates\n• More personal feel\n• Better for closing high-ticket coaching\n\nHandover is fully automatic.",
      link: "https://ayushaiautomation.in/services.html", cta: "View WhatsApp Automation"
    },
    faq_reengagement: {
      text: "Re-engagement automatically contacts old or inactive leads who went silent.\n\nSends fresh, value-driven messages to re-ignite interest.\n\n\uD83D\uDCB0 Old leads = hidden revenue sitting in your DMs right now.",
      link: "https://ayushaiautomation.in/services.html", cta: "View Re-engagement"
    },
    faq_hot_lead: {
      text: "Hot Lead Notification: you get alerted instantly when a high-intent prospect appears.\n\nSystem detects high intent \u2192 tags HOT LEAD \u2192 pings you immediately.\n\n• First response = #1 conversion factor\n• Hot leads go cold within hours\n• You never miss a ready buyer",
      link: "https://ayushaiautomation.in/process.html", cta: "See Hot Lead Feature"
    },
    faq_no_daily_manage: {
      text: "No \u2014 zero daily management needed.\n\nAfter setup, it runs on its own:\n• Replies automatically\n• Qualifies automatically\n• Follows up automatically\n\nYour only job: respond to serious, pre-qualified leads it sends you.",
      link: "https://ayushaiautomation.in/process.html", cta: "See Full Process"
    },
    faq_spam: {
      text: "No \u2014 the system never sends spam. \uD83D\uDEAB\n\nIt only replies to people who message YOU first.\n\n• No bulk messaging\n• No random outreach\n• No unsolicited messages\n• 100% within platform guidelines",
      link: null, cta: null
    },
    faq_technical_knowledge: {
      text: "Zero technical knowledge required.\n\nBuilt for fitness coaches \u2014 not developers.\n\nYou don't need to code, understand automation software, or manage settings.\n\nWe handle everything. You approve the flows, then go live.",
      link: null, cta: null
    },
    faq_organic_ads: {
      text: "Works for both \u2014 organic content AND paid ads. \u2705\n\nCaptures leads from:\n• Reel comments\n• Story replies\n• Direct DMs\n• Post comments\n• Paid ad clicks\n\nOrganic or ads \u2014 every conversation handled automatically.",
      link: "https://ayushaiautomation.in/services.html", cta: "View All Features"
    },
    faq_manychat_subscription: {
      text: "Yes \u2014 paid plans need a separate ManyChat subscription.\n\nHere's why:\n• My fee = building your system\n• ManyChat = software keeping it running 24/7\n\n\uD83C\uDFD7\uFE0F I build the shop. \uD83D\uDCA1 ManyChat is the electricity.\n\nFree Plan does NOT need ManyChat paid.",
      link: "https://ayushaiautomation.in/pricing.html", cta: "View Pricing"
    },
    faq_support: {
      text: "Support available anytime.\n\n\uD83D\uDCF1 WhatsApp: +91 94772 93867\n\uD83D\uDCE7 Email: ayushtrades54@gmail.com\n\nPaid plans include monthly optimisation sessions.\nRevisions and flow changes are included in all active paid plans.",
      link: "https://ayushaiautomation.in/book.html", cta: "Book Free Call"
    },
    faq_stop_service: {
      text: "No lock-in. Cancel anytime.\n\n• Monthly plans \u2014 just don't renew\n• No contracts, no hidden fees\n• One-time setup fees are non-refundable\n\nYou stay because it works \u2014 not because you're stuck.",
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
         Defined pairs that blend cleanly into one response.
  ═══════════════════════════════════════════════════════════ */
  function blend2(r1, r2, h1, h2) {
    return R(
      h1 + ":\n" + r1.text + "\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n" + h2 + ":\n" + r2.text,
      r1.link, r1.cta
    );
  }

  const BLEND_TABLE = [
    [["pricing","safety"],       (p,e) => blend2(p ? buildPlanDetail(p) : buildPricingOverview(), buildSafety(),             "\uD83D\uDCB0 Pricing",   "\uD83D\uDD12 Safety")],
    [["pricing","demo"],         (p,e) => blend2(p ? buildPlanDetail(p) : buildPricingOverview(), buildDemo(),                "\uD83D\uDCB0 Pricing",   "\uD83C\uDFA5 Demo")],
    [["pricing","results"],      (p,e) => blend2(p ? buildPlanDetail(p) : buildPricingOverview(), buildResults(),             "\uD83D\uDCB0 Plans",     "\uD83D\uDCC8 Results")],
    [["services","pricing"],     (p,e) => blend2(buildServices(),        p ? buildPlanDetail(p) : buildPricingOverview(),     "\uD83D\uDEE0\uFE0F Services", "\uD83D\uDCB0 Pricing")],
    [["services","process"],     (p,e) => blend2(buildServices(),        buildProcess(),                                      "\uD83D\uDEE0\uFE0F Services", "\u2699\uFE0F Process")],
    [["process","results"],      (p,e) => blend2(buildProcess(),         buildResults(),                                      "\u2699\uFE0F How It Works",   "\uD83D\uDCC8 Results")],
    [["safety","demo"],          (p,e) => blend2(buildSafety(),          buildDemo(),                                         "\uD83D\uDD12 Safety",    "\uD83C\uDFA5 Demo")],
    [["setup","pricing"],        (p,e) => blend2(buildSetup(),           p ? buildPlanDetail(p) : buildPricingOverview(),     "\u23F1\uFE0F Setup",     "\uD83D\uDCB0 Pricing")],
    [["contact","demo"],         (p,e) => blend2(buildContact(),         buildDemo(),                                         "\uD83D\uDCDE Get Started", "\uD83C\uDFA5 Demo")],
    [["compare_plans","pricing"],(p,e) => blend2(buildComparison(),      buildPricingOverview(),                              "\uD83D\uDCCA Comparison", "\uD83D\uDCB0 Full Pricing")],
    [["objection_expensive","pricing"],(p,e) => blend2(buildObjection("objection_expensive"), buildPricingOverview(),         "\uD83D\uDCB8 On Price",  "\uD83D\uDCB0 Plans")],
  ];

  function tryBlend(topIntents, plan, entities) {
    if (topIntents.length < 2) return null;
    const ids = new Set(topIntents.slice(0, 4).map(x => x.id));
    for (const [pair, builder] of BLEND_TABLE) {
      if (ids.has(pair[0]) && ids.has(pair[1])) {
        try { return builder(plan, entities); } catch(_) {}
      }
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     §14  MULTI-SENTENCE PROCESSOR
         Handles compound inputs split by conjunctions / "aur"
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
        parts.join("\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n"),
        D.contact ? D.contact.booking : "https://ayushaiautomation.in/book.html",
        "Book Free Call"
      );
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     §15  FAQ SCORER  (keyword + fuzzy match against AGENCY_DATA)
  ═══════════════════════════════════════════════════════════ */
  function matchFaq(normInput) {
    if (!D.faqs) return null;
    const tokens = TP.lemTokens(normInput);
    const grams  = TP.allGrams(tokens);
    let best = null, bestScore = 0;

    for (const faq of D.faqs) {
      let score = TP.overlap(grams, faq.keywords);
      if (!faq.keywords.some(k => k.includes(" "))) {
        for (const kw of faq.keywords) {
          for (const tok of tokens) {
            if (TP.fuzzyScore(tok, kw) >= 0.84) { score += 0.4; break; }
          }
        }
      }
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    return bestScore >= 1.5 ? best : null;
  }

  /* ═══════════════════════════════════════════════════════════
     §16  CONTEXT-AWARE RESOLVER
  ═══════════════════════════════════════════════════════════ */
  function resolveWithContext(topIntents, entities, normInput) {
    const topId   = topIntents[0]?.id;
    const nerPlan = entities.plan;

    // "What about price?" after plan discussion
    if (topId === "pricing" && MEM.lastPlan && !nerPlan) {
      return { intent: "plan_" + MEM.lastPlan, plan: MEM.lastPlan };
    }
    // "Features?" / "what does it include?" after plan discussion
    if ((topId === "services" || topId === "process") && MEM.lastPlan && !nerPlan &&
        /feature|include|what|tell me more/i.test(normInput)) {
      return { intent: "plan_" + MEM.lastPlan, plan: MEM.lastPlan };
    }
    // Bare follow-up — no new intent detected
    if (!topId && MEM.lastIntent) {
      return { intent: MEM.lastIntent, plan: MEM.resolvePlan(nerPlan) };
    }

    const plan = MEM.resolvePlan(nerPlan) || planFromIntents(topIntents);
    return { intent: topId || null, plan };
  }

  /* ═══════════════════════════════════════════════════════════
     §17  MAIN PROCESS FUNCTION  (exposed as CHATBOT.process)
  ═══════════════════════════════════════════════════════════ */
  function process(rawInput /*, mode */) {
    if (!rawInput || !rawInput.trim()) {
      return R("I didn't catch that — could you type your question? I'm here to help! \uD83D\uDE0A");
    }

    // ── Step 1: Clean + Hinglish normalise ─────────────────
    const normInput = normaliseHinglish(TP.clean(rawInput));

    // ── Step 2: NER — extract entities ─────────────────────
    const entities  = NER.extract(normInput);

    // ── Step 3: Score intents (IDF + fuzzy) ────────────────
    const topIntents = scoreIntents(normInput);

    // ── Step 4: Context-aware resolution ───────────────────
    const { intent, plan } = resolveWithContext(topIntents, entities, normInput);

    // ── Step 5: Update context memory ──────────────────────
    MEM.push(intent, plan || entities.plan, entities, normInput);

    // ── Route A: Multi-sentence compound question ───────────
    const sentences = TP.splitSentences(normInput);
    if (sentences.length >= 2) {
      const multi = processMultiSentence(sentences, plan, entities);
      if (multi) return multi;
    }

    // ── Route B: Multi-intent blend (two strong signals) ────
    if (topIntents.length >= 2 &&
        topIntents[0].score >= 2.5 &&
        topIntents[1].score >= 1.8 &&
        topIntents[0].id !== topIntents[1].id) {
      const blended = tryBlend(topIntents, plan, entities);
      if (blended) return blended;
    }

    // ── Route C: Primary intent ─────────────────────────────
    if (intent) {
      const resp = route(intent, plan, entities);
      if (resp) return resp;
    }

    // ── Route D: FAQ match from AGENCY_DATA ─────────────────
    const faq = matchFaq(normInput);
    if (faq) return R(faq.answer);

    // ── Route E: Partial salvage (any scoring intent) ────────
    if (topIntents.length > 0) {
      const salvage = route(topIntents[0].id, plan, entities);
      if (salvage) return salvage;
    }

    // ── Route F: Smart fallback ─────────────────────────────
    return buildFallback(null);
  }

  /* ═══════════════════════════════════════════════════════════
     §18  FAQ CHIP HELPERS
  ═══════════════════════════════════════════════════════════ */
  function getFaq(key)    { return FAQ_REGISTRY[key] || null; }
  function getTopFaqs(n)  { return Object.keys(FAQ_REGISTRY).slice(0, n || 10); }

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
