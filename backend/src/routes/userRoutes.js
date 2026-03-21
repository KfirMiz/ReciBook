import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { register, login } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
