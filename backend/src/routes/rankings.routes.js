import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireRankingsAccess } from '../middleware/requireRankingsAccess.js';
import { getRankings } from '../controllers/rankings.controller.js';
import {
  listViewers,
  addViewer,
  removeViewer,
} from '../controllers/rankingsViewers.controller.js';

const router = Router();

router.get('/', verifyFirebaseToken, requireRankingsAccess, getRankings);

router.get('/viewers', verifyFirebaseToken, requireAdmin, listViewers);
router.post('/viewers', verifyFirebaseToken, requireAdmin, addViewer);
router.delete('/viewers/:id', verifyFirebaseToken, requireAdmin, removeViewer);

export default router;
