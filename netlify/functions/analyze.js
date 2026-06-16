// Netlify serverless function: /api/analyze
// Holds your secret API key server-side so it's never exposed to visitors.

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

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return new Response(JSON.stringify({ error: "Upstream error", status: r.status, detail: detail.slice(0, 300) }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Analysis failed", message: String(e).slice(0, 200) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/analyze" };
