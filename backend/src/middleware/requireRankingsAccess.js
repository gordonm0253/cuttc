import prisma from '../lib/prisma.js';
import { isAdminEmail } from './requireAdmin.js';

export async function requireRankingsAccess(req, res, next) {
  try {
    const email = req.firebaseUser?.email;
    if (!email) {
      return res.status(403).json({ error: 'Rankings access required' });
    }
    if (isAdminEmail(email)) {
      return next();
    }
    const viewer = await prisma.rankingsViewer.findUnique({ where: { email: email.toLowerCase() } });
    if (!viewer) {
      return res.status(403).json({ error: 'Rankings access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
}
