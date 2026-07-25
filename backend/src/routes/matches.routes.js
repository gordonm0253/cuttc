import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireRankingsAccess } from '../middleware/requireRankingsAccess.js';
import { listMatches, createMatch } from '../controllers/matches.controller.js';

const router = Router();

router.get('/', verifyFirebaseToken, requireRankingsAccess, listMatches);
router.post('/', verifyFirebaseToken, requireAdmin, createMatch);

export default router;
