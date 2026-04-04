// ============================================================
//  Ayush AI Automation – Chatbot Engine
//  Pure JS, no backend, no external APIs
// ============================================================

const CHATBOT = (() => {

  // ── State ──────────────────────────────────────────────────
  let intents = {};
  let contextMemory = [];       // last 3 user messages
  let sessionLog   = [];        // full session for localStorage
  let intentFreq   = {};        // frequency map from localStorage
  let isTyping     = false;

  // ── Starters (randomised) ─────────────────────────────────
  const STARTERS = [
    "Got you 👇",
    "Good question 👇",
    "Makes sense 👇",
    "Here's the deal 👇",
    "Fair question 👇",
    "Glad you asked 👇",
    "Sure thing 👇",
    "Let me break it down 👇",
  ];

  function randomStarter() {
    return STARTERS[Math.floor(Math.random() * STARTERS.length)];
  }

  // ── Load data.json ────────────────────────────────────────
  async function loadData() {
    try {
      const res  = await fetch("data.json");
      const json = await res.json();
      intents = json;
      console.log("[AAA] Loaded", Object.keys(intents).length, "intents");
    } catch (e) {
      console.error("[AAA] Failed to load data.json:", e);
    }
  }

  // ── localStorage helpers ──────────────────────────────────
  function loadFreq() {
    try {
      const raw = localStorage.getItem("aaa_intent_freq");
      intentFreq = raw ? JSON.parse(raw) : {};
    } catch (_) { intentFreq = {}; }
  }

  function saveFreq() {
    try {
      localStorage.setItem("aaa_intent_freq", JSON.stringify(intentFreq));
    } catch (_) {}
  }

  function saveLog(userMsg, intentKey) {
    sessionLog.push({ ts: Date.now(), user: userMsg, intent: intentKey });
    try {
      const prev = JSON.parse(localStorage.getItem("aaa_chat_log") || "[]");
      prev.push(...sessionLog.slice(-20));
      localStorage.setItem("aaa_chat_log", JSON.stringify(prev.slice(-100)));
    } catch (_) {}
  }

  // ── Text Normalisation ────────────────────────────────────
  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")  // strip punctuation
      .replace(/\s+/g, " ")
      .trim();
  }

  // Common Hinglish normalisation map
  const HINGLISH_MAP = {
    "kya": "what", "hai": "is", "kaise": "how", "karo": "do",
    "nahi": "no", "hoga": "will", "mujhe": "me", "chahiye": "need",
    "batao": "explain", "samjhao": "explain", "accha": "ok",
    "theek": "ok", "haan": "yes", "bhai": "", "yaar": "",
    "agar": "if", "toh": "then", "aur": "and", "ya": "or",
    "kitna": "how much", "kitne": "how many", "kab": "when",
    "kahan": "where", "kyun": "why", "matlab": "meaning",
    "sab": "all", "pura": "full", "jaldi": "fast", "abhi": "now",
    "phir": "then", "wala": "", "wali": "", "karega": "will work",
    "lagta": "seems", "lagega": "will take", "milega": "will get",
    "samajh": "understand", "bata": "tell", "dekho": "see",
  };

  function hinglishNorm(text) {
    const words = text.split(" ");
    return words.map(w => HINGLISH_MAP[w] || w).filter(Boolean).join(" ");
  }

  // ── Tokenize ──────────────────────────────────────────────
  const STOP_WORDS = new Set([
    "i","me","my","the","a","an","is","are","was","were","be","been",
    "have","has","had","do","does","did","will","would","could","should",
    "can","may","might","shall","to","of","in","on","at","for","with",
    "by","from","up","about","into","then","than","so","but","and","or",
    "not","no","if","that","this","it","its","we","you","your","he","she",
    "they","their","there","what","how","when","where","which","who","am"
  ]);

  function tokenize(text) {
    return text.split(" ").filter(w => w.length > 1 && !STOP_WORDS.has(w));
  }

  // ── Levenshtein Distance (fuzzy match) ───────────────────
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b[i-1] === a[j-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }

  function fuzzyScore(word, keyword) {
    if (keyword.includes(word)) return 0.9;
    if (word.includes(keyword)) return 0.8;
    const dist = levenshtein(word, keyword);
    const maxLen = Math.max(word.length, keyword.length);
    if (maxLen === 0) return 0;
    const similarity = 1 - dist / maxLen;
    return similarity > 0.7 ? similarity : 0;
  }

  // ── Score an intent against tokens ───────────────────────
  function scoreIntent(tokens, keywords, intentKey) {
    let score = 0;
    let matchedKeywords = new Set();

    for (const token of tokens) {
      for (const kw of keywords) {
        if (matchedKeywords.has(kw)) continue;
        const kwTokens = kw.split(" ");
        // multi-word keyword: check if token is inside it
        for (const kwt of kwTokens) {
          const s = fuzzyScore(token, kwt);
          if (s > 0) {
            score += s * (kwTokens.length > 1 ? 1.5 : 1); // bonus for multi-word
            matchedKeywords.add(kw);
          }
        }
      }
    }

    // Boost score if multiple keywords matched
    if (matchedKeywords.size > 1) score *= (1 + matchedKeywords.size * 0.2);

    // Slight boost for frequently asked intent (personalisation)
    const freq = intentFreq[intentKey] || 0;
    if (freq > 0) score += Math.min(freq * 0.05, 0.3);

    return score;
  }

  // ── Build context-enriched query ─────────────────────────
  function buildContextQuery(userMsg) {
    // Merge with last 2 messages for context-awareness
    const recent = contextMemory.slice(-2).join(" ");
    return recent ? recent + " " + userMsg : userMsg;
  }

  // ── Main match engine ─────────────────────────────────────
  function matchIntent(userMsg) {
    const contextQuery  = buildContextQuery(userMsg);
    const norm          = hinglishNorm(normalize(contextQuery));
    const tokens        = tokenize(norm);

    if (tokens.length === 0) return { key: "fallback", score: 0 };

    let best = { key: "fallback", score: 0.3 };

    for (const [key, intent] of Object.entries(intents)) {
      if (key === "fallback") continue;
      const s = scoreIntent(tokens, intent.keywords || [], key);
      if (s > best.score) {
        best = { key, score: s };
      }
    }

    // Minimum threshold – if still weak, return fallback
    if (best.score < 0.45) return { key: "fallback", score: 0 };

    return best;
  }

  // ── Update context memory ─────────────────────────────────
  function updateContext(userMsg) {
    const norm = normalize(userMsg);
    contextMemory.push(norm);
    if (contextMemory.length > 3) contextMemory.shift();
  }

  // ── Build response object ─────────────────────────────────
  function buildResponse(intentKey, userMsg) {
    const intent = intents[intentKey] || intents["fallback"];
    const starter = intentKey !== "fallback" && intentKey !== "greeting" && intentKey !== "confused_user"
      ? randomStarter() + "\n\n"
      : "";

    const text = starter + intent.answer;

    return {
      text,
      link: intent.link || null,
      cta:  intent.cta  || null,
    };
  }

  // ── Public API ────────────────────────────────────────────
  async function init() {
    await loadData();
    loadFreq();
  }

  function process(userMsg) {
    updateContext(userMsg);
    const { key } = matchIntent(userMsg);

    // Track frequency
    intentFreq[key] = (intentFreq[key] || 0) + 1;
    saveFreq();
    saveLog(userMsg, key);

    return buildResponse(key, userMsg);
  }

  function getLog() {
    try {
      return JSON.parse(localStorage.getItem("aaa_chat_log") || "[]");
    } catch (_) { return []; }
  }

  return { init, process, getLog };

})();
