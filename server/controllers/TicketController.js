import { ticketService } from '../services/TicketService.js';
import { validateCreateTicket, validateUpdateTicket, validateTicketFilters } from '../validators/ticketValidators.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Create a new ticket
 */
export async function createTicket(req, res, next) {
  try {
    validateCreateTicket(req.body);
    const result = await ticketService.createTicket(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof ValidationError && error.details?.allowed === false) {
      return res.status(400).json(error.details);
    }
    next(error);
  }
}

/**
 * List tickets with filters
 */
export function listTickets(req, res, next) {
  try {
    const filters = {
      q: req.query.q,
      intent: req.query.intent,
      urgency: req.query.urgency,
      status: req.query.status,
    };
    
    validateTicketFilters(filters);
    const tickets = ticketService.listTickets(filters);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

/**
 * Get ticket by ID
 */
export function getTicketById(req, res, next) {
  try {
    const ticket = ticketService.getTicketById(req.params.id);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

/**
 * Update ticket
 */
export function updateTicket(req, res, next) {
  try {
    validateUpdateTicket(req.body);
    const ticket = ticketService.updateTicket(req.params.id, req.body);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

/**
 * Regenerate answer
 */
export async function regenerateAnswer(req, res, next) {
  try {
    const { systemHint } = req.body;
    const ticket = await ticketService.regenerateAnswer(req.params.id, systemHint);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}
