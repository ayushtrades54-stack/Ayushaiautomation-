/* ==============================================
   LAB — INTERACTIVE TOOLS
   toggleMenu(), canvas backgrounds, and scroll-reveal
   are already provided by ../main.js — not duplicated here.
============================================== */

/* =========================================================
   TOOL 1: INSTAGRAM ROI CALCULATOR
   All business assumptions live in one place (CALC_ASSUMPTIONS)
   so they can be tuned later without touching the formulas.
========================================================= */

/* ---- EDITABLE ASSUMPTIONS -------------------------------
   Change these constants any time — every formula below
   reads from here, nothing is hardcoded inline.
------------------------------------------------------------ */
const CALC_ASSUMPTIONS = {
  // Of the DMs that currently go unanswered, what % would an
  // always-on automation system realistically catch and engage?
  // (Not 100% — some DMs are still low-intent even when replied to.)
  RECOVERY_RATE: 0.75,

  // Of a conversation that gets engaged (replied to), what % typically
  // progresses far enough to reach a booked-call stage? This is
  // independent of the user's close rate, which applies AFTER a call.
  LEAD_TO_CALL_RATE: 0.4,

  // Automation removes repetitive manual replying, but a coach still
  // spends some time on hot leads / calls. This is the realistic
  // ceiling of weekly time that gets freed up.
  TIME_SAVED_RATE: 0.65,

  // Of the DMs a coach DOES reply to, what % typically go quiet before
  // ever reaching a booked call — the lead replied, engaged a bit, then
  // stopped responding. This leak exists independently of reply speed,
  // which is why a 100% reply rate alone doesn't mean zero lost revenue.
  QUIET_LEAD_RATE: 0.35,

  // Of those quiet leads, what % would a structured automated follow-up
  // sequence (1hr / 24hr / 3-day style) realistically re-engage, based
  // on how the coach currently handles quiet leads.
  FOLLOWUP_RECOVERY_BY_HABIT: {
    always: 0.05,    // already has a real follow-up system — little left to recover
    sometimes: 0.45, // partial/manual follow-up — real but inconsistent recovery
    never: 0.75,     // no follow-up at all — highest recoverable upside
  },

  // Sanity caps used purely for input validation below.
  MAX_DM_VOLUME: 100000,
  MAX_CLIENT_VALUE: 1000000,
  MAX_HOURS_PER_WEEK: 168,
};

/* ---- VALIDATION ------------------------------------------ */
function validateROIInputs(values) {
  const errors = {};

  if (values.dmVolume === "" || isNaN(values.dmVolume)) {
    errors.dmVolume = "Enter how many DMs you get per month.";
  } else if (values.dmVolume < 1) {
    errors.dmVolume = "Must be at least 1.";
  } else if (values.dmVolume > CALC_ASSUMPTIONS.MAX_DM_VOLUME) {
    errors.dmVolume = `That's unrealistically high — check the number.`;
  }

  if (values.replyRate === "" || isNaN(values.replyRate)) {
    errors.replyRate = "Enter your current reply rate.";
  } else if (values.replyRate < 0 || values.replyRate > 100) {
    errors.replyRate = "Must be between 0 and 100.";
  }

  if (values.closeRate === "" || isNaN(values.closeRate)) {
    errors.closeRate = "Enter your close rate on booked calls.";
  } else if (values.closeRate < 0 || values.closeRate > 100) {
    errors.closeRate = "Must be between 0 and 100.";
  }

  if (values.clientValue === "" || isNaN(values.clientValue)) {
    errors.clientValue = "Enter your average client value.";
  } else if (values.clientValue <= 0) {
    errors.clientValue = "Must be greater than 0.";
  } else if (values.clientValue > CALC_ASSUMPTIONS.MAX_CLIENT_VALUE) {
    errors.clientValue = "That's unrealistically high — check the number.";
  }

  if (values.hoursSpent === "" || isNaN(values.hoursSpent)) {
    errors.hoursSpent = "Enter hours/week spent on manual replies.";
  } else if (values.hoursSpent < 0) {
    errors.hoursSpent = "Cannot be negative.";
  } else if (values.hoursSpent > CALC_ASSUMPTIONS.MAX_HOURS_PER_WEEK) {
    errors.hoursSpent = "Can't exceed 168 hours in a week.";
  }

  if (!values.followupHabit) {
    errors.followupHabit = "Select what happens when a lead goes quiet.";
  }

  return errors;
}

function clearROIErrors() {
  ["dmVolume", "replyRate", "closeRate", "clientValue", "hoursSpent", "followupHabit"].forEach((id) => {
    const errEl = document.getElementById("err-" + id);
    const inputEl = document.getElementById(id);
    if (errEl) errEl.textContent = "";
    if (inputEl) inputEl.classList.remove("lab-input-invalid");
  });
  document.getElementById("validationSummary").style.display = "none";
}

function animateCount(el, target, prefix = "", suffix = "") {
  const start = 0;
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.round(start + (target - start) * progress);
    el.textContent = prefix + value.toLocaleString("en-IN") + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function calculateROI() {
  clearROIErrors();

  const raw = {
    dmVolume: document.getElementById("dmVolume").value.trim(),
    replyRate: document.getElementById("replyRate").value.trim(),
    closeRate: document.getElementById("closeRate").value.trim(),
    clientValue: document.getElementById("clientValue").value.trim(),
    hoursSpent: document.getElementById("hoursSpent").value.trim(),
    followupHabit: document.getElementById("followupHabit").value.trim(),
  };

  const values = {
    dmVolume: raw.dmVolume === "" ? "" : parseFloat(raw.dmVolume),
    replyRate: raw.replyRate === "" ? "" : parseFloat(raw.replyRate),
    closeRate: raw.closeRate === "" ? "" : parseFloat(raw.closeRate),
    clientValue: raw.clientValue === "" ? "" : parseFloat(raw.clientValue),
    hoursSpent: raw.hoursSpent === "" ? "" : parseFloat(raw.hoursSpent),
    followupHabit: raw.followupHabit,
  };

  const errors = validateROIInputs(values);

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => {
      document.getElementById("err-" + field).textContent = message;
      document.getElementById(field).classList.add("lab-input-invalid");
    });
    const summary = document.getElementById("validationSummary");
    summary.innerHTML =
      "<strong>Please fix the highlighted fields:</strong> " +
      Object.values(errors).join(" ");
    summary.style.display = "block";
    return; // do not calculate until every field is valid
  }

  const { dmVolume, replyRate, closeRate, clientValue, hoursSpent, followupHabit } = values;
  const { RECOVERY_RATE, LEAD_TO_CALL_RATE, TIME_SAVED_RATE, QUIET_LEAD_RATE, FOLLOWUP_RECOVERY_BY_HABIT } =
    CALC_ASSUMPTIONS;

  // ---- LEAK 1: DMs that never get a reply at all -----------------
  // 1. DMs that currently never get a reply at all.
  const missedConversations = dmVolume * (1 - replyRate / 100);

  // 2. Of those, how many would an automation system realistically
  //    catch and turn into an active conversation.
  const recoverableConversations = missedConversations * RECOVERY_RATE;

  // 3. Of the recovered conversations, how many reach a booked call.
  const recoverableBookedCalls = recoverableConversations * LEAD_TO_CALL_RATE;

  // 4. Revenue currently being left on the table from unanswered DMs
  //    (100% of missed DMs, carried through the call + close funnel).
  const revenueLostFromMissed =
    missedConversations * LEAD_TO_CALL_RATE * (closeRate / 100) * clientValue;

  // 5. Revenue automation would realistically recover from that leak.
  const revenueRecoveredFromMissed = revenueLostFromMissed * RECOVERY_RATE;

  // ---- LEAK 2: replied-to leads who go quiet before booking -------
  // This leak exists even at a 100% reply rate — replying fast doesn't
  // mean anyone follows up when a warm lead stops responding.
  // 6. DMs that get a reply but go quiet before a booked call.
  const repliedConversations = dmVolume * (replyRate / 100);
  const quietLeads = repliedConversations * QUIET_LEAD_RATE;

  // 7. Of those quiet leads, how many an automated follow-up sequence
  //    would realistically re-engage, based on current follow-up habit.
  const followupRecoveryRate = FOLLOWUP_RECOVERY_BY_HABIT[followupHabit] ?? 0;
  const recoverableQuietLeads = quietLeads * followupRecoveryRate;

  // 8. Of the re-engaged quiet leads, how many reach a booked call.
  const recoverableQuietBookings = recoverableQuietLeads * LEAD_TO_CALL_RATE;

  // 9. Revenue that follow-up automation would realistically recover
  //    from this leak (already scaled by what's recoverable — this is
  //    upside, not a "loss" figure, since it depends on habit chosen).
  const revenueRecoveredFromQuiet =
    recoverableQuietBookings * (closeRate / 100) * clientValue;

  // ---- COMBINED TOTALS ---------------------------------------------
  const estimatedRevenueLost = revenueLostFromMissed;
  const monthlyRevenueRecovered = revenueRecoveredFromMissed + revenueRecoveredFromQuiet;
  const totalRecoverableBookedCalls = recoverableBookedCalls + recoverableQuietBookings;

  // 10. Time freed up weekly — automation doesn't remove 100% of hours,
  //     coaches still handle hot leads and calls personally.
  const weeklyHoursSaved = hoursSpent * TIME_SAVED_RATE;

  // 11. Same monthly recovery, annualized.
  const yearlyOpportunityValue = monthlyRevenueRecovered * 12;

  animateCount(document.getElementById("statMissed"), Math.round(missedConversations));
  animateCount(document.getElementById("statRecoverable"), Math.round(recoverableConversations));
  animateCount(document.getElementById("statBookings"), Math.round(totalRecoverableBookedCalls));
  animateCount(document.getElementById("statQuietLeads"), Math.round(quietLeads));
  animateCount(document.getElementById("statLeadsLost"), Math.round(estimatedRevenueLost), "₹");
  animateCount(document.getElementById("statPotential"), Math.round(monthlyRevenueRecovered), "₹");
  animateCount(document.getElementById("statTime"), Math.round(weeklyHoursSaved), "", " hrs");
  animateCount(document.getElementById("statYearly"), Math.round(yearlyOpportunityValue), "₹");

  document.getElementById("exp-statMissed").textContent =
    `${dmVolume} DMs × (100% − ${replyRate}% reply rate).`;
  document.getElementById("exp-statRecoverable").textContent =
    `Missed conversations × ${Math.round(RECOVERY_RATE * 100)}% realistic automation recovery rate.`;
  document.getElementById("exp-statBookings").textContent =
    `Recovered from missed DMs + recovered from quiet leads, each × ${Math.round(LEAD_TO_CALL_RATE * 100)}% conversation-to-booked-call rate.`;
  document.getElementById("exp-statQuietLeads").textContent =
    `${repliedConversations.toFixed(0)} replied DMs × ${Math.round(QUIET_LEAD_RATE * 100)}% typical drop-off before booking — this leak exists even at a high reply rate.`;
  document.getElementById("exp-statLeadsLost").textContent =
    `Missed conversations → calls → clients (${closeRate}% close rate) × ₹${clientValue.toLocaleString("en-IN")} client value. Doesn't include the quiet-lead leak below.`;
  document.getElementById("exp-statPotential").textContent =
    `Recovered from missed DMs (₹${Math.round(revenueRecoveredFromMissed).toLocaleString("en-IN")}) + recovered from quiet leads via follow-up (₹${Math.round(revenueRecoveredFromQuiet).toLocaleString("en-IN")}).`;
  document.getElementById("exp-statTime").textContent =
    `${hoursSpent} hrs/week × ${Math.round(TIME_SAVED_RATE * 100)}% typical time freed by automation.`;
  document.getElementById("exp-statYearly").textContent =
    `Monthly revenue recovered × 12 months.`;

  document.getElementById("roiHelperText").textContent =
    "Based on the numbers you entered and the assumptions above — here's what's realistically on the table every month.";

  renderROIWhatsAppButton({
    dmVolume, replyRate, closeRate, clientValue,
    missedConversations, quietLeads,
    estimatedRevenueLost, monthlyRevenueRecovered, yearlyOpportunityValue,
  });
}

/* Optional, non-gating: lets the coach send themselves (or Ayush) a
   WhatsApp message with their own numbers — same wa.me pattern already
   used in the footer. No data is stored or sent anywhere automatically. */
function renderROIWhatsAppButton(r) {
  const el = document.getElementById("roiWhatsAppWrap");
  if (!el) return;
  const text =
    `My Instagram ROI numbers from the Lab calculator:\n` +
    `- DMs/month: ${r.dmVolume}, reply rate: ${r.replyRate}%, close rate: ${r.closeRate}%\n` +
    `- Missed conversations/month: ${Math.round(r.missedConversations)}\n` +
    `- Quiet leads (replied, then went cold)/month: ${Math.round(r.quietLeads)}\n` +
    `- Estimated revenue lost/month: ₹${Math.round(r.estimatedRevenueLost).toLocaleString("en-IN")}\n` +
    `- Revenue recoverable/month: ₹${Math.round(r.monthlyRevenueRecovered).toLocaleString("en-IN")}\n` +
    `- Yearly opportunity: ₹${Math.round(r.yearlyOpportunityValue).toLocaleString("en-IN")}\n` +
    `Can we talk through this?`;
  const phone = (window.SITE_DATA && window.SITE_DATA.CONTACT && window.SITE_DATA.CONTACT.phone) || "919477293867";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  el.innerHTML = `<a href="${url}" target="_blank" rel="noopener" class="btn-secondary">Send Me This Report on WhatsApp</a>`;
}

/* =========================================================
   TOOL 2: AUTOMATION HEALTH SCORE (QUIZ)
========================================================= */
const QUIZ_QUESTIONS = [
  {
    q: "How fast do you usually reply to a new Instagram DM?",
    category: "response",
    options: [
      { text: "Within a few minutes", score: 4 },
      { text: "Within a few hours", score: 3 },
      { text: "By the end of the day", score: 2 },
      { text: "Sometimes I forget to reply", score: 1 },
    ],
  },
  {
    q: "Do you ask qualifying questions before pitching your program?",
    category: "conversion",
    options: [
      { text: "Yes, every single time", score: 4 },
      { text: "Sometimes, depends on the lead", score: 2 },
      { text: "No, I pitch right away", score: 1 },
    ],
  },
  {
    q: "What happens when someone goes quiet mid-conversation?",
    category: "followup",
    options: [
      { text: "Automatic follow-up sequence kicks in", score: 4 },
      { text: "I try to remember to follow up manually", score: 2 },
      { text: "Nothing — they're gone", score: 1 },
    ],
  },
  {
    q: "Do you separate serious leads from casual browsers?",
    category: "automation",
    options: [
      { text: "Yes, an automated system tags them", score: 4 },
      { text: "I judge it manually while chatting", score: 2 },
      { text: "No, I treat every DM the same", score: 1 },
    ],
  },
  {
    q: "How do people currently book a call with you?",
    category: "conversion",
    options: [
      { text: "Auto-sent booking link after qualification", score: 4 },
      { text: "I send the link manually when it feels right", score: 2 },
      { text: "There's no clear booking step", score: 1 },
    ],
  },
  {
    q: "What happens to DMs that come in at night or on weekends?",
    category: "response",
    options: [
      { text: "They get an instant reply either way", score: 4 },
      { text: "They wait until I'm free", score: 2 },
      { text: "They often get missed entirely", score: 1 },
    ],
  },
  {
    q: "Do you re-engage old / cold leads from weeks ago?",
    category: "followup",
    options: [
      { text: "Yes, on a regular system", score: 4 },
      { text: "Occasionally, if I remember", score: 2 },
      { text: "Never — once cold, they're forgotten", score: 1 },
    ],
  },
  {
    q: "How many hours per week do you spend manually replying to DMs?",
    category: "automation",
    options: [
      { text: "Less than 2 hours — mostly automated", score: 4 },
      { text: "5–10 hours", score: 2 },
      { text: "10+ hours", score: 1 },
    ],
  },
];

let quizIndex = 0;
let quizAnswers = [];

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[quizIndex];
  const body = document.getElementById("quizBody");
  document.getElementById("quizProgress").style.width =
    ((quizIndex) / QUIZ_QUESTIONS.length) * 100 + "%";

  let html = `<div class="lab-quiz-question">Question ${quizIndex + 1} of ${QUIZ_QUESTIONS.length}<br><strong>${q.q}</strong></div>`;
  html += `<div class="lab-quiz-options">`;
  q.options.forEach((opt, i) => {
    html += `<button class="lab-quiz-option" onclick="selectQuizOption(${i})">${opt.text}</button>`;
  });
  html += `</div>`;
  body.innerHTML = html;
}

function selectQuizOption(optionIndex) {
  const q = QUIZ_QUESTIONS[quizIndex];
  quizAnswers.push({ category: q.category, score: q.options[optionIndex].score });
  quizIndex++;
  if (quizIndex < QUIZ_QUESTIONS.length) {
    renderQuizQuestion();
  } else {
    showQuizResults();
  }
}

function avgScoreFor(category) {
  const relevant = quizAnswers.filter((a) => a.category === category);
  if (!relevant.length) return 0;
  const sum = relevant.reduce((s, a) => s + a.score, 0);
  return Math.round((sum / (relevant.length * 4)) * 100);
}

function showQuizResults() {
  document.getElementById("quizProgress").style.width = "100%";
  document.getElementById("quizCard").style.display = "none";

  const scores = {
    "Lead Response Score": avgScoreFor("response"),
    "Follow-up Score": avgScoreFor("followup"),
    "Conversion Score": avgScoreFor("conversion"),
    "Automation Score": avgScoreFor("automation"),
  };

  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  let level = "Manual Hustler";
  if (overall >= 85) level = "Fully Automated Operator";
  else if (overall >= 65) level = "Semi-Automated Coach";
  else if (overall >= 40) level = "Reactive Repliers";

  document.getElementById("scoreLevel").textContent = `${overall}/100 — ${level}`;

  const barsEl = document.getElementById("scoreBars");
  barsEl.innerHTML = Object.entries(scores)
    .map(
      ([label, val]) => `
      <div class="lab-score-bar-row">
        <div class="lab-score-bar-label"><span>${label}</span><span>${val}/100</span></div>
        <div class="lab-score-bar-track"><div class="lab-score-bar-fill" style="width:${val}%;"></div></div>
      </div>`
    )
    .join("");

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  Object.entries(scores).forEach(([label, val]) => {
    if (val >= 70) strengths.push(label.replace(" Score", ""));
    else weaknesses.push(label.replace(" Score", ""));
  });

  if (scores["Lead Response Score"] < 70)
    recommendations.push("Set up instant auto-replies so no DM waits more than 60 seconds — even at night.");
  if (scores["Follow-up Score"] < 70)
    recommendations.push("Add a 1hr / 24hr / 3-day automated follow-up sequence for leads who go quiet.");
  if (scores["Conversion Score"] < 70)
    recommendations.push("Add qualifying questions before pitching, and auto-send your booking link only to serious leads.");
  if (scores["Automation Score"] < 70)
    recommendations.push("Move repetitive replies and lead tagging off your plate with a DM automation system.");
  if (!recommendations.length)
    recommendations.push("Your system is strong — focus on monthly optimization to push conversion even higher.");

  document.getElementById("strengthsList").innerHTML =
    strengths.map((s) => `<li>${s}</li>`).join("") || "<li>Keep taking the assessment seriously — build from here.</li>";
  document.getElementById("weaknessesList").innerHTML =
    weaknesses.map((s) => `<li>${s}</li>`).join("") || "<li>No major weak spots found.</li>";
  document.getElementById("recommendationsList").innerHTML =
    recommendations.map((s) => `<li>${s}</li>`).join("");

  renderProductFit(scores);
  renderQuizShareButton(overall, level);

  document.getElementById("quizResults").style.display = "block";
  document.getElementById("quizResults").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------------------------------------------------
   Product fit — maps weak categories to the product that
   actually addresses them, using real capability differences
   (never sells up by default; picks the cheaper fit when the
   gap doesn't need more than that).
   NOTE: this quiz doesn't ask about voice notes or ticket size,
   so it never recommends Business — that's flagged as a
   separate question to ask on a call instead of guessed at.
--------------------------------------------------------- */
function renderProductFit(scores) {
  const el = document.getElementById("productFit");
  if (!el) return;

  const followWeak = scores["Follow-up Score"] < 70;
  const convWeak = scores["Conversion Score"] < 70;

  let product, why;
  if (followWeak || convWeak) {
    product = "Pro";
    const reasons = [];
    if (convWeak) reasons.push("no qualification before you pitch");
    if (followWeak) reasons.push("no follow-up when a lead goes quiet");
    why =
      `Your gap is ${reasons.join(" and ")} — that's exactly what Pro adds on top of basic replies: ` +
      `locked qualifying questions asked in your order, and an automated follow-up sequence for leads who stop responding.`;
  } else {
    product = "Basic";
    why =
      `Your response handling is the main gap, and qualification/follow-up already look reasonable — ` +
      `Basic (auto-replies from your own FAQ answers, no qualification step) covers this without paying for a stage you don't need yet.`;
  }

  const anchor = product.toLowerCase();
  el.innerHTML = `
    <div class="lab-product-fit-card">
      <span class="lab-resource-tag">Suggested fit</span>
      <h4>${product}</h4>
      <p>${why}</p>
      <p class="lab-product-fit-note">If your audience is voice-heavy or higher-ticket, Business adds voice notes and AI-written follow-ups on top of Pro — this assessment doesn't test for that, so ask on a call if it applies to you.</p>
      <a href="../resources/products.html#${anchor}">See what ${product} includes →</a>
    </div>`;
}

/* Share hook — WhatsApp/Instagram is where this audience already lives,
   so a scored result is a built-in referral loop rather than a growth gimmick. */
function renderQuizShareButton(overall, level) {
  const el = document.getElementById("quizShareWrap");
  if (!el) return;
  const shareText = `I scored ${overall}/100 (${level}) on the Automation Health Score for fitness coaches. Check yours free: https://www.ayushaiautomation.in/lab/index.html#health-score`;
  const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  el.innerHTML = `<a href="${url}" target="_blank" rel="noopener" class="btn-secondary">Share My Score</a>`;
}

function restartQuiz() {
  quizIndex = 0;
  quizAnswers = [];
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizCard").style.display = "block";
  renderQuizQuestion();
  document.getElementById("quizCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================================================
   TOOL 3: RESOURCE LIBRARY
   ---------------------------------------------------------
   The resource data itself lives in SITE_DATA.LAB_RESOURCES
   (site-data.js) so it can be edited in one central place —
   add a card, remove a card, change any text, without touching
   this file. Only the small icon set below lives here.
========================================================= */

/* Small inline icon set, matched to the icon language already
   used across the rest of the site (services.html, pricing.html). */
const LAB_ICONS = {
  guide:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  trial:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  audit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  default:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
};

/* Resolves the two special buttonURL values so the library never
   has an invented or stale link — both are read live from
   SITE_DATA at render time. */
function resolveResourceURL(resource) {
  if (resource.buttonURL === "guidePdf") {
    return "../" + (window.SITE_DATA.LINKS.guidePdf || "");
  }
  if (resource.buttonURL === "instagram") {
    return window.SITE_DATA.CONTACT.instagram;
  }
  return resource.buttonURL;
}

let activeCategory = "All";

function getResources() {
  return (window.SITE_DATA && window.SITE_DATA.LAB_RESOURCES) || [];
}

function getCategories() {
  return ["All", ...new Set(getResources().map((r) => r.category))];
}

function renderFilterPills() {
  const container = document.getElementById("filterPills");
  container.innerHTML = getCategories()
    .map(
      (cat) =>
        `<button type="button" class="lab-pill ${cat === activeCategory ? "active" : ""}" onclick="setCategory('${cat.replace(/'/g, "\\'")}')">${cat}</button>`
    )
    .join("");
}

function setCategory(cat) {
  activeCategory = cat;
  renderFilterPills();
  renderLibrary();
}

// Builds one lowercase searchable string per resource: title + description + keywords + category.
function buildSearchIndex(resource) {
  return [resource.title, resource.description, resource.category, ...(resource.keywords || [])]
    .join(" ")
    .toLowerCase();
}

function renderLibrary() {
  const search = document.getElementById("librarySearch").value.toLowerCase().trim();
  const grid = document.getElementById("libraryGrid");

  let filtered = getResources().filter((r) => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch = search === "" || buildSearchIndex(r).includes(search);
    return matchesCategory && matchesSearch;
  });

  // Featured resources surface first within the filtered set.
  filtered = filtered.slice().sort((a, b) => (b.featured === true) - (a.featured === true));

  if (!filtered.length) {
    grid.innerHTML = `<div class="lab-empty-state">No resources match your search — try a different keyword or category.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((r) => {
      const url = resolveResourceURL(r);
      const isExternal = /^https?:\/\//i.test(url);
      const isDownload = r.buttonURL === "guidePdf";
      const attrs = isDownload
        ? ' download'
        : isExternal
        ? ' target="_blank" rel="noopener"'
        : "";
      const icon = LAB_ICONS[r.icon] || LAB_ICONS.default;
      return `
      <div class="ai-card lab-resource-card">
        <div class="ai-mark ai-mark--tool" aria-hidden="true">${icon}</div>
        <span class="lab-resource-tag">${r.category}</span>${r.featured ? '<span class="lab-resource-featured-badge">Featured</span>' : ""}
        <h4>${r.title}</h4>
        <p>${r.description}</p>
        <a href="${url}"${attrs}>${r.buttonText} \u2192</a>
      </div>`;
    })
    .join("");
}

/* =========================================================
   TOOL 4: BEHIND THE SCENES
   ---------------------------------------------------------
   The screenshot list itself lives directly in index.html
   (window.LAB_SNAPSHOTS, right above the script.js include) so
   it's easy to find and edit — add one object per screenshot,
   nothing here needs touching.
========================================================= */

let activeProofCategory = "All";

function getProofItems() {
  return window.LAB_SNAPSHOTS || [];
}

function getProofCategories() {
  return ["All", ...new Set(getProofItems().map((p) => p.category).filter(Boolean))];
}

function renderProofFilterPills() {
  const container = document.getElementById("proofFilterPills");
  if (!container) return;
  container.innerHTML = getProofCategories()
    .map(
      (cat) =>
        `<button type="button" class="lab-pill ${cat === activeProofCategory ? "active" : ""}" onclick="setProofCategory('${cat.replace(/'/g, "\\'")}')">${cat}</button>`
    )
    .join("");
}

function setProofCategory(cat) {
  activeProofCategory = cat;
  renderProofFilterPills();
  renderProofGallery();
}

function buildProofSearchIndex(item) {
  return [item.title, item.description, item.category, ...(item.keywords || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function renderProofGallery() {
  const searchInput = document.getElementById("proofSearch");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const grid = document.getElementById("proofGrid");
  if (!grid) return;

  const filtered = getProofItems().filter((p) => {
    const matchesCategory = activeProofCategory === "All" || p.category === activeProofCategory;
    const matchesSearch = search === "" || buildProofSearchIndex(p).includes(search);
    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="lab-empty-state">${
      getProofItems().length === 0
        ? "Nothing added yet — add one to the LAB_SNAPSHOTS list in index.html and it appears here automatically."
        : "Nothing matches your search — try a different keyword or category."
    }</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => `
      <div class="ai-card lab-proof-card">
        <button type="button" class="lab-proof-image-btn" onclick="openProofLightbox(${window.LAB_SNAPSHOTS.indexOf(p)})" aria-label="View larger: ${p.title}">
          <img src="${p.image}" alt="${p.title}" loading="lazy" class="lab-proof-image">
        </button>
        ${p.category ? `<span class="lab-resource-tag">${p.category}</span>` : ""}
        <h4>${p.title}</h4>
        <p>${p.description || ""}</p>
      </div>`)
    .join("");
}

function openProofLightbox(index) {
  const item = (window.LAB_SNAPSHOTS || [])[index];
  if (!item) return;
  const overlay = document.getElementById("proofLightbox");
  document.getElementById("proofLightboxImg").src = item.image;
  document.getElementById("proofLightboxImg").alt = item.title;
  document.getElementById("proofLightboxCaption").textContent = item.title;
  overlay.style.display = "flex";
}

function closeProofLightbox() {
  document.getElementById("proofLightbox").style.display = "none";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeProofLightbox();
});

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  renderQuizQuestion();
  renderFilterPills();
  renderLibrary();
  renderProofFilterPills();
  renderProofGallery();
});
