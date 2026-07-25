function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
}

export function requireAdmin(req, res, next) {
  if (!isAdminEmail(req.firebaseUser?.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
