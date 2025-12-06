const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');   // lowercase to match filename

// Create JWT token
function createToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/* REGISTER */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = createToken(user);

    res.status(201).json({
      message: 'User created',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* LOGIN */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// protected route: GET /api/auth/me
const authMiddleware = require('../middleware/auth'); // add at top if not already imported

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // payload set by auth middleware: { userId, email, iat, exp }
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' });

    // do not return passwordHash
    const user = await User.findById(userId).select('-passwordHash -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('GET /me error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
