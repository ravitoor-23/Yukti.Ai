# Launching Yukti — Step by Step

You have a complete, working website project. It builds successfully. Here's how to get it
live with the AI demo working. Total time: about an hour, mostly waiting.

You'll need (all free except the domain):
- A GitHub account (github.com)
- A Netlify account (netlify.com) — sign in with GitHub
- An Anthropic API key (console.anthropic.com) — this powers the live demo
- A domain name (~$12/yr for .com, ~$70-100/yr for .ai)

--------------------------------------------------------------------
STEP 1 — Get your Anthropic API key (5 min)
--------------------------------------------------------------------
1. Go to console.anthropic.com and sign in.
2. Add a small amount of credit (Billing → $5 is plenty to start).
3. Go to API Keys → Create Key. Copy it somewhere safe.
   You'll paste it into Netlify later. NEVER put it in the code or share it.

--------------------------------------------------------------------
STEP 2 — Put the code on GitHub (10 min)
--------------------------------------------------------------------
Easiest no-terminal way:
1. Go to github.com → New repository → name it "yukti-site" → Create.
2. On the new repo page, click "uploading an existing file".
3. Drag in EVERYTHING from the yukti-site folder EXCEPT the node_modules
   and dist folders (you don't need those — Netlify rebuilds them).
   Make sure you include: package.json, vite.config.js, index.html,
   netlify.toml, the src/ folder, and the netlify/ folder.
4. Click "Commit changes".

--------------------------------------------------------------------
STEP 3 — Deploy on Netlify (10 min)
--------------------------------------------------------------------
1. Go to netlify.com → "Add new site" → "Import an existing project".
2. Choose GitHub, authorize, and pick your "yukti-site" repo.
3. Netlify auto-detects the settings from netlify.toml. Just click "Deploy".
4. Wait ~1 minute. You'll get a live URL like yukti-site-xyz.netlify.app.

--------------------------------------------------------------------
STEP 4 — Add your secret key so the demo works (3 min)
--------------------------------------------------------------------
1. In Netlify: Site configuration → Environment variables → Add a variable.
2. Key:   ANTHROPIC_API_KEY
   Value: (paste the key from Step 1)
3. Save, then go to Deploys → "Trigger deploy" → "Deploy site" so it picks
   up the key. The live demo will now work for real visitors.

--------------------------------------------------------------------
STEP 5 — Connect your domain (15 min + waiting)
--------------------------------------------------------------------
1. Buy your domain at namecheap.com or cloudflare.com.
   (Check availability for: yukti.ai, getyukti.com, yukti.consulting, etc.)
2. In Netlify: Domain management → Add a domain → enter your domain.
3. Netlify shows you DNS records to add. Copy them into your domain
   registrar's DNS settings (Netlify has a step-by-step for each registrar).
4. Wait 10 min – a few hours for it to take effect. Netlify adds HTTPS
   (the padlock) automatically and free.

--------------------------------------------------------------------
DONE. Your site is live with a working AI demo.
--------------------------------------------------------------------

To make changes later: edit the files on GitHub (or locally), commit, and
Netlify redeploys automatically within a minute.

The booking form opens the visitor's email to ravitoor@truthtribe.ca.
When you want real calendar booking, swap it for a Calendly link — ask and
it's a 2-minute change.

WANT TO PREVIEW ON YOUR OWN COMPUTER FIRST? (optional)
1. Install Node.js from nodejs.org (LTS version).
2. Open Terminal, cd into the yukti-site folder.
3. Run:  npm install   then   npm run dev
4. Open the localhost link it prints. (Note: the AI demo only works once
   deployed to Netlify with the key — locally it'll show the friendly error.)
