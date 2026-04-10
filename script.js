// ============================================================
//  Ayush AI Automation — Chatbot Engine v4
//  Dual Mode: Service Guide + FAQ
//  Advanced NLP: Phrase-first → Token scoring → Fuzzy fallback
//  Language support: English, Hindi, Hinglish, Telugu, Tamil
// ============================================================

const CHATBOT = (() => {

  // ── State ──────────────────────────────────────────────────
  let intents    = {};
  let faqData    = {};
  let ctxMemory  = [];   // last 3 normalised msgs
  let intentFreq = {};   // frequency map
  let lastIntent = null; // avoid repeat answers

  // ── Tone starters ─────────────────────────────────────────
  const STARTERS = [
    "Great question! 👇",
    "Here's the deal 👇",
    "Good one! Let me explain 👇",
    "Absolutely! 👇",
    "Here's what you need to know 👇",
    "Let me break that down 👇",
    "Sure thing! 👇",
    "Happy to help 👇",
    "Here's the full picture 👇",
    "Perfect question 👇",
  ];
  const randomStarter = () => STARTERS[Math.floor(Math.random() * STARTERS.length)];

  // ── Load data.json ─────────────────────────────────────────
  async function loadData() {
    try {
      const res  = await fetch("data.json");
      const json = await res.json();
      delete json["_meta"];
      // Separate FAQ intents from service intents
      faqData = {};
      intents = {};
      for (const [k, v] of Object.entries(json)) {
        if (k.startsWith("faq_")) faqData[k] = v;
        else intents[k] = v;
      }
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
      localStorage.setItem("aaa_log", JSON.stringify(log.slice(-200)));
    } catch (_) {}
  }

  // ── Hinglish / Telugu / Tamil → English stem map ──────────
  const LANG_MAP = {
    "kya":"what","kaise":"how","kyun":"why","kab":"when","kahan":"where",
    "kaun":"who","kitna":"how much","kitni":"how much","kitne":"how many",
    "hai":"is","hain":"are","hoga":"will","hogi":"will","karega":"will do",
    "karta":"does","karti":"does","karo":"do","kar":"do","ho":"be",
    "bata":"tell","batao":"tell","samjhao":"explain","dikhao":"show",
    "chahiye":"need","chahta":"want","chahti":"want","dena":"give",
    "milega":"available","milegi":"available","lagta":"seems",
    "lagega":"will cost","lagenge":"will cost","lagti":"costs","lagta":"costs",
    "chalega":"will work","kaam":"work","karte":"do","karunga":"will do",
    "shuru":"start","shuru karo":"start","chalu":"start",
    "paisa":"money","paise":"money","rupee":"rupees","rs":"rupees",
    "mehenga":"expensive","sasta":"cheap","costly":"expensive",
    "mahina":"monthly","mahine":"monthly","subscription":"subscription",
    "acha":"good","achha":"good","theek":"ok","sahi":"right","bilkul":"absolutely",
    "nahi":"not","nai":"not","na":"not","bohot":"very","bahut":"very",
    "zyada":"more","kam":"less","fast":"fast","jaldi":"fast",
    "poora":"full","pura":"full","sabse":"most","sab":"all",
    "sirf":"only","bas":"just","abhi":"now","aaj":"today",
    "dhoka":"scam","dhokha":"scam","fraud":"scam","fake":"fake",
    "trust":"trust","bharosa":"trust","real":"real","genuine":"genuine",
    "safe":"safe","ban":"ban","suspend":"suspend",
    "bhai":"","yaar":"","bro":"","buddy":"","ji":"",
    "haan":"yes","hmm":"","aur":"and","ya":"or",
    "toh":"","phir":"","lekin":"but","par":"but",
    "agar":"if","jab":"when","wala":"","wali":"","wale":"",
    "ela":"how","enti":"what","cheppandi":"tell","meru":"you",
    "meeru":"you","nenu":"i","entha":"how much","avutundi":"is",
    "pani":"work","chestundi":"does","start":"start","join":"join",
    "anna":"brother","chala":"very","manchi":"good",
    "baagundi":"good","naku":"me","mee":"your","ikkade":"here",
    "adugutunnanu":"asking","help":"help","kaavalante":"needed",
    "vanakkam":"hello","enna":"what","epdi":"how","ethanai":"how much",
    "eppadi":"how","naan":"i","ungal":"your","ungalukku":"for you",
    "vilai":"price","selavu":"cost","thogai":"amount","thodangu":"start",
    "vendum":"need","seiya":"do","aagum":"will cost","paarkalam":"see",
    "nandri":"thanks","seri":"ok","romba":"very","nalla":"good",
  };

  // ── Grammar / filler words to IGNORE ──────────────────────
  const GRAMMAR_WORDS = new Set([
    "i","me","my","the","a","an","is","are","was","were","be","been",
    "have","has","had","do","does","did","will","would","could","should",
    "can","may","might","to","of","in","on","at","for","with","by","from",
    "up","into","than","so","and","or","not","no","if","that","this","it",
    "its","we","you","your","he","she","they","there","what","how","when",
    "where","which","who","am","just","very","get","got","let","our","us",
    "about","would","want","need","tell","know","like","also","too",
    "please","thanks","ok","okay","yes","no","hi","hey","hello",
    "bhai","yaar","bro","dost","ji","sahab","sir","mam","beta",
    "haan","nahi","hai","hain","tha","thi","the","ho","hoga","hogi",
    "karo","karna","karta","karti","kar","karo","kiye","kiya",
    "toh","phir","aur","ya","lekin","par","agar","jab","jabki",
    "wala","wali","wale","ka","ki","ke","ko","se","mein","pe","par",
    "ek","do","teen","iss","us","ye","wo","yeh","woh",
    "bahut","bohot","bilkul","zaroor","sach","seedha",
    "hmm","achha","theek","sahi","acha","ok","okay",
  ]);

  // ── HIGH-VALUE content words (2x weight) ──────────────────
  const HIGH_VALUE_WORDS = new Set([
    "price","pricing","cost","charge","fee","payment","money","rupees","paise",
    "free","trial","plan","starter","growth","subscription","monthly",
    "instagram","whatsapp","automation","bot","dm","lead","client","booking",
    "demo","setup","safety","safe","scam","fraud","guarantee","refund",
    "how","works","start","result","follow","filter","qualify",
    "expensive","cheap","affordable","discount","offer",
    "manychat","tools","software","tagging","comment","story","reengagement",
    "notification","alert","hotlead","va","virtual","organic",
  ]);

  // ── Normalise ──────────────────────────────────────────────
  function normalise(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ── Apply language map ─────────────────────────────────────
  function applyLangMap(text) {
    return text.split(" ")
      .map(w => LANG_MAP.hasOwnProperty(w) ? (LANG_MAP[w] || "") : w)
      .filter(w => w.length > 0)
      .join(" ");
  }

  // ── Tokenise ───────────────────────────────────────────────
  function tokenise(text) {
    return text.split(" ").filter(w => w.length > 1 && !GRAMMAR_WORDS.has(w));
  }

  // ── Bigrams / Trigrams ────────────────────────────────────
  function bigrams(tokens) {
    const bg = [];
    for (let i = 0; i < tokens.length - 1; i++) bg.push(tokens[i] + " " + tokens[i+1]);
    return bg;
  }
  function trigrams(tokens) {
    const tg = [];
    for (let i = 0; i < tokens.length - 2; i++) tg.push(tokens[i] + " " + tokens[i+1] + " " + tokens[i+2]);
    return tg;
  }

  // ── Levenshtein distance ───────────────────────────────────
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

  // ── Word similarity score ──────────────────────────────────
  function wordSim(w1, w2) {
    if (w1 === w2) return 1.0;
    if (w1.length < 3 || w2.length < 3) return 0;
    if (w1.length >= 4 && w2.includes(w1)) return 0.88;
    if (w2.length >= 4 && w1.includes(w2)) return 0.85;
    const minLen = Math.min(w1.length, w2.length);
    if (minLen >= 4) {
      let pfx = 0;
      for (let i = 0; i < minLen; i++) { if (w1[i] === w2[i]) pfx++; else break; }
      if (pfx >= 4) return 0.80;
    }
    const dist = lev(w1, w2);
    const maxL = Math.max(w1.length, w2.length);
    if (maxL === 0) return 0;
    const sim = 1 - dist / maxL;
    return sim >= 0.75 ? sim : 0;
  }

  // ── PHASE 1: Exact phrase match ────────────────────────────
  function phraseScore(fullText, intent) {
    const phrases = intent.phrases || [];
    let score = 0, matched = 0;
    for (const phrase of phrases) {
      const normPhrase   = normalise(phrase);
      const mappedPhrase = applyLangMap(normPhrase);
      if (fullText.includes(normPhrase)) {
        score += 3.0 + (normPhrase.split(" ").filter(Boolean).length * 0.5);
        matched++; continue;
      }
      const mappedText = applyLangMap(fullText);
      if (mappedText.includes(mappedPhrase)) {
        score += 2.5 + (mappedPhrase.split(" ").filter(Boolean).length * 0.4);
        matched++;
      }
    }
    return { score, matched };
  }

  // ── PHASE 2: Keyword token matching ───────────────────────
  function keywordScore(tokens, bgrams_arr, tgrams_arr, intent) {
    const keywords = intent.keywords || [];
    let score = 0;
    let matchedSet = new Set();

    for (const kw of keywords) {
      if (matchedSet.has(kw)) continue;
      const kwNorm   = normalise(kw);
      const kwMapped = applyLangMap(kwNorm);
      const kwTokens = tokenise(kwMapped);
      if (kwTokens.length === 0) continue;

      if (kwTokens.length >= 3) {
        const kwTg = trigrams(kwTokens);
        for (const tg of tgrams_arr) {
          for (const kt of kwTg) {
            if (tg === kt) { score += 3.5; matchedSet.add(kw); break; }
          }
          if (matchedSet.has(kw)) break;
        }
      }
      if (matchedSet.has(kw)) continue;

      if (kwTokens.length >= 2) {
        const kwBg = bigrams(kwTokens);
        for (const bg of bgrams_arr) {
          for (const kb of kwBg) {
            if (bg === kb) { score += 2.5; matchedSet.add(kw); break; }
          }
          if (matchedSet.has(kw)) break;
        }
      }
      if (matchedSet.has(kw)) continue;

      const joinedTokens = tokens.join(" ");
      if (!matchedSet.has(kw) && joinedTokens.includes(kwNorm)) {
        score += 2.0; matchedSet.add(kw);
      }
      if (matchedSet.has(kw)) continue;

      for (const kwt of kwTokens) {
        if (kwt.length < 2) continue;
        let best = 0;
        for (const t of tokens) {
          const s = wordSim(t, kwt);
          if (s > best) best = s;
        }
        if (best > 0) {
          const multiplier    = HIGH_VALUE_WORDS.has(kwt) ? 1.8 : 1.0;
          const multiWordBonus = kwTokens.length > 1 ? 1.3 : 1.0;
          score += best * multiplier * multiWordBonus;
          matchedSet.add(kw); break;
        }
      }
    }

    let multiBonus = 0;
    if (matchedSet.size >= 2) multiBonus = matchedSet.size * 0.4;
    if (matchedSet.size >= 4) multiBonus = matchedSet.size * 0.6;
    if (matchedSet.size >= 6) multiBonus = matchedSet.size * 0.8;

    return { score: score + multiBonus, matched: matchedSet.size };
  }

  // ── Context-aware query expansion ─────────────────────────
  function buildContextQuery(msg) {
    const recent = ctxMemory.slice(-2).join(" ");
    return recent ? recent + " " + msg : msg;
  }

  // ── Language detection ─────────────────────────────────────
  function detectLanguage(text) {
    const teluguWords = ["ela","enti","cheppandi","meru","meeru","nenu","entha","anna","chala","manchi","baagundi","naku","ikkade"];
    const tamilWords  = ["vanakkam","enna","epdi","ethanai","eppadi","naan","ungal","vilai","selavu","thogai","thodangu","vendum","nandri","seri","romba"];
    const hindiWords  = ["kya","kaise","kyun","kitna","bhai","yaar","paisa","paise","lagega","lagenge","milega","chahiye","batao"];
    const words = text.toLowerCase().split(" ");
    let teluguScore = 0, tamilScore = 0, hindiScore = 0;
    for (const w of words) {
      if (teluguWords.includes(w)) teluguScore++;
      if (tamilWords.includes(w))  tamilScore++;
      if (hindiWords.includes(w))  hindiScore++;
    }
    if (teluguScore > tamilScore && teluguScore > 0) return "telugu";
    if (tamilScore > teluguScore && tamilScore > 0)  return "tamil";
    if (hindiScore > 0) return "hinglish";
    return "english";
  }

  // ── Score a specific intent ────────────────────────────────
  function matchSpecificLanguage(rawNorm, tokens, bgrams_arr, tgrams_arr, intentKey) {
    const intent = intents[intentKey];
    if (!intent) return { score: 0 };
    const p1 = phraseScore(rawNorm, intent);
    const p2 = keywordScore(tokens, bgrams_arr, tgrams_arr, intent);
    return { score: p1.score + p2.score };
  }

  // ── Main match function ────────────────────────────────────
  function match(userMsg, pool) {
    const rawNorm  = normalise(userMsg);
    const lang     = detectLanguage(rawNorm);
    const mapped   = applyLangMap(rawNorm);
    const ctxQuery = applyLangMap(normalise(buildContextQuery(userMsg)));
    const tokens   = tokenise(ctxQuery);
    const bg       = bigrams(tokens);
    const tg       = trigrams(tokens);

    if (tokens.length === 0) return "fallback";

    if (!pool) {
      if (lang === "telugu") {
        const s = matchSpecificLanguage(rawNorm, tokens, bg, tg, "telugu_general");
        if (s.score >= 0.5) return "telugu_general";
      }
      if (lang === "tamil") {
        const s = matchSpecificLanguage(rawNorm, tokens, bg, tg, "tamil_general");
        if (s.score >= 0.5) return "tamil_general";
      }
    }

    const source = pool || intents;
    let best = { key: "fallback", score: 0.60 };

    for (const [key, intent] of Object.entries(source)) {
      if (key === "fallback" || key === "_meta") continue;
      const p1 = phraseScore(rawNorm, intent);
      const p1m = phraseScore(mapped, intent);
      const p2 = keywordScore(tokens, bg, tg, intent);
      const totalScore = (p1.score * 1.5) + (p1m.score * 1.2) + p2.score;
      const freq      = intentFreq[key] || 0;
      const freqBoost = Math.min(freq * 0.03, 0.25);
      const finalScore = totalScore + freqBoost;
      if (finalScore > best.score) best = { key, score: finalScore };
    }

    return best.key;
  }

  // ── Update context memory ──────────────────────────────────
  function addCtx(msg) {
    const processed = applyLangMap(normalise(msg));
    ctxMemory.push(processed);
    if (ctxMemory.length > 3) ctxMemory.shift();
  }

  // ── Build response object ──────────────────────────────────
  function buildResp(key, pool) {
    const source    = pool || intents;
    const intent    = source[key] || intents["fallback"];
    const skipStart = ["fallback","greeting","confused","ok_response","telugu_general","tamil_general"].includes(key);
    const starter   = skipStart ? "" : randomStarter() + "\n\n";
    return {
      text  : starter + intent.answer,
      link  : intent.link || null,
      cta   : intent.cta  || null,
      intent: key,
      isFaq : !!pool,
    };
  }

  // ── Get top FAQ keys for display ──────────────────────────
  function getTopFaqs(n = 6) {
    return Object.keys(faqData).slice(0, n);
  }

  // ── Get FAQ by key ─────────────────────────────────────────
  function getFaq(key) {
    const intent = faqData[key];
    if (!intent) return null;
    return {
      text  : intent.answer,
      link  : intent.link || null,
      cta   : intent.cta  || null,
      intent: key,
      isFaq : true,
    };
  }

  // ── Public API ─────────────────────────────────────────────
  async function init() {
    await loadData();
    loadFreq();
  }

  function process(userMsg, mode) {
    addCtx(userMsg);
    let key, pool = null;
    if (mode === "faq") {
      pool = faqData;
      key  = match(userMsg, pool);
      if (key === "fallback") key = match(userMsg); // fallback to service
    } else {
      key = match(userMsg);
    }
    intentFreq[key] = (intentFreq[key] || 0) + 1;
    saveFreq();
    saveLog(userMsg, key);
    lastIntent = key;
    return buildResp(key, key.startsWith("faq_") ? faqData : null);
  }

  function debugMatch(userMsg) {
    const rawNorm  = normalise(userMsg);
    const mapped   = applyLangMap(rawNorm);
    const ctxQuery = applyLangMap(normalise(buildContextQuery(userMsg)));
    const tokens   = tokenise(ctxQuery);
    const lang     = detectLanguage(rawNorm);
    const bg       = bigrams(tokens);
    const tg       = trigrams(tokens);
    const scores   = {};
    const allIntents = { ...intents, ...faqData };
    for (const [key, intent] of Object.entries(allIntents)) {
      if (key === "fallback" || key === "_meta") continue;
      const p1 = phraseScore(rawNorm, intent);
      const p2 = keywordScore(tokens, bg, tg, intent);
      scores[key] = {
        phraseScore : p1.score.toFixed(2),
        keywordScore: p2.score.toFixed(2),
        total       : (p1.score * 1.5 + p2.score).toFixed(2),
      };
    }
    const sorted = Object.entries(scores).sort((a,b) => b[1].total - a[1].total).slice(0, 5);
    return { lang, tokens, mapped, top5: sorted };
  }

  return { init, process, getTopFaqs, getFaq, faqData: () => faqData, debugMatch };

})();
