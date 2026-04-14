const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./auth');
const agentRouter = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/agent', agentRouter);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Qopikun AI Co-Workers running on port ${PORT}`);
});
