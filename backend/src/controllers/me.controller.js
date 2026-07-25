import prisma from '../lib/prisma.js';
import { isAdminEmail } from '../middleware/requireAdmin.js';
import { ensurePlayerForUser, setRankingsOptIn } from '../services/players.service.js';

export async function getMe(req, res, next) {
  try {
    const player = await ensurePlayerForUser(req.firebaseUser);
    const isAdmin = isAdminEmail(req.firebaseUser.email);
    const viewer = isAdmin
      ? null
      : await prisma.rankingsViewer.findUnique({ where: { email: req.firebaseUser.email.toLowerCase() } });
    res.json({
      email: req.firebaseUser.email,
      isAdmin,
      playerId: player.id,
      rankingsOptIn: player.rankingsOptIn,
      hasRankingsAccess: isAdmin || !!viewer,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRankingsOptIn(req, res, next) {
  try {
    const { rankingsOptIn } = req.body;
    if (typeof rankingsOptIn !== 'boolean') {
      const err = new Error('rankingsOptIn must be a boolean');
      err.status = 400;
      throw err;
    }
    const player = await setRankingsOptIn(req.firebaseUser.email, rankingsOptIn);
    res.json({ rankingsOptIn: player.rankingsOptIn });
  } catch (err) {
    next(err);
  }
}
