import admin from '../lib/firebaseAdmin.js';

export async function verifyFirebaseToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
