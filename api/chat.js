/* ═══════════════════════════════════════════════════════════════
   api/chat.js
   Required by Vercel's own convention: any file under /api becomes
   a serverless endpoint automatically, at /api/chat — no extra
   configuration, no database, no separate service. This is the
   ONLY way to call Groq without putting the API key in the browser.

   All real logic lives in /chat-ai/ (kept there on purpose, so the
   AI system stays isolated from the rest of the website). This file
   is just the thin, unavoidable entry point Vercel requires.
   ═══════════════════════════════════════════════════════════════ */
const { handleChat, FALLBACK_MESSAGE } = require("../chat-ai/ai-assistant.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ reply: FALLBACK_MESSAGE, ctas: [], ok: false });
    return;
  }

  try {
    const body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();

    const result = await handleChat({
      message: body.message,
      history: Array.isArray(body.messages) ? body.messages : [],
      ip: ip
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("[api/chat]", err && err.message);
    res.status(200).json({ reply: FALLBACK_MESSAGE, ctas: [], ok: false });
  }
};
