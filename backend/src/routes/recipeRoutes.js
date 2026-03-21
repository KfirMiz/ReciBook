import express from 'express';
import { createRecipe, getRecipeById, updateRecipe, deleteRecipe } from '../controllers/recipeController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/books/:bookId/recipes', authMiddleware, createRecipe);
router.get('/recipes/:id', optionalAuthMiddleware, getRecipeById);
router.put('/recipes/:id', authMiddleware, updateRecipe);
// 2. Add the DELETE route here, protecting it with authMiddleware:
router.delete('/recipes/:id', authMiddleware, deleteRecipe);

export default router;
