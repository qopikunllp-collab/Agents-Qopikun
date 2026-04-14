# 🚀 Qopikun AI Co-Workers — Deploy Guide
### Go live in ~20 minutes. No coding knowledge needed.

---

## What you'll end up with
- A mobile app your whole team can install on their phones
- URL like: `https://qopikun-coworkers.onrender.com`
- Each team member logs in with their own password
- All 4 agents (Aarav, Ishita, Amit, Raghav) with live Gmail access

---

## Step 1 — Get your Anthropic API Key (2 min)
1. Go to https://console.anthropic.com/settings/keys
2. Click **Create Key**
3. Name it "Qopikun App"
4. Copy the key — it starts with `sk-ant-...`
5. Save it somewhere safe — you'll need it in Step 3

---

## Step 2 — Put the code on GitHub (5 min)
1. Create a free account at https://github.com if you don't have one
2. Click **New repository** → name it `qopikun-coworkers`
3. Set to **Private** (important — keeps your code safe)
4. Click **Create repository**
5. Upload all the files from this folder by dragging them to the GitHub page
   OR use GitHub Desktop app (easier): https://desktop.github.com

**Important:** Do NOT upload the `.env` file — that stays on your computer only.

---

## Step 3 — Deploy to Render (10 min, free)
1. Go to https://render.com and sign up with your GitHub account
2. Click **New → Web Service**
3. Connect your `qopikun-coworkers` GitHub repo
4. Set these settings:
   - **Name:** qopikun-coworkers
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Add Environment Variable** and add each of these:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | your key from Step 1 |
| `JWT_SECRET` | any long random string e.g. `Qopikun@2026!SecureKey#XYZ` |
| `FOUNDER_PASS` | your chosen password for founder login |
| `RANJITH_PASS` | Ranjith's password |
| `ADMIN_PASS` | Ishita/admin team password |
| `ACCOUNTS_PASS` | Amit/accounts team password |
| `RAGHAV_PASS` | Raghav's password |

6. Click **Create Web Service**
7. Wait ~3 minutes for first deploy
8. Your URL will be: `https://qopikun-coworkers.onrender.com`

---

## Step 4 — Install on team phones (2 min per person)

### Android (Chrome):
1. Open the app URL in Chrome
2. A banner will appear: "Add Qopikun to home screen"
3. Tap **Install** → Done ✅

### iPhone (Safari):
1. Open the app URL in Safari (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add** → Done ✅

---

## Team login credentials

| Team Member | Username | Password (change in Render env vars) |
|-------------|----------|---------------------------------------|
| Founder | `founder` | `qopi@founder` (change this!) |
| Ranjith (BD) | `ranjith` | `qopi@ranjith` |
| Admin/Ishita | `admin` | `qopi@admin` |
| Accounts/Amit | `accounts` | `qopi@accounts` |
| Raghav (Legal) | `raghav` | `qopi@raghav` |

**Each person only sees their own agent** (e.g. Ranjith only sees Aarav/BD).
**Founder login** sees all 4 agents.

To add new team members: edit `server/auth.js`, add a new line to the TEAM array, push to GitHub → Render auto-redeploys.

---

## Troubleshooting

**App not loading?**
- Check Render dashboard → Logs for errors
- Make sure `ANTHROPIC_API_KEY` is set correctly

**"Connection issue" in chat?**
- Verify `ANTHROPIC_API_KEY` is correct in Render environment variables
- Check you have credits at console.anthropic.com

**Gmail not working?**
- Gmail MCP access flows through your Claude.ai account's OAuth
- Make sure the Anthropic API key is from the same account that has Gmail connected

**Want a custom domain?** (e.g. app.qopikun.com)
- In Render → Settings → Custom Domain → add your domain
- Add a CNAME record pointing to your Render URL in your domain registrar

---

## Costs
- **Render free tier:** $0/month (spins down after 15 min inactivity, wakes in ~30 sec)
- **Render paid (Starter $7/month):** Always-on, faster, recommended for daily use
- **Anthropic API:** Pay per use. Typical monthly cost for a 10-person team: $20-50/month

---

## Need help?
Ask Claude in your chat: "Help me deploy the Qopikun app to Render" and share any error messages you see.
