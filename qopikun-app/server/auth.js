const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Team members — add/remove/edit as needed
// Roles: bd | ad | ac | lg | all
const TEAM = [
  { id: 1, name: 'Founder',  username: 'founder',  password: process.env.FOUNDER_PASS  || 'qopi@founder',  role: 'all' },
  { id: 2, name: 'Ranjith',  username: 'ranjith',  password: process.env.RANJITH_PASS  || 'qopi@ranjith',  role: 'bd'  },
  { id: 3, name: 'Admin',    username: 'admin',    password: process.env.ADMIN_PASS    || 'qopi@admin',    role: 'ad'  },
  { id: 4, name: 'Accounts', username: 'accounts', password: process.env.ACCOUNTS_PASS || 'qopi@accounts', role: 'ac'  },
  { id: 5, name: 'Raghav',   username: 'raghav',   password: process.env.RAGHAV_PASS   || 'qopi@raghav',   role: 'lg'  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'qopikun-secret-change-in-production';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = TEAM.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, name: user.name, role: user.role });
});

// Middleware to verify JWT
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = router;
module.exports.requireAuth = requireAuth;
