import express from 'express';
import { createRecipe, getRecipeById, updateRecipe } from '../controllers/recipeController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/books/:bookId/recipes', authMiddleware, createRecipe);
router.get('/recipes/:id', optionalAuthMiddleware, getRecipeById);
router.put('/recipes/:id', authMiddleware, updateRecipe);

export default router;
