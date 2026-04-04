// ============================================================
//  Ayush AI Automation – Chatbot Engine v2
//  Pure JS · No backend · No external APIs
// ============================================================

const CHATBOT = (() => {

  // ── State ──────────────────────────────────────────────────
  let intents     = {};
  let ctxMemory   = [];   // last 3 normalised user msgs
  let intentFreq  = {};   // localStorage frequency map

  // ── Tone starters ─────────────────────────────────────────
  const STARTERS = [
    "Got you 👇","Good question 👇","Makes sense 👇",
    "Here's the deal 👇","Fair question 👇","Glad you asked 👇",
    "Sure thing 👇","Let me break it down 👇","Perfect question 👇",
  ];
  const randomStarter = () => STARTERS[Math.floor(Math.random() * STARTERS.length)];

  // ── Load data.json ─────────────────────────────────────────
  async function loadData() {
    try {
      const res  = await fetch("data.json");
      intents    = await res.json();
    } catch (e) {
      console.error("[AAA] data.json load failed:", e);
    }
  }

  // ── localStorage helpers ───────────────────────────────────
  function loadFreq() {
    try { intentFreq = JSON.parse(localStorage.getItem("aaa_freq") || "{}"); }
    catch (_) { intentFreq = {}; }
  }
  function saveFreq() {
    try { localStorage.setItem("aaa_freq", JSON.stringify(intentFreq)); } catch (_) {}
  }
  function saveLog(user, key) {
    try {
      const log = JSON.parse(localStorage.getItem("aaa_log") || "[]");
      log.push({ ts: Date.now(), user, intent: key });
      localStorage.setItem("aaa_log", JSON.stringify(log.slice(-120)));
    } catch (_) {}
  }

  // ── Hinglish stem map ──────────────────────────────────────
  // Maps Hinglish words → English equivalents for unified matching
  const HMAP = {
    // question words
    "kya":"what","kaise":"how","kyun":"why","kab":"when","kahan":"where",
    "kaun":"who","kitna":"how much","kitni":"how much","kitne":"how many",
    // verbs / aux
    "hai":"is","hain":"are","hoga":"will be","hogi":"will be","karega":"will do",
    "karta":"does","karti":"does","ho":"be","kar":"do","karo":"do",
    "bata":"tell","batao":"tell","samjhao":"explain","dikhao":"show",
    "chahiye":"need","chahta":"want","chahti":"want","dena":"give",
    "milega":"will get","milegi":"will get","lagta":"seems","lagega":"will take",
    "chalega":"will work","chalta":"works","kaam":"work","karte":"do",
    // nouns / adjectives
    "paisa":"money","paise":"money","rupee":"rupees","rs":"rupees",
    "safe":"safe","sahi":"right","acha":"good","achha":"good","theek":"ok",
    "nahi":"not","nai":"not","na":"not","bilkul":"absolutely",
    "bohot":"very","bahut":"very","zyada":"more","kam":"less",
    "fast":"fast","jaldi":"fast","slow":"slow","seedha":"direct",
    "poora":"full","pura":"full","sabse":"most","sab":"all",
    "sirf":"only","bas":"just","abhi":"now","aaj":"today",
    "kal":"tomorrow","din":"day","time":"time","din":"days",
    // common objection words
    "mehenga":"expensive","sasta":"cheap","costly":"expensive",
    "dhoka":"scam","dhokha":"scam","fraud":"scam","fake":"fake",
    "trust":"trust","bharosa":"trust","real":"real","genuine":"genuine",
    // filler / social
    "bhai":"","yaar":"","bro":"","buddy":"","ji":"",
    "haan":"yes","nahi":"no","hmm":"","aur":"and","ya":"or",
    "toh":"then","phir":"then","lekin":"but","par":"but",
    "agar":"if","jab":"when","jabki":"while",
  };

  // ── Normalise ──────────────────────────────────────────────
  function normalise(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function applyHmap(text) {
    return text.split(" ")
      .map(w => HMAP.hasOwnProperty(w) ? (HMAP[w] || "") : w)
      .filter(Boolean)
      .join(" ");
  }

  // ── Stop words ─────────────────────────────────────────────
  const STOP = new Set([
    "i","me","my","the","a","an","is","are","was","were","be","been",
    "have","has","had","do","does","did","will","would","could","should",
    "can","may","might","to","of","in","on","at","for","with","by","from",
    "up","into","than","so","and","or","not","no","if","that","this","it",
    "its","we","you","your","he","she","they","there","what","how","when",
    "where","which","who","am","just","very","get","got","let","our","us"
  ]);

  function tokenise(text) {
    return text.split(" ").filter(w => w.length > 1 && !STOP.has(w));
  }

  // ── Bigrams ────────────────────────────────────────────────
  function bigrams(tokens) {
    const bg = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      bg.push(tokens[i] + " " + tokens[i+1]);
    }
    return bg;
  }

  // ── Levenshtein ────────────────────────────────────────────
  function lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const dp = Array.from({length: b.length + 1}, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) dp[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        dp[i][j] = b[i-1] === a[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[b.length][a.length];
  }

  // ── Word similarity ────────────────────────────────────────
  function wordSim(w1, w2) {
    if (w1 === w2) return 1.0;
    // substring containment
    if (w1.length >= 4 && w2.includes(w1)) return 0.88;
    if (w2.length >= 4 && w1.includes(w2)) return 0.85;
    // prefix match (>= 4 chars)
    const minLen = Math.min(w1.length, w2.length);
    if (minLen >= 4) {
      let pfx = 0;
      for (let i = 0; i < minLen; i++) { if (w1[i] === w2[i]) pfx++; else break; }
      if (pfx >= 4) return 0.82;
    }
    // levenshtein fuzzy
    const dist = lev(w1, w2);
    const maxL = Math.max(w1.length, w2.length);
    if (maxL === 0) return 0;
    const sim  = 1 - dist / maxL;
    return sim >= 0.72 ? sim : 0;
  }

  // ── Score one intent ───────────────────────────────────────
  function scoreIntent(tokens, bgrams, keywords, key) {
    let score        = 0;
    let matched      = new Set();
    let multiBonus   = 0;

    for (const kw of keywords) {
      if (matched.has(kw)) continue;

      const kwNorm   = normalise(kw);
      const kwTokens = tokenise(kwNorm);

      // ── exact phrase match (bigram / multi-word) ──────────
      if (kwTokens.length >= 2) {
        const kwBg = bigrams(kwTokens);
        for (const bg of bgrams) {
          for (const kb of kwBg) {
            if (bg === kb) { score += 2.2; matched.add(kw); break; }
          }
          if (matched.has(kw)) break;
        }
        // full phrase containment
        const joined = tokens.join(" ");
        if (!matched.has(kw) && joined.includes(kwNorm)) {
          score += 2.0; matched.add(kw);
        }
      }

      if (matched.has(kw)) continue;

      // ── single keyword token matching ─────────────────────
      for (const kwt of kwTokens) {
        if (kwt.length < 2) continue;
        let best = 0;
        for (const t of tokens) {
          const s = wordSim(t, kwt);
          if (s > best) best = s;
        }
        if (best > 0) {
          score += best * (kwTokens.length > 1 ? 1.4 : 1.0);
          matched.add(kw);
          break;
        }
      }
    }

    // bonus for multiple keyword matches
    if (matched.size >= 2) multiBonus = matched.size * 0.3;
    if (matched.size >= 4) multiBonus = matched.size * 0.5;

    // small personalisation boost from frequency
    const freq = intentFreq[key] || 0;
    const freqBoost = Math.min(freq * 0.04, 0.35);

    return score + multiBonus + freqBoost;
  }

  // ── Context-aware query ────────────────────────────────────
  function contextQuery(msg) {
    const recent = ctxMemory.slice(-2).join(" ");
    return recent ? recent + " " + msg : msg;
  }

  // ── Main match ─────────────────────────────────────────────
  function match(userMsg) {
    // Build enriched query
    const raw     = normalise(userMsg);
    const hingli  = applyHmap(raw);
    const merged  = applyHmap(normalise(contextQuery(userMsg)));

    const tokens  = tokenise(merged);
    const bgrams  = bigrams(tokens);

    if (!tokens.length) return "fallback";

    let best = { key: "fallback", score: 0.38 };

    for (const [key, intent] of Object.entries(intents)) {
      if (key === "fallback") continue;
      const s = scoreIntent(tokens, bgrams, intent.keywords || [], key);
      if (s > best.score) best = { key, score: s };
    }

    // Hard threshold — below this go to fallback
    return best.score >= 0.5 ? best.key : "fallback";
  }

  // ── Update context memory ──────────────────────────────────
  function addCtx(msg) {
    ctxMemory.push(applyHmap(normalise(msg)));
    if (ctxMemory.length > 3) ctxMemory.shift();
  }

  // ── Build response ─────────────────────────────────────────
  function buildResp(key) {
    const intent  = intents[key] || intents["fallback"];
    const skipStart = ["fallback","greeting","confused","ok_response"].includes(key);
    const starter   = skipStart ? "" : randomStarter() + "\n\n";
    return {
      text: starter + intent.answer,
      link: intent.link || null,
      cta:  intent.cta  || null,
    };
  }

  // ── Public ─────────────────────────────────────────────────
  async function init() {
    await loadData();
    loadFreq();
  }

  function process(userMsg) {
    addCtx(userMsg);
    const key = match(userMsg);
    intentFreq[key] = (intentFreq[key] || 0) + 1;
    saveFreq();
    saveLog(userMsg, key);
    return buildResp(key);
  }

  return { init, process };

})();
