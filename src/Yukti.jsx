import React, { useState, useEffect, useRef } from "react";

// ---------- data ----------
const STATS = [
  { num: "55%", plain: "of businesses used AI in 2025, up from 39% the year before.", c: "var(--violet)", cv: "var(--violet)" },
  { num: "91%", plain: "of businesses using AI say it has a positive effect on revenue.", c: "var(--pink)", cv: "var(--aqua)" },
];

const SERVICES = [
  { n: "01 / STRATEGY", t: "AI Strategy & Discovery", c: "var(--violet)",
    short: "Where AI creates real leverage — and where it doesn't.",
    long: "We assess how your organization works today and map out exactly where AI fits — and, just as importantly, where it doesn't. You get a clear, prioritized view of the opportunities, ranked by impact and effort, before any decision to build. Honest, practical, and grounded in your operations." },
  { n: "02 / PRIVACY", t: "Local-First & Private", c: "var(--pink)",
    short: "Capable AI that can run entirely on your own hardware.",
    long: "Where data sensitivity matters, we design AI that runs on your own infrastructure — no third-party cloud, and nothing leaving your walls. You get the capability without the exposure, which matters whether you're a clinic, a law firm, or a team answering to a compliance lead." },
  { n: "03 / AUTOMATION", t: "Workflow Automation", c: "var(--aqua)",
    short: "The repetitive work, handled quietly in the background.",
    long: "We connect the tools you already use so the manual, repetitive work runs on its own — data entry, routing, drafting, follow-ups, reporting. The aim isn't novelty; it's hours returned to your team, reliably, week after week." },
  { n: "04 / DEPLOYMENT", t: "Implementation & Enablement", c: "var(--amber)",
    short: "Built, deployed, and handed to a team that knows how to use it.",
    long: "We see the work through. The solution is built, deployed inside your real operations, and your team is trained to use it with confidence — and we stay close while it beds in. A tool nobody adopts is just an expense, so adoption is what we set out to deliver." },
];

const INDUSTRIES_DEEP = [
  { key: "dental", t: "Dental & Healthcare", c: "var(--aqua)", icon: "\u25C8",
    tag: "Showcase vertical",
    short: "Front desks drowning in calls, reminders, and no-shows.",
    pains: [
      "Missed calls = lost patients. Every unanswered ring is a booking that walks to a competitor.",
      "No-shows leave chairs empty \u2014 pure lost revenue.",
      "Front desk buried in reminders, rescheduling, and the same insurance questions all day.",
      "Patients overdue for recalls slip through the cracks.",
    ],
    systems: [
      ["AI front-desk receptionist", "Answers every call 24/7 \u2014 books, reschedules, answers FAQs, routes emergencies."],
      ["WhatsApp / SMS auto-reply", "Instant replies and booking links so after-hours leads never go cold."],
      ["Smart reminders", "Automated reminders + one-tap reschedule that quietly kill no-shows."],
      ["Review engine", "Nudges happy patients to leave Google reviews \u2014 lifting local search."],
      ["Recall / reactivation", "Auto-nudges overdue patients back into the chair."],
    ],
    proof: "If this captures just two extra patients a month at $500+ each, it has already paid for itself many times over." },
  { key: "prof", t: "Professional Services", c: "var(--violet)",
    short: "Law, accounting, consulting \u2014 repetitive intake and drafting.",
    pains: ["Re-typing client intake into three systems by hand.", "Drafting the same proposal and document sections every time.", "Chasing clients for documents over email."],
    systems: [["Intake automation", "Capture once, populate CRM, billing, and forms automatically."], ["Document drafting", "Generate first-draft proposals, letters, and reports from a prompt."], ["Follow-up engine", "Automated, polite chasing for documents and signatures."]],
    proof: "Hours of billable time returned every week, with nothing leaving your walls when privacy matters." },
  { key: "realestate", t: "Real Estate", c: "var(--pink)",
    short: "Leads going cold and listings written by hand.",
    pains: ["Writing every listing description from scratch.", "Following up with each new lead one at a time.", "Coordinating showings over scattered texts and email."],
    systems: [["Lead responder", "Instant reply to every inquiry, qualifying and booking showings."], ["Listing writer", "Polished descriptions generated from the details in seconds."], ["Showing coordinator", "Automated scheduling across buyers and sellers."]],
    proof: "More leads worked, faster \u2014 the speed-to-lead edge that wins deals." },
  { key: "hospitality", t: "Hospitality", c: "var(--amber)",
    short: "Bookings and guest questions across every channel.",
    pains: ["Booking and availability questions across email, phone, and DMs.", "Building guest itineraries manually.", "Collecting and responding to reviews."],
    systems: [["Omni-channel booking bot", "One AI answering bookings everywhere guests reach out."], ["Itinerary builder", "Personalized guest plans generated automatically."], ["Review management", "Collect, respond to, and learn from reviews on autopilot."]],
    proof: "A front desk that never sleeps, across every channel guests use." },
  { key: "trades", t: "Trades & Home Services", c: "var(--aqua)",
    short: "Quotes, scheduling, and unpaid invoices over text.",
    pains: ["Back-and-forth over text to quote and book jobs.", "Writing up estimates after each site visit.", "Chasing unpaid invoices."],
    systems: [["Quote & booking bot", "Captures job details, books visits, and follows up automatically."], ["Estimate drafter", "Turns site notes into a clean estimate in minutes."], ["Invoice chaser", "Polite automated reminders until you get paid."]],
    proof: "More jobs booked, fewer evenings lost to admin and chasing money." },
  { key: "ecom", t: "E-commerce & Retail", c: "var(--violet)",
    short: "Support tickets and product copy that never end.",
    pains: ["Answering the same shipping and returns questions all day.", "Writing product descriptions one by one.", "Tagging and categorizing new inventory."],
    systems: [["Support AI", "Handles shipping, returns, and order questions instantly."], ["Product copywriter", "Generates descriptions and metadata at scale."], ["Auto-tagging", "Categorizes and tags inventory as it lands."]],
    proof: "Support handled and catalogs built without adding headcount." },
];

const PROCESS = [
  { n: "i", t: "Discover", d: "We learn your operations, goals, and constraints — and find where AI is worth your attention." },
  { n: "ii", t: "Prioritize", d: "We rank opportunities by impact and effort, so the first move is the highest-leverage one." },
  { n: "iii", t: "Build", d: "We design and build the solution — tailored to how your team already works." },
  { n: "iv", t: "Embed", d: "We deploy, train your people, and stay close while it becomes part of how you operate." },
];

// ---------- animated count-up ----------
function CountUp({ end, suffix = "%", dur = 1400 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [end, dur]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ---------- modal ----------
function Modal({ open, onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    if (open) { window.addEventListener("keydown", esc); document.body.style.overflow = "hidden"; }
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: "24px",
      background: "rgba(22,22,29,.45)", backdropFilter: "blur(8px)", animation: "fade .25s ease" }}>
      <div onClick={(e) => e.stopPropagation()} className="glass" style={{ borderRadius: 28, padding: "40px", maxWidth: wide ? 720 : 540, width: "100%",
        position: "relative", animation: "pop .35s cubic-bezier(.2,.9,.3,1.3)", maxHeight: "86vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--line)",
          background: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 18, color: "var(--ink)", lineHeight: 1 }}>×</button>
        {children}
      </div>
    </div>
  );
}

export default function Yukti() {
  const [expandedSvc, setExpandedSvc] = useState(null);
  const [openIndustry, setOpenIndustry] = useState(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookEmail, setBookEmail] = useState("");
  const [bookMsg, setBookMsg] = useState("");
  const [theme, setTheme] = useState("aurora");

  const THEMES = {
    aurora: { label: "Aurora", bg: "#eef0f5", ink: "#16161d", muted: "#5d5d6b", violet: "#6d5dfc", pink: "#ff5d8f", aqua: "#2fd6c9", amber: "#ffb020", dark: "22,22,29" },
    sand:   { label: "Sand",   bg: "#f5f1e8", ink: "#1f1a14", muted: "#6b6356", violet: "#c2410c", pink: "#e07a3f", aqua: "#3f7d6e", amber: "#d4a017", dark: "31,26,20" },
    mono:   { label: "Graphite", bg: "#eceef0", ink: "#101114", muted: "#5a5d63", violet: "#3a4cff", pink: "#6b7280", aqua: "#0ea5a5", amber: "#f59e0b", dark: "16,17,20" },
    midnight: { label: "Midnight", bg: "#e7e9f2", ink: "#13132b", muted: "#565a78", violet: "#5b4bff", pink: "#ff4d6d", aqua: "#22d3ee", amber: "#fbbf24", dark: "19,19,43" },
  };
  const T = THEMES[theme];

  // live AI demo
  const [industry, setIndustry] = useState("");
  const [task, setTask] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const INDUSTRIES = ["Professional services", "E-commerce / Retail", "Healthcare", "Real estate", "Hospitality", "Trades & home services", "Agency / Marketing", "Other"];

  const suggestionsByIndustry = {
    "Professional services": ["Re-typing client intake into three systems by hand", "Drafting the same proposal sections every time", "Chasing clients for documents over email"],
    "E-commerce / Retail": ["Answering shipping & returns questions all day", "Writing product descriptions one by one", "Tagging and categorizing new inventory"],
    "Healthcare": ["Appointment reminders and rescheduling calls", "Summarizing visit notes after each patient", "Answering the same insurance questions"],
    "Real estate": ["Writing listing descriptions from scratch", "Following up with every new lead by hand", "Coordinating showings over text and email"],
    "Hospitality": ["Booking & availability questions across email and DMs", "Building guest itineraries manually", "Collecting and responding to reviews"],
    "Trades & home services": ["Chasing quotes and scheduling jobs over text", "Writing up estimates after each site visit", "Following up on unpaid invoices"],
    "Agency / Marketing": ["Drafting first versions of social posts", "Pulling weekly performance reports by hand", "Repurposing one asset into ten formats"],
    "Other": ["Copying data between spreadsheets and tools", "Answering repetitive internal questions", "Manually routing incoming requests"],
  };
  const placeholderByIndustry = {
    "Professional services": "e.g. Every new client, we re-enter the same details into our CRM, billing, and intake forms…",
    "E-commerce / Retail": "e.g. We answer the same 10 shipping and return questions over email all day…",
    "Healthcare": "e.g. Our front desk spends hours every day on reminder and rescheduling calls…",
    "Real estate": "e.g. We write every listing description by hand and follow up with leads one at a time…",
    "Hospitality": "e.g. We answer booking and availability questions across email, phone, and DMs…",
    "Trades & home services": "e.g. We go back and forth over text to quote jobs and book them in…",
    "Agency / Marketing": "e.g. Every week we draft social posts and assemble client reports manually…",
    "Other": "e.g. We copy the same data between two tools every single day…",
  };

  async function runDemo(presetText) {
    const t = presetText !== undefined ? presetText : task;
    if (!t.trim()) return;
    setBusy(true); setErr(""); setResult(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, task: t }),
      });
      if (!r.ok) throw new Error("bad response");
      const parsed = await r.json();
      setResult(parsed);
    } catch (e) {
      setErr("The demo hit a snag — give it another go in a moment.");
    } finally { setBusy(false); }
  }

  // scroll reveal
  const rootRef = useRef(null);
  useEffect(() => {
    const els = rootRef.current.querySelectorAll(".reveal");
    const io = new IntersectionObserver((es) => es.forEach((e, i) => {
      if (e.isIntersecting) { setTimeout(() => e.target.classList.add("in"), i * 50); io.unobserve(e.target); }
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
    const t = setTimeout(() => els.forEach(el => el.classList.add("in")), 1800);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <div ref={rootRef} style={{ background: T.bg, minHeight: "100vh", position: "relative", transition: "background .5s ease" }}>
      <style>{`
        :root{--bg:${T.bg};--ink:${T.ink};--muted:${T.muted};--glass:rgba(255,255,255,.5);--glass-bd:rgba(255,255,255,.7);--line:rgba(${T.dark},.12);--violet:${T.violet};--pink:${T.pink};--aqua:${T.aqua};--amber:${T.amber};--dark:${T.dark};}
        *{margin:0;padding:0;box-sizing:border-box}
        .yk{font-family:'Bricolage Grotesque',system-ui,sans-serif;color:var(--ink);line-height:1.55;-webkit-font-smoothing:antialiased}
        .serif{font-family:'Instrument Serif',Georgia,serif}
        .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
        .mesh{position:fixed;inset:0;z-index:0;overflow:hidden;filter:blur(70px);pointer-events:none}
        .blob{position:absolute;border-radius:50%;opacity:.42;mix-blend-mode:multiply;animation:float 26s ease-in-out infinite}
        .b1{width:46vw;height:46vw;background:var(--violet);top:-14%;left:-8%}
        .b2{width:38vw;height:38vw;background:var(--pink);top:18%;right:-12%;animation-delay:-8s}
        .b3{width:42vw;height:42vw;background:var(--aqua);bottom:-18%;left:18%;animation-delay:-14s}
        .b4{width:28vw;height:28vw;background:var(--amber);bottom:6%;right:14%;animation-delay:-4s}
        @keyframes float{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(5%,7%) scale(1.1)}66%{transform:translate(-4%,-5%) scale(.94)}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes pop{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .content{position:relative;z-index:1}
        .wrap{max-width:1080px;margin:0 auto;padding:0 26px}
        .glass{background:var(--glass);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);border:1px solid var(--glass-bd);box-shadow:0 8px 40px rgba(22,22,29,.07),inset 0 1px 0 rgba(255,255,255,.6)}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1)}
        .reveal.in{opacity:1;transform:none}
        .btn{font-family:inherit;font-weight:600;font-size:.92rem;color:#fff;background:linear-gradient(135deg,var(--violet),var(--pink));padding:13px 26px;border-radius:50px;text-decoration:none;transition:.3s cubic-bezier(.2,.8,.2,1);display:inline-block;box-shadow:0 6px 20px rgba(109,93,252,.32);border:none;cursor:pointer}
        .btn:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(109,93,252,.46)}
        .btn.lg{padding:16px 36px;font-size:1.05rem}
        .btn.ghost{background:rgba(255,255,255,.5);color:var(--ink);border:1px solid var(--glass-bd);box-shadow:none}
        .btn.ghost:hover{box-shadow:0 10px 26px rgba(22,22,29,.1)}
        .eyebrow{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--violet);margin-bottom:16px;font-weight:500}
        h1{font-size:clamp(2.9rem,7.4vw,5.4rem);font-weight:700;line-height:1.02;letter-spacing:-.04em}
        h1 em,h2 em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;background:linear-gradient(135deg,var(--violet),var(--pink));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        h2{font-size:clamp(2rem,4.6vw,3.2rem);font-weight:700;letter-spacing:-.03em;line-height:1.08;margin-bottom:16px}
        .lead{color:var(--muted);font-size:1.16rem}
        .chip{cursor:pointer;transition:.3s cubic-bezier(.2,.8,.2,1)}
        .chip:hover{transform:translateY(-6px);box-shadow:0 22px 50px rgba(22,22,29,.14)}
        @media(max-width:780px){.nl{display:none}.svc{grid-template-columns:1fr!important}.steps{grid-template-columns:1fr 1fr!important}.demoGrid{grid-template-columns:1fr!important}.statDiv{width:80px!important;height:1px!important}.whyEvidence{flex-direction:column!important}.whyEvidence>div{padding:24px 0!important}.whyEvidence>div[style*="width: 1px"]{width:100%!important;height:1px!important}}
      `}</style>

      <div className="mesh"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="blob b4" /></div>

      <div className="content yk">
        {/* NAV */}
        <nav className="glass" style={{ position: "sticky", top: 16, zIndex: 50, margin: "16px auto 0", maxWidth: 1080, borderRadius: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px 12px 24px" }}>
            <div style={{ fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-.04em", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(135deg,var(--violet),var(--pink))", boxShadow: "0 0 14px var(--violet)" }} />Yukti
            </div>
            <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
              <a className="nl" href="#why" style={{ color: "var(--ink)", textDecoration: "none", fontSize: ".9rem", fontWeight: 500, opacity: .78 }}>Why now</a>
              <a className="nl" href="#demo" style={{ color: "var(--ink)", textDecoration: "none", fontSize: ".9rem", fontWeight: 500, opacity: .78 }}>Live demo</a>
              <a className="nl" href="#services" style={{ color: "var(--ink)", textDecoration: "none", fontSize: ".9rem", fontWeight: 500, opacity: .78 }}>What we do</a>
              <a className="nl" href="#industries" style={{ color: "var(--ink)", textDecoration: "none", fontSize: ".9rem", fontWeight: 500, opacity: .78 }}>Industries</a>
              <button className="btn" onClick={() => setBookOpen(true)}>Book a call</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <header className="wrap" style={{ padding: "92px 0 56px", textAlign: "center" }}>
          <span className="glass reveal mono" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", padding: "9px 17px", borderRadius: 40, marginBottom: 30 }}>◆ AI Consulting · End to End</span>
          <h1 className="reveal" style={{ maxWidth: "16ch", margin: "0 auto" }}>The advantage isn't AI. <em>It's how you apply it.</em></h1>
          <p className="lead reveal" style={{ margin: "28px auto 0", maxWidth: "52ch" }}>An AI consultancy. We find where AI fits your business, build it, and see it through.</p>
          <div className="reveal" style={{ marginTop: 36, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn lg" onClick={() => setBookOpen(true)}>Book a discovery call →</button>
            <button className="btn lg ghost" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Try it live ↓</button>
          </div>
        </header>

        {/* WHY NOW — editorial point of view */}
        <section id="why" className="wrap" style={{ padding: "80px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 0 }}>
            <div className="eyebrow reveal">A point of view</div>
            <h2 className="reveal whyStmt" style={{ fontSize: "clamp(1.9rem,4.2vw,3.1rem)", fontWeight: 400, lineHeight: 1.25, letterSpacing: "-.02em", maxWidth: "20ch", marginBottom: 0, fontFamily: "'Instrument Serif',serif" }}>
              <span style={{ color: "var(--ink)" }}>Everyone has access to AI now. </span>
              <span style={{ color: "var(--muted)" }}>Almost no one has a clear answer to the only question that matters: </span>
              <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,var(--violet),var(--pink))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>where, exactly, does it earn its place here?</em>
            </h2>

            <div className="whyEvidence reveal" style={{ display: "flex", gap: 0, marginTop: 56, borderTop: "1px solid var(--line)" }}>
              <div style={{ flex: 1, padding: "28px 28px 28px 0" }}>
                <div style={{ fontSize: "clamp(2.4rem,4vw,3.2rem)", fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1 }}>
                  <CountUp end={55} />
                </div>
                <p className="mono" style={{ color: "var(--muted)", fontSize: ".82rem", letterSpacing: ".02em", marginTop: 12, lineHeight: 1.6, textTransform: "none" }}>of businesses now use AI — up from 39% a year ago. The wave already happened.</p>
              </div>
              <div style={{ width: 1, background: "var(--line)" }} />
              <div style={{ flex: 1, padding: "28px 28px 28px 28px" }}>
                <div style={{ fontSize: "clamp(2.4rem,4vw,3.2rem)", fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1 }}>
                  <CountUp end={91} />
                </div>
                <p className="mono" style={{ color: "var(--muted)", fontSize: ".82rem", letterSpacing: ".02em", marginTop: 12, lineHeight: 1.6, textTransform: "none" }}>of those businesses say it lifted revenue — once they aimed it at the right thing.</p>
              </div>
              <div style={{ width: 1, background: "var(--line)" }} />
              <div style={{ flex: 1, padding: "28px 0 28px 28px" }}>
                <div style={{ fontSize: "clamp(2.4rem,4vw,3.2rem)", fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1 }}>
                  <CountUp end={80} />
                </div>
                <p className="mono" style={{ color: "var(--muted)", fontSize: ".82rem", letterSpacing: ".02em", marginTop: 12, lineHeight: 1.6, textTransform: "none" }}>of AI projects fail to deliver — almost always on strategy and data, not the model.</p>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE DEMO */}
        <section id="demo" className="wrap" style={{ padding: "60px 0" }}>
          <div className="glass reveal" style={{ borderRadius: 32, padding: "clamp(32px,5vw,56px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", filter: "blur(80px)", opacity: .32, background: "linear-gradient(135deg,var(--violet),var(--aqua))", top: -120, right: -80 }} />
            <div style={{ position: "relative" }}>
              <div className="eyebrow">Live demo · powered by AI</div>
              <h2 style={{ maxWidth: "18ch" }}>See it work <em>before you talk to us.</em></h2>
              <p className="lead" style={{ maxWidth: "58ch", marginBottom: 24 }}>Choose your industry and describe a task that takes up your week. You'll get a real analysis back — the opportunity, how it would work, and what it's worth in hours and dollars.</p>

              <div className="demoGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
                <div>
                  <div className="mono" style={{ fontSize: ".66rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>1 · Your industry</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                    {INDUSTRIES.map((ind) => {
                      const on = industry === ind;
                      return (
                        <button key={ind} onClick={() => setIndustry(on ? "" : ind)}
                          style={{ fontFamily: "inherit", fontSize: ".8rem", fontWeight: 500, cursor: "pointer", borderRadius: 30, padding: "8px 14px", transition: ".2s",
                            color: on ? "#fff" : "var(--ink)", border: on ? "1px solid transparent" : "1px solid var(--line)",
                            background: on ? "linear-gradient(135deg,var(--violet),var(--pink))" : "rgba(255,255,255,.45)" }}>{ind}</button>
                      );
                    })}
                  </div>
                  <div className="mono" style={{ fontSize: ".66rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>2 · The task that eats your time</div>
                  <textarea value={task} onChange={(e) => setTask(e.target.value)} placeholder={industry ? placeholderByIndustry[industry] : "e.g. We manually answer the same 10 customer questions by email every day…"}
                    rows={4} style={{ width: "100%", borderRadius: 16, border: "1px solid var(--glass-bd)", background: "rgba(255,255,255,.6)", padding: "16px", fontFamily: "inherit", fontSize: "1rem", color: "var(--ink)", resize: "vertical", outline: "none" }} />
                  {industry && (
                    <div style={{ marginTop: 12 }}>
                      <div className="mono" style={{ fontSize: ".6rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, opacity: .8 }}>Or start from a common one ↓</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(suggestionsByIndustry[industry] || []).map((sug, i) => (
                          <button key={i} onClick={() => setTask(sug)} className="mono"
                            style={{ fontSize: ".72rem", color: "var(--ink)", background: "rgba(255,255,255,.5)", border: "1px solid var(--line)", borderRadius: 30, padding: "7px 12px", cursor: "pointer", transition: ".2s", textAlign: "left" }}>{sug}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button className="btn lg" onClick={() => runDemo()} disabled={busy} style={{ marginTop: 16, opacity: busy ? .7 : 1 }}>
                    {busy ? "Analyzing…" : "Analyze this task →"}
                  </button>
                </div>

                <div className="glass" style={{ borderRadius: 20, padding: 28, minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "center", background: `rgba(${T.dark},.92)`, color: "#f2f2f7" }}>
                  {busy && <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#c8c8d4" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "var(--aqua)", animation: "spin .8s linear infinite" }} />Thinking it through…</div>}
                  {err && !busy && <div style={{ color: "var(--pink)" }}>{err}</div>}
                  {!busy && !result && !err && <div style={{ color: "#9494a6" }} className="mono">Your AI analysis will appear here →</div>}
                  {result && !busy && (
                    <div style={{ animation: "pop .4s ease" }}>
                      <div className="mono" style={{ fontSize: ".64rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--aqua)", marginBottom: 8 }}>The opportunity</div>
                      <div style={{ fontSize: "1.22rem", fontWeight: 600, letterSpacing: "-.01em", marginBottom: 20, lineHeight: 1.3 }}>{result.opportunity}</div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
                          <div className="mono" style={{ fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#9494a6", marginBottom: 4 }}>Today</div>
                          <div style={{ fontSize: ".88rem", color: "#e0e0e8" }}>{result.before}</div>
                        </div>
                        <span style={{ color: "var(--aqua)", fontSize: "1.2rem" }}>→</span>
                        <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: "rgba(47,214,201,.10)", border: "1px solid rgba(47,214,201,.3)" }}>
                          <div className="mono" style={{ fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--aqua)", marginBottom: 4 }}>With AI</div>
                          <div style={{ fontSize: ".88rem", color: "#e0e0e8" }}>{result.after}</div>
                        </div>
                      </div>

                      <div style={{ color: "#c8c8d4", fontSize: ".96rem", marginBottom: 20, lineHeight: 1.55 }}>{result.approach}</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,.06)" }}>
                          <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1 }}>~{result.hoursPerWeek}<span style={{ fontSize: "1rem", color: "#9494a6" }}> hrs/wk</span></div>
                          <div className="mono" style={{ fontSize: ".58rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#9494a6", marginTop: 6 }}>Time recovered</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,.06)" }}>
                          <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1 }}>~${result.dollarsPerMonth}<span style={{ fontSize: "1rem", color: "#9494a6" }}>/mo</span></div>
                          <div className="mono" style={{ fontSize: ".58rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#9494a6", marginTop: 6 }}>Value of that time</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg,rgba(109,93,252,.15),rgba(255,93,143,.1))", border: "1px solid rgba(255,255,255,.12)" }}>
                        <span style={{ color: "var(--aqua)", fontSize: ".9rem", marginTop: 1 }}>◆</span>
                        <div>
                          <div className="mono" style={{ fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--aqua)", marginBottom: 4 }}>First step · {result.difficulty} effort</div>
                          <div style={{ fontSize: ".9rem", color: "#e8e8f0" }}>{result.firstStep}</div>
                        </div>
                      </div>

                      <div className="mono" style={{ fontSize: ".58rem", color: "#7a7a8c", marginTop: 14, textAlign: "center" }}>Estimates are directional — a real audit sharpens them.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES — chips open modal */}
        <section id="services" className="wrap" style={{ padding: "60px 0" }}>
          <div className="eyebrow reveal">What we do</div>
          <h2 className="reveal" style={{ maxWidth: "20ch" }}>From question to working system — <em>end to end.</em></h2>
          <p className="lead reveal" style={{ maxWidth: "54ch", marginBottom: 8 }}>Four ways we help. Open any one to go deeper.</p>
          <div className="svc" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18, marginTop: 28 }}>
            {SERVICES.map((s, i) => {
              const open = expandedSvc === i;
              return (
                <div key={i} className="glass reveal" onClick={() => setExpandedSvc(open ? null : i)}
                  style={{ borderRadius: 24, padding: 34, position: "relative", overflow: "hidden", cursor: "pointer",
                    transition: "box-shadow .3s, transform .3s", boxShadow: open ? "0 22px 50px rgba(22,22,29,.15)" : undefined,
                    gridColumn: open ? "1 / -1" : "auto" }}>
                  <span style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", filter: "blur(48px)", top: -36, right: -36, opacity: open ? .7 : .5, background: s.c, transition: "opacity .3s" }} />
                  <div className="mono" style={{ fontSize: ".7rem", color: "var(--muted)", position: "relative" }}>{s.n}</div>
                  <h3 style={{ fontSize: "1.55rem", fontWeight: 700, letterSpacing: "-.02em", margin: "26px 0 8px", position: "relative" }}>{s.t}</h3>
                  <p style={{ color: "var(--muted)", position: "relative" }}>{s.short}</p>
                  <div style={{ position: "relative", display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .45s cubic-bezier(.2,.8,.2,1)" }}>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ color: "var(--ink)", fontSize: "1.05rem", lineHeight: 1.7, paddingTop: 18, marginTop: 18, borderTop: "1px solid var(--line)" }}>{s.long}</p>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: ".72rem", color: s.c, marginTop: 16, position: "relative", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    {open ? "Show less" : "Learn more"}
                    <span style={{ display: "inline-block", transition: "transform .35s", transform: open ? "rotate(180deg)" : "none" }}>↓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* INDUSTRIES WE SERVE */}
        <section id="industries" className="wrap" style={{ padding: "60px 0" }}>
          <div className="eyebrow reveal">Industries we serve</div>
          <h2 className="reveal" style={{ maxWidth: "22ch" }}>Built for your world — <em>not a generic playbook.</em></h2>
          <p className="lead reveal" style={{ maxWidth: "56ch", marginBottom: 28 }}>We work across industries, but we go deep on the ones we know best. Open any one to see the exact systems we'd build.</p>
          <div className="svc" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
            {INDUSTRIES_DEEP.map((ind, i) => {
              const open = openIndustry === i;
              return (
                <div key={ind.key} className="glass reveal" onClick={() => setOpenIndustry(open ? null : i)}
                  style={{ borderRadius: 24, padding: 32, position: "relative", overflow: "hidden", cursor: "pointer",
                    transition: "box-shadow .3s, transform .3s", boxShadow: open ? "0 22px 50px rgba(22,22,29,.15)" : undefined,
                    gridColumn: open ? "1 / -1" : "auto" }}>
                  <span style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", filter: "blur(48px)", top: -36, right: -36, opacity: open ? .7 : .45, background: ind.c, transition: "opacity .3s" }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-.02em" }}>{ind.t}</h3>
                    {ind.tag && <span className="mono" style={{ fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", background: "linear-gradient(135deg,var(--violet),var(--pink))", borderRadius: 30, padding: "5px 10px" }}>{ind.tag}</span>}
                  </div>
                  <p style={{ color: "var(--muted)", position: "relative", marginTop: 8 }}>{ind.short}</p>
                  <div style={{ position: "relative", display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .45s cubic-bezier(.2,.8,.2,1)" }}>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ paddingTop: 22, marginTop: 22, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="demoGrid">
                        <div>
                          <div className="mono" style={{ fontSize: ".62rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>The pain</div>
                          {ind.pains.map((p, j) => (
                            <div key={j} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                              <span style={{ color: ind.c, marginTop: 2 }}>→</span>
                              <span style={{ fontSize: ".98rem", color: "var(--ink)", lineHeight: 1.5 }}>{p}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="mono" style={{ fontSize: ".62rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>What we'd build</div>
                          {ind.systems.map((s, j) => (
                            <div key={j} style={{ marginBottom: 14 }}>
                              <div style={{ fontWeight: 600, fontSize: ".98rem" }}>{s[0]}</div>
                              <div style={{ color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.5 }}>{s[1]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: 8, padding: "16px 18px", borderRadius: 14, background: "linear-gradient(135deg,rgba(109,93,252,.1),rgba(255,93,143,.07))", border: "1px solid var(--line)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: ind.c, marginTop: 1 }}>◆</span>
                        <div style={{ fontSize: ".96rem", color: "var(--ink)", lineHeight: 1.55 }}>{ind.proof}</div>
                      </div>
                      <button className="btn" style={{ marginTop: 18 }} onClick={(e) => { e.stopPropagation(); setBookOpen(true); }}>Book a call about {ind.t} →</button>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: ".72rem", color: ind.c, marginTop: 16, position: "relative", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    {open ? "Show less" : "See what we'd build"}
                    <span style={{ display: "inline-block", transition: "transform .35s", transform: open ? "rotate(180deg)" : "none" }}>↓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* WHY US */}
        <section id="about" className="wrap" style={{ padding: "60px 0" }}>
          <div className="glass reveal" style={{ borderRadius: 34, padding: "clamp(40px,5vw,68px)", position: "relative", overflow: "hidden", background: `rgba(${T.dark},.9)`, color: "#f2f2f7", border: "1px solid rgba(255,255,255,.12)" }}>
            <span style={{ position: "absolute", width: 330, height: 330, borderRadius: "50%", filter: "blur(80px)", opacity: .38, background: "var(--violet)", top: -100, left: -60 }} />
            <span style={{ position: "absolute", width: 330, height: 330, borderRadius: "50%", filter: "blur(80px)", opacity: .38, background: "var(--pink)", bottom: -120, right: -40 }} />
            <div style={{ position: "relative" }}>
              <div className="eyebrow" style={{ color: "var(--aqua)" }}>Why us</div>
              <h2>We've sat on <em style={{ WebkitTextFillColor: "initial", background: "none", color: "var(--aqua)" }}>your</em> side of the table.</h2>
              <p className="lead" style={{ color: "#c8c8d4", maxWidth: "64ch" }}>Yukti is built on 15 years across frontline sales, sales engineering, and marketing — fused with deep, hands-on AI expertise. We've carried quotas, closed deals, and answered to results, so we read AI through a commercial lens first: what it costs, what it returns, and how a team will actually adopt it. That's the difference between advice that sounds impressive and advice you can act on. Our work is measured the way your business is — in time recovered, customers served, and revenue earned.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                {["15+ yrs · Sales & GTM", "Sales Engineering", "Marketing", "Applied AI & Automation"].map((c, i) => (
                  <span key={i} className="mono" style={{ fontSize: ".74rem", letterSpacing: ".04em", color: "#e8e8f0", border: "1px solid rgba(255,255,255,.22)", borderRadius: 30, padding: "9px 16px" }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="wrap" style={{ padding: "60px 0" }}>
          <div className="eyebrow reveal">How we work</div>
          <h2 className="reveal">A measured path. <em>No surprises.</em></h2>
          <div className="steps" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 40 }}>
            {PROCESS.map((p, i) => (
              <div key={i} className="glass reveal" style={{ borderRadius: 22, padding: "32px 26px" }}>
                <div className="serif" style={{ fontStyle: "italic", fontSize: "2.2rem", background: "linear-gradient(135deg,var(--violet),var(--pink))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 12 }}>{p.n}</div>
                <h3 style={{ fontSize: "1.28rem", fontWeight: 700, letterSpacing: "-.02em", marginBottom: 8 }}>{p.t}</h3>
                <p style={{ color: "var(--muted)", fontSize: ".96rem" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BAND */}
        <section className="wrap" style={{ padding: "60px 0" }}>
          <div className="glass reveal" style={{ borderRadius: 32, padding: "74px 30px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", filter: "blur(90px)", opacity: .46, left: "50%", top: -160, transform: "translateX(-50%)", background: "linear-gradient(135deg,var(--violet),var(--pink))" }} />
            <div style={{ position: "relative" }}>
              <div className="eyebrow">Let's talk</div>
              <h2 style={{ maxWidth: "16ch", margin: "0 auto" }}>Start with a <em>conversation.</em></h2>
              <p className="lead" style={{ maxWidth: "52ch", margin: "12px auto 0" }}>A focused discovery call to understand your business and where AI could genuinely help. No obligation — and if there's nothing worth doing yet, we'll tell you.</p>
              <button className="btn lg" style={{ marginTop: 28 }} onClick={() => setBookOpen(true)}>Book a discovery call →</button>
              <div className="mono" style={{ marginTop: 16, fontSize: ".74rem", color: "var(--muted)" }}>30 minutes · Remote · No preparation needed.</div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="wrap" style={{ padding: "50px 0 64px" }}>
          <div className="glass" style={{ borderRadius: 26, padding: 38, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.04em", display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "linear-gradient(135deg,var(--violet),var(--pink))" }} />Yukti</div>
              <p className="serif" style={{ maxWidth: "34ch", color: "var(--ink)", fontSize: "1.05rem" }}>Yukti — the clever solution. AI consulting grounded in business judgment.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <a href="#why" style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500, opacity: .78 }}>Why now</a>
              <a href="#demo" style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500, opacity: .78 }}>Live demo</a>
              <a href="#services" style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500, opacity: .78 }}>What we do</a>
            </div>
            <div className="mono" style={{ fontSize: ".8rem", opacity: .7 }}>© 2026 Yukti<br />Built with intent.</div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      <Modal open={bookOpen} onClose={() => setBookOpen(false)}>
        <div className="eyebrow">Book a discovery call</div>
        <h2 style={{ fontSize: "2rem", marginBottom: 12 }}>Let's start a <em>conversation.</em></h2>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginBottom: 22 }}>Drop your email and a line about your business. We'll reach out to schedule a 30-minute call.</p>
        <input value={bookEmail} onChange={(e) => setBookEmail(e.target.value)} type="email" placeholder="you@company.com" style={{ width: "100%", borderRadius: 14, border: "1px solid var(--glass-bd)", background: "rgba(255,255,255,.6)", padding: "14px 16px", fontFamily: "inherit", fontSize: "1rem", marginBottom: 12, outline: "none" }} />
        <textarea value={bookMsg} onChange={(e) => setBookMsg(e.target.value)} placeholder="What does your business do, and what's prompting the interest in AI?" rows={3} style={{ width: "100%", borderRadius: 14, border: "1px solid var(--glass-bd)", background: "rgba(255,255,255,.6)", padding: "14px 16px", fontFamily: "inherit", fontSize: "1rem", marginBottom: 16, outline: "none", resize: "vertical" }} />
        <button className="btn lg" style={{ width: "100%" }} onClick={() => {
          // Prefer real calendar booking; carry context via prefill.
          const note = encodeURIComponent(`${bookMsg || ""}${bookEmail ? `\n(Email: ${bookEmail})` : ""}`.trim());
          const cal = `https://calendly.com/truthtribestudio/truth-tribe-podcast${note ? `?a1=${note}` : ""}`;
          window.open(cal, "_blank", "noopener");
          setBookOpen(false);
        }}>Pick a time →</button>
        <p className="mono" style={{ fontSize: ".7rem", color: "var(--muted)", textAlign: "center", marginTop: 14 }}>Opens our live calendar \u2014 or email ravitoor@truthtribe.ca anytime.</p>
      </Modal>
    </div>
  );
}
