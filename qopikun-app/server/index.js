require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRouter = require('./auth');
const agentRouter = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Warn if API key is not properly set
const apiKey = process.env.ANTHROPIC_API_KEY || '';
if (!apiKey || apiKey.startsWith('sk-ant-YOUR')) {
  console.warn('\n⚠️  WARNING: ANTHROPIC_API_KEY is not configured in .env');
  console.warn('   AI responses will fail until you add a valid key.\n');
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static frontend
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/agent', agentRouter);

// Health check endpoint    
app.get('/api/health', (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY || '';
  res.json({
    ok: true,
    aiConfigured: !!(key && !key.startsWith('sk-ant-YOUR')),
    ts: Date.now()
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Qopikun AI Co-Workers → http://localhost:${PORT}\n`);
});
