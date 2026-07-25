import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { getMe, updateRankingsOptIn } from '../controllers/me.controller.js';

const router = Router();

router.get('/', verifyFirebaseToken, getMe);
router.put('/rankings-opt-in', verifyFirebaseToken, updateRankingsOptIn);

export default router;
