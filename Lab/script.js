/* ==============================================
   LAB — INTERACTIVE TOOLS
   toggleMenu(), canvas backgrounds, and scroll-reveal
   are already provided by ../main.js — not duplicated here.
============================================== */

/* =========================================================
   TOOL 1: INSTAGRAM ROI CALCULATOR
========================================================= */
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
  const dmVolume = parseFloat(document.getElementById("dmVolume").value) || 0;
  const replyRate = parseFloat(document.getElementById("replyRate").value) || 0;
  const closeRate = parseFloat(document.getElementById("closeRate").value) || 0;
  const clientValue = parseFloat(document.getElementById("clientValue").value) || 0;
  const hoursSpent = parseFloat(document.getElementById("hoursSpent").value) || 0;

  const missedDMs = dmVolume * (1 - replyRate / 100);
  const revenueLost = Math.round(missedDMs * (closeRate / 100) * clientValue);

  const recoverableBookings = Math.round(missedDMs * (closeRate / 100));

  const timeSavedPerWeek = Math.round(hoursSpent * 0.85);

  const potentialExtraRevenue = Math.round(
    dmVolume * ((100 - replyRate) / 100) * (closeRate / 100) * clientValue * 1.3
  );

  animateCount(document.getElementById("statLeadsLost"), revenueLost, "₹");
  animateCount(document.getElementById("statBookings"), recoverableBookings, "", "");
  animateCount(document.getElementById("statTime"), timeSavedPerWeek, "", " hrs");
  animateCount(document.getElementById("statPotential"), potentialExtraRevenue, "₹");

  document.getElementById("roiResults").querySelector("p").textContent =
    "Based on the numbers you entered — here's what's on the table every single month.";
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
   To add a new resource later — just add one object below.
========================================================= */
const RESOURCES = [
  {
    title: "Comment-to-DM ManyChat Flow (Free)",
    category: "ManyChat Flows",
    description: "Ready-to-import flow that DMs anyone who comments a keyword on your reel.",
    link: "../book.html",
    linkText: "Request Access",
  },
  {
    title: "Lead Qualification Script — Fitness Coaches",
    category: "DM Scripts",
    description: "The exact 4-question sequence used to separate serious buyers from time-wasters.",
    link: "../book.html",
    linkText: "Request Script",
  },
  {
    title: "Objection Handling Cheat Sheet",
    category: "DM Scripts",
    description: "Pre-written responses for price objections, \"I'll think about it,\" and timing hesitation.",
    link: "../book.html",
    linkText: "Request Access",
  },
  {
    title: "Follow-Up Sequence Template (1hr / 24hr / 3-day)",
    category: "Templates",
    description: "Copy-paste follow-up messages timed to bring cold leads back into conversation.",
    link: "../book.html",
    linkText: "Request Template",
  },
  {
    title: "Booking Funnel Flow Screenshot Walkthrough",
    category: "Flow Screenshots",
    description: "See exactly how a qualified lead gets pushed from conversation to a booked call.",
    link: "../demo.html",
    linkText: "View Demo",
  },
  {
    title: "Behind the Scenes: Building a Client's System",
    category: "Behind The Scenes",
    description: "A short breakdown of how a real fitness coach's automation was built, step by step.",
    link: "../process.html",
    linkText: "Read Process",
  },
  {
    title: "5-Minute Setup: Your First Auto-Reply",
    category: "Mini Tutorials",
    description: "The fastest way to get a basic auto-reply live on your Instagram DMs today.",
    link: "../faq.html",
    linkText: "Read Guide",
  },
  {
    title: "FAQ: Is DM Automation Safe for My Instagram Account?",
    category: "FAQ",
    description: "Straight answers on ban risk, OAuth access, and staying within Instagram's guidelines.",
    link: "../faq.html",
    linkText: "Read FAQ",
  },
  {
    title: "Getting Started Guide — Free Plan Walkthrough",
    category: "Guides",
    description: "What's included in the FREE plan and how to get it running this week.",
    link: "../pricing.html",
    linkText: "See Free Plan",
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

function renderLibrary() {
  const search = document.getElementById("librarySearch").value.toLowerCase();
  const grid = document.getElementById("libraryGrid");

  const filtered = RESOURCES.filter((r) => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(search) || r.description.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="lab-empty-state">No resources match your search — try a different keyword or category.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (r) => `
      <div class="lab-resource-card">
        <span class="lab-resource-tag">${r.category}</span>
        <h4>${r.title}</h4>
        <p>${r.description}</p>
        <a href="${r.link}">${r.linkText} →</a>
      </div>`
    )
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
