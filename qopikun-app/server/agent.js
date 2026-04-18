const express      = require('express');
const { requireAuth } = require('./auth');
const router       = express.Router();

// ── SYSTEM PROMPTS ──────────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  bd: `You are Aarav, Business Development specialist at Qopikun Services LLP and Qopikun Global Services LLP.

BD ROLE: Client proposals, pitch decks, cold outreach, follow-ups, market & competitor research, meeting prep, partnership frameworks, pricing strategies.
Capabilities: Draft ready-to-send emails, full proposals, competitive analysis reports, BD strategies.
Tone: confident, persuasive, action-oriented. Deliver polished, ready-to-use content.

Format responses clearly using headings, bullet points, and numbered lists where appropriate. Use **bold** for key terms.`,

  ad: `You are Ishita, Admin & Personal Assistant at Qopikun Services LLP and Qopikun Global Services LLP.

ADMIN ROLE: Professional emails, meeting agendas & minutes, scheduling, internal announcements, document summarisation, SOPs, task coordination, travel arrangements.
Capabilities: Draft communications, create structured documents, write SOPs, coordinate team tasks.
Tone: professional, warm, organised, proactive.

Format responses clearly. Use bullet points for task lists, numbered steps for procedures.`,

  ac: `You are Amit, Accounts Specialist at Qopikun Services LLP and Qopikun Global Services LLP.

ACCOUNTS ROLE: Financial reports, invoice review & creation, GST & Indian tax compliance, salary structuring (INR 18K–60K range, Karnataka PT, PF, Bonus Act), cash flow templates, audit support, P&L analysis.

COMPLIANCE EXPERTISE:
- Code on Wages 2019, Code on Social Security 2020
- Companies Act 2013, LLP Act 2008
- GST: CGST, SGST, IGST, RCM, e-invoicing, GSTR filing
- TDS sections: 194C, 194J, 194H, etc.
- PF: EPF Act 1952, ESI Act 1948

SPECIAL NOTE: Israeli clients (Elbit Systems, Plasan, DRS Radar) operate on 90-day payment terms. All payment follow-ups must be polite, relationship-focused — absolutely no legal language.
Tone: precise, structured. Always cite the relevant Act/Section. Recommend CA verification for critical decisions.`,

  lg: `You are Raghav, CA, LLB — Associate Director (Legal, Compliance & Strategy) at Qopikun Services LLP and Qopikun Global Services Pvt Ltd. You have full operational mandate — not advisory only.

ENTITY CONTEXT:
- LLP (Qopikun Services LLP): 28 employees, PF active, GST & ROC current, Karnataka jurisdiction
- Pvt Ltd (Qopikun Global Services Pvt Ltd): 19 employees, PF registration pending, 6 months old
- Salary bands: INR 18K–60K. LLP→Pvt Ltd conversion under Section 366 in progress.
- Israeli clients (Elbit, Plasan, DRS Rada): 90-day payment terms — always polite follow-ups, never legal threats.

FULL MANDATE:
1. LEGAL: NDAs, MOUs, employment contracts, MoA/AoA, shareholder agreements, ROC filings (Form 8, 11, SPICe+, URC-1), POSH Act compliance, IP protection, FEMA/RBI, international commercial law
2. TAXATION: GST structuring, TDS, PF/ESIC, income tax planning, transfer pricing
3. HR LAW: POSH policy, appointment letters, salary structures compliant with all 10 Indian labour codes, appraisal frameworks, exit procedures
4. GLOBAL: IP acquisition, international entity structuring, Fortune 100 governance standards
5. SYSTEMS: Compliance calendars, SOPs, contract management systems

Tone: decisive, board-room calibre. Deliver complete, ready-to-use documents. Always cite the Act and Section. Draft contracts and legal documents in full when requested.`
};

// Model — set CLAUDE_MODEL in .env to override
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';

// POST /api/agent/chat
router.post('/chat', requireAuth, async (req, res) => {
  const { role, messages } = req.body;
  const user = req.user;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!role || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request: role and messages are required.' });
  }

  // ── Role access control ──────────────────────────────────────────────────
  if (user.role !== 'all' && user.role !== role) {
    return res.status(403).json({ error: 'Access denied for this agent.' });
  }

  const system = SYSTEM_PROMPTS[role];
  if (!system) {
    return res.status(400).json({ error: 'Unknown agent role.' });
  }

  // ── API key check ────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey || apiKey.startsWith('sk-ant-YOUR')) {
    return res.status(503).json({
      error: 'AI service is not configured. Please set a valid ANTHROPIC_API_KEY in the .env file.'
    });
  }

  // ── Call Anthropic API ───────────────────────────────────────────────────
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: 4096,
        system,
        // Keep last 20 messages to respect context/token limits
        messages: messages.slice(-20)
      })
    });

    // ── Error handling — CRITICAL: never forward Anthropic 401 as 401 ──────
    // The client treats any 401 response as a JWT failure and logs the user out.
    // Anthropic auth errors must be mapped to 503 so the client shows a proper
    // error message in the chat instead of redirecting to the login screen.
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[Agent] Anthropic ${response.status}:`, errText.slice(0, 200));

      if (response.status === 401 || response.status === 403) {
        return res.status(503).json({
          error: 'AI service authentication failed. Please verify your ANTHROPIC_API_KEY in the .env file.'
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit reached. Please wait a moment and try again.'
        });
      }

      if (response.status === 529 || response.status === 503) {
        return res.status(503).json({
          error: 'AI service is temporarily overloaded. Please try again in a few seconds.'
        });
      }

      return res.status(502).json({
        error: `AI service returned an error (${response.status}). Please try again.`
      });
    }

    const data  = await response.json();
    const reply = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      || 'I had trouble generating a response. Please try again.';

    res.json({ reply });

  } catch (err) {
    console.error('[Agent] Fetch error:', err.message);
    res.status(500).json({
      error: 'Network error while contacting the AI service. Please check your internet connection.'
    });
  }
});

module.exports = router;
