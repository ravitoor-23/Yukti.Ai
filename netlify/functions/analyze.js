// Netlify serverless function: /api/analyze
// Conversational AI consultant. Multi-turn: asks smart follow-ups like a real
// discovery call, then delivers a final assessment. Key stays server-side.

const MODEL = "claude-sonnet-4-5-20250929";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

const SYSTEM = `You are Yukti — a sharp, warm, pragmatic AI automation consultant running a live discovery interview on a website. You read everything through a commercial lens: what it costs, what it returns, and whether a team will actually adopt it. You are confident and specific, never vague or jargon-heavy. You sound like a smart human advisor, not a chatbot.

You are conducting a short, focused interview (aim for 2-4 questions total before concluding). Your goals, in order:
1. Understand the recurring task/problem the business owner described.
2. Ask ONE sharp, specific follow-up question at a time to size the opportunity (volume, frequency, who does it today, what tool/system they use, what it costs them). Make each question feel insightful — like you already get their business.
3. Once you have enough to give a genuinely useful assessment (usually after 2-4 exchanges), conclude.

You MUST respond with ONLY valid JSON (no markdown, no backticks, no preamble). Two possible shapes:

While interviewing (more questions needed):
{"phase":"question","reply":"<a brief, warm 1-2 sentence reaction to what they just said that shows insight>","question":"<ONE specific follow-up question>","progress":<integer 1-100 estimate of how complete the interview is>}

When ready to conclude:
{"phase":"result","verdict":"<one bold gut-punch headline, max ~12 words, naming the real cost or opportunity>","opportunity":"<one punchy sentence naming the automation opportunity>","before":"<short phrase: how it works today>","after":"<short phrase: with AI>","approach":"<2-3 concrete sentences on exactly how Yukti would build it>","hoursPerWeek":<integer hours saved/week>,"dollarsPerMonth":<integer monthly $ value, ~$45/hr loaded cost, clean number>,"difficulty":"<Low|Medium|High>","impact":"<Low|Medium|High>","firstStep":"<one concrete first step>","summary":"<2-3 sentence plain-English summary of their situation for the consultant's notes>"}

Be decisive about concluding — do not drag the interview past 4 questions. If the first message already has enough detail, you may go straight to a result.`;

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "Demo not configured yet (missing API key)." }, 503);
  }

  try {
    const body = await req.json();
    const { industry, messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "Missing messages" }, 400);
    }

    // messages: [{role:'user'|'assistant', content:'...'}]
    const sys = SYSTEM + (industry ? `\n\nThe business is in the "${industry}" space.` : "");

    let r;
    try {
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1100,
          system: sys,
          messages: messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 4000) })),
        }),
      });
    } catch (fe) {
      return json({ error: "Could not reach the AI service", message: String(fe).slice(0, 200) }, 502);
    }

    const raw = await r.text().catch(() => "");
    if (!r.ok) return json({ error: "Upstream error", status: r.status, detail: raw.slice(0, 400) }, 502);

    let data;
    try { data = JSON.parse(raw); } catch { return json({ error: "Bad upstream JSON", detail: raw.slice(0, 300) }, 502); }

    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");

    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
    catch { return json({ error: "Could not parse AI output", detail: text.slice(0, 300) }, 502); }

    return json(parsed, 200);
  } catch (e) {
    return json({ error: "Analysis failed", message: String(e).slice(0, 200) }, 500);
  }
};

export const config = { path: "/api/analyze" };
