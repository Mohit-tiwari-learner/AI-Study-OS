import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️  GEMINI_API_KEY missing. Set it in backend/.env");
}
const genAI = new GoogleGenerativeAI(apiKey || "");
const MODEL = "gemini-1.5-flash";

async function gen(prompt, { json = false } = {}) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    ...(json
      ? { generationConfig: { responseMimeType: "application/json" } }
      : {}),
  });
  const r = await model.generateContent(prompt);
  return r.response.text();
}

// 1) Voice/text → structured notes
app.post("/api/notes", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "text required" });
    const prompt = `You are an expert study-notes formatter.
Take the raw lecture/voice transcript below and turn it into clean, well-structured study notes in Markdown.

Rules:
- Start with a single H2 title summarizing the topic.
- Use H3 sub-headings for each concept.
- Use bullet points, **bold** for keywords, and short examples where useful.
- Add a final "Quick recap" section with 3 one-line bullets.
- Keep language clear and student-friendly.

TRANSCRIPT:
"""${text}"""`;
    const notes = await gen(prompt);
    res.json({ notes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 2) Notes → summary + key points + 5 questions
app.post("/api/summary", async (req, res) => {
  try {
    const { notes } = req.body || {};
    if (!notes) return res.status(400).json({ error: "notes required" });
    const prompt = `You analyze study notes and return strict JSON.

Return JSON shaped exactly like:
{
  "summary": "3-4 sentence concise summary",
  "keyPoints": ["...", "...", "..."],          // 5-7 bullets
  "questions": ["...", "...", "...", "...", "..."] // exactly 5 exam-style questions
}

NOTES:
"""${notes}"""`;
    const raw = await gen(prompt, { json: true });
    let data;
    try { data = JSON.parse(raw); }
    catch { data = { summary: raw, keyPoints: [], questions: [] }; }
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 3) Syllabus + deadline → day-wise plan
app.post("/api/planner", async (req, res) => {
  try {
    const { syllabus, deadline, hoursPerDay = 2 } = req.body || {};
    if (!syllabus || !deadline) return res.status(400).json({ error: "syllabus and deadline required" });
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `You are an expert study coach.
Today: ${today}. Exam date: ${deadline}. Daily study time: ${hoursPerDay} hours.

Build a realistic day-wise study plan from the syllabus below.

Return STRICT JSON only:
{
  "plan": [
    { "day": 1, "date": "YYYY-MM-DD", "focus": "short title", "tasks": ["...", "..."] }
  ]
}

Rules:
- One object per study day from today to deadline (skip none).
- 2-4 concrete tasks per day.
- Last 2 days = revision + mock test.

SYLLABUS:
"""${syllabus}"""`;
    const raw = await gen(prompt, { json: true });
    let data;
    try { data = JSON.parse(raw); }
    catch { data = { plan: [] }; }
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 4) Doubt solver chat
app.post("/api/doubt", async (req, res) => {
  try {
    const { messages = [], hinglish = false } = req.body || {};
    const sys = hinglish
      ? `You are a friendly tutor. Explain answers step-by-step in Hinglish (Hindi written in English script mixed with English technical terms). Keep tone casual and clear. Use markdown.`
      : `You are a friendly tutor. Explain answers step-by-step in clear English. Use markdown with short paragraphs and bullets where helpful.`;
    const convo = messages
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n");
    const prompt = `${sys}\n\nConversation so far:\n${convo}\n\nReply as Tutor:`;
    const answer = await gen(prompt);
    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (_req, res) => res.json({ ok: true, service: "ai-study-os-backend" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✨ AI Study OS backend running on http://localhost:${PORT}`));
