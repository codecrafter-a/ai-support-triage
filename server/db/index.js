import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '../../data');
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(join(DB_DIR, 'tickets.db'));

db.pragma('foreign_keys = ON');

export const stmts = {
  insertTicket: null,
  getTicket: null,
  updateTicket: null,
  listTickets: null,
  insertKB: null,
  getKB: null,
  updateKB: null,
  deleteKB: null,
  listKB: null,
  getKBById: null,
};

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      createdAt INTEGER NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      moderation_allowed INTEGER NOT NULL,
      moderation_reasons TEXT,
      nlp_intent TEXT,
      nlp_entities TEXT,
      nlp_urgency TEXT,
      nlp_confidence REAL,
      nlp_raw TEXT,
      rag_answerDraft TEXT,
      rag_citations TEXT,
      rag_similarity REAL,
      status TEXT NOT NULL DEFAULT 'queued',
      intent_override TEXT,
      urgency_override TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS kb_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      embedding TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_intent ON tickets(nlp_intent);
    CREATE INDEX IF NOT EXISTS idx_tickets_urgency ON tickets(nlp_urgency);
    CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(createdAt);
    CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(email);
    CREATE INDEX IF NOT EXISTS idx_kb_created ON kb_articles(createdAt);
  `);

  stmts.insertTicket = db.prepare(`
    INSERT INTO tickets (
      id, createdAt, email, subject, message,
      moderation_allowed, moderation_reasons,
      nlp_intent, nlp_entities, nlp_urgency, nlp_confidence, nlp_raw,
      rag_answerDraft, rag_citations, rag_similarity,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmts.getTicket = db.prepare('SELECT * FROM tickets WHERE id = ?');
  stmts.listTickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC');
  stmts.listKB = db.prepare('SELECT id, title, body, createdAt, updatedAt FROM kb_articles ORDER BY createdAt DESC');
  stmts.getKBById = db.prepare('SELECT id, title, body FROM kb_articles WHERE id = ?');
  stmts.getKBFull = db.prepare('SELECT id, title, body, createdAt, updatedAt FROM kb_articles WHERE id = ?');
  stmts.insertKB = db.prepare(`
    INSERT INTO kb_articles (id, title, body, embedding, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmts.updateKB = db.prepare(`
    UPDATE kb_articles 
    SET title = ?, body = ?, embedding = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmts.deleteKB = db.prepare('DELETE FROM kb_articles WHERE id = ?');
  stmts.getAllKB = db.prepare('SELECT id, title, body FROM kb_articles');

  console.log('Database initialized');
}

export default db;

