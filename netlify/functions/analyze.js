// Netlify serverless function: /api/analyze
// Holds your secret API key server-side so it's never exposed to visitors.

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { industry, task } = await req.json();

    if (!task || !task.trim()) {
      return new Response(JSON.stringify({ error: "Missing task" }), { status: 400 });
    }

    const prompt = `You are a sharp, pragmatic AI automation consultant. A business owner${
      industry ? ` in the "${industry}" space` : ""
    } describes a recurring task. Assess it honestly and respond ONLY with valid JSON — no markdown, no preamble, no backticks. Use this exact shape:
{"opportunity":"<one punchy sentence naming the automation opportunity>","before":"<short phrase: how it works today, manually>","after":"<short phrase: how it works with AI>","approach":"<2 plain-lan[...]
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
    return new Response(JSON.stringify({ error: "Analysis failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/analyze" };
