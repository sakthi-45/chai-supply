const express = require('express');
const router = express.Router();
const UserCredential = require('../models/UserCredential');

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password, userId } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    await UserCredential.findOneAndUpdate(
      { email: cleanEmail },
      {
        email: cleanEmail,
        userId: userId || cleanEmail,
        password,
        updatedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({
      success: true,
      message: 'Password recorded in database successfully',
      email: cleanEmail,
    });
  } catch (err) {
    console.warn('Could not persist credential to MongoDB:', err.message);
    res.status(500).json({ error: 'Failed to record password' });
  }
});

// POST /api/auth/verify-password
router.post('/verify-password', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.json({ valid: false });
    const cleanEmail = email.toLowerCase().trim();
    const cred = await UserCredential.findOne({ email: cleanEmail });
    if (cred && cred.password === password) {
      return res.json({ valid: true, email: cleanEmail, userId: cred.userId });
    }
    return res.json({ valid: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify' });
  }
});

module.exports = router;
