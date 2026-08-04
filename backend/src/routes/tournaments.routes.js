import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  listTournaments,
  getTournament,
  createTournament,
  deleteTournament,
  reportTournamentMatchResult,
  deleteTournamentMatchResult,
} from '../controllers/tournaments.controller.js';

const router = Router();

router.get('/', listTournaments);
router.get('/:id', getTournament);
router.post('/', verifyFirebaseToken, requireAdmin, createTournament);
router.delete('/:id', verifyFirebaseToken, requireAdmin, deleteTournament);
router.post('/matches/:tournamentMatchId/result', verifyFirebaseToken, requireAdmin, reportTournamentMatchResult);
router.delete('/matches/:tournamentMatchId/result', verifyFirebaseToken, requireAdmin, deleteTournamentMatchResult);

export default router;
