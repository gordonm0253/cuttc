import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/events.controller.js';

const router = Router();

router.get('/', listEvents);
router.post('/', verifyFirebaseToken, requireAdmin, createEvent);
router.put('/:id', verifyFirebaseToken, requireAdmin, updateEvent);
router.delete('/:id', verifyFirebaseToken, requireAdmin, deleteEvent);

export default router;
