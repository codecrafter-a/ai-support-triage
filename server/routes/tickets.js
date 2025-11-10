import express from 'express';
import * as ticketController from '../controllers/TicketController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/tickets - Submit a ticket (public)
 */
router.post('/', ticketController.createTicket);

/**
 * GET /api/tickets - List tickets (admin)
 */
router.get('/', requireAuth, ticketController.listTickets);

/**
 * GET /api/tickets/:id - Get ticket details (admin)
 */
router.get('/:id', requireAuth, ticketController.getTicketById);

/**
 * PATCH /api/tickets/:id - Update ticket (admin)
 */
router.patch('/:id', requireAuth, ticketController.updateTicket);

/**
 * POST /api/tickets/:id/regenerate - Regenerate answer (admin)
 */
router.post('/:id/regenerate', requireAuth, ticketController.regenerateAnswer);

export default router;
