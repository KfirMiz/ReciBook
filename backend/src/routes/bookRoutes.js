import express from 'express';
import {
  createBook,
  getBookById,
  getBookRecipes,
  getBooks,
  shareBook,
  updateBook,
} from '../controllers/bookController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuthMiddleware, getBooks);
router.post('/', authMiddleware, createBook);
router.get('/:id', optionalAuthMiddleware, getBookById);
router.put('/:id', authMiddleware, updateBook);
router.post('/:id/share', authMiddleware, shareBook);
router.get('/:bookId/recipes', optionalAuthMiddleware, getBookRecipes);

export default router;
