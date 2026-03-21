import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const parseBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

export const authMiddleware = async (req, res, next) => {
  const token = parseBearerToken(req);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuthMiddleware = async (req, _res, next) => {
  const token = parseBearerToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    return next();
  } catch {
    req.user = null;
    return next();
  }
};
