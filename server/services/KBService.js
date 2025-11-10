import { v4 as uuidv4 } from 'uuid';
import db, { stmts } from '../db/index.js';
import { aiProvider } from '../ai/provider.js';
import { storeEmbedding, removeEmbedding, clearAll, searchSimilar } from '../ai/vector.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Knowledge Base Service - Business logic for KB articles
 */
export class KBService {
  /**
   * Create a new KB article
   */
  async createArticle({ title, body }) {
    const id = uuidv4();
    const now = Date.now();
    
    const embedding = await aiProvider.embed(`${title}\n\n${body}`);
    
    stmts.insertKB.run(id, title, body, JSON.stringify(embedding), now, now);
    storeEmbedding(id, embedding);
    
    return {
      id,
      title,
      body,
      createdAt: now,
      updatedAt: now,
    };
  }
  
  /**
   * List all KB articles
   */
  listArticles() {
    return stmts.listKB.all();
  }
  
  /**
   * Get KB article by ID
   */
  getArticleById(id) {
    const article = stmts.getKBFull.get(id);
    if (!article) {
      throw new NotFoundError('Article');
    }
    return article;
  }
  
  /**
   * Search KB articles
   */
  async searchArticles(query, limit = 3) {
    const queryEmbedding = await aiProvider.embed(query);
    const results = searchSimilar(queryEmbedding, parseInt(limit), 0.0);
    
    return results.map(({ id, score }) => {
      const article = stmts.getKBById.get(id);
      return article ? { ...article, score } : null;
    }).filter(Boolean);
  }
  
  /**
   * Update KB article
   */
  async updateArticle(id, { title, body }) {
    const existing = stmts.getKBFull.get(id);
    if (!existing) {
      throw new NotFoundError('Article');
    }
    
    const newTitle = title !== undefined ? title : existing.title;
    const newBody = body !== undefined ? body : existing.body;
    
    const embedding = await aiProvider.embed(`${newTitle}\n\n${newBody}`);
    
    stmts.updateKB.run(newTitle, newBody, JSON.stringify(embedding), Date.now(), id);
    storeEmbedding(id, embedding);
    
    return this.getArticleById(id);
  }
  
  /**
   * Delete KB article
   */
  deleteArticle(id) {
    const result = stmts.deleteKB.run(id);
    if (result.changes === 0) {
      throw new NotFoundError('Article');
    }
    removeEmbedding(id);
    return true;
  }
  
  /**
   * Re-embed all articles
   */
  async reembedAll() {
    const articles = stmts.getAllKB.all();
    clearAll();
    
    const updateStmt = db.prepare('UPDATE kb_articles SET embedding = ? WHERE id = ?');
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      try {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const embedding = await aiProvider.embed(`${article.title}\n\n${article.body}`);
        updateStmt.run(JSON.stringify(embedding), article.id);
        storeEmbedding(article.id, embedding);
        successCount++;
        
        console.log(`Re-embedded ${i + 1}/${articles.length}: ${article.title}`);
      } catch (error) {
        console.error(`Failed to re-embed article ${article.id}:`, error.message);
        failCount++;
        
        if (error.status === 429) {
          console.log('Rate limit hit, waiting 60 seconds before continuing...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }
    
    return {
      success: successCount,
      failed: failCount,
    };
  }
}

export const kbService = new KBService();

