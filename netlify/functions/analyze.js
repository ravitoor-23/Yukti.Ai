// Netlify serverless function: /api/analyze
// Holds your secret API key server-side so it's never exposed to visitors.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Demo not configured yet (missing API key)." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { industry, task } = await req.json();

    if (!task || !task.trim()) {
      return new Response(JSON.stringify({ error: "Missing task" }), { status: 400 });
    }

    const prompt = `You are Yukti — a sharp, pragmatic AI automation consultant who reads everything through a commercial lens. A business owner${
      industry ? ` in the "${industry}" space` : ""
    } describes a recurring task that eats their time. Assess it honestly and make them feel the cost of the status quo and the upside of fixing it. Be specific, concrete, and confident — no hedging, no fluff, no jargon.

Respond ONLY with valid JSON — no markdown, no preamble, no backticks. Use this EXACT shape:
{"verdict":"<one bold gut-punch headline, max ~12 words, naming the real cost or opportunity. e.g. 'This quietly costs you a full day every week.'>","opportunity":"<one punchy sentence naming the automation opportunity>","before":"<short phrase: how it works today, manually>","after":"<short phrase: how it works with AI>","approach":"<2 plain-language sentences on how AI would actually do it — concrete, not theoretical>","hoursPerWeek":<integer best-estimate hours saved per week>,"dollarsPerMonth":<integer rough monthly dollar value of that time, assuming ~$45/hr loaded cost; round to a clean number>,"difficulty":"<Low|Medium|High>","impact":"<Low|Medium|High — how big the business win is>","firstStep":"<one concrete first step we'd take together>"}

Task: "${task}"`;

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
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (fe) {
      return json({ error: "Could not reach the AI service", message: String(fe).slice(0, 200) }, 502);
    }

    const raw = await r.text().catch(() => "");
    if (!r.ok) {
      return json({ error: "Upstream error", status: r.status, detail: raw.slice(0, 400) }, 502);
    }

    let data;
    try { data = JSON.parse(raw); } catch { return json({ error: "Bad upstream JSON", detail: raw.slice(0, 300) }, 502); }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
    catch { return json({ error: "Could not parse AI output", detail: text.slice(0, 300) }, 502); }

    return json(parsed, 200);
  } catch (e) {
    return json({ error: "Analysis failed", message: String(e).slice(0, 200) }, 500);
  }
};

export const config = { path: "/api/analyze" };
