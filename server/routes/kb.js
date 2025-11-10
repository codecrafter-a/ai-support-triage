import express from 'express';
import * as kbController from '../controllers/KBController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/kb - Create KB article (admin)
 */
router.post('/', requireAuth, kbController.createArticle);

/**
 * GET /api/kb - List all KB articles (admin)
 */
router.get('/', requireAuth, kbController.listArticles);

/**
 * GET /api/kb/search - Search KB (admin)
 */
router.get('/search', requireAuth, kbController.searchArticles);

/**
 * GET /api/kb/:id - Get KB article (admin)
 */
router.get('/:id', requireAuth, kbController.getArticleById);

/**
 * PATCH /api/kb/:id - Update KB article (admin)
 */
router.patch('/:id', requireAuth, kbController.updateArticle);

/**
 * DELETE /api/kb/:id - Delete KB article (admin)
 */
router.delete('/:id', requireAuth, kbController.deleteArticle);

/**
 * POST /api/kb/reembed - Re-embed all articles (admin)
 */
router.post('/reembed', requireAuth, kbController.reembedAll);

export default router;
