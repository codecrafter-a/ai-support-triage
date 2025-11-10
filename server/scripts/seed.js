import { initDb, stmts } from '../db/index.js';
import db from '../db/index.js';
import { aiProvider } from '../ai/provider.js';
import { storeEmbedding } from '../ai/vector.js';
import { v4 as uuidv4 } from 'uuid';

// KB Articles seed data
const kbArticles = [
  {
    title: 'Reset Password',
    body: 'Steps: Settings → Security → "Reset Password"; email link expires in 15 mins.',
  },
  {
    title: 'Change Billing Email',
    body: 'Admins can update billing email in Billing → Contacts.',
  },
  {
    title: 'Refund Policy',
    body: 'Refunds within 14 days for annual plans; pro-rated otherwise.',
  },
  {
    title: '2FA Setup',
    body: 'Requires Authenticator App; recovery codes available once.',
  },
  {
    title: 'API Rate Limits',
    body: 'Free: 60 rpm; Pro: 600 rpm; Enterprise: custom.',
  },
  {
    title: 'Webhook Retries',
    body: 'Exponential backoff up to 5 retries; signature in X-App-Sig.',
  },
];

// Demo tickets
const demoTickets = [
  {
    email: 'a@demo.io',
    subject: 'refund pls',
    message: 'I was charged twice yesterday on my annual plan. Can I get a refund?',
  },
  {
    email: 'b@demo.io',
    subject: 'cant login',
    message: "I lost my phone and can't access my 2FA. How do I get back in?",
  },
];

async function seed() {
  console.log('Seeding database...');
  
  // Initialize DB
  initDb();
  
  db.prepare('DELETE FROM kb_articles').run();
  db.prepare('DELETE FROM tickets').run();
  
  // Seed KB Articles
  console.log('Creating KB articles...');
  for (const article of kbArticles) {
    const id = uuidv4();
    const now = Date.now();
    
    try {
      const embedding = await aiProvider.embed(`${article.title}\n\n${article.body}`);
      
      stmts.insertKB.run(id, article.title, article.body, JSON.stringify(embedding), now, now);
      
      storeEmbedding(id, embedding);
      
      console.log(`  ✓ Created: ${article.title}`);
    } catch (error) {
      console.error(`  ✗ Failed: ${article.title}`, error.message);
    }
  }
  
  console.log('\nCreating demo tickets...');
  for (const ticket of demoTickets) {
    try {
      const ticketId = uuidv4();
      const createdAt = Date.now();
      
      const moderation = await aiProvider.moderate(`${ticket.subject}\n\n${ticket.message}`);
      
      const nlp = await aiProvider.extractNLP(ticket.subject, ticket.message);
      
      const queryText = `${ticket.subject}\n\n${ticket.message}`;
      const queryEmbedding = await aiProvider.embed(queryText);
      const { searchSimilar } = await import('../ai/vector.js');
      const similarArticles = searchSimilar(queryEmbedding, 3, 0.7);
      
      const articleDetails = similarArticles.map(({ id, score }) => {
        const article = stmts.getKBById.get(id);
        return article ? { ...article, score } : null;
      }).filter(Boolean);
      
      const rag = await aiProvider.generateRAGAnswer(queryText, articleDetails);
      
      const status = nlp.confidence >= 0.6 ? 'answered' : 'queued';
      
      db.prepare(`
        INSERT INTO tickets (
          id, createdAt, email, subject, message,
          moderation_allowed, moderation_reasons,
          nlp_intent, nlp_entities, nlp_urgency, nlp_confidence, nlp_raw,
          rag_answerDraft, rag_citations, rag_similarity,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        ticketId,
        createdAt,
        ticket.email,
        ticket.subject,
        ticket.message,
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
      
      console.log(`  ✓ Created ticket: ${ticket.email} - ${ticket.subject}`);
    } catch (error) {
      console.error(`  ✗ Failed ticket: ${ticket.email}`, error.message);
    }
  }
  
  console.log('\n✓ Seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
