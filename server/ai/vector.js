
const vectorStore = new Map();

export function loadFromDb(db) {
  try {
    const articles = db.prepare('SELECT id, embedding FROM kb_articles WHERE embedding IS NOT NULL').all();
    let loaded = 0;
    for (const article of articles) {
      try {
        const embedding = JSON.parse(article.embedding);
        vectorStore.set(article.id, embedding);
        loaded++;
      } catch (error) {
        console.warn(`Failed to load embedding for article ${article.id}:`, error.message);
      }
    }
    console.log(`Loaded ${loaded} embeddings into vector store`);
  } catch (error) {
    console.error('Failed to load embeddings from database:', error);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Store embedding for an article
 */
export function storeEmbedding(articleId, embedding) {
  vectorStore.set(articleId, embedding);
}

/**
 * Remove embedding
 */
export function removeEmbedding(articleId) {
  vectorStore.delete(articleId);
}

/**
 * Search for top-k similar articles
 * Optimized: Calculate all scores, then sort and filter
 * @param {number[]} queryEmbedding - Query vector
 * @param {number} k - Number of results
 * @param {number} threshold - Minimum similarity score
 * @returns {Array<{id: string, score: number}>}
 */
export function searchSimilar(queryEmbedding, k = 3, threshold = 0.7) {
  if (vectorStore.size === 0) return [];
  
  const results = [];
  
  for (const [articleId, embedding] of vectorStore.entries()) {
    const score = cosineSimilarity(queryEmbedding, embedding);
    results.push({ id: articleId, score });
  }
  
  results.sort((a, b) => b.score - a.score);
  
  return results.filter(r => r.score >= threshold).slice(0, k);
}

/**
 * Get all stored article IDs
 */
export function getAllArticleIds() {
  return Array.from(vectorStore.keys());
}

/**
 * Clear all embeddings (for re-embedding)
 */
export function clearAll() {
  vectorStore.clear();
}

