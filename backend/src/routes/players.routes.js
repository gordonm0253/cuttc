import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listPlayers } from '../controllers/players.controller.js';

const router = Router();

router.get('/', verifyFirebaseToken, requireAdmin, listPlayers);

export default router;
