import { v4 as uuidv4 } from 'uuid';
import db, { stmts } from '../db/index.js';
import { aiProvider } from '../ai/provider.js';
import { searchSimilar, getAllArticleIds } from '../ai/vector.js';
import { config } from '../config/env.js';
import { TICKET_STATUS } from '../config/constants.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Ticket Service - Business logic for tickets
 */
export class TicketService {
  /**
   * Create a new ticket
   */
  async createTicket({ email, subject, message }) {
    const ticketId = uuidv4();
    const createdAt = Date.now();
    
    // Moderation check
    const moderation = await aiProvider.moderate(`${subject}\n\n${message}`);
    if (!moderation.allowed) {
      throw new ValidationError('Content not allowed', {
        allowed: false,
        reasons: moderation.reasons,
      });
    }
    
    // NLP extraction
    const nlp = await aiProvider.extractNLP(subject, message);
    
    // RAG search
    const queryText = `${subject}\n\n${message}`;
    const queryEmbedding = await aiProvider.embed(queryText);
    
    let similarArticles = searchSimilar(
      queryEmbedding,
      config.RAG_TOP_K,
      config.RAG_SIMILARITY_THRESHOLD
    );
    
    if (similarArticles.length === 0) {
      console.log(`No articles found with threshold ${config.RAG_SIMILARITY_THRESHOLD}, trying lower threshold ${config.RAG_FALLBACK_THRESHOLD}`);
      similarArticles = searchSimilar(queryEmbedding, config.RAG_TOP_K, config.RAG_FALLBACK_THRESHOLD);
    }
    
    if (similarArticles.length > 0) {
      console.log(`Found ${similarArticles.length} similar articles with scores:`, 
        similarArticles.map(a => `${a.id}:${a.score.toFixed(3)}`).join(', '));
    } else {
      const vectorStoreSize = getAllArticleIds().length;
      console.warn(`No similar articles found in knowledge base. Vector store size: ${vectorStoreSize}`);
      if (vectorStoreSize === 0) {
        console.warn('WARNING: No KB articles found in vector store. Please run seed script or create KB articles.');
      }
    }
    
    const articleDetails = similarArticles.map(({ id, score }) => {
      const article = stmts.getKBById.get(id);
      return article ? { ...article, score } : null;
    }).filter(Boolean);
    
    // Generate RAG answer
    const rag = await aiProvider.generateRAGAnswer(queryText, articleDetails);
    
    // Determine status based on confidence
    const status = nlp.confidence >= config.LOW_CONFIDENCE_THRESHOLD 
      ? TICKET_STATUS.ANSWERED 
      : TICKET_STATUS.QUEUED;
    
    // Save to database
    stmts.insertTicket.run(
      ticketId,
      createdAt,
      email,
      subject,
      message,
      moderation.allowed ? 1 : 0,
      JSON.stringify(moderation.reasons),
      nlp.intent,
      JSON.stringify(nlp.entities),
      nlp.urgency,
      nlp.confidence,
      nlp.raw,
      rag.answer,
      JSON.stringify(rag.citations),
      articleDetails.length > 0 ? articleDetails[0].score : 0,
      status,
    );
    
    return {
      ticketId,
      status,
      answerDraft: rag.answer,
      citations: rag.citations,
    };
  }
  
  /**
   * List tickets with filters
   */
  listTickets(filters = {}) {
    const { q, intent, urgency, status } = filters;
    
    // Build dynamic query
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];
    
    if (q) {
      query += ' AND (subject LIKE ? OR message LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (intent) {
      query += ' AND (nlp_intent = ? OR intent_override = ?)';
      params.push(intent, intent);
    }
    
    if (urgency) {
      query += ' AND (nlp_urgency = ? OR urgency_override = ?)';
      params.push(urgency, urgency);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    // Use prepared statement for security (SQLite supports this)
    const tickets = params.length > 0 
      ? db.prepare(query).all(...params)
      : stmts.listTickets.all();
    
    return tickets.map(this.formatTicket);
  }
  
  /**
   * Get ticket by ID
   */
  getTicketById(id) {
    const ticket = stmts.getTicket.get(id);
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }
    return this.formatTicket(ticket);
  }
  
  /**
   * Update ticket
   */
  updateTicket(id, updates) {
    const { status, intent, urgency, answerDraft } = updates;
    
    const ticket = stmts.getTicket.get(id);
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }
    
    const updateFields = [];
    const params = [];
    
    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    
    if (intent !== undefined) {
      updateFields.push('intent_override = ?');
      params.push(intent || null);
    }
    
    if (urgency !== undefined) {
      updateFields.push('urgency_override = ?');
      params.push(urgency || null);
    }
    
    if (answerDraft !== undefined) {
      updateFields.push('rag_answerDraft = ?');
      params.push(answerDraft);
    }
    
    if (updateFields.length === 0) {
      throw new ValidationError('No fields to update');
    }
    
    params.push(id);
    
    db.prepare(`UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`)
      .run(...params);
    
    return this.getTicketById(id);
  }
  
  /**
   * Regenerate RAG answer for a ticket
   */
  async regenerateAnswer(id, systemHint = null) {
    const ticket = stmts.getTicket.get(id);
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }
    
    const queryText = `${ticket.subject}\n\n${ticket.message}`;
    const queryEmbedding = await aiProvider.embed(queryText);
    
    let similarArticles = searchSimilar(
      queryEmbedding,
      config.RAG_TOP_K,
      config.RAG_SIMILARITY_THRESHOLD
    );
    
    if (similarArticles.length === 0) {
      console.log(`No articles found with threshold ${config.RAG_SIMILARITY_THRESHOLD}, trying lower threshold ${config.RAG_FALLBACK_THRESHOLD}`);
      similarArticles = searchSimilar(queryEmbedding, config.RAG_TOP_K, config.RAG_FALLBACK_THRESHOLD);
    }
    
    const articleDetails = similarArticles.map(({ id, score }) => {
      const article = stmts.getKBById.get(id);
      return article ? { ...article, score } : null;
    }).filter(Boolean);
    
    const rag = await aiProvider.generateRAGAnswer(queryText, articleDetails, systemHint);
    
    db.prepare(`
      UPDATE tickets 
      SET rag_answerDraft = ?, rag_citations = ?, rag_similarity = ?
      WHERE id = ?
    `).run(
      rag.answer,
      JSON.stringify(rag.citations),
      articleDetails.length > 0 ? articleDetails[0].score : 0,
      id,
    );
    
    return this.getTicketById(id);
  }
  
  /**
   * Format ticket for API response
   */
  formatTicket(ticket) {
    return {
      id: ticket.id,
      createdAt: ticket.createdAt,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      moderation: {
        allowed: ticket.moderation_allowed === 1,
        reasons: ticket.moderation_reasons ? JSON.parse(ticket.moderation_reasons) : [],
      },
      nlp: {
        intent: ticket.intent_override || ticket.nlp_intent,
        entities: ticket.nlp_entities ? JSON.parse(ticket.nlp_entities) : {},
        urgency: ticket.urgency_override || ticket.nlp_urgency,
        confidence: ticket.nlp_confidence,
        raw: ticket.nlp_raw,
      },
      rag: {
        answerDraft: ticket.rag_answerDraft,
        citations: ticket.rag_citations ? JSON.parse(ticket.rag_citations) : [],
        similarity: ticket.rag_similarity,
      },
      status: ticket.status,
    };
  }
}

export const ticketService = new TicketService();

