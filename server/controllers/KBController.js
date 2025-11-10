import { kbService } from '../services/KBService.js';
import { validateKBArticle, validateKBSearch } from '../validators/kbValidators.js';

/**
 * Create a new KB article
 */
export async function createArticle(req, res, next) {
  try {
    validateKBArticle(req.body);
    const article = await kbService.createArticle(req.body);
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
}

/**
 * List all KB articles
 */
export function listArticles(req, res, next) {
  try {
    const articles = kbService.listArticles();
    res.json(articles);
  } catch (error) {
    next(error);
  }
}

/**
 * Get KB article by ID
 */
export function getArticleById(req, res, next) {
  try {
    const article = kbService.getArticleById(req.params.id);
    res.json(article);
  } catch (error) {
    next(error);
  }
}

/**
 * Search KB articles
 */
export async function searchArticles(req, res, next) {
  try {
    const { q, k = 3 } = req.query;
    validateKBSearch(q);
    const articles = await kbService.searchArticles(q, k);
    res.json(articles);
  } catch (error) {
    next(error);
  }
}

/**
 * Update KB article
 */
export async function updateArticle(req, res, next) {
  try {
    validateKBArticle(req.body);
    const article = await kbService.updateArticle(req.params.id, req.body);
    res.json(article);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete KB article
 */
export function deleteArticle(req, res, next) {
  try {
    kbService.deleteArticle(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Re-embed all articles
 */
export async function reembedAll(req, res, next) {
  try {
    const result = await kbService.reembedAll();
    res.json({
      message: `Re-embedded ${result.success} articles${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      success: result.success,
      failed: result.failed,
    });
  } catch (error) {
    next(error);
  }
}
