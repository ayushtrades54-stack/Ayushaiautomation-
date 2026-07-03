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

  return errors;
}

function clearROIErrors() {
  ["dmVolume", "replyRate", "closeRate", "clientValue", "hoursSpent"].forEach((id) => {
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
  };

  const values = {
    dmVolume: raw.dmVolume === "" ? "" : parseFloat(raw.dmVolume),
    replyRate: raw.replyRate === "" ? "" : parseFloat(raw.replyRate),
    closeRate: raw.closeRate === "" ? "" : parseFloat(raw.closeRate),
    clientValue: raw.clientValue === "" ? "" : parseFloat(raw.clientValue),
    hoursSpent: raw.hoursSpent === "" ? "" : parseFloat(raw.hoursSpent),
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

  const { dmVolume, replyRate, closeRate, clientValue, hoursSpent } = values;
  const { RECOVERY_RATE, LEAD_TO_CALL_RATE, TIME_SAVED_RATE } = CALC_ASSUMPTIONS;

  // 1. DMs that currently never get a reply at all.
  const missedConversations = dmVolume * (1 - replyRate / 100);

  // 2. Of those, how many would an automation system realistically
  //    catch and turn into an active conversation.
  const recoverableConversations = missedConversations * RECOVERY_RATE;

  // 3. Of the recovered conversations, how many reach a booked call.
  const recoverableBookedCalls = recoverableConversations * LEAD_TO_CALL_RATE;

  // 4. Revenue currently being left on the table (100% of missed DMs,
  //    carried through the same call + close funnel) — this is the
  //    "cost of doing nothing" baseline.
  const estimatedRevenueLost =
    missedConversations * LEAD_TO_CALL_RATE * (closeRate / 100) * clientValue;

  // 5. Revenue automation would realistically recover — the same
  //    funnel, but scaled down to what RECOVERY_RATE says is catchable.
  const monthlyRevenueRecovered = estimatedRevenueLost * RECOVERY_RATE;

  // 6. Time freed up weekly — automation doesn't remove 100% of hours,
  //    coaches still handle hot leads and calls personally.
  const weeklyHoursSaved = hoursSpent * TIME_SAVED_RATE;

  // 7. Same monthly recovery, annualized.
  const yearlyOpportunityValue = monthlyRevenueRecovered * 12;

  animateCount(document.getElementById("statMissed"), Math.round(missedConversations));
  animateCount(document.getElementById("statRecoverable"), Math.round(recoverableConversations));
  animateCount(document.getElementById("statBookings"), Math.round(recoverableBookedCalls));
  animateCount(document.getElementById("statLeadsLost"), Math.round(estimatedRevenueLost), "₹");
  animateCount(document.getElementById("statPotential"), Math.round(monthlyRevenueRecovered), "₹");
  animateCount(document.getElementById("statTime"), Math.round(weeklyHoursSaved), "", " hrs");
  animateCount(document.getElementById("statYearly"), Math.round(yearlyOpportunityValue), "₹");

  document.getElementById("exp-statMissed").textContent =
    `${dmVolume} DMs × (100% − ${replyRate}% reply rate).`;
  document.getElementById("exp-statRecoverable").textContent =
    `Missed conversations × ${Math.round(RECOVERY_RATE * 100)}% realistic automation recovery rate.`;
  document.getElementById("exp-statBookings").textContent =
    `Recoverable conversations × ${Math.round(LEAD_TO_CALL_RATE * 100)}% typical conversation-to-booked-call rate.`;
  document.getElementById("exp-statLeadsLost").textContent =
    `Missed conversations → calls → clients (${closeRate}% close rate) × ₹${clientValue.toLocaleString("en-IN")} client value.`;
  document.getElementById("exp-statPotential").textContent =
    `Revenue lost × ${Math.round(RECOVERY_RATE * 100)}% recovery rate — the realistic portion automation reclaims.`;
  document.getElementById("exp-statTime").textContent =
    `${hoursSpent} hrs/week × ${Math.round(TIME_SAVED_RATE * 100)}% typical time freed by automation.`;
  document.getElementById("exp-statYearly").textContent =
    `Monthly revenue recovered × 12 months.`;

  document.getElementById("roiHelperText").textContent =
    "Based on the numbers you entered and the assumptions above — here's what's realistically on the table every month.";
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

  document.getElementById("quizResults").style.display = "block";
  document.getElementById("quizResults").scrollIntoView({ behavior: "smooth", block: "start" });
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
   TO ADD / EDIT A RESOURCE: only touch this array. Copy the
   shape below — cards, buttons, search, filters, and the
   featured badge all generate automatically from it.

   {
     title:       "",
     description: "",
     keywords:    ["", "", ""],   // used for smart search
     buttonText:  "",
     buttonURL:   "",             // any URL — external links open in a new tab
     category:    "",
     icon:        "🔥",           // any emoji
     featured:    false
   }
========================================================= */
const RESOURCES = [
  {
    title: "Free Guide",
    description: "A free guide walking fitness coaches through what DM automation is and how it fits their business.",
    keywords: ["guide", "free", "getting started", "learn", "automation", "coach", "fitness"],
    buttonText: "Get the Guide",
    buttonURL: "../faq.html",
    category: "Getting Started",
    icon: "📘",
    featured: true,
  },
  {
    title: "Free Plan",
    description: "Start with the ₹0 FREE plan — basic auto-replies and FAQ handling, live in minutes.",
    keywords: ["free", "plan", "pricing", "starter", "zero cost", "trial"],
    buttonText: "See Free Plan",
    buttonURL: "../pricing.html",
    category: "Getting Started",
    icon: "🆓",
    featured: true,
  },
  {
    title: "Free Audit",
    description: "Get a free audit of your current Instagram DM setup — what's working, what's leaking leads.",
    keywords: ["audit", "free", "review", "assessment", "check", "dm setup"],
    buttonText: "Request Free Audit",
    buttonURL: "../book.html",
    category: "Getting Started",
    icon: "🔍",
    featured: true,
  },
  {
    title: "Instagram Highlights",
    description: "See saved highlights covering how the automation looks and works, straight from Instagram.",
    keywords: ["instagram", "highlights", "ig", "proof", "social"],
    buttonText: "View Highlights",
    buttonURL: "https://instagram.com/ayush.automation",
    category: "Instagram Resources",
    icon: "📌",
    featured: false,
  },
  {
    title: "Behind The Scenes",
    description: "Behind-the-scenes looks at how client systems get built, direct from Instagram.",
    keywords: ["bts", "behind the scenes", "instagram", "process", "build"],
    buttonText: "See BTS on Instagram",
    buttonURL: "https://instagram.com/ayush.automation",
    category: "Instagram Resources",
    icon: "🎬",
    featured: false,
  },
  {
    title: "Client Results",
    description: "Real client results and outcomes shared on Instagram.",
    keywords: ["results", "proof", "testimonials", "case study", "instagram"],
    buttonText: "See Results on Instagram",
    buttonURL: "https://instagram.com/ayush.automation",
    category: "Instagram Resources",
    icon: "📈",
    featured: false,
  },
  {
    title: "Flow Screenshots",
    description: "Screenshots of real automation flows and conversation examples on Instagram.",
    keywords: ["screenshots", "flow", "manychat", "instagram", "examples"],
    buttonText: "View Screenshots",
    buttonURL: "https://instagram.com/ayush.automation",
    category: "Instagram Resources",
    icon: "🖼️",
    featured: false,
  },
  {
    title: "More on Instagram",
    description: "Follow for ongoing educational content, tips, and future resources as they're posted.",
    keywords: ["instagram", "follow", "educational", "content", "updates"],
    buttonText: "Follow on Instagram",
    buttonURL: "https://instagram.com/ayush.automation",
    category: "Instagram Resources",
    icon: "🔔",
    featured: false,
  },
];

let activeCategory = "All";

function getCategories() {
  return ["All", ...new Set(RESOURCES.map((r) => r.category))];
}

function renderFilterPills() {
  const container = document.getElementById("filterPills");
  container.innerHTML = getCategories()
    .map(
      (cat) =>
        `<button class="lab-pill ${cat === activeCategory ? "active" : ""}" onclick="setCategory('${cat.replace(/'/g, "\\'")}')">${cat}</button>`
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

  let filtered = RESOURCES.filter((r) => {
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
      const isExternal = /^https?:\/\//i.test(r.buttonURL);
      const targetAttrs = isExternal ? ' target="_blank" rel="noopener"' : "";
      return `
      <div class="lab-resource-card">
        <div class="lab-resource-icon">${r.icon || "📎"}</div>
        <span class="lab-resource-tag">${r.category}</span>${r.featured ? '<span class="lab-resource-featured-badge">Featured</span>' : ""}
        <h4>${r.title}</h4>
        <p>${r.description}</p>
        <a href="${r.buttonURL}"${targetAttrs}>${r.buttonText} →</a>
      </div>`;
    })
    .join("");
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  renderQuizQuestion();
  renderFilterPills();
  renderLibrary();
});
