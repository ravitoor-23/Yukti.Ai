// Netlify serverless function: /api/lead
// Captures a completed interview lead and fans out to (whichever are configured):
//   - Google Sheet  (env: SHEET_WEBHOOK_URL  -> Apps Script Web App)
//   - Email          (env: RESEND_API_KEY + LEAD_EMAIL_TO [+ LEAD_EMAIL_FROM])
//   - Airtable        (env: AIRTABLE_TOKEN + AIRTABLE_BASE_ID + AIRTABLE_TABLE)
//   - Notion          (env: NOTION_TOKEN + NOTION_DATABASE_ID)
// Each destination is optional and isolated — one failing never breaks the others.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let lead;
  try { lead = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }

  const safe = {
    name: String(lead.name || "").slice(0, 120),
    email: String(lead.email || "").slice(0, 160),
    company: String(lead.company || "").slice(0, 160),
    industry: String(lead.industry || "").slice(0, 80),
    verdict: String(lead.verdict || "").slice(0, 300),
    summary: String(lead.summary || "").slice(0, 1500),
    hoursPerWeek: lead.hoursPerWeek ?? "",
    dollarsPerMonth: lead.dollarsPerMonth ?? "",
    impact: String(lead.impact || "").slice(0, 20),
    transcript: String(lead.transcript || "").slice(0, 6000),
    page: String(lead.page || "").slice(0, 200),
    at: new Date().toISOString(),
  };

  const results = {};

  // ---- Google Sheet (Apps Script Web App) ----
  if (process.env.SHEET_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safe),
      });
      results.sheet = r.ok ? "ok" : "err " + r.status;
    } catch (e) { results.sheet = "throw"; }
  }

  // ---- Email via Resend ----
  if (process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_TO) {
    try {
      const html = `<h2>New Yukti lead</h2>
        <p><b>${esc(safe.name) || "(no name)"}</b> — ${esc(safe.email) || "(no email)"} ${safe.company ? "· " + esc(safe.company) : ""}</p>
        <p><b>Industry:</b> ${esc(safe.industry)}</p>
        <p><b>Verdict:</b> ${esc(safe.verdict)}</p>
        <p><b>Est. value:</b> ~$${esc(String(safe.dollarsPerMonth))}/mo · ~${esc(String(safe.hoursPerWeek))} hrs/wk · Impact: ${esc(safe.impact)}</p>
        <p><b>Summary:</b><br>${esc(safe.summary)}</p>
        <hr><p><b>Transcript:</b></p><pre style="white-space:pre-wrap;font-family:ui-monospace,monospace">${esc(safe.transcript)}</pre>
        <p style="color:#888">${safe.at} · ${esc(safe.page)}</p>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_EMAIL_FROM || "Yukti Demo <onboarding@resend.dev>",
          to: [process.env.LEAD_EMAIL_TO],
          reply_to: safe.email || undefined,
          subject: `New Yukti lead: ${safe.name || safe.email || "anonymous"} — ${safe.industry || "AI demo"}`,
          html,
        }),
      });
      results.email = r.ok ? "ok" : "err " + r.status;
    } catch (e) { results.email = "throw"; }
  }

  // ---- Airtable ----
  if (process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID) {
    try {
      const table = encodeURIComponent(process.env.AIRTABLE_TABLE || "Leads");
      const r = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${table}`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + process.env.AIRTABLE_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            Name: safe.name, Email: safe.email, Company: safe.company, Industry: safe.industry,
            Verdict: safe.verdict, Summary: safe.summary, "Hours/wk": Number(safe.hoursPerWeek) || 0,
            "$/mo": Number(safe.dollarsPerMonth) || 0, Impact: safe.impact, Transcript: safe.transcript,
          },
          typecast: true,
        }),
      });
      results.airtable = r.ok ? "ok" : "err " + r.status;
    } catch (e) { results.airtable = "throw"; }
  }

  // ---- Notion ----
  if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
    try {
      const r = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.NOTION_TOKEN,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DATABASE_ID },
          properties: {
            Name: { title: [{ text: { content: safe.name || safe.email || "Lead" } }] },
            Email: { email: safe.email || null },
            Industry: { rich_text: [{ text: { content: safe.industry } }] },
            Verdict: { rich_text: [{ text: { content: safe.verdict } }] },
            "$/mo": { number: Number(safe.dollarsPerMonth) || 0 },
            Impact: { rich_text: [{ text: { content: safe.impact } }] },
          },
          children: [
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: "Summary: " + safe.summary } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: "Transcript:\n" + safe.transcript.slice(0, 1900) } }] } },
          ],
        }),
      });
      results.notion = r.ok ? "ok" : "err " + r.status;
    } catch (e) { results.notion = "throw"; }
  }

  return json({ ok: true, results });
};

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const config = { path: "/api/lead" };
