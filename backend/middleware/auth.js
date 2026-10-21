const ADMIN_UIDS = [
  'fVQ8A8RLOZOrfjqe9mB3uZU7iJR2',
  'NvdsLwfkpkd4yHgBUaYOm1h8D1D3',
  'Bg7vsno7q8ZGVlZy2SpisDX2Um02',
];

const ADMIN_EMAILS = [
  'sakthivelmurugadass@gmail.com',
  'admin@chaisupply.com',
  'admin@gmail.com',
  'admin2@gmail.com',
];

// Admin Authorization Middleware
function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const roleHeader = req.headers['x-user-role'];

    // 1. Check for explicit admin role header
    if (roleHeader === 'admin') {
      return next();
    }

    // 2. Decode Firebase Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const uid = payload.user_id || payload.sub || payload.uid;
        if (
          ADMIN_UIDS.includes(uid) ||
          (payload.email && ADMIN_EMAILS.includes(payload.email)) ||
          payload.admin === true ||
          payload.role === 'admin'
        ) {
          req.user = payload;
          return next();
        }
      }
    }

    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = {
  requireAdmin,
  ADMIN_UIDS,
  ADMIN_EMAILS,
};
