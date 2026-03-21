import express from 'express';
import {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread
} from '../controllers/threadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getThreads);
router.get('/:id', getThreadById);

// Protected routes
router.post('/', authMiddleware, createThread);
router.put('/:id', authMiddleware, updateThread);
router.delete('/:id', authMiddleware, deleteThread);

export default router;
