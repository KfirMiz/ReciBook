import express from 'express';
import {
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum
} from '../controllers/forumController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getForums);
router.get('/:id', getForumById);

// Protected routes
router.post('/', authMiddleware, createForum);
router.put('/:id', authMiddleware, updateForum);
router.delete('/:id', authMiddleware, deleteForum);

export default router;
